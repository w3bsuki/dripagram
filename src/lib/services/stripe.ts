// Stripe Payment Processing Service
// Phase 4 Monetization - Server-side Stripe integration

import Stripe from 'stripe';
import { createSupabaseServerClient } from '$lib/supabase/server.js';
import type { Database } from '$lib/types/database.types.js';

// Get environment variables with fallbacks for development
const PRIVATE_STRIPE_SECRET_KEY = process.env.PRIVATE_STRIPE_SECRET_KEY || 'sk_test_placeholder';
const PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
const PRIVATE_STRIPE_WEBHOOK_SECRET = process.env.PRIVATE_STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

// Initialize Stripe (will be null if no real keys provided)
const stripe = PRIVATE_STRIPE_SECRET_KEY !== 'sk_test_placeholder' 
	? new Stripe(PRIVATE_STRIPE_SECRET_KEY, {
			apiVersion: '2024-11-20.acacia',
			typescript: true
		})
	: null;

export { stripe };

// Types for payment processing
export interface CreatePaymentIntentParams {
	transactionId: string;
	amount: number; // in cents
	currency?: string;
	customerId?: string;
	metadata?: Record<string, string>;
}

export interface PaymentResult {
	success: boolean;
	paymentIntent?: Stripe.PaymentIntent;
	error?: string;
	requiresAction?: boolean;
}

export interface SubscriptionResult {
	success: boolean;
	subscription?: Stripe.Subscription;
	error?: string;
	clientSecret?: string;
}

// Platform configuration
const PLATFORM_CONFIG = {
	defaultCurrency: 'bgn',
	defaultCommissionRate: 0.05, // 5%
	minTransactionAmount: 100, // 1 BGN in stotinki
	maxTransactionAmount: 100000000, // 1M BGN in stotinki
	supportedCurrencies: ['bgn', 'eur', 'usd'],
	webhookEndpointSecret: PRIVATE_STRIPE_SECRET_KEY // In production, use separate webhook secret
} as const;

/**
 * Create a payment intent for a transaction
 */
export async function createPaymentIntent(
	params: CreatePaymentIntentParams,
	supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<PaymentResult> {
	try {
		// Development mode - return mock response if no real Stripe keys
		if (!stripe) {
			console.warn('Stripe not configured - returning mock payment intent');
			return {
				success: true,
				paymentIntent: {
					id: 'pi_mock_' + Date.now(),
					client_secret: 'pi_mock_secret_' + Date.now(),
					amount: Math.round(params.amount),
					currency: params.currency || 'bgn',
					status: 'requires_payment_method'
				} as any
			};
		}
		const { transactionId, amount, currency = PLATFORM_CONFIG.defaultCurrency, customerId, metadata = {} } = params;

		// Validate amount
		if (amount < PLATFORM_CONFIG.minTransactionAmount || amount > PLATFORM_CONFIG.maxTransactionAmount) {
			return {
				success: false,
				error: `Amount must be between ${PLATFORM_CONFIG.minTransactionAmount} and ${PLATFORM_CONFIG.maxTransactionAmount} stotinki`
			};
		}

		// Get transaction details
		const { data: transaction, error: transactionError } = await supabase
			.from('transactions')
			.select(`
				*,
				buyer:buyer_id(id, email, full_name),
				seller:seller_id(id, email, full_name),
				listing:listing_id(id, title, images)
			`)
			.eq('id', transactionId)
			.single();

		if (transactionError || !transaction) {
			return { success: false, error: 'Transaction not found' };
		}

		// Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency,
			customer: customerId,
			metadata: {
				transactionId,
				buyerId: transaction.buyer_id,
				sellerId: transaction.seller_id,
				listingId: transaction.listing_id,
				...metadata
			},
			description: `Purchase: ${transaction.listing?.title || 'Item'}`,
			automatic_payment_methods: {
				enabled: true
			},
			// Enable for future payments if customer exists
			setup_future_usage: customerId ? 'off_session' : undefined
		});

		// Store payment record
		const { error: paymentError } = await supabase
			.from('payments')
			.insert({
				transaction_id: transactionId,
				stripe_payment_intent_id: paymentIntent.id,
				amount: amount / 100, // Convert back to BGN
				currency: currency.toUpperCase(),
				status: paymentIntent.status
			});

		if (paymentError) {
			console.error('Failed to store payment record:', paymentError);
			// Continue anyway - payment intent was created successfully
		}

		return {
			success: true,
			paymentIntent,
			requiresAction: paymentIntent.status === 'requires_action'
		};
	} catch (error) {
		console.error('Error creating payment intent:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Confirm payment and process transaction
 */
export async function confirmPayment(
	paymentIntentId: string,
	supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<PaymentResult> {
	try {
		// Retrieve payment intent
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		
		if (paymentIntent.status === 'succeeded') {
			// Get transaction from metadata
			const transactionId = paymentIntent.metadata.transactionId;
			
			if (transactionId) {
				await processSuccessfulPayment(transactionId, paymentIntent, supabase);
			}

			return { success: true, paymentIntent };
		}

		return {
			success: false,
			error: `Payment status: ${paymentIntent.status}`,
			requiresAction: paymentIntent.status === 'requires_action'
		};
	} catch (error) {
		console.error('Error confirming payment:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Process successful payment
 */
async function processSuccessfulPayment(
	transactionId: string,
	paymentIntent: Stripe.PaymentIntent,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	try {
		// Update transaction status
		const { error: transactionError } = await supabase
			.from('transactions')
			.update({
				status: 'completed',
				updated_at: new Date().toISOString()
			})
			.eq('id', transactionId);

		if (transactionError) {
			throw new Error(`Failed to update transaction: ${transactionError.message}`);
		}

		// Update payment record
		const { error: paymentError } = await supabase
			.from('payments')
			.update({
				status: paymentIntent.status,
				receipt_url: paymentIntent.charges.data[0]?.receipt_url,
				stripe_charge_id: paymentIntent.charges.data[0]?.id,
				updated_at: new Date().toISOString()
			})
			.eq('stripe_payment_intent_id', paymentIntent.id);

		if (paymentError) {
			throw new Error(`Failed to update payment: ${paymentError.message}`);
		}

		// Get transaction details for wallet update
		const { data: transaction, error: fetchError } = await supabase
			.from('transactions')
			.select('seller_id, seller_earnings, currency')
			.eq('id', transactionId)
			.single();

		if (fetchError || !transaction) {
			throw new Error('Failed to fetch transaction details');
		}

		// Update seller wallet
		await updateSellerWallet(transaction.seller_id, transaction.seller_earnings, supabase);

		// Record platform commission
		await recordPlatformCommission(transactionId, supabase);

		console.log(`Payment processed successfully for transaction ${transactionId}`);
	} catch (error) {
		console.error('Error processing successful payment:', error);
		throw error;
	}
}

/**
 * Update seller wallet with earnings
 */
async function updateSellerWallet(
	sellerId: string,
	earnings: number,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	// First, ensure wallet exists
	const { error: walletError } = await supabase
		.from('seller_wallets')
		.upsert({
			seller_id: sellerId,
			available_balance: 0,
			pending_balance: 0,
			total_earnings: 0,
			total_withdrawn: 0
		}, {
			onConflict: 'seller_id',
			ignoreDuplicates: true
		});

	if (walletError) {
		console.error('Error ensuring wallet exists:', walletError);
	}

	// Add wallet transaction
	const { error: transactionError } = await supabase
		.from('wallet_transactions')
		.insert({
			wallet_id: (await supabase
				.from('seller_wallets')
				.select('id')
				.eq('seller_id', sellerId)
				.single()
			).data?.id,
			type: 'credit',
			amount: earnings,
			description: 'Sale earnings'
		});

	if (transactionError) {
		console.error('Error recording wallet transaction:', transactionError);
		throw new Error(`Failed to update wallet: ${transactionError.message}`);
	}
}

/**
 * Record platform commission
 */
async function recordPlatformCommission(
	transactionId: string,
	supabase: ReturnType<typeof createSupabaseServerClient>
) {
	const { data: transaction, error } = await supabase
		.from('transactions')
		.select('platform_fee')
		.eq('id', transactionId)
		.single();

	if (error || !transaction) {
		throw new Error('Failed to fetch transaction for commission recording');
	}

	const { error: commissionError } = await supabase
		.from('platform_commissions')
		.insert({
			transaction_id: transactionId,
			commission_rate: PLATFORM_CONFIG.defaultCommissionRate,
			commission_amount: transaction.platform_fee,
			commission_type: 'standard'
		});

	if (commissionError) {
		console.error('Error recording platform commission:', commissionError);
	}
}

/**
 * Create subscription for seller premium features
 */
export async function createSubscription(
	sellerId: string,
	planId: string,
	paymentMethodId: string,
	supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<SubscriptionResult> {
	try {
		// Get seller details
		const { data: seller, error: sellerError } = await supabase
			.from('profiles')
			.select('email, full_name')
			.eq('id', sellerId)
			.single();

		if (sellerError || !seller) {
			return { success: false, error: 'Seller not found' };
		}

		// Get subscription plan
		const { data: plan, error: planError } = await supabase
			.from('subscription_plans')
			.select('*')
			.eq('id', planId)
			.single();

		if (planError || !plan) {
			return { success: false, error: 'Subscription plan not found' };
		}

		// Create or get Stripe customer
		let customer = await findOrCreateCustomer(seller.email, seller.full_name || '');

		// Attach payment method to customer
		await stripe.paymentMethods.attach(paymentMethodId, {
			customer: customer.id
		});

		// Set as default payment method
		await stripe.customers.update(customer.id, {
			invoice_settings: {
				default_payment_method: paymentMethodId
			}
		});

		// Create subscription
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{
				price: plan.stripe_monthly_price_id // or yearly based on selection
			}],
			metadata: {
				sellerId,
				planId
			},
			expand: ['latest_invoice.payment_intent']
		});

		// Store subscription in database
		const { error: dbError } = await supabase
			.from('seller_subscriptions')
			.insert({
				seller_id: sellerId,
				plan_id: planId,
				status: subscription.status as any,
				billing_cycle: 'monthly',
				current_price: plan.monthly_price,
				current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
				current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
				stripe_subscription_id: subscription.id,
				stripe_customer_id: customer.id
			});

		if (dbError) {
			// Cancel stripe subscription if database update fails
			await stripe.subscriptions.cancel(subscription.id);
			return { success: false, error: 'Failed to store subscription in database' };
		}

		const invoice = subscription.latest_invoice as Stripe.Invoice;
		const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

		return {
			success: true,
			subscription,
			clientSecret: paymentIntent?.client_secret || undefined
		};
	} catch (error) {
		console.error('Error creating subscription:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Find existing customer or create new one
 */
async function findOrCreateCustomer(email: string, name: string): Promise<Stripe.Customer> {
	// Try to find existing customer
	const existingCustomers = await stripe.customers.list({
		email,
		limit: 1
	});

	if (existingCustomers.data.length > 0) {
		return existingCustomers.data[0];
	}

	// Create new customer
	return await stripe.customers.create({
		email,
		name
	});
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
	subscriptionId: string,
	cancelAtPeriodEnd: boolean = true,
	supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<{ success: boolean; error?: string }> {
	try {
		if (cancelAtPeriodEnd) {
			// Cancel at period end
			await stripe.subscriptions.update(subscriptionId, {
				cancel_at_period_end: true
			});
		} else {
			// Cancel immediately
			await stripe.subscriptions.cancel(subscriptionId);
		}

		// Update database
		const { error: dbError } = await supabase
			.from('seller_subscriptions')
			.update({
				cancel_at_period_end: cancelAtPeriodEnd,
				cancelled_at: new Date().toISOString(),
				status: cancelAtPeriodEnd ? 'active' : 'cancelled'
			})
			.eq('stripe_subscription_id', subscriptionId);

		if (dbError) {
			console.error('Error updating subscription in database:', dbError);
		}

		return { success: true };
	} catch (error) {
		console.error('Error canceling subscription:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

/**
 * Calculate transaction fees and earnings
 */
export function calculateTransactionFees(
	itemPrice: number,
	shippingPrice: number = 0,
	commissionRate: number = PLATFORM_CONFIG.defaultCommissionRate
): {
	itemPrice: number;
	shippingPrice: number;
	platformFee: number;
	paymentProcessingFee: number;
	totalAmount: number;
	sellerEarnings: number;
} {
	const subtotal = itemPrice + shippingPrice;
	const platformFee = Number((subtotal * commissionRate).toFixed(2));
	
	// Stripe fees: 2.9% + 0.30 BGN per transaction
	const paymentProcessingFee = Number((subtotal * 0.029 + 0.30).toFixed(2));
	
	const totalAmount = subtotal + platformFee + paymentProcessingFee;
	const sellerEarnings = subtotal - platformFee - paymentProcessingFee;

	return {
		itemPrice,
		shippingPrice,
		platformFee,
		paymentProcessingFee,
		totalAmount,
		sellerEarnings
	};
}

/**
 * Get publishable key for client-side
 */
export function getPublishableKey(): string {
	return PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/**
 * Webhook event handlers
 */
export const webhookHandlers = {
	'payment_intent.succeeded': async (event: Stripe.Event, supabase: ReturnType<typeof createSupabaseServerClient>) => {
		const paymentIntent = event.data.object as Stripe.PaymentIntent;
		const transactionId = paymentIntent.metadata.transactionId;
		
		if (transactionId) {
			await processSuccessfulPayment(transactionId, paymentIntent, supabase);
		}
	},

	'invoice.payment_succeeded': async (event: Stripe.Event, supabase: ReturnType<typeof createSupabaseServerClient>) => {
		const invoice = event.data.object as Stripe.Invoice;
		const subscriptionId = invoice.subscription as string;
		
		// Update subscription status
		await supabase
			.from('seller_subscriptions')
			.update({ status: 'active' })
			.eq('stripe_subscription_id', subscriptionId);
	},

	'invoice.payment_failed': async (event: Stripe.Event, supabase: ReturnType<typeof createSupabaseServerClient>) => {
		const invoice = event.data.object as Stripe.Invoice;
		const subscriptionId = invoice.subscription as string;
		
		// Update subscription status
		await supabase
			.from('seller_subscriptions')
			.update({ status: 'past_due' })
			.eq('stripe_subscription_id', subscriptionId);
	},

	'customer.subscription.deleted': async (event: Stripe.Event, supabase: ReturnType<typeof createSupabaseServerClient>) => {
		const subscription = event.data.object as Stripe.Subscription;
		
		// Update subscription status
		await supabase
			.from('seller_subscriptions')
			.update({ status: 'cancelled' })
			.eq('stripe_subscription_id', subscription.id);
	}
};

export default stripe;