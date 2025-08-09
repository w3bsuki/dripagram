<script lang="ts">
	import { Search, Sliders, Grid3x3, Heart, Share, Bookmark } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { FeedProduct } from '$lib/types';

	const { data } = $props() as { data: any };

	// State
	let searchQuery = $state(data.query || '');
	let isSearchFocused = $state(false);
	let products = $state<FeedProduct[]>(data.products || []);
	let total = $state(data.total || 0);
	let currentPage = $state(data.currentPage || 1);
	let nextPage = $state(data.nextPage);
	let sort = $state('relevance');
	let trendingSearches = $state(data.trendingSearches || []);
	let recentSearches = $state<string[]>(data.recentSearches || []);

	// Derived
	const showEmptyState = $derived(!searchQuery.trim());
	const showResults = $derived(searchQuery.trim() && products.length > 0);
	const showNoResults = $derived(searchQuery.trim() && products.length === 0);

	// Sync state from URL
	$effect(() => {
		const unsubscribe = page.subscribe(($pg) => {
			const url = $pg.url;
			const sp = url.searchParams;
			const q = sp.get('q') || '';
			const s = sp.get('sort') || 'relevance';
			const p = Number(sp.get('page') || '1');
			
			if (q !== searchQuery) searchQuery = q;
			if (s !== sort) sort = s;
			if (p !== currentPage) currentPage = p;
		});
		return unsubscribe;
	});

	// Update data when props change
	$effect(() => {
		products = data?.products || [];
		total = data?.total || 0;
		currentPage = data?.currentPage || 1;
		nextPage = data?.nextPage;
		trendingSearches = data?.trendingSearches || [];
		recentSearches = data?.recentSearches || [];
	});

	function updateURL() {
		if (!browser) return;
		const url = new URL(window.location.href);
		if (searchQuery.trim()) {
			url.searchParams.set('q', searchQuery.trim());
		} else {
			url.searchParams.delete('q');
		}
		if (sort !== 'relevance') {
			url.searchParams.set('sort', sort);
		} else {
			url.searchParams.delete('sort');
		}
		if (currentPage > 1) {
			url.searchParams.set('page', String(currentPage));
		} else {
			url.searchParams.delete('page');
		}
		goto(url.toString(), { replaceState: false, keepFocus: true, noScroll: false });
	}

	function handleSearch(e?: Event) {
		if (e) e.preventDefault();
		if (!searchQuery.trim()) return;
		
		// Add to recent searches
		const query = searchQuery.trim();
		if (!recentSearches.includes(query)) {
			recentSearches = [query, ...recentSearches].slice(0, 5);
			// TODO: Save to localStorage or user preferences
		}
		
		currentPage = 1;
		updateURL();
	}

	function handleTrendingSearch(query: string) {
		searchQuery = query;
		handleSearch();
	}

	function handleRecentSearch(query: string) {
		searchQuery = query;
		handleSearch();
	}

	function handleSortChange() {
		currentPage = 1;
		updateURL();
	}

	function loadNextPage() {
		if (!nextPage) return;
		currentPage = nextPage;
		updateURL();
	}

	// Product interactions
	function handleProductTap(productId: string) {
		goto(`/products/${productId}`);
	}

	function handleLike(productId: string, event: Event) {
		event.stopPropagation();
		// TODO: Implement like functionality
		console.log('Like product:', productId);
	}

	function handleSave(productId: string, event: Event) {
		event.stopPropagation();
		// TODO: Implement save functionality
		console.log('Save product:', productId);
	}

	function handleShare(productId: string, event: Event) {
		event.stopPropagation();
		// TODO: Implement share functionality
		console.log('Share product:', productId);
	}

	// Focus management
	let searchInputEl: HTMLInputElement | null = null;

	$effect(() => {
		// Auto-focus search input on route load
		if (browser && searchInputEl && !searchQuery) {
			setTimeout(() => searchInputEl?.focus(), 100);
		}
	});
</script>

<svelte:head>
	<title>{searchQuery ? `"${searchQuery}" - Search` : 'Search'} - Driplo</title>
	<meta name="description" content={searchQuery ? `Search results for "${searchQuery}"` : 'Search for fashion items, brands, and styles on Driplo'} />
</svelte:head>

<div class="search-page">
	<!-- Sticky Search Header -->
	<div class="search-header sticky">
		<form class="search-form" onsubmit={handleSearch} role="search" aria-label="Product search">
			<div class="search-input-wrapper">
				<Search size={20} class="search-icon" />
				<input
					bind:this={searchInputEl}
					bind:value={searchQuery}
					type="search"
					placeholder="Search items, brands, styles..."
					class="search-input"
					onfocus={() => isSearchFocused = true}
					onblur={() => setTimeout(() => isSearchFocused = false, 200)}
					aria-label="Search query"
				/>
				{#if searchQuery}
					<button 
						type="button" 
						class="clear-search" 
						onclick={() => { searchQuery = ''; handleSearch(); }}
						aria-label="Clear search"
					>
						×
					</button>
				{/if}
			</div>
		</form>

		<!-- Trending/Recent Chips -->
		{#if showEmptyState || isSearchFocused}
			<div class="search-suggestions">
				{#if recentSearches.length > 0}
					<div class="suggestion-group">
						<h3>Recent</h3>
						<div class="chip-scroll">
							{#each recentSearches as query}
								<button 
									class="suggestion-chip recent"
									onclick={() => handleRecentSearch(query)}
								>
									{query}
								</button>
							{/each}
						</div>
					</div>
				{/if}
				
				<div class="suggestion-group">
					<h3>Trending</h3>
					<div class="chip-scroll">
						{#each trendingSearches as query}
							<button 
								class="suggestion-chip trending"
								onclick={() => handleTrendingSearch(query)}
							>
								🔥 {query}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Results Header -->
	{#if showResults}
		<div class="results-header">
			<div class="results-info">
				<span class="results-count">{total.toLocaleString()} results</span>
				{#if searchQuery}
					<span class="search-term">for "{searchQuery}"</span>
				{/if}
			</div>
			<div class="results-controls">
				<select bind:value={sort} onchange={handleSortChange} class="sort-select" aria-label="Sort results">
					<option value="relevance">Most Relevant</option>
					<option value="newest">Newest First</option>
					<option value="price-low">Price: Low to High</option>
					<option value="price-high">Price: High to Low</option>
					<option value="most-liked">Most Liked</option>
					<option value="trending">Trending</option>
				</select>
			</div>
		</div>
	{/if}

	<!-- Content Area -->
	<div class="search-content">
		{#if showEmptyState}
			<!-- Empty State -->
			<div class="empty-state">
				<div class="empty-icon">🔍</div>
				<h2>Discover amazing finds</h2>
				<p>Search for fashion items, brands, and styles from our community of sellers.</p>
			</div>
		{:else if showNoResults}
			<!-- No Results -->
			<div class="no-results">
				<div class="empty-icon">😔</div>
				<h2>No results found</h2>
				<p>Try adjusting your search or browse our trending items instead.</p>
				<div class="trending-suggestions">
					{#each trendingSearches.slice(0, 4) as query}
						<button 
							class="suggestion-chip"
							onclick={() => handleTrendingSearch(query)}
						>
							{query}
						</button>
					{/each}
				</div>
			</div>
		{:else if showResults}
			<!-- Results Grid -->
			<div class="results-grid">
				{#each products as product (product.id)}
					<div 
						class="product-card"
						onclick={() => handleProductTap(product.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && handleProductTap(product.id)}
					>
						<div class="product-image">
							<img 
								src={product.thumbnail_url}
								alt={product.title}
								loading="lazy"
								decoding="async"
							/>
							<div class="product-actions">
								<button 
									class="action-btn like {product.isLiked ? 'active' : ''}"
									onclick={(e) => handleLike(product.id, e)}
									aria-label={product.isLiked ? 'Unlike' : 'Like'}
									title={product.isLiked ? 'Unlike' : 'Like'}
								>
									<Heart size={16} fill={product.isLiked ? 'currentColor' : 'none'} />
								</button>
								<button 
									class="action-btn save {product.isSaved ? 'active' : ''}"
									onclick={(e) => handleSave(product.id, e)}
									aria-label={product.isSaved ? 'Unsave' : 'Save'}
									title={product.isSaved ? 'Unsave' : 'Save'}
								>
									<Bookmark size={16} fill={product.isSaved ? 'currentColor' : 'none'} />
								</button>
								<button 
									class="action-btn share"
									onclick={(e) => handleShare(product.id, e)}
									aria-label="Share"
									title="Share"
								>
									<Share size={16} />
								</button>
							</div>
						</div>
						<div class="product-info">
							<div class="product-price">{product.price} {product.currency}</div>
							{#if product.brand}
								<div class="product-brand">{product.brand}</div>
							{/if}
							<div class="product-title">{product.title}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Load More / Pagination -->
			{#if nextPage}
				<div class="load-more-section">
					<button class="load-more-btn" onclick={loadNextPage}>
						Load More Results
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.search-page {
		min-height: 100vh;
		background: var(--color-surface);
		padding-bottom: 80px; /* space for mobile nav */
	}

	/* Search Header */
	.search-header {
		background: white;
		border-bottom: 1px solid var(--color-border);
		padding: 1rem;
		position: sticky;
		top: 0;
		z-index: var(--z-high);
	}

	.search-form {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		height: 48px;
		padding: 0 3rem 0 3rem;
		border: 2px solid var(--color-border);
		border-radius: 24px;
		background: var(--color-surface);
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: white;
		box-shadow: 0 0 0 4px rgba(24,119,242,0.1);
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		color: var(--color-text-secondary);
		pointer-events: none;
	}

	.clear-search {
		position: absolute;
		right: 1rem;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-gray-200);
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-base);
		font-weight: bold;
	}

	.clear-search:hover {
		background: var(--color-gray-300);
	}

	/* Search Suggestions */
	.search-suggestions {
		margin-top: 1rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.suggestion-group {
		margin-bottom: 1rem;
	}

	.suggestion-group h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 0.5rem;
	}

	.chip-scroll {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.chip-scroll::-webkit-scrollbar {
		display: none;
	}

	.suggestion-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-gray-100);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.suggestion-chip:hover {
		background: var(--color-gray-200);
		border-color: var(--color-primary);
	}

	.suggestion-chip.recent {
		background: rgba(24,119,242,0.1);
		border-color: rgba(24,119,242,0.2);
		color: var(--color-primary);
	}

	/* Results Header */
	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: white;
		border-bottom: 1px solid var(--color-border);
	}

	.results-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.results-count {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.search-term {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.sort-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: white;
		font-size: 0.875rem;
		cursor: pointer;
	}

	/* Content Area */
	.search-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Empty/No Results States */
	.empty-state, .no-results {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-secondary);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.7;
	}

	.empty-state h2, .no-results h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.trending-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	/* Results Grid - Explore Style */
	.results-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1px;
		background: var(--color-border);
		margin-top: 1rem;
	}

	@media (min-width: 640px) {
		.results-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 768px) {
		.results-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.results-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.product-card {
		background: white;
		cursor: pointer;
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		transition: transform 0.2s ease;
	}

	.product-card:hover {
		transform: scale(1.02);
		z-index: var(--z-low);
		box-shadow: 0 8px 24px rgba(0,0,0,0.1);
	}

	.product-image {
		position: relative;
		width: 100%;
		height: 70%;
		overflow: hidden;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.product-actions {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.product-card:hover .product-actions {
		opacity: 1;
	}

	.action-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(255,255,255,0.9);
		border: 1px solid rgba(0,0,0,0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.action-btn:hover {
		background: white;
		transform: scale(1.1);
	}

	.action-btn.like.active {
		color: #e91e63;
		background: rgba(233,30,99,0.1);
		border-color: rgba(233,30,99,0.3);
	}

	.action-btn.save.active {
		color: var(--color-primary);
		background: rgba(24,119,242,0.1);
		border-color: rgba(24,119,242,0.3);
	}

	.product-info {
		padding: 0.5rem;
		height: 30%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.product-price {
		font-weight: 700;
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}

	.product-brand {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.product-title {
		font-size: 0.75rem;
		color: var(--color-text-primary);
		line-height: 1.2;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
	}

	/* Load More */
	.load-more-section {
		text-align: center;
		padding: 2rem;
	}

	.load-more-btn {
		padding: 0.75rem 2rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 24px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.load-more-btn:hover {
		background: var(--color-primary-dark, #1a73e8);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(24,119,242,0.3);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.search-header {
			padding: 0.75rem;
		}
		
		.results-header {
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}
		
		.results-info {
			justify-content: center;
		}
	}

	/* Focus styles for accessibility */
	.product-card:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.action-btn:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
	}
</style>
