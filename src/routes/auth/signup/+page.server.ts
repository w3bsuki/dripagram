import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Fallback redirect for old auth paths
export const load: PageServerLoad = async ({ url }) => {
	// Default to Bulgarian locale for fallback
	const redirectTo = url.searchParams.get('redirectTo');
	const newUrl = redirectTo 
		? `/bg/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`
		: '/bg/auth/signup';
	
	throw redirect(301, newUrl);
};