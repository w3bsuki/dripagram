import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	// Return any initial data needed for the messages page
	return {
		session,
		user: session.user,
	};
};