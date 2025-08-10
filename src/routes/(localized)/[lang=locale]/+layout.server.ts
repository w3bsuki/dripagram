import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals, cookies }) => {
	const { lang } = params;
	
	// Set the locale in locals for this route group
	locals.lang = lang as 'bg' | 'en';
	
	// Get region from cookies
	const region = cookies.get('region') || (lang === 'bg' ? 'sofia' : 'international');
	
	return {
		lang: lang as 'bg' | 'en',
		region
	};
};