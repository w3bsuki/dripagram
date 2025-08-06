import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

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

	const { data, error } = await supabase
		.from('products')
		.insert({
			...listingData,
			seller_id: user.id,
			thumbnail_url,
			status: 'active',
			views: 0,
			likes: 0,
			like_count: 0,
		})
		.select('id')
		.single();

	if (error) {
		console.error('Create listing error:', error);
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
		console.error('Update listing error:', error);
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
		console.error('Delete listing error:', error);
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
		console.error('Get user listings error:', error);
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
        avatar_url
      )
    `
		)
		.eq('id', id)
		.single();

	if (error) {
		console.error('Get listing error:', error);
		throw new Error(`Failed to get listing: ${error.message}`);
	}

	return data;
}
