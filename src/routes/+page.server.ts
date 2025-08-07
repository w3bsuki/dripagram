import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Fetch active products with seller information
		const { data: products, error } = await supabase
			.from('products')
			.select(`
				id,
				title,
				price,
				thumbnail_url,
				images,
				brand,
				size,
				condition,
				like_count,
				views,
				created_at,
				seller:profiles!seller_id (
					id,
					username,
					full_name,
					avatar_url,
					verified
				)
			`)
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('[Supabase Error] Failed to fetch products:', {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code
			});
			// Return empty array if there's an error
			return {
				products: []
			};
		}

		// Transform products to match the expected format
		const transformedProducts = products?.map(product => ({
			id: product.id,
			title: product.title,
			price: product.price,
			image: product.thumbnail_url || product.images?.[0] || '/placeholder.jpg',
			images: product.images || [],
			seller: {
				username: product.seller?.username || 'anonymous',
				avatar: product.seller?.avatar_url || '',
				verified: product.seller?.verified || false
			},
			likes: product.like_count || 0,
			isLiked: false, // TODO: Check if current user liked this
			brand: product.brand,
			size: product.size,
			condition: product.condition
		})) || [];

		console.log(`[Homepage] Successfully loaded ${transformedProducts.length} products`);

		return {
			products: transformedProducts
		};
	} catch (err) {
		console.error('[Homepage] Unexpected error loading products:', err);
		return {
			products: []
		};
	}
};