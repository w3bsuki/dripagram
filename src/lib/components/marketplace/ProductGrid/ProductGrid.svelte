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
	let internalSearchQuery = $state(searchQuery);
	let showCategories = $state(false);
	let quickViewProduct = $state<Product | null>(null);
	let isQuickViewOpen = $state(false);

	// Use products directly - no fallback to mock data
	let effectiveProducts = $derived(products);

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
	{#if effectiveProducts.length > 0}
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
	{:else}
		<div class="empty-state">
			<div class="empty-state-content">
				<svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
				<h3 class="empty-title">No products available</h3>
				<p class="empty-text">Check back soon for new items!</p>
			</div>
		</div>
	{/if}
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

	/* Empty state */
	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		padding: 2rem;
	}

	.empty-state-content {
		text-align: center;
		max-width: 400px;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		color: var(--color-text-secondary);
		opacity: 0.5;
	}

	.empty-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-text {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}
</style>