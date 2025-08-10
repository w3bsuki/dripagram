import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Fallback redirect for old onboarding path
export const load: PageServerLoad = async () => {
	// Default to Bulgarian locale for fallback
	throw redirect(301, '/bg/onboarding');
};