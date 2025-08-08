import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserListings } from '$lib/services/listingService';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	
	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	try {
		// Get user's profile data from the profiles table
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		// Get user's listings from the products table
		const { data: products } = await locals.supabase
			.from('products')
			.select('*')
			.eq('seller_id', user.id)
			.order('created_at', { ascending: false });

		// Get listing stats
		const activeListings = products?.filter((l) => l.status === 'active') || [];
		const soldListings = products?.filter((l) => l.status === 'sold') || [];

		return {
			session,
			user,
			profile,
			listings: activeListings,
			soldListings,
			stats: {
				listings: activeListings.length,
				sold: soldListings.length,
				followers: profile?.follower_count || 0,
				following: profile?.following_count || 0,
			},
		};
	} catch (error) {
		console.error('Error loading profile:', error);

		// Return empty data if there's an error
		return {
			session,
			user,
			profile: null,
			listings: [],
			soldListings: [],
			stats: {
				listings: 0,
				sold: 0,
				followers: 0,
				following: 0,
			},
		};
	}
};
