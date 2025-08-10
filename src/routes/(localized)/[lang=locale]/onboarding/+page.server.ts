import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.safeGetSession();
	const locale = params.lang || 'bg';

	// Redirect to login if not authenticated
	if (!session || !user) {
		throw redirect(303, `/${locale}/auth/login`);
	}

	// Check if user has already completed onboarding
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('onboarding_completed, username, account_type, social_links')
		.eq('id', user.id)
		.single();

	// Redirect to home if already onboarded
	if (profile?.onboarding_completed) {
		throw redirect(303, `/${locale}`);
	}

	return {
		user,
		profile: profile || {}
	};
};

export const actions: Actions = {
	complete: async ({ request, locals, params }) => {
		const { session, user } = await locals.safeGetSession();
		const locale = params.lang || 'bg';

		if (!session || !user) {
			throw redirect(303, `/${locale}/auth/login`);
		}

		try {
			const formData = await request.formData();
			const username = formData.get('username') as string;
			const accountType = formData.get('account_type') as string;
			const payoutMethod = formData.get('payout_method') as string;
			const payoutDetails = formData.get('payout_details') as string;
			const bio = formData.get('bio') as string;
			const region = formData.get('region') as string;
			
			// Parse social links
			const socialLinks = {
				instagram: formData.get('instagram') as string || '',
				facebook: formData.get('facebook') as string || '',
				tiktok: formData.get('tiktok') as string || ''
			};

			// Validation
			if (!username || username.length < 3) {
				return fail(400, { error: 'Username must be at least 3 characters long' });
			}

			if (!accountType || !['personal', 'brand'].includes(accountType)) {
				return fail(400, { error: 'Please select a valid account type' });
			}

			// Check if username is available
			const { data: existingUser } = await locals.supabase
				.from('profiles')
				.select('id')
				.eq('username', username)
				.neq('id', user.id)
				.single();

			if (existingUser) {
				return fail(400, { error: 'Username is already taken' });
			}

			// Update user profile
			const { error: profileError } = await locals.supabase
				.from('profiles')
				.update({
					username,
					account_type: accountType,
					payout_method: payoutMethod,
					payout_details: payoutDetails,
					social_links: socialLinks,
					bio,
					region,
					onboarding_completed: true,
					updated_at: new Date().toISOString()
				})
				.eq('id', user.id);

			if (profileError) {
				return fail(500, { error: 'Failed to update profile' });
			}

			// Update user metadata to mark onboarding as complete
			const { error: authError } = await locals.supabase.auth.updateUser({
				data: { onboarding_completed: true }
			});

			if (authError) {
				console.error('Failed to update user metadata:', authError);
			}

			// Redirect to home page
			throw redirect(303, `/${locale}`);

		} catch (error) {
			console.error('Onboarding error:', error);
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};