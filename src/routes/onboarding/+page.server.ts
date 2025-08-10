import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Redirect to login if not authenticated
	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	// Check if user has already completed onboarding
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('onboarding_completed, username, account_type, social_links')
		.eq('id', user.id)
		.single();

	// Redirect to home if already onboarded
	if (profile?.onboarding_completed) {
		throw redirect(303, '/bg');
	}

	return {
		user,
		profile: profile || {}
	};
};