import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

const supabase = createClient();

interface FeedItem {
	id: string;
	title: string;
	description: string;
	price: number;
	images: string[];
	thumbnail_url: string;
	brand?: string;
	condition: string;
	location?: string;
	view_count: number;
	like_count: number;
	created_at: string;
	seller: {
		id: string;
		username?: string;
		full_name?: string;
		avatar_url?: string;
		verified?: boolean;
	};
	feed_score?: number;
	feed_reasons?: string[];
}

export interface FeedResponse {
	items: FeedItem[];
	hasMore: boolean;
	nextCursor?: string;
}

/**
 * Get "For You" personalized feed
 * Algorithm considers user's liked items, browsing history, and location
 */
export async function getForYouFeed(
	supabase: SupabaseClient<Database>,
	userId?: string,
	limit: number = 20,
	cursor?: string
): Promise<FeedResponse> {
	try {
		let query = supabase
			.from('listings')
			.select(
				`
        id,
        title,
        description,
        price,
        images,
        thumbnail_url,
        brand,
        condition,
        location,
        view_count,
        like_count,
        created_at,
        seller:profiles!seller_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
			)
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(limit);

		if (cursor) {
			query = query.lt('created_at', cursor);
		}

		const { data: listings, error } = await query;

		if (error) {
			throw error;
		}

		if (!listings) {
			return { items: [], hasMore: false };
		}

		// If user is logged in, personalize the feed
		let personalizedItems: FeedItem[] = [];

		if (userId) {
			personalizedItems = await personalizeListings(listings, userId, supabase);
		} else {
			// For anonymous users, just return recent items with basic scoring
			personalizedItems = listings.map((item) => ({
				...item,
				like_count: item.like_count,
				seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
				feed_score: calculateBasicScore(item),
				feed_reasons: ['Recently listed'],
			}));
		}

		// Sort by feed score (descending)
		personalizedItems.sort((a, b) => (b.feed_score || 0) - (a.feed_score || 0));

		return {
			items: personalizedItems,
			hasMore: listings.length === limit,
			nextCursor: listings.length > 0 ? listings[listings.length - 1].created_at : undefined,
		};
	} catch (error) {
		throw error;
	}
}

/**
 * Get "Newest" feed - simple chronological order
 */
export async function getNewestFeed(
	supabase: SupabaseClient<Database>,
	limit: number = 20,
	cursor?: string
): Promise<FeedResponse> {
	try {
		let query = supabase
			.from('listings')
			.select(
				`
        id,
        title,
        description,
        price,
        images,
        thumbnail_url,
        brand,
        condition,
        location,
        view_count,
        like_count,
        created_at,
        seller:profiles!seller_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
			)
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(limit);

		if (cursor) {
			query = query.lt('created_at', cursor);
		}

		const { data: listings, error } = await query;

		if (error) throw error;

		const items: FeedItem[] = (listings || []).map((item) => ({
			...item,
			seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
			feed_score: 0,
			feed_reasons: ['Recently listed'],
		}));

		return {
			items,
			hasMore: listings?.length === limit,
			nextCursor:
				listings && listings.length > 0 ? listings[listings.length - 1].created_at : undefined,
		};
	} catch (error) {
		throw error;
	}
}

/**
 * Get "Trending" feed - based on engagement
 */
export async function getTrendingFeed(
	supabase: SupabaseClient<Database>,
	limit: number = 20,
	cursor?: string
): Promise<FeedResponse> {
	try {
		let query = supabase
			.from('listings')
			.select(
				`
        id,
        title,
        description,
        price,
        images,
        thumbnail_url,
        brand,
        condition,
        location,
        view_count,
        like_count,
        created_at,
        seller:profiles!seller_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
			)
			.eq('status', 'active')
			.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
			.limit(limit);

		const { data: listings, error } = await query;

		if (error) throw error;

		// Calculate trending scores and sort
		const trendingItems: FeedItem[] = (listings || []).map((item) => {
			const trendingScore = calculateTrendingScore(item);
			return {
				...item,
				like_count: item.like_count,
				seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
				feed_score: trendingScore,
				feed_reasons: ['Trending this week'],
			};
		});

		// Sort by trending score
		trendingItems.sort((a, b) => (b.feed_score || 0) - (a.feed_score || 0));

		return {
			items: trendingItems,
			hasMore: listings?.length === limit,
			nextCursor: undefined, // Trending doesn't use cursor pagination
		};
	} catch (error) {
		throw error;
	}
}

/**
 * Personalize listings based on user preferences
 */
async function personalizeListings(
	listings: any[],
	userId: string,
	supabase: SupabaseClient<Database>
): Promise<FeedItem[]> {
	try {
		// Get user's liked items to understand preferences
		const { data: userLikes, error: likesError } = await supabase
			.from('favorites')
			.select(
				`
        listing_id,
        products (
          brand,
          condition,
          price
        )
      `
			)
			.eq('user_id', userId)
			.limit(50);

		if (likesError) {
		}

		// Extract user preferences  
		const userPreferences = extractUserPreferences(userLikes || []);

		// Score each listing based on user preferences
		return listings.map((item) => {
			const personalizedScore = calculatePersonalizedScore(item, userPreferences);
			const reasons = generateFeedReasons(item, userPreferences);

			return {
				...item,
				like_count: item.like_count,
				seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
				feed_score: personalizedScore,
				feed_reasons: reasons,
			};
		});
	} catch (error) {
		// Fallback to basic scoring
		return listings.map((item) => ({
			...item,
			feed_score: calculateBasicScore(item),
			feed_reasons: ['Recent listing'],
		}));
	}
}

/**
 * Extract user preferences from their liked items
 */
function extractUserPreferences(userLikes: any[]) {
	const brands: { [key: string]: number } = {};
	const conditions: { [key: string]: number } = {};
	const priceRanges: { [key: string]: number } = {};

	userLikes.forEach((like) => {
		const listing = like.products;
		if (!listing) return;

		// Count brand preferences
		if (listing.brand) {
			brands[listing.brand] = (brands[listing.brand] || 0) + 1;
		}

		// Count condition preferences
		if (listing.condition) {
			conditions[listing.condition] = (conditions[listing.condition] || 0) + 1;
		}

		// Count price range preferences
		const priceRange = getPriceRange(listing.price);
		priceRanges[priceRange] = (priceRanges[priceRange] || 0) + 1;
	});

	return { brands, conditions, priceRanges };
}

/**
 * Calculate personalized score for a listing
 */
function calculatePersonalizedScore(item: any, preferences: any): number {
	let score = calculateBasicScore(item);

	// Brand preference boost
	if (item.brand && preferences.brands[item.brand]) {
		score += preferences.brands[item.brand] * 10;
	}

	// Condition preference boost
	if (item.condition && preferences.conditions[item.condition]) {
		score += preferences.conditions[item.condition] * 5;
	}

	// Price range preference boost
	const priceRange = getPriceRange(item.price);
	if (preferences.priceRanges[priceRange]) {
		score += preferences.priceRanges[priceRange] * 3;
	}

	return score;
}

/**
 * Calculate basic engagement score
 */
function calculateBasicScore(item: any): number {
	const ageHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
	const agePenalty = Math.max(0, 100 - ageHours); // Newer items get higher scores

	const likes = item.like_count || 0;
	const views = item.view_count || 0;
	return likes * 3 + views * 0.1 + agePenalty;
}

/**
 * Calculate trending score based on recent engagement
 */
function calculateTrendingScore(item: any): number {
	const ageHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
	const agePenalty = Math.max(0, 168 - ageHours) / 168; // 168 hours = 7 days

	const likes = item.like_count || 0;
	const views = item.view_count || 0;
	return (likes * 2 + views * 0.5) * agePenalty;
}

/**
 * Generate feed reasons based on personalization
 */
function generateFeedReasons(item: any, preferences: any): string[] {
	const reasons: string[] = [];

	if (item.brand && preferences.brands[item.brand]) {
		reasons.push(`You like ${item.brand}`);
	}

	if (item.condition && preferences.conditions[item.condition]) {
		reasons.push(`You prefer ${item.condition} items`);
	}

	const likes = item.like_count || 0;
	if (likes > 5) {
		reasons.push('Popular item');
	}

	if (reasons.length === 0) {
		reasons.push('Recently listed');
	}

	return reasons;
}

/**
 * Get price range category
 */
function getPriceRange(price: number): string {
	if (price < 20) return 'under-20';
	if (price < 50) return '20-50';
	if (price < 100) return '50-100';
	if (price < 200) return '100-200';
	return 'over-200';
}
