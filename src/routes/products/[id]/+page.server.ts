import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getListingById } from '$lib/services/listingService';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	try {
		const product = await getListingById(params.id, supabase);

		if (!product) {
			throw error(404, 'Product not found');
		}

		// Increment view count
		await supabase
			.from('products')
			.update({ views: (product.views || 0) + 1 })
			.eq('id', params.id);

		return {
			product,
		};
	} catch (err) {
		console.error('Error loading product:', err);
		throw error(404, 'Product not found');
	}
};
