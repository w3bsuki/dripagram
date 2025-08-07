import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { EmailOtpType } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	console.log('Auth callback triggered:', { token_hash: !!token_hash, type, code: !!code, next });

	try {
		// Handle email verification with OTP token (modern PKCE flow)
		if (token_hash && type) {
			console.log('Processing OTP verification:', { type });
			
			const { error } = await supabase.auth.verifyOtp({
				type,
				token_hash
			});

			if (error) {
				console.error('OTP verification failed:', error);
				redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
			}

			// Handle specific verification types
			switch (type) {
				case 'recovery':
					console.log('Password recovery verified - redirecting to reset');
					redirect(303, '/auth/reset-password');
				case 'signup':
					console.log('Email verified - redirecting to dashboard');
					redirect(303, '/dashboard');
				case 'invite':
					console.log('Invite verified - redirecting');
					redirect(303, next);
				default:
					console.log('Generic verification completed');
					redirect(303, next);
			}
		}

		// Handle OAuth callback with authorization code (PKCE flow)
		if (code) {
			console.log('Processing OAuth code exchange');
			
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			
			if (error) {
				console.error('OAuth code exchange failed:', error);
				redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`);
			}

			console.log('OAuth authentication successful - redirecting to:', next);
			redirect(303, next);
		}

		// If no valid auth parameters found
		console.warn('Auth callback called without valid parameters:', Object.fromEntries(url.searchParams));
		redirect(303, '/auth/error?message=Invalid%20authentication%20request');

	} catch (err) {
		console.error('Unexpected error in auth callback:', err);
		redirect(303, '/auth/error?message=Authentication%20failed');
	}
};