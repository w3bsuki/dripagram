import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

/**
 * Root page redirect logic for Bulgarian-first localization
 * Redirects users to their preferred locale path:
 * - Default: /bg (Bulgarian)
 * - If user prefers English: /en
 * - Preserves URL parameters during redirect
 */
export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	// Get user's preferred locale from different sources
	const userLang = locals.lang || 'bg';
	const cookieLocale = cookies.get('locale') || 'bg';
	const urlParams = url.searchParams.toString();
	
	// Default to Bulgarian, but respect user preferences
	const targetLocale = userLang === 'en' ? 'en' : 'bg';
	
	// Preserve URL parameters when redirecting
	const redirectUrl = urlParams ? `/${targetLocale}?${urlParams}` : `/${targetLocale}`;
	
	throw redirect(302, redirectUrl);
};