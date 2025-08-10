import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { signupSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

// Define adapter at module level for memoization
const signupAdapter = zod(signupSchema as any);

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	
	// If already logged in, redirect to home
	if (session) {
		redirect(303, '/');
	}
	
	const form = await superValidate(signupAdapter, { id: 'signup' });
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, signupAdapter, { id: 'signup' });
		
		if (!form.valid) {
			return fail(400, { form });
		}
		
		const { email, password, fullName } = form.data as {
			email: string;
			password: string;
			confirmPassword: string;
			fullName: string;
		};

		// Sign up the user
		const { data: authData, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName
				},
				emailRedirectTo: `${url.origin}/auth/confirm`
			}
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		if (authData.user) {
			// Update profile with additional data - username will be set during onboarding
			const { error: profileError } = await locals.supabase
				.from('profiles')
				.upsert({
					id: authData.user.id,
					full_name: fullName,
					account_type: 'personal',
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				});

			if (profileError) {
				console.error('Profile creation error:', profileError);
			}
		}

		// Redirect to verification page
		throw redirect(303, '/auth/verify');
	}
};