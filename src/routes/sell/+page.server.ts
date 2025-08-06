import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { session, user } }) => {
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	return {
		session,
		user,
	};
};
