import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Handles email confirmation for signup, password reset, and other OTP-based flows.
 * This is the recommended handler for email verification links.
 */
export const GET: RequestHandler = async ({ url, locals: { supabase }, params }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const locale = params.lang || 'bg';
	const next = url.searchParams.get('next') ?? `/${locale}`;

	if (token_hash && type) {
		try {
			const { error } = await supabase.auth.verifyOtp({
				type,
				token_hash,
			});

			if (!error) {
				// Successfully verified - redirect based on type
				switch (type) {
					case 'recovery':
						redirect(303, `/${locale}/auth/reset-password`);
					case 'signup':
						redirect(303, `/${locale}/onboarding`);
					case 'invite':
						redirect(303, next);
					case 'email_change':
						redirect(303, `/${locale}/profile`);
					default:
						redirect(303, next);
				}
			} else {
				redirect(303, `/${locale}/auth/error?message=${encodeURIComponent(error.message)}`);
			}
		} catch (err) {
			redirect(303, `/${locale}/auth/error?message=Email%20confirmation%20failed`);
		}
	}

	// If no valid token parameters found
	redirect(303, `/${locale}/auth/error?message=Invalid%20confirmation%20link`);
};