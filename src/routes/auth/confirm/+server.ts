import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Handles email confirmation for signup, password reset, and other OTP-based flows.
 * This is the recommended handler for email verification links.
 */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/';

	console.log('Auth confirm triggered:', { token_hash: !!token_hash, type, next });

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
						console.log('Password recovery confirmed - redirecting to reset');
						redirect(303, '/auth/reset-password');
					case 'signup':
						console.log('Email signup confirmed - redirecting to onboarding');
						redirect(303, '/onboarding');
					case 'invite':
						console.log('Invite confirmed - redirecting');
						redirect(303, next);
					case 'email_change':
						console.log('Email change confirmed - redirecting to profile');
						redirect(303, '/profile');
					default:
						console.log('Generic confirmation completed - redirecting');
						redirect(303, next);
				}
			} else {
				console.error('OTP verification failed:', error);
				redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
			}
		} catch (err) {
			console.error('Unexpected error during email confirmation:', err);
			redirect(303, '/auth/error?message=Email%20confirmation%20failed');
		}
	}

	// If no valid token parameters found
	console.warn('Auth confirm called without valid parameters:', Object.fromEntries(url.searchParams));
	redirect(303, '/auth/error?message=Invalid%20confirmation%20link');
};