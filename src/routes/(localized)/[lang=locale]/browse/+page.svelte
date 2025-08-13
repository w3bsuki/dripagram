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
	let selectedSize = $state<string | null>(null);
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
		
		if (selectedSize) url.searchParams.set('size', selectedSize);
		else url.searchParams.delete('size');
		
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
		onCategoryChange={handleCategoryChange}
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

	<!-- Simple filters modal for mobile -->
	{#if showFilters}
		<div class="filters-modal">
			<div class="modal-backdrop" onclick={() => showFilters = false}></div>
			<div class="modal-content">
				<h2>Filters</h2>
				<button class="close-btn" onclick={() => showFilters = false}>×</button>
				<!-- Add filter options here -->
				<p>Filter options coming soon</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.browse-page {
		min-height: 100vh;
		background: #f9fafb;
	}

	.search-section {
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.search-form {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-input-group {
		display: flex;
		align-items: center;
		background: #f3f4f6;
		border: 2px solid transparent;
		border-radius: 12px;
		padding: 0 16px;
		height: 44px;
	}

	.search-input-group:focus-within {
		border-color: #3b82f6;
		background: white;
	}

	.search-icon {
		color: #6b7280;
		margin-right: 12px;
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
		padding: 20px;
		max-height: 80vh;
		overflow-y: auto;
	}

	.modal-content h2 {
		margin: 0 0 16px;
		font-size: 18px;
	}

	.close-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		width: 32px;
		height: 32px;
		border: none;
		background: #f3f4f6;
		border-radius: 50%;
		font-size: 20px;
		cursor: pointer;
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