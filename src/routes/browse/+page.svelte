<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { ProductGrid } from '$lib/components/marketplace';
	import CategoryPills from '$lib/components/browse/CategoryPills.svelte';
	import FilterBar from '$lib/components/browse/FilterBar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
	let showFilters = $state(false);
	
	// Products data
	let products = $state(data?.products || []);
	let isLoading = $state(false);

	// URL update
	function updateURL() {
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
		
		if (priceMin > 0) url.searchParams.set('min', priceMin.toString());
		else url.searchParams.delete('min');
		
		if (priceMax < 9999) url.searchParams.set('max', priceMax.toString());
		else url.searchParams.delete('max');
		
		if (sortBy !== 'newest') url.searchParams.set('sort', sortBy);
		else url.searchParams.delete('sort');
		
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		updateURL();
	}

	function handleCategoryChange(categoryId: string | null) {
		selectedCategory = categoryId;
		selectedSubcategory = null; // Reset subcategory when category changes
		updateURL();
	}

	function handleSubcategoryChange(subcategoryId: string | null) {
		selectedSubcategory = subcategoryId;
		updateURL();
	}

	function handleSortChange(sort: string) {
		sortBy = sort;
		updateURL();
	}

	function handleSizeChange(size: string | null) {
		selectedSize = size;
		updateURL();
	}

	function handleShowFilters() {
		showFilters = true;
	}
</script>

<div class="browse-page">
	<!-- Search bar -->
	<div class="search-section">
		<form class="search-form" onsubmit={handleSearch}>
			<div class="search-input-group">
				<Search size={20} class="search-icon" />
				<input
					bind:value={searchQuery}
					type="search"
					placeholder="Search items or @sellers"
					class="search-input"
				/>
				<button type="submit" class="search-button" aria-label="Search">
					<Search size={18} />
				</button>
			</div>
		</form>
	</div>

	<!-- Category pills -->
	<CategoryPills
		{selectedCategory}
		{selectedSubcategory}
		onCategoryChange={handleCategoryChange}
		onSubcategoryChange={handleSubcategoryChange}
	/>

	<!-- Filter bar -->
	<FilterBar
		{sortBy}
		{viewMode}
		{selectedSize}
		onSortChange={handleSortChange}
		onViewModeChange={(mode) => viewMode = mode}
		onSizeChange={handleSizeChange}
		onShowFilters={handleShowFilters}
	/>

	<!-- Products grid -->
	<div class="products-section">
		{#if isLoading}
			<div class="loading">Loading...</div>
		{:else if products.length > 0}
			<ProductGrid {products} />
		{:else}
			<div class="no-results">
				<p>No products found</p>
			</div>
		{/if}
	</div>

	<!-- Filters modal -->
	{#if showFilters}
		<div class="filters-modal">
			<div class="modal-backdrop" onclick={() => showFilters = false}></div>
			<div class="modal-content">
				<div class="modal-header">
					<h2>Filters</h2>
					<button class="close-btn" onclick={() => showFilters = false}>×</button>
				</div>
				
				<div class="filter-sections">
					<!-- Condition filter -->
					<div class="filter-section">
						<h3>Condition</h3>
						<div class="filter-options">
							{#each ['New with tags', 'New without tags', 'Like new', 'Good', 'Fair'] as condition}
								<button 
									class="filter-option"
									class:active={selectedCondition === condition}
									onclick={() => selectedCondition = selectedCondition === condition ? null : condition}
								>
									{condition}
								</button>
							{/each}
						</div>
					</div>

					<!-- Brand filter -->
					<div class="filter-section">
						<h3>Brand</h3>
						<div class="filter-options">
							{#each ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Prada', 'Versace', 'Other'] as brand}
								<button 
									class="filter-option"
									class:active={selectedBrand === brand}
									onclick={() => selectedBrand = selectedBrand === brand ? null : brand}
								>
									{brand}
								</button>
							{/each}
						</div>
					</div>

					<!-- Price range filter -->
					<div class="filter-section">
						<h3>Price Range</h3>
						<div class="price-inputs">
							<div class="price-input-group">
								<label for="min-price">Min</label>
								<input 
									id="min-price"
									type="number" 
									bind:value={priceMin}
									min="0"
									max={priceMax}
									placeholder="0"
								/>
								<span>$</span>
							</div>
							<span class="price-separator">-</span>
							<div class="price-input-group">
								<label for="max-price">Max</label>
								<input 
									id="max-price"
									type="number" 
									bind:value={priceMax}
									min={priceMin}
									placeholder="500"
								/>
								<span>$</span>
							</div>
						</div>
						<div class="price-presets">
							<button class="price-preset" onclick={() => { priceMin = 0; priceMax = 50; }}>
								Under $50
							</button>
							<button class="price-preset" onclick={() => { priceMin = 50; priceMax = 100; }}>
								$50-$100
							</button>
							<button class="price-preset" onclick={() => { priceMin = 100; priceMax = 200; }}>
								$100-$200
							</button>
							<button class="price-preset" onclick={() => { priceMin = 200; priceMax = 9999; }}>
								$200+
							</button>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					<button class="clear-filters-btn" onclick={() => {
						selectedCondition = null;
						selectedBrand = null;
						priceMin = 0;
						priceMax = 500;
					}}>
						Clear all
					</button>
					<button class="apply-filters-btn" onclick={() => {
						updateURL();
						showFilters = false;
					}}>
						Apply filters
					</button>
				</div>
			</div>
		</div>
	{/if}
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
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 0 8px 0 16px;
		height: 48px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
		font-size: 15px;
		color: #111827;
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.search-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: #3b82f6;
		color: white;
		border-radius: 8px;
		cursor: pointer;
		flex-shrink: 0;
		margin-left: 8px;
	}

	.search-button:hover {
		background: #2563eb;
	}

	.products-section {
		padding: 20px;
	}

	.loading,
	.no-results {
		text-align: center;
		padding: 40px;
		color: #6b7280;
	}

	/* Simple modal for filters */
	.filters-modal {
		position: fixed;
		inset: 0;
		z-index: 100;
	}

	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
	}

	.modal-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 16px 16px 0 0;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: #f3f4f6;
		border-radius: 50%;
		font-size: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-sections {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.filter-section {
		margin-bottom: 28px;
	}

	.filter-section h3 {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 12px;
		color: #111827;
	}

	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.filter-option {
		padding: 8px 16px;
		border: 1.5px solid #e5e7eb;
		border-radius: 20px;
		background: white;
		color: #4b5563;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.filter-option:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.filter-option.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.price-inputs {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.price-input-group {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.price-input-group label {
		font-size: 12px;
		color: #6b7280;
	}

	.price-input-group input {
		flex: 1;
		padding: 8px 12px;
		border: 1.5px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
	}

	.price-input-group input:focus {
		border-color: #3b82f6;
	}

	.price-input-group span {
		font-size: 14px;
		color: #6b7280;
	}

	.price-separator {
		color: #9ca3af;
	}

	.price-presets {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.price-preset {
		padding: 8px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: #f9fafb;
		color: #4b5563;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.price-preset:hover {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		padding: 16px 20px;
		border-top: 1px solid #e5e7eb;
	}

	.clear-filters-btn {
		flex: 1;
		padding: 12px;
		border: 1.5px solid #e5e7eb;
		border-radius: 10px;
		background: white;
		color: #374151;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
	}

	.apply-filters-btn {
		flex: 2;
		padding: 12px;
		border: none;
		border-radius: 10px;
		background: #3b82f6;
		color: white;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
	}

	.apply-filters-btn:hover {
		background: #2563eb;
	}

	@media (min-width: 768px) {
		.products-section {
			max-width: 1200px;
			margin: 0 auto;
		}

		.modal-content {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			bottom: auto;
			width: 90%;
			max-width: 500px;
			border-radius: 16px;
		}
	}
</style>