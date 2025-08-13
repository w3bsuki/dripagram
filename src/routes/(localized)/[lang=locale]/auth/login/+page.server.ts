import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const { session } = await locals.safeGetSession();
	const locale = params.lang || 'bg';
	
	if (session) {
		// Redirect to localized path
		const redirectTo = url.searchParams.get('redirectTo') || `/${locale}`;
		redirect(303, redirectTo);
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url, params }) => {
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		
		const locale = params.lang || 'bg';
		const redirectTo = url.searchParams.get('redirectTo') || `/${locale}`;

		// Validate form data with Zod schema
		const result = loginSchema.safeParse(formData);
		
		if (!result.success) {
			const errors = result.error.format();
			return fail(400, { 
				error: errors.email?._errors[0] || errors.password?._errors[0] || 'Invalid form data',
				email: formData.email as string
			});
		}

		const { email, password } = result.data;

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(400, { 
				error: error.message,
				email: email
			});
		}

		throw redirect(303, redirectTo);
	}
};