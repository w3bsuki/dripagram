<script lang="ts">
	import { ProductCard } from '$lib/components/marketplace';

	// Sample product data for testing the QuickViewDialog
	const sampleProducts = [
		{
			id: 'test-1',
			title: 'Vintage Levi\'s 501 Jeans',
			description: 'Classic vintage Levi\'s 501 jeans in excellent condition. These timeless jeans are perfect for any casual outfit and have been carefully maintained by the previous owner.',
			price: 75,
			original_price: 120,
			currency: 'USD',
			condition: 'like_new',
			size: '32/34',
			brand: 'Levi\'s',
			color: 'Dark Blue',
			like_count: 24,
			view_count: 156,
			created_at: '2024-01-15T10:00:00Z',
			shipping_available: true,
			shipping_price: 0,
			city: 'Sofia',
			location: 'Sofia, Bulgaria',
			thumbnail_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop&crop=center',
			images: [
				'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop&crop=center',
				'https://images.unsplash.com/photo-1506629905607-d3bb3d702b53?w=600&h=600&fit=crop&crop=center',
				'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=600&fit=crop&crop=center'
			],
			tags: ['vintage', 'denim', 'casual', 'classic'],
			seller: {
				id: 'seller-1',
				username: 'fashionista_sofia',
				full_name: 'Maria Petrova',
				avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
				verified: true,
				seller_verified: true,
				seller_rating: 4.8,
				total_sales: 127,
				follower_count: 1250
			},
			likes: [{ count: 24 }],
			is_liked: []
		},
		{
			id: 'test-2',
			title: 'Nike Air Force 1 White',
			description: 'Classic white Nike Air Force 1 sneakers in pristine condition. Only worn a few times, comes with original box and laces.',
			price: 85,
			currency: 'USD',
			condition: 'new',
			size: '9 US',
			brand: 'Nike',
			color: 'White',
			like_count: 18,
			view_count: 89,
			created_at: '2024-01-12T14:30:00Z',
			shipping_available: true,
			shipping_price: 10,
			city: 'Plovdiv',
			location: 'Plovdiv, Bulgaria',
			thumbnail_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
			images: [
				'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
				'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
			],
			tags: ['sneakers', 'nike', 'white', 'classic'],
			seller: {
				id: 'seller-2',
				username: 'sneaker_king',
				full_name: 'Dimitar Georgiev',
				avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
				verified: false,
				seller_verified: true,
				seller_rating: 4.5,
				total_sales: 64,
				follower_count: 890
			},
			likes: [{ count: 18 }],
			is_liked: []
		},
		{
			id: 'test-3',
			title: 'Zara Cropped Blazer',
			description: 'Elegant black cropped blazer from Zara. Perfect for office wear or evening events. Made from high-quality fabric with excellent tailoring.',
			price: 45,
			original_price: 89,
			currency: 'USD',
			condition: 'good',
			size: 'M',
			brand: 'Zara',
			color: 'Black',
			like_count: 32,
			view_count: 203,
			created_at: '2024-01-10T09:15:00Z',
			shipping_available: false,
			city: 'Varna',
			location: 'Varna, Bulgaria',
			thumbnail_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center',
			images: [
				'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
			],
			tags: ['blazer', 'office', 'elegant', 'black'],
			seller: {
				id: 'seller-3',
				username: 'elegant_styles',
				full_name: 'Elena Dimitrova',
				avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
				verified: true,
				seller_verified: true,
				seller_rating: 4.9,
				total_sales: 203,
				follower_count: 2100
			},
			likes: [{ count: 32 }],
			is_liked: []
		}
	];
</script>

<svelte:head>
	<title>Quick View Dialog Example - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-6xl px-4">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900 mb-4">Quick View Dialog Demo</h1>
			<p class="text-gray-600 max-w-2xl mx-auto">
				Hover over the product cards below and click the eye icon to test the new Quick View Dialog feature.
				The dialog provides a fast, mobile-optimized way to browse product details without leaving the current page.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each sampleProducts as product}
				<ProductCard {product} />
			{/each}
		</div>

		<div class="mt-12 bg-white rounded-xl shadow-sm border p-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Features Included:</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 class="font-medium text-gray-900 mb-2">🖼️ Image Carousel</h3>
					<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
						<li>Navigation dots and arrows</li>
						<li>Touch/swipe gestures on mobile</li>
						<li>Image counter display</li>
						<li>Smooth transitions</li>
					</ul>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 mb-2">💬 User Actions</h3>
					<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
						<li>Like/unlike products</li>
						<li>Save to favorites</li>
						<li>Share with social links</li>
						<li>Message seller directly</li>
					</ul>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 mb-2">📱 Mobile Optimized</h3>
					<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
						<li>Responsive layout</li>
						<li>Touch-friendly interactions</li>
						<li>Prevents body scroll</li>
						<li>Safe area handling</li>
					</ul>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 mb-2">♿ Accessibility</h3>
					<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
						<li>Keyboard navigation (ESC to close)</li>
						<li>Screen reader support</li>
						<li>Focus management</li>
						<li>ARIA labels</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>