<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { ProductGrid } from '$lib/components/marketplace';
	import CategoryPills from '$lib/components/browse/CategoryPills.svelte';
	import FilterBar from '$lib/components/browse/FilterBar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	const { data } = $props();

	// State
	let searchQuery = $state('');
	let selectedCategory = $state<string | null>(null);
	let selectedSubcategory = $state<string | null>(null);
	let selectedSize = $state<string | null>(null);
	let selectedBrand = $state<string | null>(null);
	let selectedCondition = $state<string | null>(null);
	let priceMin = $state<number>(0);
	let priceMax = $state<number>(500);
	let sortBy = $state('newest');
	let viewMode = $state<'grid' | 'list'>('grid');
	
	// Products data - reactive to data changes
	let isLoading = $state(false);
	
	// Reactive products that update when data changes
	let products = $derived(data?.products || []);
	
	// Categories and subcategories
	let categories = $derived(data?.categories || []);
	let subcategories = $state<Array<{id: string, name: string, emoji?: string}>>([]);
	
	// Debug logging
	console.log('Browse page - data:', data);
	console.log('Browse page - categories:', categories);
	
	// Fetch subcategories when category changes
	async function fetchSubcategories(categoryId: string | null) {
		if (!categoryId) {
			subcategories = [];
			return;
		}
		
		try {
			const response = await fetch(`/api/categories/subcategories?parent=${categoryId}`);
			if (response.ok) {
				const data = await response.json();
				subcategories = data.subcategories || [];
			} else {
				subcategories = [];
			}
		} catch (error) {
			console.error('Failed to fetch subcategories:', error);
			subcategories = [];
		}
	}

	// URL update and data fetch
	async function updateFiltersAndFetch() {
		const url = new URL($page.url);
		
		if (searchQuery) url.searchParams.set('q', searchQuery);
		else url.searchParams.delete('q');
		
		if (selectedCategory) url.searchParams.set('category', selectedCategory);
		else url.searchParams.delete('category');
		
		if (selectedSubcategory) url.searchParams.set('subcategory', selectedSubcategory);
		else url.searchParams.delete('subcategory');
		
		if (selectedSize) url.searchParams.set('size', selectedSize);
		else url.searchParams.delete('size');
		
		if (selectedBrand) url.searchParams.set('brand', selectedBrand);
		else url.searchParams.delete('brand');
		
		if (selectedCondition) url.searchParams.set('condition', selectedCondition);
		else url.searchParams.delete('condition');
		
		if (priceMin > 0) url.searchParams.set('price_min', priceMin.toString());
		else url.searchParams.delete('price_min');
		
		if (priceMax < 9999) url.searchParams.set('price_max', priceMax.toString());
		else url.searchParams.delete('price_max');
		
		if (sortBy !== 'newest') url.searchParams.set('sort', sortBy);
		else url.searchParams.delete('sort');
		
		// Navigate to new URL and invalidate data to force reload
		await goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
		await invalidateAll();
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		updateFiltersAndFetch();
	}

	function handleCategoryChange(categoryId: string | null) {
		selectedCategory = categoryId;
		selectedSubcategory = null; // Reset subcategory when category changes
		updateFiltersAndFetch();
	}

	function handleSubcategoryChange(subcategoryId: string | null) {
		selectedSubcategory = subcategoryId;
		updateFiltersAndFetch();
	}

	function handleSortChange(sort: string) {
		sortBy = sort;
		updateFiltersAndFetch();
	}

	function handleSizeChange(size: string | null) {
		selectedSize = size;
		updateFiltersAndFetch();
	}

	function handleConditionChange(condition: string | null) {
		selectedCondition = condition;
		updateFiltersAndFetch();
	}

	function handleBrandChange(brand: string | null) {
		selectedBrand = brand;
		updateFiltersAndFetch();
	}

	function handlePriceChange(price: string | null) {
		// Parse price range and update min/max
		if (price === null) {
			priceMin = 0;
			priceMax = 500;
		} else if (price === '0-50') {
			priceMin = 0;
			priceMax = 50;
		} else if (price === '50-100') {
			priceMin = 50;
			priceMax = 100;
		} else if (price === '100-200') {
			priceMin = 100;
			priceMax = 200;
		} else if (price === '200+') {
			priceMin = 200;
			priceMax = 9999;
		}
		updateFiltersAndFetch();
	}
	
	// Initialize subcategories on page load if category is already selected
	if (selectedCategory) {
		fetchSubcategories(selectedCategory);
	}
</script>

<div class="browse-page">
	<!-- Search bar -->
	<div class="search-section">
		<form class="search-form" onsubmit={handleSearch}>
			<div class="search-input-group">
				<Search size={18} class="search-icon" />
				<input
					bind:value={searchQuery}
					type="search"
					placeholder="Search items or @sellers"
					class="search-input"
				/>
			</div>
		</form>
	</div>

	<!-- Category pills -->
	<CategoryPills
		{selectedCategory}
		{selectedSubcategory}
		{categories}
		{subcategories}
		onCategoryChange={handleCategoryChange}
		onSubcategoryChange={handleSubcategoryChange}
	/>

	<!-- Filter bar -->
	<FilterBar
		{sortBy}
		{viewMode}
		{selectedSize}
		{selectedCondition}
		{selectedBrand}
		selectedPrice={priceMin > 0 || priceMax < 500 ? `${priceMin}-${priceMax === 9999 ? '+' : priceMax}` : null}
		onSortChange={handleSortChange}
		onViewModeChange={(mode) => viewMode = mode}
		onSizeChange={handleSizeChange}
		onConditionChange={handleConditionChange}
		onBrandChange={handleBrandChange}
		onPriceChange={handlePriceChange}
	/>

	<!-- Products grid -->
	<div class="products-section">
		{#if isLoading}
			<div class="loading">Loading...</div>
		{:else if products.length > 0}
			<ProductGrid {products} variant="grid" />
		{:else}
			<div class="no-results">
				<p>No products found</p>
			</div>
		{/if}
	</div>

</div>

<style>
	.browse-page {
		min-height: 100vh;
		background: #f9fafb;
		padding-top: 64px; /* Account for fixed header */
	}

	.search-section {
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: relative;
		z-index: 10;
	}

	.search-form {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-input-group {
		display: flex;
		align-items: center;
		background: white;
		border: 1.5px solid #e5e7eb;
		border-radius: 10px;
		padding: 0 16px;
		height: 42px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.search-input-group:focus-within {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		color: #6b7280;
		margin-right: 12px;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-size: 14px;
		color: #111827;
	}

	.search-input::placeholder {
		color: #9ca3af;
	}


	.products-section {
		padding: 0;
	}

	.loading,
	.no-results {
		text-align: center;
		padding: 40px;
		color: #6b7280;
	}

	@media (min-width: 768px) {
		.products-section {
			max-width: 1200px;
			margin: 0 auto;
		}
	}
</style>