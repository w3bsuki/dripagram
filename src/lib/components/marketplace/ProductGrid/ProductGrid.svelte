<script lang="ts">
	import ProductGridCard from './ProductGridCard.svelte';
	import ProductGridSearch from './ProductGridSearch.svelte';
	import ProductGridFilters from './ProductGridFilters.svelte';
	import QuickViewDialog from '../QuickViewDialog.svelte';
	import type { ProductGridProps, Product } from './types';
	import { getMockProducts } from '$lib/data/mockProducts';

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
			// Use centralized mock data
			const mockData = getMockProducts(8);
			internalProducts = mockData.map(mock => ({
				id: mock.id,
				title: mock.title,
				price: mock.price,
				image: mock.images[0],
				seller: {
					username: mock.seller.name,
					avatar: mock.seller.avatar,
					verified: mock.seller.rating > 4.7
				},
				likes: mock.likes,
				isLiked: mock.saved,
				brand: mock.brand,
				size: mock.size,
				condition: mock.condition
			}));
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
	<!-- Search and filters hidden on mobile, shown on desktop -->
	<div class="search-filters-desktop">
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
	</div>

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

	/* Hide search/filters on mobile */
	.search-filters-desktop {
		display: none;
	}

	/* Show search/filters on desktop */
	@media (min-width: 640px) {
		.search-filters-desktop {
			display: block;
		}
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
		.product-grid-container {
			padding: 0.5rem;
		}
		
		.product-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}
	}
</style>