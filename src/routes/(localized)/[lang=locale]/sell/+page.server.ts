import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createListing } from '$lib/services/listingService';

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

	return {
		session,
		user,
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

		const formData = await request.formData();
		
		// Extract form data
		const title = formData.get('title')?.toString().trim() || '';
		const description = formData.get('description')?.toString().trim() || '';
		const priceStr = formData.get('price')?.toString() || '';
		const category = formData.get('category')?.toString() || '';
		const condition = formData.get('condition')?.toString() || 'good';
		const brand = formData.get('brand')?.toString().trim() || '';
		const size = formData.get('size')?.toString().trim() || '';
		const color = formData.get('color')?.toString().trim() || '';
		const location = formData.get('location')?.toString().trim() || 'Sofia';
		const shippingAvailable = formData.get('shipping_available') === 'on';
		const shippingPriceStr = formData.get('shipping_price')?.toString() || '5';
		
		// Extract image URLs
		const imageUrls = formData.getAll('images')
			.map(img => img.toString())
			.filter(Boolean);

		// Store form values for re-display on error
		const values = {
			title,
			description,
			price: priceStr,
			category,
			condition,
			brand,
			size,
			color,
			location,
			shipping_available: shippingAvailable,
			shipping_price: shippingPriceStr
		};

		// Validation
		if (!title || title.length < 3) {
			return fail(400, {
				error: 'Title must be at least 3 characters long',
				values
			});
		}

		if (title.length > 80) {
			return fail(400, {
				error: 'Title must be less than 80 characters',
				values
			});
		}

		const price = parseFloat(priceStr);
		if (isNaN(price) || price <= 0) {
			return fail(400, {
				error: 'Please enter a valid price',
				values
			});
		}

		if (price > 99999) {
			return fail(400, {
				error: 'Price cannot exceed 99,999 BGN',
				values
			});
		}

		if (!category) {
			return fail(400, {
				error: 'Please select a category',
				values
			});
		}

		if (!brand || brand.length < 2) {
			return fail(400, {
				error: 'Please enter a valid brand name',
				values
			});
		}

		if (brand.length > 50) {
			return fail(400, {
				error: 'Brand name is too long',
				values
			});
		}

		const shippingPrice = parseFloat(shippingPriceStr);
		if (shippingAvailable && (isNaN(shippingPrice) || shippingPrice < 0)) {
			return fail(400, {
				error: 'Please enter a valid shipping price',
				values
			});
		}

		if (imageUrls.length === 0) {
			return fail(400, {
				error: 'Please add at least one photo',
				values
			});
		}

		if (imageUrls.length > 10) {
			return fail(400, {
				error: 'Maximum 10 photos allowed',
				values
			});
		}

		// Validate condition value
		const validConditions = ['new', 'like_new', 'very_good', 'good', 'acceptable'];
		if (!validConditions.includes(condition)) {
			return fail(400, {
				error: 'Invalid condition selected',
				values
			});
		}

		try {
			// Create listing data
			const listingData = {
				title,
				description: description || undefined,
				price,
				category_id: undefined, // We're not using category_id for now
				condition: condition as 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable',
				brand,
				size: size || undefined,
				color: color || undefined,
				location,
				city: location,
				shipping_available: shippingAvailable,
				shipping_price: shippingAvailable ? shippingPrice : undefined,
				images: imageUrls,
				thumbnail_url: imageUrls[0],
				tags: []
			};
			
			// Create the listing
			const listing = await createListing(listingData, locals.supabase);

			// Redirect to success page
			throw redirect(303, `/${lang}/sell/success?id=${listing.id}`);
			
		} catch (error) {
			// If it's a redirect (success), rethrow it
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				throw error;
			}
			
			console.error('Failed to create listing:', error);
			
			return fail(500, {
				error: 'Failed to create listing. Please try again.',
				values
			});
		}
	}
};