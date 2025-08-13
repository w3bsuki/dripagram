import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

const supabase = createClient();

export interface ListingData {
	// Basic Info
	title: string;
	description: string;
	price: number;
	category_id?: string;

	// Product Details
	brand?: string;
	size?: string;
	condition: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair';
	color?: string;
	material?: string;

	// Images
	images: string[];
	thumbnail_url?: string;

	// Location & Shipping
	location?: string;
	city?: string;
	shipping_available: boolean;
	shipping_price?: number;

	// Instagram-style features
	tags?: string[];
}

export async function createListing(
	listingData: ListingData,
	supabase: SupabaseClient<Database>
): Promise<{ id: string }> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in to create listing');

	// Set thumbnail to first image if not provided
	const thumbnail_url = listingData.thumbnail_url || listingData.images[0] || null;

	// Convert condition values to match database enum
	const conditionMap: Record<string, string> = {
		'new': 'new',
		'like_new': 'like_new',
		'very_good': 'very_good',
		'good': 'good',
		'acceptable': 'acceptable'
	};

	const insertData = {
		title: listingData.title,
		description: listingData.description || null,
		price: listingData.price,
		category_id: listingData.category_id || null,
		brand: listingData.brand || null,
		size: listingData.size || null,
		condition: conditionMap[listingData.condition] || 'good',
		color: listingData.color || null,
		material: listingData.material || null,
		images: listingData.images,
		thumbnail_url,
		location: listingData.location ? { city: listingData.location } : null,
		city: listingData.city || listingData.location || null,
		shipping_available: listingData.shipping_available,
		shipping_price: listingData.shipping_price || null,
		tags: listingData.tags || [],
		seller_id: user.id,
		status: 'active',
		views: 0,
		likes: 0,
		like_count: 0
	};

	console.log('Inserting listing data:', insertData);

	const { data, error } = await supabase
		.from('products')
		.insert(insertData)
		.select('id')
		.single();

	if (error) {
		console.error('Supabase error:', error);
		throw new Error(`Failed to create listing: ${error.message}`);
	}

	return data;
}

export async function updateListing(
	id: string,
	listingData: Partial<ListingData>,
	supabase: SupabaseClient<Database>
): Promise<void> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in to update listing');

	const { error } = await supabase
		.from('products')
		.update({
			...listingData,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.eq('seller_id', user.id); // Ensure user owns the listing

	if (error) {
		throw new Error(`Failed to update listing: ${error.message}`);
	}
}

export async function deleteListing(id: string, supabase: SupabaseClient<Database>): Promise<void> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in to delete listing');

	const { error } = await supabase
		.from('products')
		.update({ status: 'deleted' })
		.eq('id', id)
		.eq('seller_id', user.id); // Ensure user owns the listing

	if (error) {
		throw new Error(`Failed to delete listing: ${error.message}`);
	}
}

export async function getUserListings(
	supabase: SupabaseClient<Database>,
	userId: string,
	status?: string
): Promise<any[]> {
	let query = supabase
		.from('products')
		.select('*')
		.eq('seller_id', userId)
		.order('created_at', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(`Failed to get listings: ${error.message}`);
	}

	return data || [];
}

export async function getListingById(id: string, supabase: SupabaseClient<Database>): Promise<any> {
	const { data, error } = await supabase
		.from('products')
		.select(
			`
      *,
      seller:profiles!seller_id (
        id,
        username,
        full_name,
        avatar_url,
        verified,
        created_at
      ),
      category:categories(name, slug)
    `
		)
		.eq('id', id)
		.eq('status', 'active')
		.single();

	if (error) {
		throw new Error(`Failed to get listing: ${error.message}`);
	}

	return data;
}
