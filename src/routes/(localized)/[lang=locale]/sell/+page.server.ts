import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { listingSchema } from '$lib/schemas/listing';
import { createListing } from '$lib/services/listingService';

const listingAdapter = zod(listingSchema as any);

export const load: PageServerLoad = async ({ locals, params }) => {
	const { lang } = params;
	const { session, user } = await locals.safeGetSession();
	
	if (!session || !user) {
		throw redirect(303, `/${lang}/auth/login?redirectTo=/${lang}/sell`);
	}

	// Check if user has completed onboarding
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('onboarding_completed, username')
		.eq('id', user.id)
		.single();

	if (!profile?.onboarding_completed) {
		throw redirect(303, `/${lang}/onboarding`);
	}

	// Initialize form with defaults
	const form = await superValidate(listingAdapter, {
		id: 'listing',
		defaults: {
			condition: 'like_new',
			shipping_available: true,
			shipping_price: 5,
			location: 'Sofia, Bulgaria',
			images: [],
			tags: []
		}
	});

	return {
		session,
		user,
		form,
		lang
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { lang } = params;
		const { session, user } = await locals.safeGetSession();
		
		if (!session || !user) {
			throw redirect(303, `/${lang}/auth/login`);
		}

		const form = await superValidate(request, listingAdapter, { id: 'listing' });

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Create listing in Supabase
			const listingData = form.data as any;
			
			// Don't send category_id if it's not a valid UUID
			const createData: any = {
				...listingData,
				thumbnail_url: listingData.images?.[0]
			};
			
			// Remove the category field since it's not a UUID
			delete createData.category;
			
			const listing = await createListing(createData, locals.supabase);

			// Redirect to success page with listing info
			const title = encodeURIComponent(listingData.title || '');
			throw redirect(303, `/${lang}/sell/success?id=${listing.id}&title=${title}`);
		} catch (error) {
			// If it's a redirect, it means success - rethrow it
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				throw error;
			}
			
			return message(form, 'Failed to create listing. Please try again.', { status: 500 });
		}
	}
};