import { getSupabaseBrowserClient } from '$lib/supabase/client';
import type { Database } from '$lib/types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Use centralized Supabase client
const supabase = getSupabaseBrowserClient();

// Real-time subscriptions cache
const subscriptions = new Map<string, RealtimeChannel>();

export interface LikeData {
	id: string;
	user_id: string;
	product_id: string;
	created_at: string;
}

export interface LikeStats {
	totalLikes: number;
	isLiked: boolean;
	recentLikers: Array<{
		id: string;
		username: string;
		avatar_url: string | null;
	}>;
}

/**
 * Toggle like status for a product (Instagram-style)
 * Uses optimistic updates for instant feedback
 */
export async function toggleLike(
	productId: string
): Promise<{ isLiked: boolean; totalLikes: number }> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in to like items');

	// Check current like status
	const { data: existingLike } = await supabase
		.from('product_likes')
		.select('id')
		.eq('user_id', user.id)
		.eq('product_id', productId)
		.single();

	if (existingLike) {
		// Unlike the product
		const { error } = await supabase
			.from('product_likes')
			.delete()
			.eq('user_id', user.id)
			.eq('product_id', productId);

		if (error) throw error;

		// Get updated count
		const { count } = await supabase
			.from('product_likes')
			.select('*', { count: 'exact', head: true })
			.eq('product_id', productId);

		return { isLiked: false, totalLikes: count || 0 };
	} else {
		// Like the product
		const { error } = await supabase.from('product_likes').insert({
			user_id: user.id,
			product_id: productId,
		});

		if (error) throw error;

		// Get updated count
		const { count } = await supabase
			.from('product_likes')
			.select('*', { count: 'exact', head: true })
			.eq('product_id', productId);

		return { isLiked: true, totalLikes: count || 0 };
	}
}

/**
 * Get comprehensive like statistics for a listing
 */
export async function getLikeStats(productId: string): Promise<LikeStats> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Get total like count
	const { count: totalLikes } = await supabase
		.from('product_likes')
		.select('*', { count: 'exact', head: true })
		.eq('product_id', productId);

	// Check if current user liked this listing
	let isLiked = false;
	if (user) {
		const { data: userLike } = await supabase
			.from('product_likes')
			.select('id')
			.eq('user_id', user.id)
			.eq('product_id', productId)
			.single();
		isLiked = !!userLike;
	}

	// Get recent likers (for "liked by X and Y" display)
	const { data: recentLikes } = await supabase
		.from('product_likes')
		.select(
			`
			id,
			user_id,
			profiles!inner (
				id,
				username,
				avatar_url
			)
		`
		)
		.eq('product_id', productId)
		.order('created_at', { ascending: false })
		.limit(3);

	const recentLikers = (recentLikes || []).map((like) => ({
		id: (like as any).profiles.id,
		username: (like as any).profiles.username || 'Anonymous',
		avatar_url: (like as any).profiles.avatar_url,
	}));

	return {
		totalLikes: totalLikes || 0,
		isLiked,
		recentLikers,
	};
}

/**
 * Get bulk like statistics for multiple listings
 * Optimized for feed performance
 */
export async function getBulkLikeStats(productIds: string[]): Promise<Map<string, LikeStats>> {
	if (productIds.length === 0) return new Map();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	const statsMap = new Map<string, LikeStats>();

	// Get like counts for all listings
	const { data: likeCounts } = await supabase
		.from('product_likes')
		.select('product_id')
		.in('product_id', productIds);

	// Count likes per listing
	const counts: Record<string, number> = {};
	(likeCounts || []).forEach((like) => {
		counts[like.product_id] = (counts[like.product_id] || 0) + 1;
	});

	// Get user's likes if logged in
	let userLikes: Set<string> = new Set();
	if (user) {
		const { data: userLikeData } = await supabase
			.from('product_likes')
			.select('product_id')
			.eq('user_id', user.id)
			.in('product_id', productIds);

		userLikes = new Set((userLikeData || []).map((like) => like.product_id));
	}

	// Build stats for each listing
	productIds.forEach((productId) => {
		statsMap.set(productId, {
			totalLikes: counts[productId] || 0,
			isLiked: userLikes.has(productId),
			recentLikers: [], // Skip recent likers for bulk to improve performance
		});
	});

	return statsMap;
}

/**
 * Subscribe to real-time like updates for a listing
 */
export function subscribeToLikes(
	productId: string,
	callback: (stats: LikeStats) => void
): () => void {
	const channelName = `likes:${productId}`;

	// Remove existing subscription if any
	if (subscriptions.has(channelName)) {
		subscriptions.get(channelName)?.unsubscribe();
	}

	// Create new subscription
	const channel = supabase
		.channel(channelName)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'product_likes',
				filter: `product_id=eq.${productId}`,
			},
			async () => {
				// Refresh like stats when changes occur
				try {
					const stats = await getLikeStats(productId);
					callback(stats);
				} catch (error) {
				}
			}
		)
		.subscribe();

	subscriptions.set(channelName, channel);

	// Return unsubscribe function
	return () => {
		channel.unsubscribe();
		subscriptions.delete(channelName);
	};
}

/**
 * Get trending listings based on recent likes
 */
export async function getTrendingByLikes(limit: number = 20): Promise<string[]> {
	const { data } = await supabase
		.from('product_likes')
		.select('product_id')
		.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
		.order('created_at', { ascending: false });

	if (!data) return [];

	// Count likes per listing in the last 7 days
	const likeCounts: Record<string, number> = {};
	data.forEach((like) => {
		likeCounts[like.product_id] = (likeCounts[like.product_id] || 0) + 1;
	});

	// Sort by like count and return listing IDs
	return Object.entries(likeCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit)
		.map(([productId]) => productId);
}

/**
 * Get user's liked listings (for profile/favorites page)
 */
export async function getUserLikedListings(userId?: string, limit: number = 50): Promise<string[]> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const targetUserId = userId || user?.id;

	if (!targetUserId) return [];

	const { data } = await supabase
		.from('product_likes')
		.select('product_id')
		.eq('user_id', targetUserId)
		.order('created_at', { ascending: false })
		.limit(limit);

	return (data || []).map((like) => like.product_id);
}

/**
 * Clean up all subscriptions (call on component unmount)
 */
export function cleanupLikeSubscriptions(): void {
	subscriptions.forEach((channel) => channel.unsubscribe());
	subscriptions.clear();
}

/**
 * Optimistic like update for instant UI feedback
 * Use this before calling toggleLike for better UX
 */
export function optimisticLikeUpdate(currentStats: LikeStats, isLiking: boolean): LikeStats {
	return {
		...currentStats,
		totalLikes: currentStats.totalLikes + (isLiking ? 1 : -1),
		isLiked: isLiking,
	};
}
