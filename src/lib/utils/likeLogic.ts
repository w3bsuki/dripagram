/**
 * Shared Like Logic Utility
 * Centralized logic for handling like operations across components
 */

import { getSupabaseBrowserClient } from '$lib/supabase/client';

export interface LikeState {
	isLiked: boolean;
	likeCount: number;
	isAnimating?: boolean;
}

/**
 * Toggle like state optimistically
 * Returns the new state after toggling
 */
export function toggleLikeState(currentState: LikeState): LikeState {
	const newIsLiked = !currentState.isLiked;
	const newCount = newIsLiked 
		? Math.max(0, currentState.likeCount + 1)
		: Math.max(0, currentState.likeCount - 1);
	
	return {
		isLiked: newIsLiked,
		likeCount: newCount,
		isAnimating: true
	};
}

/**
 * Format like count for display
 */
export function formatLikeCount(count: number): string {
	if (count === 0) return '';
	if (count < 1000) return count.toString();
	if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
	return `${(count / 1000000).toFixed(1)}m`;
}

/**
 * Format like text (e.g., "1 like", "2 likes")
 */
export function formatLikeText(count: number): string {
	if (count === 0) return 'No likes yet';
	if (count === 1) return '1 like';
	return `${count.toLocaleString()} likes`;
}

/**
 * Handle like action with database update
 * Performs optimistic update and syncs with database
 */
export async function handleLikeAction(
	productId: string,
	currentState: LikeState,
	userId?: string | null
): Promise<{ success: boolean; newState: LikeState; error?: string }> {
	// Check if user is authenticated
	if (!userId) {
		return {
			success: false,
			newState: currentState,
			error: 'Authentication required'
		};
	}

	// Optimistic update
	const newState = toggleLikeState(currentState);
	
	try {
		const supabase = getSupabaseBrowserClient();
		
		if (newState.isLiked) {
			// Add like
			const { error } = await supabase
				.from('likes')
				.insert({
					product_id: productId,
					user_id: userId
				});
			
			if (error && error.code !== '23505') { // Ignore duplicate key errors
				throw error;
			}
		} else {
			// Remove like
			const { error } = await supabase
				.from('likes')
				.delete()
				.eq('product_id', productId)
				.eq('user_id', userId);
			
			if (error) {
				throw error;
			}
		}
		
		return {
			success: true,
			newState
		};
	} catch (error) {
		// Revert on error
		return {
			success: false,
			newState: currentState,
			error: error instanceof Error ? error.message : 'Failed to update like'
		};
	}
}

/**
 * Check if a product is liked by the current user
 */
export async function checkIsLiked(
	productId: string,
	userId?: string | null
): Promise<boolean> {
	if (!userId) return false;
	
	try {
		const supabase = getSupabaseBrowserClient();
		const { data, error } = await supabase
			.from('likes')
			.select('id')
			.eq('product_id', productId)
			.eq('user_id', userId)
			.single();
		
		return !error && !!data;
	} catch {
		return false;
	}
}

/**
 * Get like count for a product
 */
export async function getLikeCount(productId: string): Promise<number> {
	try {
		const supabase = getSupabaseBrowserClient();
		const { count, error } = await supabase
			.from('likes')
			.select('*', { count: 'exact', head: true })
			.eq('product_id', productId);
		
		if (error) throw error;
		return count || 0;
	} catch {
		return 0;
	}
}

/**
 * Handle double-tap to like gesture
 */
export function handleDoubleTapLike(
	currentState: LikeState,
	onLike: () => void
): LikeState {
	if (!currentState.isLiked) {
		onLike();
		return {
			...currentState,
			isLiked: true,
			likeCount: currentState.likeCount + 1,
			isAnimating: true
		};
	}
	return currentState;
}

/**
 * Animation duration for like heart animation
 */
export const LIKE_ANIMATION_DURATION = 600;

/**
 * Animation duration for save/bookmark animation  
 */
export const SAVE_ANIMATION_DURATION = 300;