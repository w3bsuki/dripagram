import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	try {
		// Get the product with seller information and engagement data
		const { data: product, error: productError } = await supabase
			.from('products')
			.select(`
				*,
				seller:profiles!seller_id (
					id,
					username,
					full_name,
					avatar_url,
					verified,
					created_at
				),
				category:categories(name, slug)
			`)
			.eq('id', params.id)
			.eq('status', 'active')
			.single();

		if (productError) {
			throw error(404, 'Product not found');
		}
		
		if (!product) {
			throw error(404, 'Product not found');
		}

		// Increment view count asynchronously (fire and forget)
		supabase.rpc('increment_view_count', { listing_id: params.id });

		// Get related products from the same seller
		const { data: relatedProducts } = await supabase
			.from('products')
			.select(`
				id,
				title,
				price,
				thumbnail_url,
				images,
				like_count,
				view_count,
				size,
				condition,
				created_at,
				seller:profiles!seller_id(
					id,
					username,
					full_name,
					avatar_url,
					verified
				)
			`)
			.eq('seller_id', product.seller_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.order('created_at', { ascending: false })
			.limit(6);

		// Get similar products in the same category
		const { data: similarProducts } = await supabase
			.from('products')
			.select(`
				id,
				title,
				price,
				thumbnail_url,
				images,
				like_count,
				view_count,
				size,
				condition,
				created_at,
				seller:profiles!seller_id(
					id,
					username,
					full_name,
					avatar_url,
					verified
				)
			`)
			.eq('category_id', product.category_id)
			.eq('status', 'active')
			.neq('id', params.id)
			.neq('seller_id', product.seller_id)
			.order('like_count', { ascending: false })
			.limit(6);

		// Convert related and similar products to FeedProduct format
		const convertToFeedProduct = (item: any) => ({
			...item,
			seller_id: item.seller?.id || '',
			updated_at: item.created_at,
			isLiked: false, // TODO: Check if user has liked this product
			isSaved: false, // TODO: Check if user has saved this product
			seller: Array.isArray(item.seller) ? item.seller[0] : item.seller
		});

		return {
			product,
			relatedProducts: (relatedProducts || []).map(convertToFeedProduct),
			similarProducts: (similarProducts || []).map(convertToFeedProduct)
		};
	} catch (err) {
		throw error(404, 'Product not found');
	}
};
