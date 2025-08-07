import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

// Define adapter at module level for memoization
const loginAdapter = zod(loginSchema as any);

export const load: PageServerLoad = async ({ url, locals }) => {
	const { session } = await locals.safeGetSession();
	
	if (session) {
		const redirectTo = url.searchParams.get('redirectTo') || '/';
		redirect(303, redirectTo);
	}
	
	const form = await superValidate(loginAdapter, { id: 'login' });
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, loginAdapter, { id: 'login' });
		
		if (!form.valid) {
			return fail(400, { form });
		}
		
		const { email, password } = form.data as { email: string; password: string };
		const redirectTo = url.searchParams.get('redirectTo') || '/';

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		redirect(303, redirectTo);
	}
};