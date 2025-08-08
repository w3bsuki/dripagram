import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

// Types
export type UserProfile = {
	id: string;
	username: string;
	full_name?: string;
	avatar_url?: string;
	bio?: string;
	location?: string;
	phone?: string;
	rating: number;
	total_reviews: number;
	total_sales: number;
	verified: boolean;
	created_at: string;
	listings_count?: number;
	followers_count?: number;
	following_count?: number;
};

// Initialize Supabase client
const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Get current user profile
 */
export async function getCurrentUser() {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	return getUserProfile(user.id);
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

	if (error) {
		console.error('Error fetching user profile:', error);
		return null;
	}

	return {
		id: data.id,
		username: data.username || '',
		full_name: data.full_name || undefined,
		avatar_url: data.avatar_url || undefined,
		bio: data.bio || undefined,
		location: data.location || undefined,
		phone: undefined,
		rating: data.seller_rating || 0,
		total_reviews: data.seller_rating_count || 0,
		total_sales: 0,
		verified: false,
		created_at: data.created_at || '',
		listings_count: 0,
		followers_count: 0,
		following_count: 0,
	};
}

/**
 * Update user profile
 */
export async function updateProfile(
	updates: Partial<{
		username: string;
		full_name: string;
		bio: string;
		location: string;
		phone: string;
		avatar_url: string;
	}>
) {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const { data, error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', user.id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<string> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const fileExt = file.name.split('.').pop();
	const fileName = `${user.id}-${Date.now()}.${fileExt}`;
	const filePath = `avatars/${fileName}`;

	const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

	if (uploadError) throw uploadError;

	const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

	return data.publicUrl;
}

/**
 * Follow/unfollow user
 */
export async function toggleFollow(targetUserId: string): Promise<boolean> {
	// Temporarily disabled until follows table is properly typed
	return false;
}

/**
 * Check if following a user
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
	// Temporarily disabled until follows table is properly typed
	return false;
}

/**
 * Get user's listings
 */
export async function getUserListings(userId: string) {
	const { data, error } = await supabase
		.from('listings')
		.select('*')
		.eq('seller_id', userId)
		.eq('status', 'active')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching user listings:', error);
		return [];
	}

	return data;
}

/**
 * Get user's reviews
 */
export async function getUserReviews(userId: string) {
	// Temporarily return empty array until reviews table is properly typed
	return [];
}

/**
 * Leave a review for a user
 */
export async function createReview(review: {
	transaction_id: string;
	seller_id: string;
	rating: number;
	review_text: string;
}) {
	// Temporarily disabled until reviews table is properly typed
	return null;
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
	const [profile, listings, sales] = await Promise.all([
		getUserProfile(userId),
		supabase
			.from('listings')
			.select('*', { count: 'exact' })
			.eq('seller_id', userId)
			.eq('status', 'active'),
		supabase
			.from('transactions')
			.select('*', { count: 'exact' })
			.eq('seller_id', userId)
			.eq('status', 'completed'),
	]);

	return {
		profile,
		activeListings: listings.count || 0,
		totalSales: sales.count || 0,
	};
}
