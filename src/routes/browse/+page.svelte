<script lang="ts">
	import { Search, Filter, ChevronDown, X } from '@lucide/svelte';
	import { ProductGrid } from '$lib/components/marketplace';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let isMobile = $state(false);
	let searchQuery = $state('');
	let showFilters = $state(false);
	let selectedCategory = $state<string | null>(null);
	let selectedCondition = $state<string | null>(null);
	let selectedSubcategory = $state<string | null>(null);
	let priceRange = $state({ min: 0, max: 500 });
	let sortBy = $state('newest');

	const collections = [
		{ id: 'summer', name: 'Summer Sale', emoji: '🌞', color: 'bg-yellow-100' },
		{ id: 'vintage', name: 'Vintage Finds', emoji: '📸', color: 'bg-orange-100' },
		{ id: 'designer', name: 'Designer Deals', emoji: '💎', color: 'bg-blue-100' },
		{ id: 'trending', name: 'Trending Now', emoji: '🔥', color: 'bg-red-100' },
		{ id: 'eco', name: 'Eco Friendly', emoji: '🌿', color: 'bg-green-100' },
	];

	const categories = [
		{ id: 'women', name: 'Women', emoji: '👗' },
		{ id: 'men', name: 'Men', emoji: '👔' },
		{ id: 'shoes', name: 'Shoes', emoji: '👟' },
		{ id: 'bags', name: 'Bags', emoji: '👜' },
		{ id: 'accessories', name: 'Accessories', emoji: '💍' },
		{ id: 'kids', name: 'Kids', emoji: '👶' },
	];

	const subcategories = {
		women: ['Dresses', 'T-Shirts', 'Jeans', 'Jackets', 'Skirts', 'Blouses'],
		men: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Sweaters', 'Shorts'],
		shoes: ['Sneakers', 'Boots', 'Heels', 'Sandals', 'Flats', 'Athletic'],
		bags: ['Handbags', 'Backpacks', 'Clutches', 'Wallets', 'Totes', 'Crossbody'],
		accessories: ['Jewelry', 'Watches', 'Belts', 'Hats', 'Scarves', 'Sunglasses'],
		kids: ['Baby', 'Toddler', 'Girls', 'Boys', 'Shoes', 'Accessories'],
	};

	const conditions = [
		{ id: 'new-tags', name: 'New with tags', emoji: '🏷️' },
		{ id: 'like-new', name: 'Like new', emoji: '✨' },
		{ id: 'good', name: 'Good', emoji: '👍' },
		{ id: 'fair', name: 'Fair', emoji: '🤝' },
		{ id: 'vintage', name: 'Vintage', emoji: '📿' },
	];

	const trendingSearches = [
		'Vintage denim',
		'Nike sneakers',
		'Summer dresses',
		'Designer bags',
		'Streetwear',
		'Y2K fashion',
		'Cottagecore',
		'Minimalist style',
	];

	// TODO: Replace with actual product fetching from Supabase
	let products = $state<any[]>([]);

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			const handleResize = () => {
				isMobile = window.innerWidth < 768;
			};
			window.addEventListener('resize', handleResize);
			
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	function clearFilters() {
		selectedCategory = null;
		selectedCondition = null;
		selectedSubcategory = null;
		priceRange = { min: 0, max: 500 };
		sortBy = 'newest';
	}

	const activeFiltersCount = $derived(
		[selectedCategory, selectedCondition, selectedSubcategory].filter(Boolean).length
	);
	const currentSubcategories = $derived(
		selectedCategory ? subcategories[selectedCategory as keyof typeof subcategories] || [] : []
	);
</script>

<svelte:head>
	<title>Browse - Driplo | Discover Fashion</title>
	<meta
		name="description"
		content="Browse thousands of fashion items. Find your perfect style from vintage to designer pieces."
	/>
</svelte:head>

<div class="browse-page">
	<!-- Sticky Search Header -->
	<header class="search-header">
		<div class="search-container">
			<div class="search-box">
				<Search size={20} class="search-icon" />
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Search for items, brands, or styles..."
					class="search-input"
				/>
				{#if searchQuery}
					<button class="clear-search" onclick={() => (searchQuery = '')}>
						<X size={16} />
					</button>
				{/if}
			</div>

			<button
				class="filter-btn"
				onclick={() => (showFilters = !showFilters)}
				class:active={showFilters}
			>
				<Filter size={20} />
				<span>Filters</span>
				{#if activeFiltersCount > 0}
					<span class="filter-count">{activeFiltersCount}</span>
				{/if}
			</button>
		</div>

		<!-- Trending Searches (shown when search is empty) -->
		{#if !searchQuery && !isMobile}
			<div class="trending-searches">
				<span class="trending-label">Trending:</span>
				{#each trendingSearches.slice(0, 5) as search}
					<button class="trending-tag" onclick={() => (searchQuery = search)}>
						{search}
					</button>
				{/each}
			</div>
		{/if}
	</header>

	<!-- Collection Pills -->
	<div class="collections-bar">
		<div class="collections-scroll">
			{#each collections as collection}
				<button class="collection-pill {collection.color}">
					<span class="collection-emoji">{collection.emoji}</span>
					<span>{collection.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Quick Category Buttons -->
	<div class="category-section">
		<div class="category-grid">
			{#each categories as category}
				<button
					class="category-btn"
					class:active={selectedCategory === category.id}
					onclick={() => (selectedCategory = selectedCategory === category.id ? null : category.id)}
				>
					<span class="category-emoji">{category.emoji}</span>
					<span>{category.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Subcategory Pills (if category selected) -->
	{#if selectedCategory && currentSubcategories.length > 0}
		<div class="subcategory-bar">
			<div class="subcategory-scroll">
				{#each currentSubcategories as subcategory}
					<button
						class="subcategory-pill"
						class:active={selectedSubcategory === subcategory}
						onclick={() =>
							(selectedSubcategory = selectedSubcategory === subcategory ? null : subcategory)}
					>
						{subcategory}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Filter Bar -->
	<div class="filter-bar">
		<div class="filter-info">
			<span class="results-count">2,456 items</span>
			{#if activeFiltersCount > 0}
				<button class="clear-filters" onclick={clearFilters}> Clear filters </button>
			{/if}
		</div>

		<div class="sort-dropdown">
			<label for="sort-select">Sort by:</label>
			<select id="sort-select" bind:value={sortBy} class="sort-select">
				<option value="newest">Newest first</option>
				<option value="price-low">Price: Low to High</option>
				<option value="price-high">Price: High to Low</option>
				<option value="most-liked">Most Liked</option>
				<option value="trending">Trending</option>
			</select>
		</div>
	</div>

	<!-- Products Grid -->
	<div class="products-section">
		<ProductGrid products={products} />
	</div>

	<!-- Mobile Filter Sheet -->
	{#if showFilters}
		<div 
			class="filter-overlay" 
			role="button"
			tabindex="0"
			onclick={() => (showFilters = false)}
			onkeydown={(e) => e.key === 'Escape' && (showFilters = false)}
			aria-label="Close filters"
		></div>
		<div class="filter-sheet">
			<div class="filter-header">
				<h2>Filters</h2>
				<button class="close-filters" onclick={() => (showFilters = false)}>
					<X size={24} />
				</button>
			</div>

			<div class="filter-content">
				<!-- Condition Filter -->
				<div class="filter-group">
					<h3>Condition</h3>
					<div class="condition-options">
						{#each conditions as condition}
							<button
								class="condition-btn"
								class:active={selectedCondition === condition.id}
								onclick={() =>
									(selectedCondition = selectedCondition === condition.id ? null : condition.id)}
							>
								<span>{condition.emoji}</span>
								<span>{condition.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Price Range -->
				<div class="filter-group">
					<h3>Price Range</h3>
					<div class="price-inputs">
						<input
							type="number"
							bind:value={priceRange.min}
							placeholder="Min"
							class="price-input"
						/>
						<span>-</span>
						<input
							type="number"
							bind:value={priceRange.max}
							placeholder="Max"
							class="price-input"
						/>
						<span>лв</span>
					</div>
				</div>
			</div>

			<div class="filter-footer">
				<button class="reset-btn" onclick={clearFilters}>Reset</button>
				<button class="apply-btn" onclick={() => (showFilters = false)}> Apply Filters </button>
			</div>
		</div>
	{/if}
</div>

<style>
	.browse-page {
		min-height: 100vh;
		background: var(--color-surface);
		padding-bottom: 80px; /* Space for mobile nav */
	}

	/* Search Header */
	.search-header {
		position: sticky;
		top: 0;
		background: white;
		border-bottom: 1px solid var(--color-border);
		z-index: 100;
		padding: 1rem;
	}

	.search-container {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.search-box {
		flex: 1;
		position: relative;
	}

	.search-box :global(.search-icon) {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #8e8e8e;
	}

	.search-input {
		width: 100%;
		height: 44px;
		background: #f5f5f5;
		border: 1px solid transparent;
		border-radius: 22px;
		padding: 0 44px;
		font-size: 16px;
		color: #262626;
		outline: none;
		transition: all 0.2s;
	}

	.search-input:focus {
		background: white;
		border-color: var(--color-border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.clear-search {
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #8e8e8e;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 22px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.filter-btn:hover,
	.filter-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.filter-count {
		background: var(--color-accent);
		color: white;
		font-size: 12px;
		padding: 0 6px;
		border-radius: 10px;
		min-width: 20px;
		text-align: center;
	}

	/* Trending Searches */
	.trending-searches {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.75rem;
		font-size: 14px;
	}

	.trending-label {
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.trending-tag {
		padding: 0.375rem 0.75rem;
		background: #f5f5f5;
		border: none;
		border-radius: 16px;
		font-size: 13px;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.trending-tag:hover {
		background: var(--color-primary);
		color: white;
	}

	/* Collections Bar */
	.collections-bar {
		background: white;
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-border);
		overflow: hidden;
	}

	.collections-scroll {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.collections-scroll::-webkit-scrollbar {
		display: none;
	}

	.collection-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 24px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.collection-pill:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.collection-emoji {
		font-size: 1.125rem;
	}

	.bg-yellow-100 {
		background: #fef3c7;
	}

	.bg-orange-100 {
		background: #fed7aa;
	}

	.bg-blue-100 {
		background: #dbeafe;
	}

	.bg-red-100 {
		background: #fee2e2;
	}

	.bg-green-100 {
		background: #d1fae5;
	}

	/* Category Section */
	.category-section {
		background: white;
		padding: 1.5rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		.category-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.category-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 0.5rem;
		background: #f8f8f8;
		border: 1px solid transparent;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.category-btn:hover {
		background: white;
		border-color: var(--color-border);
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.category-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.category-emoji {
		font-size: 2rem;
	}

	/* Subcategory Bar */
	.subcategory-bar {
		background: white;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border);
		overflow: hidden;
	}

	.subcategory-scroll {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.subcategory-scroll::-webkit-scrollbar {
		display: none;
	}

	.subcategory-pill {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		font-size: 14px;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.subcategory-pill:hover {
		background: var(--color-gray-50);
	}

	.subcategory-pill.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	/* Filter Bar */
	.filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: white;
		border-bottom: 1px solid var(--color-border);
		max-width: 1200px;
		margin: 0 auto;
	}

	.filter-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.results-count {
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.clear-filters {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		text-decoration: underline;
	}

	.sort-dropdown {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 14px;
	}

	.sort-dropdown label {
		color: var(--color-text-secondary);
	}

	.sort-select {
		padding: 0.375rem 0.75rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 14px;
		color: var(--color-text-primary);
		cursor: pointer;
		outline: none;
	}

	/* Products Section */
	.products-section {
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Mobile Filter Sheet */
	.filter-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
	}

	.filter-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 24px 24px 0 0;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		z-index: 201;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.filter-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-filters {
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.filter-group {
		margin-bottom: 2rem;
	}

	.filter-group h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.condition-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.condition-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f5f5f5;
		border: 1px solid transparent;
		border-radius: 20px;
		font-size: 14px;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.condition-btn:hover {
		background: white;
		border-color: var(--color-border);
	}

	.condition-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.price-inputs {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.price-input {
		flex: 1;
		padding: 0.625rem;
		background: #f5f5f5;
		border: 1px solid transparent;
		border-radius: 8px;
		font-size: 14px;
		color: var(--color-text-primary);
		outline: none;
		text-align: center;
	}

	.price-input:focus {
		background: white;
		border-color: var(--color-border);
	}

	.filter-footer {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.reset-btn {
		flex: 1;
		padding: 0.875rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: #f5f5f5;
	}

	.apply-btn {
		flex: 2;
		padding: 0.875rem;
		background: var(--color-primary);
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.apply-btn:hover {
		background: var(--color-primary-dark);
	}

	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.search-header {
			padding: 0.75rem;
		}

		.search-input {
			font-size: 16px; /* Prevent zoom on iOS */
		}

		.category-grid {
			gap: 0.5rem;
		}

		.category-btn {
			padding: 0.75rem 0.25rem;
			font-size: 12px;
		}

		.category-emoji {
			font-size: 1.5rem;
		}

		.filter-bar {
			padding: 0.75rem;
		}

		.sort-dropdown label {
			display: none;
		}
	}

	/* Desktop Enhancements */
	@media (min-width: 768px) {
		.filter-sheet {
			position: static;
			max-height: none;
			border-radius: 0;
			box-shadow: none;
			animation: none;
		}

		.filter-overlay {
			display: none;
		}
	}
</style>
