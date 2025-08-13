import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals, cookies, url }) => {
	const { lang } = params;
	
	// Set the locale in locals for this route group
	locals.lang = lang as 'bg' | 'en';
	
	// Get region from cookies
	const region = cookies.get('region') || (lang === 'bg' ? 'sofia' : 'international');
	
	// Get user session
	const { session, user } = await locals.safeGetSession();
	
	// If user is logged in, check if onboarding is completed
	if (session && user) {
		// Allow auth-related routes and onboarding
		const allowedPaths = ['/auth/', '/onboarding'];
		const isAllowedPath = allowedPaths.some(path => url.pathname.includes(path));
		
		if (!isAllowedPath) {
			// Check if user has completed onboarding
			const { data: profile } = await locals.supabase
				.from('profiles')
				.select('onboarding_completed')
				.eq('id', user.id)
				.single();
			
			// If onboarding not completed, redirect to onboarding
			if (!profile?.onboarding_completed) {
				throw redirect(303, `/${lang}/onboarding`);
			}
		}
	}
	
	return {
		lang: lang as 'bg' | 'en',
		region
	};
};