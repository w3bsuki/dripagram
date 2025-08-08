import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { username } = params;
	const { session, user } = await locals.safeGetSession();
	
	// Fetch user profile
	const { data: profile, error: profileError } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('username', username)
		.single();
		
	if (profileError || !profile) {
		throw error(404, 'User not found');
	}
	
	// Fetch user's listings (use products table)
	const { data: listings } = await locals.supabase
		.from('products')
		.select('*')
		.eq('seller_id', profile.id)
		.eq('status', 'active')
		.order('created_at', { ascending: false });
	
	// Check if current user is following this profile
	let isFollowing = false;
	if (user && user.id !== profile.id) {
		const { data: followData } = await locals.supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', profile.id)
			.single();
		
		isFollowing = !!followData;
	}
	
	// Get actual stats
	const stats = {
		listings: listings?.length || 0,
		followers: profile.follower_count || 0,
		following: profile.following_count || 0
	};
	
	return {
		profile,
		listings: listings || [],
		stats,
		isFollowing
	};
};