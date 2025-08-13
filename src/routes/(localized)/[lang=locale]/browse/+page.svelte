<script lang="ts">
	const { data } = $props() as { data: any };
	import { ChevronDown, Filter, Grid3x3, Grid, List, Search, SlidersHorizontal, X } from '@lucide/svelte';
	import { ProductGrid } from '$lib/components/marketplace';
	import BrowseSearchBar from '$lib/components/browse/BrowseSearchBar.svelte';
	import CategorySelector from '$lib/components/browse/CategorySelector.svelte';
	import FilterSheet from '$lib/components/browse/FilterSheet.svelte';
	import CategoryPills from '$lib/components/browse/CategoryPills.svelte';
	import FilterBar from '$lib/components/browse/FilterBar.svelte';
	import FilterBottomSheet from '$lib/components/browse/FilterBottomSheet.svelte';
	import EnhancedSearchBar from '$lib/components/browse/EnhancedSearchBar.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	// Search state
	let searchQuery = $state('');
	let showSearchDropdown = $state(false);
	
	// View mode state
	let viewMode = $state<'grid' | 'list'>('grid');
	
	// Dropdown states
	let showSortDropdown = $state(false);
	let showConditionDropdown = $state(false);
	
	// Category state
	let selectedDemographic = $state<string | null>(null);
	let selectedCategory = $state<string | null>(null);
	let showCategoryMenu = $state(false);
	
	// Filter state
	let isMobile = $state(false);
	let showFilters = $state(false);
	let showSizeDropdown = $state(false);
	let selectedSubcategory = $state<string | null>(null);
	let filters = $state({
		selectedCondition: null as string | null,
		selectedBrand: null as string | null,
		selectedSize: null as string | null,
		priceRange: { min: 0, max: 500 },
		selectedCollection: null as string | null
	});
	
	// Sort and pagination
	let sortBy = $state('newest');
	let products = $state<any[]>(data?.products || []);
	let nextCursor = $state<string | null>(data?.nextCursor || null);
	let total = $state<number>(data?.total || 0);

	// Fallback categories for when server doesn't return any
	const fallbackCategories = [
		{ id: 'women', name: m['browse.women'](), emoji: '👗' },
		{ id: 'men', name: m['browse.men'](), emoji: '👔' },
		{ id: 'shoes', name: m['categories.shoes'](), emoji: '👟' },
		{ id: 'bags', name: m['categories.bags'](), emoji: '👜' },
		{ id: 'accessories', name: m['categories.accessories'](), emoji: '💍' },
		{ id: 'kids', name: m['browse.kids'](), emoji: '👶' }
	];
	const categories = $derived((data?.categories && data.categories.length) ? data.categories : fallbackCategories);

	function getCategoryName(id: string | null) {
		if (!id) return '';
		const list = (data?.categories && data.categories.length) ? data.categories : fallbackCategories;
		return (list.find((c: any) => c.id === id)?.name) || id;
	}

	const collections = [
		{ id: 'summer', name: m['browse.summer_sale'](), emoji: '🌞', color: 'bg-yellow-100' },
		{ id: 'vintage', name: m['browse.vintage_finds'](), emoji: '📸', color: 'bg-orange-100' },
		{ id: 'designer', name: m['browse.designer_deals'](), emoji: '💎', color: 'bg-blue-100' },
		{ id: 'trending', name: m['browse.trending_now'](), emoji: '🔥', color: 'bg-red-100' },
		{ id: 'eco', name: m['browse.eco_friendly'](), emoji: '🌿', color: 'bg-green-100' }
	];

	// Enhanced category system for search dropdown
	const demographics = [
		{ id: 'men', name: m['browse.men'](), emoji: '👨' },
		{ id: 'women', name: m['browse.women'](), emoji: '👩' },
		{ id: 'kids', name: m['browse.kids'](), emoji: '👶' },
		{ id: 'pets', name: m['browse.pets'](), emoji: '🐾' }
	];

	const subcategories = {
		men: [
			{ id: 'mens-shoes', name: m['browse.mens_shoes'](), emoji: '👟' },
			{ id: 'mens-tshirts', name: m['browse.mens_tshirts'](), emoji: '👕' },
			{ id: 'mens-jackets', name: m['browse.mens_jackets'](), emoji: '🧥' },
			{ id: 'mens-jeans', name: m['browse.mens_jeans'](), emoji: '👖' },
			{ id: 'mens-bags', name: m['browse.mens_bags'](), emoji: '🎒' },
			{ id: 'mens-accessories', name: m['browse.mens_accessories'](), emoji: '🕶️' },
			{ id: 'mens-suits', name: m['browse.mens_suits'](), emoji: '🤵' },
			{ id: 'mens-shirts', name: m['browse.mens_shirts'](), emoji: '👔' }
		],
		women: [
			{ id: 'womens-shoes', name: m['browse.womens_shoes'](), emoji: '👠' },
			{ id: 'womens-dresses', name: m['browse.womens_dresses'](), emoji: '👗' },
			{ id: 'womens-tops', name: m['browse.womens_tops'](), emoji: '👚' },
			{ id: 'womens-jeans', name: m['browse.womens_jeans'](), emoji: '👖' },
			{ id: 'womens-bags', name: m['browse.womens_bags'](), emoji: '👜' },
			{ id: 'womens-accessories', name: m['browse.womens_accessories'](), emoji: '💍' },
			{ id: 'womens-jackets', name: m['browse.womens_jackets'](), emoji: '🧥' },
			{ id: 'womens-skirts', name: m['browse.womens_skirts'](), emoji: '👗' }
		],
		kids: [
			{ id: 'kids-shoes', name: m['browse.kids_shoes'](), emoji: '👟' },
			{ id: 'kids-clothes', name: m['browse.kids_clothes'](), emoji: '👕' },
			{ id: 'kids-toys', name: m['browse.kids_toys'](), emoji: '🧸' },
			{ id: 'kids-accessories', name: m['browse.kids_accessories'](), emoji: '🎒' },
			{ id: 'baby-clothes', name: m['browse.baby_clothes'](), emoji: '👶' },
			{ id: 'toddler-clothes', name: m['browse.toddler_clothes'](), emoji: '🧒' }
		],
		pets: [
			{ id: 'pet-clothes', name: 'Clothes', emoji: '🦺' },
			{ id: 'pet-accessories', name: 'Accessories', emoji: '🦴' },
			{ id: 'pet-toys', name: 'Toys', emoji: '🎾' },
			{ id: 'pet-beds', name: 'Beds', emoji: '🛏️' },
			{ id: 'pet-food', name: 'Food & Treats', emoji: '🥘' }
		]
	} as const;

	const oldSubcategories = {
		women: ['Dresses', 'T-Shirts', 'Jeans', 'Jackets', 'Skirts', 'Blouses'],
		men: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Sweaters', 'Shorts'],
		shoes: ['Sneakers', 'Boots', 'Heels', 'Sandals', 'Flats', 'Athletic'],
		bags: ['Handbags', 'Backpacks', 'Clutches', 'Wallets', 'Totes', 'Crossbody'],
		accessories: ['Jewelry', 'Watches', 'Belts', 'Hats', 'Scarves', 'Sunglasses'],
		kids: ['Baby', 'Toddler', 'Girls', 'Boys', 'Shoes', 'Accessories']
	} as const;

	const conditions = [
		{ id: 'new-tags', name: 'New with tags', emoji: '🏷️' },
		{ id: 'like-new', name: 'Like new', emoji: '✨' },
		{ id: 'good', name: 'Good', emoji: '👍' },
		{ id: 'fair', name: 'Fair', emoji: '🤝' },
		{ id: 'vintage', name: 'Vintage', emoji: '📿' }
	];

	// Derived values
	const currentSubcategories = $derived(
		selectedCategory ? oldSubcategories[selectedCategory as keyof typeof oldSubcategories] || [] : []
	);
	const currentDemographicSubcategories = $derived(
		selectedDemographic ? subcategories[selectedDemographic as keyof typeof subcategories] || [] : []
	);
	const activeFiltersCount = $derived(
		[
			selectedCategory,
			selectedSubcategory,
			filters.selectedCondition,
			filters.selectedCollection,
			filters.selectedBrand,
			filters.selectedSize,
			filters.priceRange.min !== 0 ? 'min' : null,
			filters.priceRange.max !== 500 ? 'max' : null
		].filter(Boolean).length
	);

	// Sync state from URL via store subscription
	$effect(() => {
		const unsubscribe = page.subscribe(($pg) => {
			const url = $pg.url;
			const sp = url.searchParams;
			selectedCategory = sp.get('category');
			selectedSubcategory = sp.get('subcategory');
			filters.selectedCondition = sp.get('condition');
			filters.selectedCollection = sp.get('collection');
			filters.selectedBrand = sp.get('brand');
			filters.selectedSize = sp.get('size');
			sortBy = sp.get('sort') || 'newest';
			const min = sp.get('price_min');
			const max = sp.get('price_max');
			filters.priceRange = {
				min: min ? Math.max(0, Number(min)) : 0,
				max: max ? Math.max(0, Number(max)) : 500
			};
			searchQuery = sp.get('q') || '';
		});
		return unsubscribe;
	});

	function updateURL() {
		if (!browser) return;
		const url = new URL(window.location.href);
		function setOrDelete(key: string, val: string | null | undefined) {
			if (val && String(val).length) url.searchParams.set(key, String(val));
			else url.searchParams.delete(key);
		}
		setOrDelete('category', selectedCategory);
		setOrDelete('subcategory', selectedSubcategory);
		setOrDelete('condition', filters.selectedCondition);
		setOrDelete('collection', filters.selectedCollection);
		setOrDelete('brand', filters.selectedBrand);
		setOrDelete('size', filters.selectedSize);
		setOrDelete('sort', sortBy);
		setOrDelete('price_min', filters.priceRange.min !== 0 ? String(filters.priceRange.min) : null);
		setOrDelete('price_max', filters.priceRange.max !== 500 ? String(filters.priceRange.max) : null);
		setOrDelete('q', searchQuery?.trim() ? searchQuery.trim() : null);
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	// Handler functions for CategoryPills component
	function handleCategoryChange(categoryId: string | null) {
		selectedCategory = categoryId;
		selectedSubcategory = null;
		updateURL();
	}

	function handleSubcategoryChange(subcategoryId: string | null) {
		selectedSubcategory = subcategoryId;
		updateURL();
	}

	// Handler functions for FilterBar component
	function handleSortChange(sort: string) {
		sortBy = sort;
		updateURL();
	}

	function handleFilterChange(newFilters: any) {
		filters = newFilters;
		updateURL();
	}

	function handleViewModeChange(mode: 'grid' | 'list') {
		viewMode = mode;
	}

	function handleShowFilters() {
		showFilters = true;
	}

	function handleApplyFilters(newFilters: any, category: string | null, subcategory: string | null) {
		filters = newFilters;
		selectedCategory = category;
		selectedSubcategory = subcategory;
		updateURL();
		showFilters = false;
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		updateURL();
		showSearchDropdown = false;
	}

	function handleSearchFocus() {
		showSearchDropdown = true;
	}

	function handleDemographicClick(demographicId: string) {
		if (selectedDemographic === demographicId) {
			selectedDemographic = null;
		} else {
			selectedDemographic = demographicId;
		}
	}

	function handleCategorySelect(categoryId: string) {
		selectedCategory = categoryId;
		selectedSubcategory = null;
		updateURL();
		showSearchDropdown = false;
	}

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			const handleResize = () => (isMobile = window.innerWidth < 768);
			const handleDocClick = (e: Event) => {
				const t = e.target as Node;
				
				// Handle filter modal close on mobile
				if (showFilters && !t.closest('.bottom-sheet')) {
					showFilters = false;
				}
			};
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') { 
					showFilters = false;
				}
			};
			const handleKeyDown = (e: KeyboardEvent) => {
				// Keyboard navigation for chip scrollers
				if (e.target && (e.target as HTMLElement).closest('.chip-scroll')) {
					const scrollEl = (e.target as HTMLElement).closest('.chip-scroll') as HTMLElement;
					if (e.key === 'ArrowLeft') {
						e.preventDefault();
						scrollEl.scrollBy({ left: -120, behavior: 'smooth' });
					} else if (e.key === 'ArrowRight') {
						e.preventDefault();
						scrollEl.scrollBy({ left: 120, behavior: 'smooth' });
					}
				}

				// Desktop keyboard shortcuts
				if (e.ctrlKey || e.metaKey) {
					switch(e.key) {
						case 'k': // Focus search (Ctrl/Cmd + K)
							e.preventDefault();
							document.querySelector('.search-input')?.focus();
							break;
						case 'f': // Open filters (Ctrl/Cmd + F)
							e.preventDefault();
							if (isMobile) {
								showFilters = true;
							} else {
								document.querySelector('#desktop-filters')?.scrollIntoView({ behavior: 'smooth' });
							}
							break;
						case '1': // Toggle grid view (Ctrl/Cmd + 1)
							e.preventDefault();
							viewMode = 'grid';
							break;
						case '2': // Toggle list view (Ctrl/Cmd + 2)
							e.preventDefault();
							viewMode = 'list';
							break;
					}
				}

				// Quick filter shortcuts (no modifier needed)
				if (!e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement?.tagName !== 'INPUT') {
					switch(e.key) {
						case 'c': // Clear all filters
							e.preventDefault();
							clearFilters();
							break;
						case 'n': // Sort by newest
							e.preventDefault();
							sortBy = 'newest';
							updateURL();
							break;
						case 'p': // Sort by price
							e.preventDefault();
							sortBy = sortBy === 'price-low' ? 'price-high' : 'price-low';
							updateURL();
							break;
					}
				}
			};
			window.addEventListener('resize', handleResize);
			document.addEventListener('mousedown', handleDocClick);
			document.addEventListener('touchstart', handleDocClick);
			window.addEventListener('keydown', handleEsc);
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('resize', handleResize);
				document.removeEventListener('mousedown', handleDocClick);
				document.removeEventListener('touchstart', handleDocClick);
				window.removeEventListener('keydown', handleEsc);
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	function clearFilters() {
		selectedCategory = null;
		selectedSubcategory = null;
		filters.selectedCondition = null;
		filters.selectedCollection = null;
		filters.selectedBrand = null;
		filters.selectedSize = null;
		filters.priceRange = { min: 0, max: 500 };
		sortBy = 'newest';
		updateURL();
	}


	$effect(() => {
		products = data?.products || [];
		nextCursor = data?.nextCursor || null;
		total = data?.total || 0;
	});

	let topScrollEl: HTMLDivElement | null = null;
	let popScrollEl: HTMLDivElement | null = null;
	let categoryBtnEl: HTMLButtonElement | null = null;
	let popoverEl: HTMLDivElement | null = null;
	let collectionsScrollEl: HTMLDivElement | null = null;
	let searchInputEl = $state<HTMLDivElement | null>(null);
	let searchDropdownEl = $state<HTMLDivElement | null>(null);
	let loadingMore = $state(false);
	let filterSheetEl = $state<HTMLDivElement | null>(null);
	let filterContainerEl = $state<HTMLDivElement | null>(null);
	let sortDropdownEl = $state<HTMLDivElement | null>(null);
	let conditionDropdownEl = $state<HTMLDivElement | null>(null);
	let sortButtonEl = $state<HTMLButtonElement | null>(null);
	let conditionButtonEl = $state<HTMLButtonElement | null>(null);

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const params = new URLSearchParams(window.location.search);
			params.set('cursor', nextCursor);
			const res = await fetch(`/api/browse?${params.toString()}`);
			if (res.ok) {
				const json = await res.json();
				products = [...products, ...(json.products || [])];
				nextCursor = json.nextCursor || null;
			}
		} finally {
			loadingMore = false;
		}
	}

	// Product interaction handlers
	async function handleProductLike(productId: string) {
		try {
			const response = await fetch(`/api/products/${productId}/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) throw new Error('Failed to like product');
		} catch (error) {
			console.error('Error liking product:', error);
		}
	}

	async function handleProductSave(productId: string) {
		try {
			const response = await fetch(`/api/products/${productId}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) throw new Error('Failed to save product');
		} catch (error) {
			console.error('Error saving product:', error);
		}
	}

	function handleProductShare(productId: string) {
		if (navigator.share) {
			navigator.share({
				title: 'Check out this product',
				url: `${window.location.origin}/products/${productId}`
			});
		} else {
			// Fallback to clipboard
			navigator.clipboard.writeText(`${window.location.origin}/products/${productId}`);
		}
	}

	function handleProductComment(productId: string) {
		goto(`/products/${productId}#comments`);
	}
</script>

<svelte:head>
	<title>{m['browse.title']()}</title>
	<meta name="description" content={m['browse.meta_description']()} />
</svelte:head>

<main class="main-content" style="margin-top: var(--header-height);">
	<!-- Enhanced Search Section -->
	<section class="search-section">
		<div class="search-container">
			<EnhancedSearchBar
				{searchQuery}
				onSearch={(query) => {
					searchQuery = query;
					updateURL();
				}}
				placeholder={m['browse.search_placeholder']()}
			/>
		</div>
	</section>

	<!-- Category Pills -->
	<CategoryPills
		{selectedCategory}
		{selectedSubcategory}
		onCategoryChange={handleCategoryChange}
		onSubcategoryChange={handleSubcategoryChange}
	/>

	<!-- Filter Bar -->
	<FilterBar
		{sortBy}
		{filters}
		{viewMode}
		{activeFiltersCount}
		onSortChange={handleSortChange}
		onFilterChange={handleFilterChange}
		onViewModeChange={handleViewModeChange}
		onShowFilters={handleShowFilters}
		onClearFilters={clearFilters}
	/>


		<!-- Main Content Area -->
		<div class="content-wrapper">
			<!-- Desktop Filter Rail -->
			<aside class="filter-rail desktop-only" id="desktop-filters" aria-label="Filters">
				<div class="filter-rail-content">
					<!-- Category -->
					<div class="filter-group">
						<h3>{m['search.categories']()}</h3>
						<div class="filter-options vertical">
							{#each categories as c}
								<button
									class="filter-option {selectedCategory === c.id ? 'active' : ''}"
									aria-pressed={selectedCategory === c.id}
									onclick={() => {
										selectedCategory = selectedCategory === c.id ? null : c.id;
										selectedSubcategory = null;
										updateURL();
									}}
								>
									<span class="emoji">{c.emoji}</span>
									<span>{c.name}</span>
								</button>
							{/each}
						</div>
						{#if selectedCategory && currentSubcategories.length > 0}
							<div class="filter-options vertical subcategories">
								{#each currentSubcategories as sub}
									<button
										class="filter-option sub {selectedSubcategory === sub ? 'active' : ''}"
										aria-pressed={selectedSubcategory === sub}
										onclick={() => {
											selectedSubcategory = selectedSubcategory === sub ? null : sub;
											updateURL();
										}}
									>
										{sub}
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Condition -->
					<div class="filter-group">
						<h3>Condition</h3>
						<div class="filter-options vertical">
							{#each conditions as condition}
								<button
									class="filter-option {filters.selectedCondition === condition.id ? 'active' : ''}"
									aria-pressed={filters.selectedCondition === condition.id}
									onclick={() => {
										filters.selectedCondition = filters.selectedCondition === condition.id ? null : condition.id;
										updateURL();
									}}
								>
									<span class="emoji">{condition.emoji}</span>
									<span>{condition.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Price -->
					<div class="filter-group">
						<h3>Price Range</h3>
						<div class="price-range">
							<div class="price-inputs">
								<input 
									type="number" 
									bind:value={filters.priceRange.min} 
									placeholder="Min" 
									class="price-input"
									onchange={updateURL}
								/>
								<span>-</span>
								<input 
									type="number" 
									bind:value={filters.priceRange.max} 
									placeholder="Max" 
									class="price-input"
									onchange={updateURL}
								/>
								<span>лв</span>
							</div>
						</div>
					</div>

					<!-- Size -->
					<div class="filter-group">
						<h3>Size</h3>
						<div class="filter-options horizontal">
							{#each ['XS','S','M','L','XL','XXL'] as s}
								<button 
									class="filter-option size {filters.selectedSize === s ? 'active' : ''}" 
									aria-pressed={filters.selectedSize === s} 
									onclick={() => {
										filters.selectedSize = filters.selectedSize === s ? null : s;
										updateURL();
									}}
								>
									{s}
								</button>
							{/each}
						</div>
						<div class="filter-options horizontal">
							{#each ['6','7','8','9','10','11','12'] as s}
								<button 
									class="filter-option size {filters.selectedSize === s ? 'active' : ''}" 
									aria-pressed={filters.selectedSize === s} 
									onclick={() => {
										filters.selectedSize = filters.selectedSize === s ? null : s;
										updateURL();
									}}
								>
									{s}
								</button>
							{/each}
						</div>
					</div>

					<!-- Brand -->
					<div class="filter-group">
						<h3>Brand</h3>
						<input 
							type="text" 
							placeholder="e.g. Nike, Zara..." 
							class="brand-input"
							bind:value={filters.selectedBrand}
							onchange={updateURL}
						/>
						<div class="popular-brands">
							{#each ['Nike','Adidas','Zara','H&M'] as brand}
								<button 
									class="brand-pill {filters.selectedBrand && filters.selectedBrand.toLowerCase() === brand.toLowerCase() ? 'active' : ''}"
									onclick={() => { filters.selectedBrand = filters.selectedBrand && filters.selectedBrand.toLowerCase() === brand.toLowerCase() ? '' : brand; updateURL(); }}
								>
									{brand}
								</button>
							{/each}
						</div>
					</div>

					<!-- Clear All -->
					{#if activeFiltersCount > 0}
						<button class="clear-all-rail" onclick={clearFilters}>
							Clear all filters
						</button>
					{/if}

					<!-- Desktop Keyboard Shortcuts Help -->
					<div class="keyboard-shortcuts-help">
						<h4>⌨️ Shortcuts</h4>
						<div class="shortcuts-list">
							<div class="shortcut-item">
								<kbd>Ctrl</kbd> + <kbd>K</kbd> <span>Focus search</span>
							</div>
							<div class="shortcut-item">
								<kbd>Ctrl</kbd> + <kbd>F</kbd> <span>Open filters</span>
							</div>
							<div class="shortcut-item">
								<kbd>C</kbd> <span>Clear filters</span>
							</div>
							<div class="shortcut-item">
								<kbd>N</kbd> <span>Sort newest</span>
							</div>
							<div class="shortcut-item">
								<kbd>P</kbd> <span>Sort price</span>
							</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- Product Grid -->
			<div class="products-area">

				{#if products?.length > 0}
					<div class="products-grid-container {viewMode}">
						<ProductGrid 
							{products} 
							variant={viewMode === 'list' ? 'feed' : 'grid'}
							onLike={handleProductLike}
							onSave={handleProductSave}
							onShare={handleProductShare}
							onComment={handleProductComment}
						/>
					</div>
					
					{#if nextCursor}
						<div class="flex justify-center py-8 px-4">
							<button 
								class="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full font-semibold transition-all duration-150 min-h-12 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg" 
								onclick={loadMore} 
								disabled={loadingMore}
							>
								{#if loadingMore}
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Loading...
								{:else}
									Load More
								{/if}
							</button>
						</div>
					{/if}
				{:else}
					<div class="flex flex-col items-center justify-center py-16 px-8 text-center text-gray-500">
						<div class="text-5xl mb-4 opacity-70">🔍</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
						<p class="text-sm leading-6 max-w-xs text-gray-600">Try adjusting your filters or search terms to find more items.</p>
					</div>
				{/if}
			</div>
		</div>
	<!-- Filter Bottom Sheet -->
	<FilterBottomSheet
		isOpen={showFilters}
		{filters}
		{selectedCategory}
		{selectedSubcategory}
		{categories}
		onClose={() => showFilters = false}
		onApplyFilters={handleApplyFilters}
		onClearFilters={clearFilters}
	/>
</main>

<style>
	:global(body) { overscroll-behavior-y: contain; }

	.main-content {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-bottom: 80px;
	}

	/* Enhanced Search Section */
	.search-section {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 16px;
		position: sticky;
		top: var(--header-height);
		z-index: 100; /* Below FilterBar (110) but above content */
	}

	.search-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 16px;
	}

	/* Mobile: Full width search bar */
	@media (max-width: 768px) {
		.search-section {
			padding: 12px;
		}
		
		.search-container {
			padding: 0;
		}
	}

	/* Enhanced search component handles its own styling */

	/* Clean and minimal - only essential styles */

	/* Remove all padding/constraints - match main page */
	.content-wrapper {
		display: block;
	}
	
	.products-area {
		width: 100%;
	}
	
	/* Hide filter rail on mobile by default */
	.filter-rail {
		display: none;
	}
	
	@media (min-width: 1024px) {
		.content-wrapper {
			display: flex;
			gap: 1.5rem;
			max-width: 1400px;
			margin: 0 auto;
		}
		
		.filter-rail.desktop-only {
			display: block;
			width: 320px; /* Slightly wider for better content */
			flex-shrink: 0;
			background: white;
			border: 1px solid #f1f3f4;
			height: fit-content;
			position: sticky;
			top: calc(var(--header-height) + 80px); /* Account for search and filter bar */
			border-radius: 16px;
			margin-left: 1.5rem;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
			overflow: hidden;
			/* Enhanced desktop styling */
			backdrop-filter: blur(8px);
			border-top: 3px solid #3b82f6;
		}
		
		.products-area {
			flex: 1;
			min-width: 0;
		}
	}


	/* Enhanced Filter Rail Styles */
	.filter-rail-content {
		padding: 0;
	}

	.filter-rail .filter-group {
		border-bottom: 1px solid #f8fafc;
		padding: 1.5rem;
		transition: background-color 0.2s ease;
	}

	.filter-rail .filter-group:last-child {
		border-bottom: none;
	}

	.filter-rail .filter-group:hover {
		background: #fafbfc;
	}

	.filter-rail .filter-group h3 {
		font-size: 0.95rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #111827;
		text-transform: none;
		letter-spacing: -0.01em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		position: relative;
	}

	.filter-rail .filter-group h3::after {
		content: '';
		width: 20px;
		height: 2px;
		background: #3b82f6;
		border-radius: 1px;
		transition: all 0.2s ease;
	}

	.filter-options.vertical {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-options.horizontal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-options.subcategories {
		margin-top: 1rem;
		padding-left: 1rem;
		border-left: 2px solid var(--color-border-light);
	}

	.filter-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid transparent;
		border-radius: 10px;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		font-size: 0.9rem;
		font-weight: 500;
		text-align: left;
		width: 100%;
		color: #4b5563;
		position: relative;
		margin-bottom: 0.25rem;
	}

	.filter-option:hover {
		background: #f3f4f6;
		color: #111827;
		transform: translateX(4px);
		border-color: #e5e7eb;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.filter-option.active {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
		font-weight: 600;
		transform: translateX(4px);
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
		border-color: #3b82f6;
	}

	.filter-option.active::before {
		content: '';
		position: absolute;
		left: -1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 100%;
		background: #3b82f6;
		border-radius: 2px;
	}

	.filter-option.sub {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
	}

	.filter-option.size {
		width: auto;
		min-width: 2.5rem;
		justify-content: center;
		padding: 0.5rem 0.75rem;
	}

	.filter-option .emoji {
		font-size: 1rem;
	}

	.clear-all-rail {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 2px solid #e5e7eb;
		border-radius: 10px;
		color: #ef4444;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.clear-all-rail:hover {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
	}

	/* Desktop Keyboard Shortcuts Help */
	.keyboard-shortcuts-help {
		padding: 1rem 0 0;
		border-top: 1px solid #f1f3f4;
		margin-top: 0.5rem;
	}

	.keyboard-shortcuts-help h4 {
		font-size: 0.8rem;
		font-weight: 600;
		color: #6b7280;
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.shortcuts-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.shortcut-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.shortcut-item kbd {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.125rem 0.25rem;
		font-size: 0.65rem;
		font-weight: 600;
		color: #374151;
		font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.shortcut-item span {
		color: #6b7280;
		font-weight: 500;
	}

	.brand-input,
	.price-input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: #fafbfc;
		border: 2px solid #e5e7eb;
		border-radius: 10px;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		transition: all 0.2s ease;
		color: #111827;
		font-weight: 500;
	}

	.brand-input:focus,
	.price-input:focus {
		outline: none;
		border-color: #3b82f6;
		background: white;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		transform: translateY(-1px);
	}

	.brand-input:hover,
	.price-input:hover {
		border-color: #d1d5db;
		background: white;
	}

	.price-inputs {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.price-inputs span {
		color: #6b7280;
		font-weight: 600;
	}

	.popular-brands {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.brand-pill {
		padding: 0.375rem 0.625rem;
		background: var(--color-border-lighter);
		border: 1px solid transparent;
		border-radius: 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--color-text-quaternary);
	}

	.brand-pill:hover {
		background: var(--color-border-light);
		color: var(--color-text-dark);
	}

	.brand-pill.active {
		background: var(--color-surface-overlay);
		color: white;
		font-weight: 600;
	}


	/* Essential animations only */
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	@keyframes fadeInScale {
		0% { 
			opacity: 0; 
			transform: scale(0.95) translateY(-4px); 
		}
		100% { 
			opacity: 1; 
			transform: scale(1) translateY(0); 
		}
	}

	/* Page Layout */
	.browse-page {
		min-height: 100vh;
		background: var(--color-surface-quaternary);
		padding-bottom: 5rem;
	}
	
	@media (min-width: 768px) {
		.browse-page {
			padding-top: 4rem;
			padding-bottom: 0;
		}
	}

	/* View toggle is now handled by FilterBar component */

	/* Product Grid Container Styles */
	.products-grid-container {
		width: 100%;
	}

	.products-grid-container.list :global(.product-grid) {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.products-grid-container.list :global(.product-card) {
		display: flex;
		flex-direction: row;
		gap: 16px;
		max-width: 100%;
		height: auto;
	}

	.products-grid-container.list :global(.product-card img) {
		width: 120px;
		height: 120px;
		flex-shrink: 0;
	}

	/* Mobile layout is handled by individual components */
</style>