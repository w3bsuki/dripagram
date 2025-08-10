import type { LayoutLoad } from './$types';
import { setLocale } from '$lib/paraglide/runtime.js';

export const load: LayoutLoad = async ({ params }) => {
	const { lang } = params;
	
	// Set Paraglide locale on the client side
	setLocale(lang as 'bg' | 'en');
	
	return {
		lang: lang as 'bg' | 'en'
	};
};