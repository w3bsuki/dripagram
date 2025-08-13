import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const next = url.searchParams.get('next') || '';
	const locale = params.lang || 'bg';

	if (token_hash && type) {
		const { data, error } = await locals.supabase.auth.verifyOtp({
			type: type as any,
			token_hash,
		});

		if (error) {
			console.error('Auth confirmation error:', error);
			throw redirect(303, `/${locale}/auth/error?message=${encodeURIComponent(error.message)}`);
		}

		if (data?.user) {
			// Successful verification - redirect based on type and user state
			const { data: profile } = await locals.supabase
				.from('profiles')
				.select('onboarding_completed, username')
				.eq('id', data.user.id)
				.single();

			// Determine redirect destination
			if (type === 'recovery') {
				// Password reset - go to reset password page
				throw redirect(303, `/${locale}/auth/reset-password`);
			} else if (type === 'email' || type === 'signup') {
				// Email confirmation - check if onboarding needed
				if (!profile?.onboarding_completed) {
					throw redirect(303, `/${locale}/onboarding`);
				} else {
					throw redirect(303, `/${locale}`);
				}
			} else if (type === 'magiclink') {
				// Magic link - go to intended destination or home
				if (next) {
					throw redirect(303, `/${locale}${next}`);
				} else {
					throw redirect(303, `/${locale}`);
				}
			}
		}
	}

	// If no token or verification failed, redirect to login
	throw redirect(303, `/${locale}/auth/login?error=invalid_link`);
};