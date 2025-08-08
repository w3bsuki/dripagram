import { createClient } from '$lib/supabase/client';
import type { Database } from '$lib/types/database.types';

const supabase = createClient();

type Category = Database['public']['Tables']['categories']['Row'];

export interface CategoryWithCount extends Category {
	listing_count?: number;
}

/**
 * Get all active categories
 */
export async function getAllCategories(): Promise<Category[]> {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('is_active', true)
		.order('sort_order', { ascending: true });

	if (error) {
		return [];
	}

	return data || [];
}

/**
 * Get only top-level categories (no parent)
 */
export async function getTopLevelCategories(): Promise<Category[]> {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.is('parent_id', null)
		.eq('is_active', true)
		.order('sort_order', { ascending: true });

	if (error) {
		return [];
	}

	return data || [];
}

/**
 * Get subcategories for a specific parent category
 */
export async function getSubcategories(parentId: string): Promise<Category[]> {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('parent_id', parentId)
		.eq('is_active', true)
		.order('sort_order', { ascending: true });

	if (error) {
		return [];
	}

	return data || [];
}

/**
 * Get categories with listing counts using RPC function
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
	const { data, error } = await supabase.rpc('get_categories_with_counts');

	if (error) {
		return [];
	}

	// Map the RPC response to CategoryWithCount format
	if (!data) return [];

	return data.map((item: any) => ({
		...item.category_data,
		listing_count: item.product_count || 0,
	})) as CategoryWithCount[];
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('slug', slug)
		.eq('is_active', true)
		.single();

	if (error) {
		return null;
	}

	return data;
}

/**
 * Get full category hierarchy (parent with children)
 */
export async function getCategoryHierarchy(): Promise<(Category & { children: Category[] })[]> {
	const topLevel = await getTopLevelCategories();

	const hierarchy = await Promise.all(
		topLevel.map(async (category) => {
			const children = await getSubcategories(category.id);
			return {
				...category,
				children,
			};
		})
	);

	return hierarchy;
}
