import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	return {
		session,
		user: session.user
	};
};