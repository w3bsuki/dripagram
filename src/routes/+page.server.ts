import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Listing } from '$lib/types';

interface FeedProduct extends Listing {
	seller: {
		id: string;
		username: string;
		full_name?: string;
		avatar_url?: string;
		verified: boolean;
	};
	isLiked: boolean;
	engagement_score?: number;
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	const supabase = createSupabaseServerClient(cookies);
	
	// Get current user
	const { data: { session } } = await supabase.auth.getSession();
	const userId = session?.user?.id;
	
	// Parse URL parameters
	const tab = url.searchParams.get('tab') || 'for-you';
	const cursor = url.searchParams.get('cursor');
	const pageSize = 20;

	try {
		let products: FeedProduct[] = [];
		let nextCursor: string | null = null;

		if (tab === 'for-you') {
			const result = await loadForYouFeed(supabase, userId, cursor, pageSize);
			products = result.products;
			nextCursor = result.nextCursor;
		} else if (tab === 'following') {
			const result = await loadFollowingFeed(supabase, userId, cursor, pageSize);
			products = result.products;
			nextCursor = result.nextCursor;
		} else if (tab === 'trending') {
			const result = await loadTrendingFeed(supabase, userId, cursor, pageSize);
			products = result.products;
			nextCursor = result.nextCursor;
		}

		// Fetch all registered users for brands section
		const { data: registeredUsers } = await supabase
			.from('profiles')
			.select('id, username, full_name, avatar_url, verified, follower_count, listing_count')
			.order('follower_count', { ascending: false })
			.order('listing_count', { ascending: false })
			.limit(20); // Get top 20 users by followers and products

		return {
			products,
			nextCursor,
			currentTab: tab as 'for-you' | 'following' | 'trending',
			isAuthenticated: !!userId,
			registeredUsers: registeredUsers || []
		};
	} catch (error) {
		console.error('Error loading feed:', error);
		return {
			products: [],
			nextCursor: null,
			currentTab: tab as 'for-you' | 'following' | 'trending',
			isAuthenticated: !!userId,
			registeredUsers: []
		};
	}
};

async function loadForYouFeed(
	supabase: any,
	userId: string | undefined,
	cursor: string | null,
	pageSize: number
) {
	let query = supabase
		.from('products')
		.select(`
			id,
			title,
			description,
			price,
			thumbnail_url,
			images,
			brand,
			size,
			color,
			condition,
			like_count,
			views,
			tags,
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
		.limit(pageSize + 1); // Get one extra to check for next page

	// For authenticated users, personalize based on their liked categories and followed users
	if (userId) {
		// Get user's liked categories from their product likes
		const { data: likedCategories } = await supabase
			.from('product_likes')
			.select(`
				products!inner(category_id),
				created_at
			`)
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(50);

		const categoryIds = likedCategories
			?.map((like: any) => like.products?.category_id)
			.filter(Boolean) || [];

		if (categoryIds.length > 0) {
			// Weight products from liked categories higher
			query = query.or(`category_id.in.(${categoryIds.join(',')})`);
		}
	}

	// Apply cursor-based pagination
	if (cursor) {
		const [timestamp, id] = cursor.split(':');
		query = query.lt('created_at', timestamp).neq('id', id);
	}

	query = query.order('created_at', { ascending: false });

	const { data: rawProducts, error } = await query;

	if (error) {
		throw error;
	}

	// Get user's likes if authenticated
	let userLikes: string[] = [];
	if (userId && rawProducts?.length) {
		const productIds = rawProducts.map((p: any) => p.id);
		const { data: likes } = await supabase
			.from('product_likes')
			.select('product_id')
			.eq('user_id', userId)
			.in('product_id', productIds);
		
		userLikes = likes?.map((like: any) => like.product_id) || [];
	}

	// Transform and prepare response
	const products: FeedProduct[] = (rawProducts?.slice(0, pageSize) || []).map((product: any) => 
		transformProduct(product, userLikes)
	);

	// Determine next cursor
	let nextCursor: string | null = null;
	if (rawProducts && rawProducts.length > pageSize) {
		const lastProduct = rawProducts[pageSize - 1];
		nextCursor = `${lastProduct.created_at}:${lastProduct.id}`;
	}

	return { products, nextCursor };
}

async function loadFollowingFeed(
	supabase: any,
	userId: string | undefined,
	cursor: string | null,
	pageSize: number
) {
	if (!userId) {
		return { products: [], nextCursor: null };
	}

	let query = supabase
		.from('products')
		.select(`
			id,
			title,
			description,
			price,
			thumbnail_url,
			images,
			brand,
			size,
			color,
			condition,
			like_count,
			views,
			tags,
			created_at,
			seller_id,
			seller:profiles!seller_id (
				id,
				username,
				full_name,
				avatar_url,
				verified
			),
			user_follows!inner(follower_id)
		`)
		.eq('status', 'active')
		.eq('user_follows.follower_id', userId)
		.limit(pageSize + 1);

	// Apply cursor-based pagination
	if (cursor) {
		const [timestamp, id] = cursor.split(':');
		query = query.lt('created_at', timestamp).neq('id', id);
	}

	query = query.order('created_at', { ascending: false });

	const { data: rawProducts, error } = await query;

	if (error) {
		throw error;
	}

	// Get user's likes
	let userLikes: string[] = [];
	if (rawProducts?.length) {
		const productIds = rawProducts.map((p: any) => p.id);
		const { data: likes } = await supabase
			.from('product_likes')
			.select('product_id')
			.eq('user_id', userId)
			.in('product_id', productIds);
		
		userLikes = likes?.map((like: any) => like.product_id) || [];
	}

	// Transform products
	const products: FeedProduct[] = (rawProducts?.slice(0, pageSize) || []).map((product: any) => 
		transformProduct(product, userLikes)
	);

	// Determine next cursor
	let nextCursor: string | null = null;
	if (rawProducts && rawProducts.length > pageSize) {
		const lastProduct = rawProducts[pageSize - 1];
		nextCursor = `${lastProduct.created_at}:${lastProduct.id}`;
	}

	return { products, nextCursor };
}

async function loadTrendingFeed(
	supabase: any,
	userId: string | undefined,
	cursor: string | null,
	pageSize: number
) {
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	// Use the product_engagement view for trending calculation
	let query = supabase
		.from('product_engagement')
		.select(`
			id,
			seller_id,
			title,
			view_count,
			like_count,
			last_viewed_at,
			last_liked_at,
			created_at,
			products!inner(
				id,
				title,
				description,
				price,
				thumbnail_url,
				images,
				brand,
				size,
				color,
				condition,
				tags,
				status,
				created_at,
				seller:profiles!seller_id (
					id,
					username,
					full_name,
					avatar_url,
					verified
				)
			),
			promotions(
				id,
				type,
				starts_at,
				ends_at
			)
		`)
		.gte('created_at', sevenDaysAgo.toISOString())
		.limit(pageSize + 1);

	// Apply cursor-based pagination using engagement score + created_at
	if (cursor) {
		const [score, timestamp, id] = cursor.split(':');
		query = query.or(`and(engagement_score.lt.${score},created_at.lt.${timestamp}),and(engagement_score.eq.${score},created_at.lt.${timestamp})`);
	}

	// Order by engagement score (views + likes * 2) and recency
	const { data: engagementData, error } = await query;

	if (error) {
		throw error;
	}

	// Calculate engagement scores and sort
	const productsWithScores = (engagementData || [])
		.map((item: any) => {
			const product = item.products;
			if (!product) return null;

			// Calculate engagement score: views + likes * 2 + recency bonus
			const daysSinceCreation = Math.max(1, Math.floor(
				(Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
			));
			const recencyBonus = Math.max(0, 10 - daysSinceCreation);
			const engagementScore = (item.view_count || 0) + (item.like_count || 0) * 2 + recencyBonus;

			// Check if product is promoted
			const isPromoted = item.promotions?.some((promo: any) => {
				const now = new Date();
				const startDate = new Date(promo.starts_at);
				const endDate = new Date(promo.ends_at);
				return now >= startDate && now <= endDate;
			}) || false;

			return {
				...product,
				engagement_score: isPromoted ? engagementScore + 100 : engagementScore, // Boost promoted items
				view_count: item.view_count || 0,
				like_count: item.like_count || 0,
				isPromoted
			};
		})
		.filter(Boolean)
		.sort((a: any, b: any) => b.engagement_score - a.engagement_score);

	// Get user's likes if authenticated
	let userLikes: string[] = [];
	if (userId && productsWithScores.length) {
		const productIds = productsWithScores.map((p: any) => p.id);
		const { data: likes } = await supabase
			.from('product_likes')
			.select('product_id')
			.eq('user_id', userId)
			.in('product_id', productIds);
		
		userLikes = likes?.map((like: any) => like.product_id) || [];
	}

	// Transform products
	const products: FeedProduct[] = productsWithScores
		.slice(0, pageSize)
		.map((product: any) => transformProduct(product, userLikes));

	// Determine next cursor
	let nextCursor: string | null = null;
	if (productsWithScores.length > pageSize) {
		const lastProduct = productsWithScores[pageSize - 1];
		nextCursor = `${lastProduct.engagement_score}:${lastProduct.created_at}:${lastProduct.id}`;
	}

	return { products, nextCursor };
}

function transformProduct(product: any, userLikes: string[]): FeedProduct {
	// Handle seller as array (Supabase returns single relation as array sometimes)
	const seller = Array.isArray(product.seller) ? product.seller[0] : product.seller;
	
	return {
		id: product.id,
		seller_id: product.seller_id,
		title: product.title,
		description: product.description,
		price: product.price,
		currency: 'BGN',
		brand: product.brand,
		size: product.size,
		color: product.color,
		condition: product.condition,
		images: product.images || [],
		thumbnail_url: product.thumbnail_url || product.images?.[0] || '/placeholder.jpg',
		status: product.status || 'active',
		view_count: product.views || 0,
		like_count: product.like_count || 0,
		tags: product.tags || [],
		created_at: product.created_at,
		updated_at: product.updated_at || product.created_at,
		seller: {
			id: seller?.id || product.seller_id,
			username: seller?.username || 'anonymous',
			full_name: seller?.full_name,
			avatar_url: seller?.avatar_url,
			verified: seller?.verified || false
		},
		isLiked: userLikes.includes(product.id),
		engagement_score: product.engagement_score
	} as FeedProduct;
}