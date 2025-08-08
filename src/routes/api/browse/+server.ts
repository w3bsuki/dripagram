import { json, type RequestHandler } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase/server';

function isLikelyUUID(v: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type Seller = {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	seller_verified?: boolean | null;
};

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

function mapListingToProduct(row: ListingRow) {
	const s = row.seller;
	let seller: Seller | null = null;
	if (Array.isArray(s)) seller = s[0] ?? null; else seller = s ?? null;
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
		} : null
	};
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const supabase = createSupabaseServerClient(cookies);

	const q = url.searchParams.get('q')?.trim() || '';
	const categoryParam = url.searchParams.get('category');
	const collection = url.searchParams.get('collection');
	const condition = url.searchParams.get('condition');
	const sort = url.searchParams.get('sort') || 'newest';
	const min = Number(url.searchParams.get('price_min') || '0');
	const max = Number(url.searchParams.get('price_max') || '0');
	const cursor = url.searchParams.get('cursor');

	const pageSize = 20;

	let categoryId: string | null = null;
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
			if (cat) categoryId = cat.id; else return json({ products: [], nextCursor: null });
		}
	}

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
				id,username,full_name,avatar_url,seller_verified
			)
		`)
		.eq('status', 'active')
		.limit(pageSize + 1);

	if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`);
	if (categoryId) query = query.eq('category_id', categoryId);
	if (condition) query = query.eq('condition', condition);
	if (collection) query = query.contains('tags', [collection]);
	if (min && min > 0) query = query.gte('price', min);
	if (max && max > 0) query = query.lte('price', max);

	if (cursor) {
		const [ts, id] = cursor.split(':');
		query = query.lt('created_at', ts).neq('id', id);
	}

	switch (sort) {
		case 'price-low': query = query.order('price', { ascending: true }); break;
		case 'price-high': query = query.order('price', { ascending: false }); break;
		case 'most-liked': query = query.order('like_count', { ascending: false }); break;
		case 'trending': query = query.order('view_count', { ascending: false }).order('like_count', { ascending: false }); break;
		default: query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
	}

	const { data: items, error } = await query;
	if (error) return json({ products: [], nextCursor: null });

	const products = (items || []).slice(0, pageSize).map(mapListingToProduct);
	let nextCursor: string | null = null;
	if (items && items.length > pageSize) {
		const last = items[pageSize - 1] as ListingRow;
		nextCursor = `${last.created_at}:${last.id}`;
	}

	return json({ products, nextCursor });
};
