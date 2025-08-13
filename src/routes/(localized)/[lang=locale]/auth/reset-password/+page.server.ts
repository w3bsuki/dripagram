import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

const resetPasswordSchema = z.object({
	password: z.string().min(8, 'Password must be at least 8 characters'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session } = await locals.safeGetSession();
	const locale = params.lang || 'bg';
	
	// User must be logged in (from the reset link) to access this page
	if (!session) {
		throw redirect(303, `/${locale}/auth/login`);
	}

	return { locale };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const locale = params.lang || 'bg';
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = resetPasswordSchema.safeParse(data);
		
		if (!result.success) {
			const errors = result.error.format();
			let errorMessage = 'Invalid form data';
			if (errors.password?._errors[0]) errorMessage = errors.password._errors[0];
			else if (errors.confirmPassword?._errors[0]) errorMessage = errors.confirmPassword._errors[0];
			
			return fail(400, { 
				error: errorMessage,
				password: data.password as string
			});
		}

		const { password } = result.data;

		const { error } = await locals.supabase.auth.updateUser({
			password: password
		});

		if (error) {
			return fail(400, { 
				error: error.message,
				password: password
			});
		}

		// Success - redirect to home with success message
		throw redirect(303, `/${locale}?message=password_updated`);
	}
};