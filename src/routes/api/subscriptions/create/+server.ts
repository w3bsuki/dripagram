// API endpoint for creating seller subscriptions
// Phase 4 Monetization - Subscription management

import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { createSupabaseServerClient } from '$lib/supabase/server.js';
import { createSubscription } from '$lib/services/stripe.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '$lib/config/api-constants.js';
import type { RequestHandler } from './$types.js';

// Validation schema for subscription creation
const createSubscriptionSchema = z.object({
	planId: z.string().uuid(),
	billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
	paymentMethodId: z.string()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json(
				{ error: ERROR_MESSAGES.UNAUTHORIZED },
				{ status: HTTP_STATUS.UNAUTHORIZED }
			);
		}

		// Validate request body
		const body = await request.json();
		const validation = createSubscriptionSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ 
					error: ERROR_MESSAGES.VALIDATION_ERROR,
					details: validation.error.flatten().fieldErrors
				},
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		const { planId, billingCycle, paymentMethodId } = validation.data;
		const supabase = createSupabaseServerClient(locals.cookies);

		// Check if user already has an active subscription
		const { data: existingSubscription, error: existingError } = await supabase
			.from('seller_subscriptions')
			.select('id, status')
			.eq('seller_id', locals.user.id)
			.eq('status', 'active')
			.single();

		if (existingError && existingError.code !== 'PGRST116') {
			console.error('Error checking existing subscription:', existingError);
			return json(
				{ error: ERROR_MESSAGES.INTERNAL_ERROR },
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		if (existingSubscription) {
			return json(
				{ error: 'You already have an active subscription. Please cancel it first.' },
				{ status: HTTP_STATUS.CONFLICT }
			);
		}

		// Get subscription plan details
		const { data: plan, error: planError } = await supabase
			.from('subscription_plans')
			.select('*')
			.eq('id', planId)
			.eq('is_active', true)
			.single();

		if (planError || !plan) {
			return json(
				{ error: 'Subscription plan not found or not available' },
				{ status: HTTP_STATUS.NOT_FOUND }
			);
		}

		// Create subscription with Stripe
		const subscriptionResult = await createSubscription(
			locals.user.id,
			planId,
			paymentMethodId,
			supabase
		);

		if (!subscriptionResult.success) {
			return json(
				{ error: subscriptionResult.error || 'Failed to create subscription' },
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		// Return success response
		return json({
			success: true,
			subscription: {
				id: subscriptionResult.subscription?.id,
				status: subscriptionResult.subscription?.status,
				current_period_start: subscriptionResult.subscription?.current_period_start,
				current_period_end: subscriptionResult.subscription?.current_period_end,
				clientSecret: subscriptionResult.clientSecret
			},
			plan: {
				name: plan.name,
				price: billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price,
				billing_cycle: billingCycle,
				features: {
					max_listings: plan.max_listings,
					max_images_per_listing: plan.max_images_per_listing,
					featured_listings_per_month: plan.featured_listings_per_month,
					promoted_listings_per_month: plan.promoted_listings_per_month,
					analytics_access: plan.analytics_access,
					priority_support: plan.priority_support,
					custom_branding: plan.custom_branding,
					commission_rate: plan.commission_rate
				}
			}
		});

	} catch (error) {
		console.error('Subscription creation error:', error);
		return json(
			{ error: ERROR_MESSAGES.INTERNAL_ERROR },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
};