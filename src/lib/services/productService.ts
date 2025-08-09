import { getSupabaseBrowserClient } from '$lib/supabase/client';
import type { Database } from '$lib/types/database.types';

// Types
export type Product = Database['public']['Tables']['products']['Row'] & {
	seller?: {
		name: string;
		avatar?: string;
		rating: number;
		verified?: boolean;
	};
	images: string[];
	isFavorite?: boolean;
};

export type ProductFilters = {
	category?: string;
	condition?: string;
	minPrice?: number;
	maxPrice?: number;
	size?: string;
	brand?: string;
	gender?: string;
	sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
	search?: string;
	limit?: number;
	offset?: number;
};

// Use centralized Supabase client
const supabase = getSupabaseBrowserClient();

/**
 * Get products with filters
 */
export async function getProducts(filters: ProductFilters = {}) {
	let query = supabase.from('products').select('*').eq('status', 'active');

	// Apply filters
	if (filters.category) {
		query = query.eq('category_id', filters.category);
	}

	if (filters.condition) {
		query = query.eq('condition', filters.condition);
	}

	if (filters.minPrice) {
		query = query.gte('price', filters.minPrice);
	}

	if (filters.maxPrice) {
		query = query.lte('price', filters.maxPrice);
	}

	if (filters.size) {
		query = query.eq('size', filters.size);
	}

	if (filters.brand) {
		const escapedBrand = filters.brand.replace(/[%_]/g, '\\$&');
		query = query.ilike('brand', `%${escapedBrand}%`);
	}

	if (filters.search) {
		const escapedSearch = filters.search.replace(/[%_]/g, '\\$&');
		query = query.or(`title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`);
	}

	// Apply sorting
	switch (filters.sortBy) {
		case 'price_asc':
			query = query.order('price', { ascending: true });
			break;
		case 'price_desc':
			query = query.order('price', { ascending: false });
			break;
		case 'popular':
			query = query.order('view_count', { ascending: false });
			break;
		case 'newest':
		default:
			query = query.order('created_at', { ascending: false });
	}

	// Apply pagination
	const limit = filters.limit || 20;
	const offset = filters.offset || 0;
	query = query.range(offset, offset + limit - 1);

	const { data, error } = await query;

	if (error) {
		return [];
	}

	// Transform to match our Product type
	return (data || []).map(
		(item) =>
			({
				...item,
				seller: {
					name: 'Seller',
					rating: 4.5,
					verified: true,
				},
				images: Array.isArray(item.images) ? item.images : [],
				isFavorite: false,
			}) as Product
	);
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts() {
	return getProducts({
		sortBy: 'popular',
		limit: 12,
	});
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string) {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

	if (error) {
		return null;
	}

	return {
		...data,
		seller: {
			name: 'Seller',
			rating: 4.5,
			verified: true,
		},
		images: Array.isArray(data.images) ? data.images : [],
		isFavorite: false,
	} as Product;
}

/**
 * Create a new product listing
 */
export async function createListing(listing: {
	title: string;
	description: string;
	price: number;
	category_id: string;
	condition: string;
	size?: string;
	brand?: string;
	images: string[];
	location?: string;
}) {
	const supabase = getSupabaseClient();

	// Get current user
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error('You must be logged in to create a listing');
	}

	const { data, error } = await supabase
		.from('products')
		.insert({
			...listing,
			seller_id: user.id,
			status: 'active',
			view_count: 0,
		})
		.select()
		.single();

	if (error) {
		throw error;
	}

	return data;
}

/**
 * Update a product listing
 */
export async function updateListing(
	id: string,
	updates: Partial<{
		title: string;
		description: string;
		price: number;
		category_id: string;
		condition: string;
		size?: string;
		brand?: string;
		images: string[];
		status: string;
	}>
) {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from('products')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return data;
}

/**
 * Delete a product listing
 */
export async function deleteListing(id: string) {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from('listings').delete().eq('id', id);

	if (error) {
		throw error;
	}

	return true;
}

/**
 * Increment view count for a product
 */
export async function incrementViewCount(id: string) {
	const supabase = getSupabaseClient();
	// Get current count and increment
	const { data: listing } = await supabase
		.from('products')
		.select('view_count')
		.eq('id', id)
		.single();

	if (!listing) return;

	const { error } = await supabase
		.from('products')
		.update({ view_count: (listing.view_count || 0) + 1 })
		.eq('id', id);

	if (error) {
	}
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string) {
	// Map friendly URLs to actual categories
	const categoryMap: Record<string, string> = {
		women: 'womens-clothing',
		men: 'mens-clothing',
		kids: 'kids-clothing',
		vintage: 'vintage',
		luxury: 'designer',
		shoes: 'shoes',
		bags: 'bags-accessories',
	};

	const actualCategory = categoryMap[category] || category;

	return getProducts({
		category: actualCategory,
		sortBy: 'newest',
	});
}

/**
 * Get products by condition
 */
export async function getProductsByCondition(condition: string) {
	// Map URL-friendly conditions to database values
	const conditionMap: Record<string, string> = {
		'new-with-tags': 'new_with_tags',
		'like-new': 'like_new',
		'very-good': 'very_good',
		good: 'good',
		fair: 'fair',
	};

	const actualCondition = conditionMap[condition] || condition;

	return getProducts({
		condition: actualCondition,
		sortBy: 'newest',
	});
}
