// Revenue Analytics API for sellers and platform
// Phase 4 Monetization - Analytics dashboard

import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { createSupabaseServerClient } from '$lib/supabase/server.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '$lib/config/api-constants.js';
import type { RequestHandler } from './$types.js';

// Validation schema for analytics request
const analyticsSchema = z.object({
	period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
	sellerId: z.string().uuid().optional()
});

export const GET: RequestHandler = async ({ request, locals, url }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json(
				{ error: ERROR_MESSAGES.UNAUTHORIZED },
				{ status: HTTP_STATUS.UNAUTHORIZED }
			);
		}

		// Parse query parameters
		const period = url.searchParams.get('period') || '30d';
		const sellerId = url.searchParams.get('sellerId') || locals.user.id;

		// Validate parameters
		const validation = analyticsSchema.safeParse({ period, sellerId });
		if (!validation.success) {
			return json(
				{ 
					error: ERROR_MESSAGES.VALIDATION_ERROR,
					details: validation.error.flatten().fieldErrors
				},
				{ status: HTTP_STATUS.BAD_REQUEST }
			);
		}

		const { period: validPeriod, sellerId: validSellerId } = validation.data;
		const supabase = createSupabaseServerClient(locals.cookies);

		// Check permissions - users can only view their own analytics unless admin
		const isAdmin = locals.user.role === 'admin' || locals.user.role === 'moderator';
		const requestedSellerId = validSellerId || locals.user.id;

		if (!isAdmin && requestedSellerId !== locals.user.id) {
			return json(
				{ error: 'Access denied. You can only view your own analytics.' },
				{ status: HTTP_STATUS.FORBIDDEN }
			);
		}

		// Check if seller has analytics access (premium feature)
		if (!isAdmin && requestedSellerId === locals.user.id) {
			const { data: sellerPlan } = await supabase
				.rpc('get_seller_plan', { p_seller_id: requestedSellerId });

			if (!sellerPlan?.[0]?.analytics_access) {
				return json(
					{ error: 'Analytics access requires a premium subscription' },
					{ status: HTTP_STATUS.FORBIDDEN }
				);
			}
		}

		// Calculate date range
		const endDate = new Date();
		const startDate = new Date();
		
		switch (validPeriod) {
			case '7d':
				startDate.setDate(startDate.getDate() - 7);
				break;
			case '30d':
				startDate.setDate(startDate.getDate() - 30);
				break;
			case '90d':
				startDate.setDate(startDate.getDate() - 90);
				break;
			case '1y':
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
		}

		// Get transaction analytics
		const { data: transactionStats, error: transactionError } = await supabase
			.from('transactions')
			.select('status, total_amount, seller_earnings, platform_fee, created_at')
			.eq('seller_id', requestedSellerId)
			.gte('created_at', startDate.toISOString())
			.lte('created_at', endDate.toISOString());

		if (transactionError) {
			console.error('Transaction analytics error:', transactionError);
			return json(
				{ error: ERROR_MESSAGES.INTERNAL_ERROR },
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		// Get listing analytics
		const { data: listingStats, error: listingError } = await supabase
			.from('listings')
			.select('status, price, view_count, like_count, share_count, created_at, sold_at')
			.eq('seller_id', requestedSellerId)
			.gte('created_at', startDate.toISOString())
			.lte('created_at', endDate.toISOString());

		if (listingError) {
			console.error('Listing analytics error:', listingError);
			return json(
				{ error: ERROR_MESSAGES.INTERNAL_ERROR },
				{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
			);
		}

		// Get seller analytics from daily aggregates
		const { data: dailyStats, error: dailyError } = await supabase
			.from('seller_analytics')
			.select('*')
			.eq('seller_id', requestedSellerId)
			.gte('date', startDate.toISOString().split('T')[0])
			.lte('date', endDate.toISOString().split('T')[0])
			.order('date', { ascending: true });

		if (dailyError) {
			console.error('Daily analytics error:', dailyError);
		}

		// Process transaction data
		const transactionAnalytics = processTransactionData(transactionStats || []);
		const listingAnalytics = processListingData(listingStats || []);
		const timeSeriesData = processDailyData(dailyStats || [], validPeriod);

		// Get current wallet balance
		const { data: wallet, error: walletError } = await supabase
			.from('seller_wallets')
			.select('available_balance, pending_balance, total_earnings, total_withdrawn')
			.eq('seller_id', requestedSellerId)
			.single();

		if (walletError) {
			console.error('Wallet analytics error:', walletError);
		}

		return json({
			success: true,
			data: {
				period: validPeriod,
				dateRange: {
					start: startDate.toISOString(),
					end: endDate.toISOString()
				},
				transactions: transactionAnalytics,
				listings: listingAnalytics,
				wallet: wallet || {
					available_balance: 0,
					pending_balance: 0,
					total_earnings: 0,
					total_withdrawn: 0
				},
				timeSeries: timeSeriesData,
				summary: {
					totalRevenue: transactionAnalytics.totalEarnings,
					totalTransactions: transactionAnalytics.totalTransactions,
					averageOrderValue: transactionAnalytics.averageOrderValue,
					conversionRate: calculateConversionRate(listingAnalytics.totalViews, transactionAnalytics.completedTransactions),
					topPerformingListings: getTopPerformingListings(listingStats || [])
				}
			}
		});

	} catch (error) {
		console.error('Revenue analytics error:', error);
		return json(
			{ error: ERROR_MESSAGES.INTERNAL_ERROR },
			{ status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
		);
	}
};

/**
 * Process transaction data for analytics
 */
function processTransactionData(transactions: any[]) {
	const completed = transactions.filter(t => t.status === 'completed');
	const failed = transactions.filter(t => t.status === 'failed');
	const pending = transactions.filter(t => t.status === 'pending');

	const totalEarnings = completed.reduce((sum, t) => sum + (t.seller_earnings || 0), 0);
	const totalRevenue = completed.reduce((sum, t) => sum + (t.total_amount || 0), 0);
	const totalFees = completed.reduce((sum, t) => sum + (t.platform_fee || 0), 0);

	return {
		totalTransactions: transactions.length,
		completedTransactions: completed.length,
		failedTransactions: failed.length,
		pendingTransactions: pending.length,
		totalRevenue: Number(totalRevenue.toFixed(2)),
		totalEarnings: Number(totalEarnings.toFixed(2)),
		totalFeesPaid: Number(totalFees.toFixed(2)),
		averageOrderValue: completed.length > 0 ? Number((totalRevenue / completed.length).toFixed(2)) : 0,
		successRate: transactions.length > 0 ? Number(((completed.length / transactions.length) * 100).toFixed(1)) : 0
	};
}

/**
 * Process listing data for analytics
 */
function processListingData(listings: any[]) {
	const active = listings.filter(l => l.status === 'active');
	const sold = listings.filter(l => l.status === 'sold');
	const expired = listings.filter(l => l.status === 'expired');

	const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
	const totalLikes = listings.reduce((sum, l) => sum + (l.like_count || 0), 0);
	const totalShares = listings.reduce((sum, l) => sum + (l.share_count || 0), 0);

	return {
		totalListings: listings.length,
		activeListings: active.length,
		soldListings: sold.length,
		expiredListings: expired.length,
		totalViews,
		totalLikes,
		totalShares,
		averageViewsPerListing: listings.length > 0 ? Math.round(totalViews / listings.length) : 0,
		soldRate: listings.length > 0 ? Number(((sold.length / listings.length) * 100).toFixed(1)) : 0
	};
}

/**
 * Process daily data for time series
 */
function processDailyData(dailyStats: any[], period: string) {
	// Group by appropriate time period
	const groupBy = period === '7d' || period === '30d' ? 'day' : 'week';
	
	return dailyStats.map(day => ({
		date: day.date,
		revenue: day.gross_sales || 0,
		earnings: day.net_earnings || 0,
		transactions: day.conversions || 0,
		views: day.listing_views || 0,
		likes: day.listing_likes || 0,
		newListings: day.new_listings || 0
	}));
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(views: number, conversions: number): number {
	if (views === 0) return 0;
	return Number(((conversions / views) * 100).toFixed(2));
}

/**
 * Get top performing listings
 */
function getTopPerformingListings(listings: any[]) {
	return listings
		.filter(l => l.status === 'sold')
		.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
		.slice(0, 5)
		.map(l => ({
			id: l.id,
			title: l.title,
			price: l.price,
			views: l.view_count || 0,
			likes: l.like_count || 0,
			soldAt: l.sold_at
		}));
}