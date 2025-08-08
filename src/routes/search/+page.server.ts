import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Cookies } from '@sveltejs/kit';

// Seller type returned from joined profiles
type Seller = {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	seller_verified?: boolean | null;
};

// Minimal type for listings row
interface ListingRow {
	id: string;
	title: string;
	description: string | null;
	price: number;
	currency: string | null;
	brand: string | null;
	size: string | null;
	color: string | null;
	condition: string | null;
	images: string[] | null;
	thumbnail_url: string | null;
	status: string;
	like_count: number | null;
	view_count: number | null;
	tags: string[] | null;
	created_at: string;
	updated_at: string | null;
	seller?: Seller | Seller[] | null;
}

export const load = async ({ cookies, url }: { cookies: Cookies; url: URL }) => {
	const supabase = createSupabaseServerClient(cookies);

	// Query params
	const q = url.searchParams.get('q')?.trim() || '';
	const sort = url.searchParams.get('sort') || 'relevance';
	const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
	const pageSize = 24; // 3 cols x 8 rows for mobile, auto-fill on desktop

	// Get trending searches and recent popular queries
	const trendingSearches = [
		'vintage denim',
		'designer bags',
		'nike sneakers',
		'summer dresses',
		'vintage tees',
		'streetwear',
		'leather jackets',
		'designer shoes'
	];

	// If no search query, return trending and empty results
	if (!q) {
		return {
			products: [],
			total: 0,
			nextPage: null,
			currentPage: page,
			query: q,
			trendingSearches,
			recentSearches: [] // TODO: Get from user preferences/local storage
		};
	}

	// Base query for search
	let query = supabase
		.from('listings')
		.select(`
			id,
			title,
			description,
			price,
			currency,
			brand,
			size,
			color,
			condition,
			images,
			thumbnail_url,
			status,
			like_count,
			view_count,
			tags,
			created_at,
			updated_at,
			seller:profiles!seller_id(
				id,
				username,
				full_name,
				avatar_url,
				seller_verified
			)
		`, { count: 'exact' })
		.eq('status', 'active')
		.limit(pageSize);

	// Search across title, description, brand, and tags
	query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%,tags.cs.{${q}}`);

	// Pagination
	const offset = (page - 1) * pageSize;
	if (offset > 0) {
		query = query.range(offset, offset + pageSize - 1);
	}

	// Sorting
	switch (sort) {
		case 'price-low':
			query = query.order('price', { ascending: true });
			break;
		case 'price-high':
			query = query.order('price', { ascending: false });
			break;
		case 'newest':
			query = query.order('created_at', { ascending: false });
			break;
		case 'most-liked':
			query = query.order('like_count', { ascending: false });
			break;
		case 'trending':
			query = query.order('view_count', { ascending: false }).order('like_count', { ascending: false });
			break;
		default: // relevance - basic text search ranking
			query = query.order('created_at', { ascending: false });
	}

	const { data: items, error, count } = await query;
	
	if (error) {
		console.error('Search error:', error);
		return {
			products: [],
			total: 0,
			nextPage: null,
			currentPage: page,
			query: q,
			trendingSearches,
			recentSearches: []
		};
	}

	const products = (items || []).map(mapListingToProduct);
	const total = count || 0;
	const totalPages = Math.ceil(total / pageSize);
	const nextPage = page < totalPages ? page + 1 : null;

	return {
		products,
		total,
		nextPage,
		currentPage: page,
		query: q,
		trendingSearches,
		recentSearches: [] // TODO: Get from user session/preferences
	};
};

function mapListingToProduct(row: ListingRow) {
	const s = row.seller;
	let seller: Seller | null = null;
	if (Array.isArray(s)) {
		seller = s[0] ?? null;
	} else {
		seller = s ?? null;
	}

	return {
		id: row.id,
		title: row.title,
		description: row.description,
		price: row.price,
		currency: row.currency || 'BGN',
		brand: row.brand || undefined,
		size: row.size || undefined,
		color: row.color || undefined,
		condition: row.condition || undefined,
		images: row.images || [],
		thumbnail_url: row.thumbnail_url || row.images?.[0] || '/placeholder.jpg',
		status: row.status,
		like_count: row.like_count || 0,
		view_count: row.view_count || 0,
		tags: row.tags || [],
		created_at: row.created_at,
		updated_at: row.updated_at || row.created_at,
		seller: seller ? {
			id: seller.id,
			username: seller.username,
			full_name: seller.full_name,
			avatar_url: seller.avatar_url,
			verified: !!seller.seller_verified
		} : null,
		isLiked: false, // TODO: Check if user has liked this product
		isSaved: false  // TODO: Check if user has saved this product
	};
}