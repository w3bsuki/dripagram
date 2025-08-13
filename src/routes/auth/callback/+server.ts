import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	try {
		// Handle email verification with OTP token (modern PKCE flow)
		if (token_hash && type) {
			
			const { error } = await supabase.auth.verifyOtp({
				type,
				token_hash
			});

			if (error) {
				redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
			}

			// Handle specific verification types
			switch (type) {
				case 'recovery':
					redirect(303, '/bg/auth/reset-password');
					break;
				case 'signup':
					redirect(303, '/onboarding'); // Redirect to onboarding after email confirmation
					break;
				case 'invite':
					redirect(303, next);
					break;
				default:
					redirect(303, next);
					break;
			}
		}

		// Handle OAuth callback with authorization code (PKCE flow)
		if (code) {
			
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			
			if (error) {
				redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
			}

			redirect(303, next);
		}

		// If no valid auth parameters found
		redirect(303, '/auth/error?message=Invalid%20authentication%20request');

	} catch (err) {
		redirect(303, '/auth/error?message=Authentication%20failed');
	}
};