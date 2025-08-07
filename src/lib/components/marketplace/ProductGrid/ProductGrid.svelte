<script lang="ts">
	import ProductGridCard from './ProductGridCard.svelte';
	import ProductGridSearch from './ProductGridSearch.svelte';
	import ProductGridFilters from './ProductGridFilters.svelte';
	import QuickViewDialog from '../QuickViewDialog.svelte';
	import type { ProductGridProps, Product } from './types';

	let { 
		products = [], 
		searchQuery = '', 
		selectedCategory = null, 
		filterBy = null,
		onProductClick,
		onLikeToggle,
		onQuickView,
		onAddToBag
	}: ProductGridProps = $props();

	// Internal state
	let internalProducts = $state<Product[]>(products);
	let internalSearchQuery = $state(searchQuery);
	let showCategories = $state(false);
	let quickViewProduct = $state<Product | null>(null);
	let isQuickViewOpen = $state(false);

	// Use internal state if no external handlers provided
	let effectiveProducts = $derived(products.length > 0 ? products : internalProducts);

	// Default data if no products provided
	$effect(() => {
		if (products.length === 0) {
			internalProducts = [
				{
					id: '1',
					title: 'Vintage Denim Jacket',
					price: 89,
					image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400&h=500&fit=crop',
					seller: {
						username: 'vintage_finds',
						avatar: 'https://i.pravatar.cc/150?img=1',
						verified: true,
					},
					likes: 234,
					brand: "Levi's",
					size: 'M',
					condition: 'Excellent',
				},
				{
					id: '2',
					title: 'Designer Silk Dress',
					price: 156,
					image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
					seller: {
						username: 'luxury_closet',
						avatar: 'https://i.pravatar.cc/150?img=2',
					},
					likes: 412,
					isLiked: true,
					brand: 'Zara',
					size: 'S',
					condition: 'Like New',
				},
				{
					id: '3',
					title: 'Streetwear Hoodie',
					price: 75,
					image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop',
					seller: {
						username: 'street_style',
						avatar: 'https://i.pravatar.cc/150?img=3',
						verified: true,
					},
					likes: 189,
					brand: 'Supreme',
					size: 'L',
					condition: 'New with Tags',
				},
				{
					id: '4',
					title: 'Leather Ankle Boots',
					price: 120,
					image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
					seller: {
						username: 'shoe_haven',
						avatar: 'https://i.pravatar.cc/150?img=4',
					},
					likes: 298,
					brand: 'Dr. Martens',
					size: '38',
					condition: 'Good',
				},
				{
					id: '5',
					title: 'Retro Sunglasses',
					price: 45,
					image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop',
					seller: {
						username: 'accessories_bg',
						avatar: 'https://i.pravatar.cc/150?img=5',
					},
					likes: 156,
					brand: 'Ray-Ban',
					condition: 'Excellent',
				},
				{
					id: '6',
					title: 'Knit Sweater',
					price: 68,
					image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
					seller: {
						username: 'cozy_style',
						avatar: 'https://i.pravatar.cc/150?img=6',
						verified: true,
					},
					likes: 342,
					isLiked: true,
					brand: 'COS',
					size: 'M',
					condition: 'Like New',
				},
				{
					id: '7',
					title: 'Canvas Backpack',
					price: 52,
					image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
					seller: {
						username: 'urban_gear',
						avatar: 'https://i.pravatar.cc/150?img=7',
					},
					likes: 128,
					brand: 'Herschel',
					condition: 'Good',
				},
				{
					id: '8',
					title: 'Floral Summer Dress',
					price: 78,
					image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop',
					seller: {
						username: 'summer_vibes',
						avatar: 'https://i.pravatar.cc/150?img=8',
					},
					likes: 267,
					brand: 'H&M',
					size: 'M',
					condition: 'Excellent',
				},
			];
		}
	});

	// Event handlers
	function handleProductClick(productId: string) {
		if (onProductClick) {
			onProductClick(productId);
		} else {
			// Default behavior
			window.location.href = `/products/${productId}`;
		}
	}

	function handleLikeToggle(product: Product) {
		if (onLikeToggle) {
			onLikeToggle(product);
		} else {
			// Default behavior - update the product directly
			product.isLiked = !product.isLiked;
			product.likes += product.isLiked ? 1 : -1;
		}
	}

	function handleQuickView(product: Product) {
		if (onQuickView) {
			onQuickView(product);
		} else {
			// Default behavior - show quick view dialog
			quickViewProduct = {
				id: product.id,
				title: product.title,
				price: product.price,
				condition: product.condition as any,
				thumbnail_url: product.image,
				images: [product.image],
				like_count: product.likes,
				size: product.size,
				brand: product.brand,
				seller: {
					id: product.seller.username,
					username: product.seller.username,
					avatar_url: product.seller.avatar,
					verified: product.seller.verified,
					seller_verified: product.seller.verified,
				},
			};
			isQuickViewOpen = true;
		}
	}

	function handleAddToBag(product: Product) {
		if (onAddToBag) {
			onAddToBag(product);
		} else {
			// Default behavior - could show a toast or handle bag logic
			console.log('Add to bag:', product.title);
		}
	}

	function handleSearchChange(query: string) {
		internalSearchQuery = query;
	}

	function handleCategoriesToggle() {
		showCategories = !showCategories;
	}

	function handleCategorySelect(category: string) {
		// Handle category selection
		showCategories = false;
		console.log('Selected category:', category);
	}

	function handleFilterSelect(filter: string) {
		// Handle filter selection  
		showCategories = false;
		console.log('Selected filter:', filter);
	}

	function closeQuickView() {
		isQuickViewOpen = false;
		quickViewProduct = null;
	}
</script>

<div class="product-grid-container">
	<ProductGridSearch 
		searchQuery={internalSearchQuery}
		{showCategories}
		onSearchChange={handleSearchChange}
		onCategoriesToggle={handleCategoriesToggle}
		onCategorySelect={handleCategorySelect}
		onFilterSelect={handleFilterSelect}
	/>

	<ProductGridFilters 
		{showCategories}
		onCategorySelect={handleCategorySelect}
		onFilterSelect={handleFilterSelect}
	/>

	<!-- Product Grid -->
	<div class="product-grid">
		{#each effectiveProducts as product (product.id)}
			<ProductGridCard 
				{product}
				onProductClick={handleProductClick}
				onLikeToggle={handleLikeToggle}
				onQuickView={handleQuickView}
				onAddToBag={handleAddToBag}
			/>
		{/each}
	</div>
</div>

<!-- Quick View Dialog -->
{#if quickViewProduct}
	<QuickViewDialog
		product={quickViewProduct}
		isOpen={isQuickViewOpen}
		onClose={closeQuickView}
	/>
{/if}

<style>
	.product-grid-container {
		padding: 1rem;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: 1.5rem;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.product-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}
	}
</style>