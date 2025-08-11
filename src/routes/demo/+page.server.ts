import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		demo: true
	};
}) satisfies PageServerLoad;