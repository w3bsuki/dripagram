// API endpoint for creating payment intents
// Phase 4 Monetization - Payment processing

import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { createSupabaseServerClient } from '$lib/supabase/server.js';
import { createPaymentIntent, calculateTransactionFees } from '$lib/services/stripe.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '$lib/config/api-constants.js';
import type { RequestHandler } from './$types.js';

// Validation schema for payment creation
const createPaymentSchema = z.object({
	listingId: z.string().uuid(),
	shippingPrice: z.number().min(0).optional().default(0),
	paymentMethodId: z.string().optional()
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
		const validation = createPaymentSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ 
					error: ERROR_MESSAGES.VALIDATION_ERROR,
					details: validation.error.flatten().fieldErrors
				},
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		const { listingId, shippingPrice, paymentMethodId } = validation.data;
		const supabase = createSupabaseServerClient(locals.cookies);

		// Get listing details
		const { data: listing, error: listingError } = await supabase
			.from('listings')
			.select(`
				*,
				seller:seller_id(id, email, full_name),
				category:category_id(name)
			`)
			.eq('id', listingId)
			.eq('status', 'active')
			.single();

		if (listingError || !listing) {
			return json(
				{ error: 'Listing not found or not available' },
				{ status: HTTP_STATUS.NOT_FOUND }
			);
		}

		// Prevent self-purchase
		if (listing.seller_id === locals.user.id) {
			return json(
				{ error: 'Cannot purchase your own listing' },
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		// Check if already sold
		if (listing.status === 'sold') {
			return json(
				{ error: 'This item has already been sold' },
				{ status: HTTP_STATUS.CONFLICT }
			);
		}

		// Get seller's subscription plan for commission rate
		const { data: sellerPlan } = await supabase
			.rpc('get_seller_plan', { p_seller_id: listing.seller_id });

		const commissionRate = sellerPlan?.[0]?.commission_rate || 0.05; // Default 5%

		// Calculate fees
		const fees = calculateTransactionFees(
			listing.price,
			shippingPrice,
			commissionRate
		);

		// Create transaction record
		const { data: transaction, error: transactionError } = await supabase
			.from('transactions')
			.insert({
				transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				listing_id: listingId,
				buyer_id: locals.user.id,
				seller_id: listing.seller_id,
				item_price: fees.itemPrice,
				shipping_price: fees.shippingPrice,
				platform_fee: fees.platformFee,
				payment_processing_fee: fees.paymentProcessingFee,
				total_amount: fees.totalAmount,
				seller_earnings: fees.sellerEarnings,
				currency: listing.currency || 'BGN',
				status: 'pending'
			})
			.select()
			.single();

		if (transactionError || !transaction) {
			console.error('Transaction creation error:', transactionError);
			return json(
				{ error: ERROR_MESSAGES.INTERNAL_ERROR },
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		// Create payment intent with Stripe
		const paymentResult = await createPaymentIntent(
			{
				transactionId: transaction.id,
				amount: Math.round(fees.totalAmount * 100), // Convert to stotinki (cents)
				currency: (listing.currency || 'bgn').toLowerCase(),
				metadata: {
					buyerName: locals.user.full_name || locals.user.email || '',
					sellerName: listing.seller.full_name || listing.seller.email || '',
					listingTitle: listing.title,
					category: listing.category?.name || ''
				}
			},
			supabase
		);

		if (!paymentResult.success || !paymentResult.paymentIntent) {
			// Clean up transaction if payment intent creation failed
			await supabase
				.from('transactions')
				.delete()
				.eq('id', transaction.id);

			return json(
				{ 
					error: paymentResult.error || 'Failed to create payment intent'
				},
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		// Mark listing as reserved temporarily
		await supabase
			.from('listings')
			.update({ status: 'reserved' })
			.eq('id', listingId);

		// Return success response
		return json({
			success: true,
			transactionId: transaction.id,
			paymentIntent: {
				id: paymentResult.paymentIntent.id,
				clientSecret: paymentResult.paymentIntent.client_secret,
				amount: paymentResult.paymentIntent.amount,
				currency: paymentResult.paymentIntent.currency,
				status: paymentResult.paymentIntent.status
			},
			fees: {
				itemPrice: fees.itemPrice,
				shippingPrice: fees.shippingPrice,
				platformFee: fees.platformFee,
				paymentProcessingFee: fees.paymentProcessingFee,
				totalAmount: fees.totalAmount
			},
			listing: {
				id: listing.id,
				title: listing.title,
				price: listing.price,
				currency: listing.currency,
				images: listing.images,
				seller: {
					name: listing.seller.full_name || 'Anonymous',
					verified: listing.seller_verified || false
				}
			}
		});

	} catch (error) {
		console.error('Payment creation error:', error);
		return json(
			{ error: ERROR_MESSAGES.INTERNAL_ERROR },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
};