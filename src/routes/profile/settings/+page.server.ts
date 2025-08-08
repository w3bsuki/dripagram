import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	
	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	return {
		session,
		user,
		supabase: locals.supabase
	};
};