// Filter constants for consistent mapping between UI and database

export const CONDITION_OPTIONS = [
	{ value: 'new_with_tags', label: 'New with tags' },
	{ value: 'like_new', label: 'Like new' },
	{ value: 'very_good', label: 'Very good' },
	{ value: 'good', label: 'Good' },
	{ value: 'fair', label: 'Fair' }
] as const;

export const SIZE_OPTIONS = {
	// Clothing sizes
	clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	// Shoe sizes (EU)
	shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
	// Kids sizes
	kids: ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'],
	// Default/all sizes
	all: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
} as const;

export const SORT_OPTIONS = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'price-low', label: 'Price: Low to High' },
	{ value: 'price-high', label: 'Price: High to Low' },
	{ value: 'most-liked', label: 'Most Liked' },
	{ value: 'trending', label: 'Trending' }
] as const;

export const PRICE_RANGES = [
	{ value: '0-50', label: 'Under 50 лв' },
	{ value: '50-100', label: '50-100 лв' },
	{ value: '100-200', label: '100-200 лв' },
	{ value: '200+', label: '200+ лв' }
] as const;

// Popular brands - can be extended or made dynamic
export const BRAND_OPTIONS = [
	'Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Uniqlo', 'Gap', "Levi's", 'Puma', 'Reserved', 'Other'
] as const;

// Helper functions
export function getConditionLabel(value: string): string {
	return CONDITION_OPTIONS.find(opt => opt.value === value)?.label || value;
}

export function getConditionValue(label: string): string {
	return CONDITION_OPTIONS.find(opt => opt.label === label)?.value || label;
}

export function getSizesForCategory(categoryName: string): readonly string[] {
	const nameL = categoryName.toLowerCase();
	
	if (nameL.includes('shoe') || nameL.includes('boot') || nameL.includes('sneaker')) {
		return SIZE_OPTIONS.shoes;
	}
	if (nameL.includes('kid') || nameL.includes('baby') || nameL.includes('child')) {
		return SIZE_OPTIONS.kids;
	}
	
	return SIZE_OPTIONS.clothing;
}