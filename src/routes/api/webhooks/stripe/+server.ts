// Stripe webhook handler for payment events
// Phase 4 Monetization - Webhook processing

import { json } from '@sveltejs/kit';
// Get webhook secret with fallback for development
const PRIVATE_STRIPE_WEBHOOK_SECRET = process.env.PRIVATE_STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
import { stripe, webhookHandlers } from '$lib/services/stripe.js';
import { createSupabaseServerClient } from '$lib/supabase/server.js';
import { HTTP_STATUS } from '$lib/config/api-constants.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.text();
		const signature = request.headers.get('stripe-signature');

		if (!signature) {
			console.error('Missing Stripe signature');
			return json(
				{ error: 'Missing signature' },
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		// Verify webhook signature
		let event;
		try {
			event = stripe.webhooks.constructEvent(
				body,
				signature,
				PRIVATE_STRIPE_WEBHOOK_SECRET
			);
		} catch (error) {
			console.error('Webhook signature verification failed:', error);
			return json(
				{ error: 'Invalid signature' },
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		console.log(`Received Stripe webhook: ${event.type}`);

		// Create Supabase client
		const supabase = createSupabaseServerClient(locals.cookies);

		// Handle different event types
		switch (event.type) {
			case 'payment_intent.succeeded':
				await webhookHandlers['payment_intent.succeeded'](event, supabase);
				break;

			case 'payment_intent.payment_failed':
				await handlePaymentFailed(event, supabase);
				break;

			case 'invoice.payment_succeeded':
				await webhookHandlers['invoice.payment_succeeded'](event, supabase);
				break;

			case 'invoice.payment_failed':
				await webhookHandlers['invoice.payment_failed'](event, supabase);
				break;

			case 'customer.subscription.created':
				await handleSubscriptionCreated(event, supabase);
				break;

			case 'customer.subscription.updated':
				await handleSubscriptionUpdated(event, supabase);
				break;

			case 'customer.subscription.deleted':
				await webhookHandlers['customer.subscription.deleted'](event, supabase);
				break;

			case 'invoice.payment_action_required':
				await handlePaymentActionRequired(event, supabase);
				break;

			case 'setup_intent.succeeded':
				await handleSetupIntentSucceeded(event, supabase);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
				break;
		}

		return json({ received: true });

	} catch (error) {
		console.error('Webhook processing error:', error);
		return json(
			{ error: 'Webhook processing failed' },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
};

/**
 * Handle payment failure
 */
async function handlePaymentFailed(
	event: any,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const paymentIntent = event.data.object;
	const transactionId = paymentIntent.metadata.transactionId;

	if (!transactionId) {
		console.error('No transaction ID in payment intent metadata');
		return;
	}

	try {
		// Update transaction status
		const { error: transactionError } = await supabase
			.from('transactions')
			.update({
				status: 'failed',
				updated_at: new Date().toISOString()
			})
			.eq('id', transactionId);

		if (transactionError) {
			console.error('Failed to update transaction status:', transactionError);
		}

		// Update payment record
		const { error: paymentError } = await supabase
			.from('payments')
			.update({
				status: paymentIntent.status,
				failure_reason: paymentIntent.last_payment_error?.message,
				updated_at: new Date().toISOString()
			})
			.eq('stripe_payment_intent_id', paymentIntent.id);

		if (paymentError) {
			console.error('Failed to update payment record:', paymentError);
		}

		// Release reserved listing
		const { data: transaction } = await supabase
			.from('transactions')
			.select('listing_id')
			.eq('id', transactionId)
			.single();

		if (transaction?.listing_id) {
			await supabase
				.from('listings')
				.update({ status: 'active' })
				.eq('id', transaction.listing_id);
		}

		console.log(`Payment failed for transaction ${transactionId}`);
	} catch (error) {
		console.error('Error handling payment failure:', error);
	}
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(
	event: any,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const subscription = event.data.object;
	const sellerId = subscription.metadata.sellerId;

	if (!sellerId) {
		console.error('No seller ID in subscription metadata');
		return;
	}

	try {
		// Subscription should already be created in database via API
		// This webhook confirms it was created successfully in Stripe
		await supabase
			.from('seller_subscriptions')
			.update({
				status: subscription.status,
				current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
				current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('stripe_subscription_id', subscription.id);

		console.log(`Subscription created for seller ${sellerId}`);
	} catch (error) {
		console.error('Error handling subscription creation:', error);
	}
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(
	event: any,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const subscription = event.data.object;

	try {
		await supabase
			.from('seller_subscriptions')
			.update({
				status: subscription.status,
				current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
				current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
				cancel_at_period_end: subscription.cancel_at_period_end,
				updated_at: new Date().toISOString()
			})
			.eq('stripe_subscription_id', subscription.id);

		console.log(`Subscription updated: ${subscription.id}`);
	} catch (error) {
		console.error('Error handling subscription update:', error);
	}
}

/**
 * Handle payment requiring additional action
 */
async function handlePaymentActionRequired(
	event: any,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const invoice = event.data.object;
	const subscriptionId = invoice.subscription;

	if (subscriptionId) {
		try {
			await supabase
				.from('seller_subscriptions')
				.update({
					status: 'unpaid',
					updated_at: new Date().toISOString()
				})
				.eq('stripe_subscription_id', subscriptionId);

			console.log(`Payment action required for subscription ${subscriptionId}`);
		} catch (error) {
			console.error('Error handling payment action required:', error);
		}
	}
}

/**
 * Handle setup intent success (for future payments)
 */
async function handleSetupIntentSucceeded(
	event: any,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const setupIntent = event.data.object;
	const customerId = setupIntent.customer;

	console.log(`Setup intent succeeded for customer ${customerId}`);
	
	// This could be used to update customer payment methods in the future
	// For now, just log the event
}

// Health check endpoint for webhook
export const GET: RequestHandler = async () => {
	return json({ status: 'Stripe webhook endpoint is active' });
};