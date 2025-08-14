import { json, type RequestHandler } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase/server';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const supabase = createSupabaseServerClient(cookies);
	const parentId = url.searchParams.get('parent');

	if (!parentId) {
		return json({ subcategories: [] });
	}

	try {
		const { data: subcategories, error } = await supabase
			.from('categories')
			.select('id, name, slug, icon_url')
			.eq('parent_id', parentId)
			.eq('is_active', true)
			.order('display_order', { ascending: true });

		if (error) {
			console.error('Error fetching subcategories:', error);
			return json({ subcategories: [] });
		}

		const formattedSubcategories = (subcategories || []).map(cat => ({
			id: cat.slug || cat.id,
			name: cat.name,
			emoji: getEmojiForCategory(cat.name) // Helper function for emojis
		}));

		return json({ subcategories: formattedSubcategories });
	} catch (error) {
		console.error('Failed to fetch subcategories:', error);
		return json({ subcategories: [] });
	}
};

// Helper function to assign emojis based on category name
function getEmojiForCategory(name: string): string {
	const nameL = name.toLowerCase();
	
	// Clothing items
	if (nameL.includes('shoes')) return '👟';
	if (nameL.includes('dress')) return '👗';
	if (nameL.includes('top') || nameL.includes('shirt') || nameL.includes('blouse')) return '👚';
	if (nameL.includes('bottom') || nameL.includes('pants') || nameL.includes('jeans')) return '👖';
	if (nameL.includes('jacket') || nameL.includes('coat')) return '🧥';
	if (nameL.includes('bag') || nameL.includes('purse')) return '👜';
	if (nameL.includes('jewelry') || nameL.includes('jewellery')) return '💍';
	if (nameL.includes('hat') || nameL.includes('cap')) return '👒';
	if (nameL.includes('accessori')) return '⌚';
	
	// Default emoji
	return '🛍️';
}