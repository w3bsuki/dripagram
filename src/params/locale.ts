import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Parameter matcher for locale routes
 * Matches 'bg' and 'en' locale codes
 */
export const match: ParamMatcher = (param) => {
	return /^(bg|en)$/.test(param);
};