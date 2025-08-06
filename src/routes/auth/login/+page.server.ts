import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const { session } = await locals.safeGetSession();
	
	// If already logged in, redirect to home or intended destination
	if (session) {
		const redirectTo = url.searchParams.get('redirectTo') || '/';
		redirect(303, redirectTo);
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const redirectTo = url.searchParams.get('redirectTo') || '/';

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			// Check if it's email not confirmed error
			if (error.message === 'Email not confirmed') {
				return fail(400, {
					error: 'Please confirm your email before signing in. Check your inbox for the confirmation link.',
					email
				});
			}
			
			return fail(400, {
				error: error.message,
				email
			});
		}

		// Successful login - redirect
		redirect(303, redirectTo);
	}
};