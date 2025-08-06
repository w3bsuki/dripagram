import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/supabase/types';
import type { Product } from './productService';

// Initialize Supabase client
const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Toggle favorite status for a product
 */
export async function toggleFavorite(productId: string): Promise<boolean> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in to favorite items');

	// Check if already favorited
	const { data: existing } = await supabase
		.from('favorites')
		.select('*')
		.eq('user_id', user.id)
		.eq('product_id', productId)
		.single();

	if (existing) {
		// Remove from favorites
		const { error } = await supabase
			.from('favorites')
			.delete()
			.eq('user_id', user.id)
			.eq('product_id', productId);

		if (error) throw error;
		return false;
	} else {
		// Add to favorites
		const { error } = await supabase.from('favorites').insert({
			user_id: user.id,
			product_id: productId,
		});

		if (error) throw error;
		return true;
	}
}

/**
 * Check if product is favorited by current user
 */
export async function isFavorited(productId: string): Promise<boolean> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return false;

	const { data } = await supabase
		.from('favorites')
		.select('*')
		.eq('user_id', user.id)
		.eq('product_id', productId)
		.single();

	return !!data;
}

/**
 * Get user's favorite products
 */
export async function getFavorites(): Promise<Product[]> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from('favorites')
		.select(
			`
			product_id,
			created_at,
			products (*)
		`
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching favorites:', error);
		return [];
	}

	// Transform data to match Product type
	return (data || []).map(
		(item) =>
			({
				...(item as any).products,
				seller: {
					name: 'Seller',
					rating: 4.5,
					verified: true,
				},
				images: Array.isArray((item as any).products?.images) ? (item as any).products.images : [],
				isFavorite: true,
			}) as Product
	);
}

/**
 * Get favorite count for a product
 */
export async function getFavoriteCount(productId: string): Promise<number> {
	const { count, error } = await supabase
		.from('favorites')
		.select('*', { count: 'exact', head: true })
		.eq('product_id', productId);

	if (error) {
		console.error('Error getting favorite count:', error);
		return 0;
	}

	return count || 0;
}

/**
 * Get user's favorite count
 */
export async function getUserFavoriteCount(): Promise<number> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return 0;

	const { count, error } = await supabase
		.from('favorites')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', user.id);

	if (error) {
		console.error('Error getting user favorite count:', error);
		return 0;
	}

	return count || 0;
}

// Saved searches functionality - to be implemented when table is created
// /**
//  * Create saved search alert
//  */
// export async function createSavedSearch(search: {
// 	query?: string;
// 	category?: string;
// 	min_price?: number;
// 	max_price?: number;
// 	condition?: string;
// 	size?: string;
// 	brand?: string;
// }) {
// 	const { data: { user } } = await supabase.auth.getUser();
// 	if (!user) throw new Error('Must be logged in to save searches');

// 	const { data, error } = await supabase
// 		.from('saved_searches')
// 		.insert({
// 			user_id: user.id,
// 			...search,
// 			notify: true
// 		})
// 		.select()
// 		.single();

// 	if (error) throw error;
// 	return data;
// }

// /**
//  * Get user's saved searches
//  */
// export async function getSavedSearches() {
// 	const { data: { user } } = await supabase.auth.getUser();
// 	if (!user) return [];

// 	const { data, error } = await supabase
// 		.from('saved_searches')
// 		.select('*')
// 		.eq('user_id', user.id)
// 		.order('created_at', { ascending: false });

// 	if (error) {
// 		console.error('Error fetching saved searches:', error);
// 		return [];
// 	}

// 	return data || [];
// }

// /**
//  * Delete saved search
//  */
// export async function deleteSavedSearch(searchId: string) {
// 	const { data: { user } } = await supabase.auth.getUser();
// 	if (!user) throw new Error('Must be logged in');

// 	const { error } = await supabase
// 		.from('saved_searches')
// 		.delete()
// 		.eq('id', searchId)
// 		.eq('user_id', user.id);

// 	if (error) throw error;
// 	return true;
// }
