export interface MockProduct {
	id: string;
	title: string;
	price: number;
	originalPrice?: number;
	brand: string;
	size: string;
	condition: string;
	images: string[];
	seller: {
		name: string;
		avatar: string;
		rating: number;
		sales: number;
	};
	likes: number;
	saved: boolean;
	category: string;
	discount?: number;
}

export const mockProducts: MockProduct[] = [
	{
		id: '1',
		title: 'Vintage Denim Jacket',
		price: 45,
		originalPrice: 89,
		brand: 'Levi\'s',
		size: 'M',
		condition: 'Excellent',
		images: [
			'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'vintage_vibes',
			avatar: 'https://i.pravatar.cc/150?img=1',
			rating: 4.8,
			sales: 234
		},
		likes: 342,
		saved: false,
		category: 'Outerwear',
		discount: 49
	},
	{
		id: '2',
		title: 'Designer Silk Dress',
		price: 120,
		originalPrice: 280,
		brand: 'Diane von Furstenberg',
		size: 'S',
		condition: 'Like New',
		images: [
			'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'luxe_closet',
			avatar: 'https://i.pravatar.cc/150?img=2',
			rating: 4.9,
			sales: 567
		},
		likes: 892,
		saved: true,
		category: 'Dresses',
		discount: 57
	},
	{
		id: '3',
		title: 'Nike Air Max 90',
		price: 75,
		originalPrice: 130,
		brand: 'Nike',
		size: '42',
		condition: 'Good',
		images: [
			'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'sneaker_head',
			avatar: 'https://i.pravatar.cc/150?img=3',
			rating: 4.7,
			sales: 123
		},
		likes: 234,
		saved: false,
		category: 'Shoes',
		discount: 42
	},
	{
		id: '4',
		title: 'Gucci Marmont Bag',
		price: 850,
		originalPrice: 1800,
		brand: 'Gucci',
		size: 'One Size',
		condition: 'Excellent',
		images: [
			'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'designer_deals',
			avatar: 'https://i.pravatar.cc/150?img=4',
			rating: 5.0,
			sales: 892
		},
		likes: 1243,
		saved: true,
		category: 'Bags',
		discount: 53
	},
	{
		id: '5',
		title: 'Cashmere Sweater',
		price: 65,
		originalPrice: 150,
		brand: 'Everlane',
		size: 'L',
		condition: 'Like New',
		images: [
			'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1582330041155-c2f3b5c63c54?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'cozy_style',
			avatar: 'https://i.pravatar.cc/150?img=5',
			rating: 4.6,
			sales: 345
		},
		likes: 567,
		saved: false,
		category: 'Knitwear',
		discount: 57
	},
	{
		id: '6',
		title: 'Zara Leather Jacket',
		price: 55,
		originalPrice: 120,
		brand: 'Zara',
		size: 'M',
		condition: 'Good',
		images: [
			'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
			'https://images.unsplash.com/photo-1557418669-db3f781a58c0?w=400&h=500&fit=crop'
		],
		seller: {
			name: 'fashion_forward',
			avatar: 'https://i.pravatar.cc/150?img=6',
			rating: 4.5,
			sales: 156
		},
		likes: 423,
		saved: false,
		category: 'Outerwear',
		discount: 54
	}
];

// Function to get mock products with optional filtering
export function getMockProducts(count?: number, category?: string): MockProduct[] {
	let products = [...mockProducts];
	
	if (category) {
		products = products.filter(p => p.category === category);
	}
	
	if (count && count < products.length) {
		return products.slice(0, count);
	}
	
	// If more products are needed than available, duplicate with new IDs
	if (count && count > products.length) {
		const result = [...products];
		while (result.length < count) {
			const product = { ...products[result.length % products.length] };
			product.id = `${product.id}-${result.length}`;
			result.push(product);
		}
		return result;
	}
	
	return products;
}