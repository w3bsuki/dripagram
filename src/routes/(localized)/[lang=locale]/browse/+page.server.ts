import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Cookies } from '@sveltejs/kit';

function isLikelyUUID(v: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

// Helper function to get category emoji
function getCategoryEmoji(name: string): string {
	const nameL = name.toLowerCase();
	if (nameL.includes('women') || nameL.includes('woman')) return '👩';
	if (nameL.includes('men') || nameL.includes('man')) return '👨';
	if (nameL.includes('kids') || nameL.includes('child') || nameL.includes('baby')) return '👶';
	if (nameL.includes('accessories') || nameL.includes('accessory')) return '👜';
	if (nameL.includes('shoes') || nameL.includes('shoe')) return '👟';
	return '🛍️'; // Default emoji
}

// Seller type returned from joined profiles
type Seller = {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	verified?: boolean | null;
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
	views: number | null;
	tags: string[] | null;
	created_at: string;
	updated_at: string | null;
	seller?: Seller | Seller[] | null;
}

export const load = async ({ cookies, url, params }: { cookies: Cookies; url: URL; params: any }) => {
	const { lang } = params;
	const supabase = createSupabaseServerClient(cookies);

	// Query params
	const q = url.searchParams.get('q')?.trim() || '';
	const categoryParam = url.searchParams.get('category');
	const subcategoryParam = url.searchParams.get('subcategory');
	const collection = url.searchParams.get('collection');
	const condition = url.searchParams.get('condition');
	const size = url.searchParams.get('size');
	const brand = url.searchParams.get('brand');
	const sort = url.searchParams.get('sort') || 'newest';
	const min = Number(url.searchParams.get('price_min') || '0');
	const max = Number(url.searchParams.get('price_max') || '0');
	const cursor = url.searchParams.get('cursor');

	const pageSize = 20;

	// Resolve category slug -> id if needed
	let categoryId: string | null = null;
	let subcategoryId: string | null = null;
	
	if (categoryParam) {
		if (isLikelyUUID(categoryParam)) {
			categoryId = categoryParam;
		} else {
			const { data: cat } = await supabase
				.from('categories')
				.select('id, slug')
				.eq('slug', categoryParam)
				.limit(1)
				.single();
			if (cat) {
				categoryId = cat.id;
			} else {
				// slug not found => no results
				return { products: [], total: 0, nextCursor: null, categories: [], lang };
			}
		}
	}
	
	// Resolve subcategory slug -> id if needed
	if (subcategoryParam) {
		if (isLikelyUUID(subcategoryParam)) {
			subcategoryId = subcategoryParam;
		} else {
			const { data: subcat } = await supabase
				.from('categories')
				.select('id, slug')
				.eq('slug', subcategoryParam)
				.limit(1)
				.single();
			if (subcat) {
				subcategoryId = subcat.id;
			} else {
				// subcategory slug not found => no results
				return { products: [], total: 0, nextCursor: null, categories: [], lang };
			}
		}
	}

	// Fetch top-level categories for chips
	const { data: catRows, error: catError } = await supabase
		.from('categories')
		.select('id, name, slug, icon')
		.is('parent_id', null)
		.eq('is_active', true)
		.order('display_order', { ascending: true });

	console.log('Categories query result:', { catRows, catError });

	const categories = (catRows || []).map((c) => ({
		id: c.slug || c.id,
		name: c.name,
		emoji: getCategoryEmoji(c.name)
	}));
	
	console.log('Mapped categories:', categories);

	// Base query
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
			views,
			tags,
			created_at,
			updated_at,
			seller:profiles!seller_id(
				id,
				username,
				full_name,
				avatar_url,
				verified
			)
		`, { count: 'exact' })
		.eq('status', 'active')
		.limit(pageSize + 1);

	// Search - safely escape special characters for ILIKE
	if (q) {
		const escapedQuery = q.replace(/[%_]/g, '\\$&');
		query = query.or(`title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,brand.ilike.%${escapedQuery}%`);
	}

	// Category filter by id - prefer subcategory if available, otherwise use category
	if (subcategoryId) {
		query = query.eq('category_id', subcategoryId);
	} else if (categoryId) {
		query = query.eq('category_id', categoryId);
	}

	// Condition
	if (condition) {
		query = query.eq('condition', condition);
	}

	// Size
	if (size) {
		query = query.eq('size', size);
	}

	// Brand
	if (brand) {
		query = query.ilike('brand', `%${brand}%`);
	}

	// Collections mapping via tags
	if (collection) {
		query = query.contains('tags', [collection]);
	}

	// Price range
	if (min && min > 0) query = query.gte('price', min);
	if (max && max > 0) query = query.lte('price', max);

	// Pagination
	if (cursor) {
		const [ts, id] = cursor.split(':');
		query = query.lt('created_at', ts).neq('id', id);
	}

	// Sorting
	switch (sort) {
		case 'price-low':
			query = query.order('price', { ascending: true });
			break;
		case 'price-high':
			query = query.order('price', { ascending: false });
			break;
		case 'most-liked':
			query = query.order('like_count', { ascending: false });
			break;
		case 'trending':
			query = query.order('views', { ascending: false }).order('like_count', { ascending: false });
			break;
		default:
			query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
	}

	const { data: items, error, count } = await query;
	if (error) {
		return { products: [], total: 0, nextCursor: null, categories, lang };
	}

	const products = (items || []).slice(0, pageSize).map(mapListingToProduct);

	let nextCursor: string | null = null;
	if (items && items.length > pageSize) {
		const last = items[pageSize - 1] as ListingRow;
		nextCursor = `${last.created_at}:${last.id}`;
	}

	return {
		products,
		total: count || products.length,
		nextCursor,
		categories,
		lang
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
		view_count: row.views || 0,
		tags: row.tags || [],
		created_at: row.created_at,
		updated_at: row.updated_at || row.created_at,
		seller: seller ? {
			id: seller.id,
			username: seller.username,
			full_name: seller.full_name,
			avatar_url: seller.avatar_url,
			verified: !!seller.verified
		} : null
	};
}