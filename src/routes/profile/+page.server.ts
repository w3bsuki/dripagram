import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserListings } from '$lib/services/listingService';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	
	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	try {
		// Get user's listings
		const listings = await getUserListings(locals.supabase, user.id);

		// Get listing stats
		const activeListings = listings.filter((l) => l.status === 'active');
		const soldListings = listings.filter((l) => l.status === 'sold');

		return {
			session,
			user,
			listings: activeListings,
			soldListings,
			stats: {
				listings: activeListings.length,
				sold: soldListings.length,
				followers: user.user_metadata?.follower_count || 0,
				following: user.user_metadata?.following_count || 0,
			},
		};
	} catch (error) {
		console.error('Error loading profile:', error);

		// Return empty data if there's an error
		return {
			session,
			user,
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
