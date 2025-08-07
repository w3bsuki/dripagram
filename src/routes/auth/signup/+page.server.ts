import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	
	// If already logged in, redirect to home
	if (session) {
		redirect(303, '/');
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const username = formData.get('username') as string;
		const accountType = formData.get('accountType') as 'personal' | 'brand';
		const brandName = formData.get('brandName') as string;
		const acceptTerms = formData.get('acceptTerms') === 'on';

		// Validation
		if (!email || !password || !username) {
			return fail(400, {
				error: 'Email, username, and password are required',
				email,
				username,
				accountType
			});
		}

		if (!acceptTerms) {
			return fail(400, {
				error: 'Please accept the terms and conditions',
				email,
				username,
				accountType
			});
		}

		if (accountType === 'brand' && !brandName?.trim()) {
			return fail(400, {
				error: 'Brand name is required for brand accounts',
				email,
				username,
				accountType
			});
		}

		// Create metadata
		const metadata: any = { username };
		if (accountType) metadata.account_type = accountType;
		if (brandName) metadata.brand_name = brandName;

		// Sign up the user
		const { data: authData, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: metadata,
				emailRedirectTo: `${url.origin}/auth/confirm`
			}
		});

		if (error) {
			return fail(400, {
				error: error.message,
				email,
				username,
				accountType
			});
		}

		if (authData.user) {
			// Update profile with additional data
			if (username || accountType || brandName) {
				const profileUpdates: any = { 
					id: authData.user.id,
					username,
					account_type: accountType
				};
				if (brandName) profileUpdates.brand_name = brandName;

				const { error: profileError } = await locals.supabase
					.from('profiles')
					.upsert(profileUpdates);

				if (profileError) {
					console.error('Profile update error:', profileError);
				}
			}
		}

		// Redirect to verification page
		redirect(303, '/auth/verify');
	}
};