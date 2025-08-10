import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

// Define adapter at module level for memoization
const loginAdapter = zod(loginSchema as any);

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const { session } = await locals.safeGetSession();
	const locale = params.lang || 'bg';
	
	if (session) {
		// Redirect to localized path
		const redirectTo = url.searchParams.get('redirectTo') || `/${locale}`;
		redirect(303, redirectTo);
	}
	
	const form = await superValidate(loginAdapter, { id: 'login' });
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url, params }) => {
		const form = await superValidate(request, loginAdapter, { id: 'login' });
		
		if (!form.valid) {
			return fail(400, { form });
		}
		
		const { email, password } = form.data as { email: string; password: string };
		const locale = params.lang || 'bg';
		const redirectTo = url.searchParams.get('redirectTo') || `/${locale}`;

		const { error, data } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		throw redirect(303, redirectTo);
	}
};