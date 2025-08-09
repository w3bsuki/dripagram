import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, lang }, cookies }) => {
	const { session, user } = await safeGetSession();

	return {
		session,
		user,
		lang,
		cookies: cookies.getAll(),
	};
};
