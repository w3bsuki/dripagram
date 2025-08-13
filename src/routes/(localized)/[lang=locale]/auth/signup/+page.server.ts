import { fail, redirect } from '@sveltejs/kit';
import { signupSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session } = await locals.safeGetSession();
	const locale = params.lang || 'bg';
	
	// If already logged in, redirect to localized home
	if (session) {
		redirect(303, `/${locale}`);
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url, params }) => {
		const data = await request.formData();
		const formData = Object.fromEntries(data);

		const locale = params.lang || 'bg';

		// Validate form data with Zod schema
		const result = signupSchema.safeParse(formData);
		
		if (!result.success) {
			const errors = result.error.format();
			
			// Return the first validation error
			let errorMessage = 'Invalid form data';
			if (errors.email?._errors[0]) errorMessage = errors.email._errors[0];
			else if (errors.password?._errors[0]) errorMessage = errors.password._errors[0];
			else if (errors.confirmPassword?._errors[0]) errorMessage = errors.confirmPassword._errors[0];
			else if (errors.fullName?._errors[0]) errorMessage = errors.fullName._errors[0];
			
			return fail(400, { 
				error: errorMessage,
				email: formData.email as string,
				fullName: formData.fullName as string
			});
		}

		const { email, password, fullName } = result.data;

		// Sign up the user
		const { data: authData, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName
				},
				emailRedirectTo: `https://driplo.xyz/${locale}/auth/confirm`
			}
		});

		if (error) {
			return fail(400, { 
				error: error.message,
				email: email,
				fullName: fullName
			});
		}

		if (authData.user) {
			// Update profile with additional data - username will be set during onboarding
			const { error: profileError } = await locals.supabase
				.from('profiles')
				.upsert({
					id: authData.user.id,
					username: `user_${authData.user.id.slice(0, 8)}`, // Temporary username
					full_name: fullName,
					account_type: 'personal',
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				});

			if (profileError) {
				console.error('Profile creation error:', profileError);
			}
		}

		// Redirect to localized verification page
		throw redirect(303, `/${locale}/auth/verify`);
	}
};