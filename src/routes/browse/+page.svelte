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

	// Search state
	let searchQuery = $state('');
	
	// View mode state
	let viewMode = $state<'grid' | 'list'>('grid');
	
	// Category state
	let selectedCategory = $state<string | null>(null);
	let selectedSubcategory = $state<string | null>(null);
	
	// Filter state
	let isMobile = $state(false);
	let showFilters = $state(false);
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
		{ id: 'women', name: 'Women', emoji: '👗' },
		{ id: 'men', name: 'Men', emoji: '👔' },
		{ id: 'shoes', name: 'Shoes', emoji: '👟' },
		{ id: 'bags', name: 'Bags', emoji: '👜' },
		{ id: 'accessories', name: 'Accessories', emoji: '💍' },
		{ id: 'kids', name: 'Kids', emoji: '👶' }
	];
	const categories = $derived((data?.categories && data.categories.length) ? data.categories : fallbackCategories);

	function getCategoryName(id: string | null) {
		if (!id) return '';
		const list = (data?.categories && data.categories.length) ? data.categories : fallbackCategories;
		return (list.find((c: any) => c.id === id)?.name) || id;
	}

	const collections = [
		{ id: 'summer', name: 'Summer Sale', emoji: '🌞', color: 'bg-warning/10' },
		{ id: 'vintage', name: 'Vintage Finds', emoji: '📸', color: 'bg-orange-100' },
		{ id: 'designer', name: 'Designer Deals', emoji: '💎', color: 'bg-primary/10' },
		{ id: 'trending', name: 'Trending Now', emoji: '🔥', color: 'bg-destructive/10' },
		{ id: 'eco', name: 'Eco Friendly', emoji: '🌿', color: 'bg-success/10' }
	];

	// Enhanced category system for search dropdown
	const demographics = [
		{ id: 'men', name: 'Men', emoji: '👨' },
		{ id: 'women', name: 'Women', emoji: '👩' },
		{ id: 'kids', name: 'Kids', emoji: '👶' },
		{ id: 'pets', name: 'Pets', emoji: '🐾' }
	];

	const subcategories = {
		men: [
			{ id: 'mens-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'mens-tshirts', name: 'T-shirts', emoji: '👕' },
			{ id: 'mens-jackets', name: 'Jackets', emoji: '🧥' },
			{ id: 'mens-jeans', name: 'Jeans', emoji: '👖' },
			{ id: 'mens-bags', name: 'Bags', emoji: '🎒' },
			{ id: 'mens-accessories', name: 'Accessories', emoji: '🕶️' },
			{ id: 'mens-suits', name: 'Suits', emoji: '🤵' },
			{ id: 'mens-shirts', name: 'Shirts', emoji: '👔' }
		],
		women: [
			{ id: 'womens-shoes', name: 'Shoes', emoji: '👠' },
			{ id: 'womens-dresses', name: 'Dresses', emoji: '👗' },
			{ id: 'womens-tops', name: 'Tops', emoji: '👚' },
			{ id: 'womens-jeans', name: 'Jeans', emoji: '👖' },
			{ id: 'womens-bags', name: 'Bags', emoji: '👜' },
			{ id: 'womens-accessories', name: 'Accessories', emoji: '💍' },
			{ id: 'womens-jackets', name: 'Jackets', emoji: '🧥' },
			{ id: 'womens-skirts', name: 'Skirts', emoji: '👗' }
		],
		kids: [
			{ id: 'kids-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'kids-clothes', name: 'Clothes', emoji: '👕' },
			{ id: 'kids-toys', name: 'Toys', emoji: '🧸' },
			{ id: 'kids-accessories', name: 'Accessories', emoji: '🎒' },
			{ id: 'baby-clothes', name: 'Baby Clothes', emoji: '👶' },
			{ id: 'toddler-clothes', name: 'Toddler Clothes', emoji: '🧒' }
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

	function handleSearch(e: Event) {
		e.preventDefault();
		updateURL();
		showSearchDropdown = false;
	}

	// Handler functions for enhanced components
	function handleCategoryChange(categoryId: string | null) {
		selectedCategory = categoryId;
		selectedSubcategory = null;
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

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			const handleResize = () => (isMobile = window.innerWidth < 768);
			const handleDocClick = (e: Event) => {
				const t = e.target as Node;
				
				// Handle category menu
				if (showCategoryMenu) {
					if (popoverEl && popoverEl.contains(t)) return;
					if (categoryBtnEl && categoryBtnEl.contains(t)) return;
					showCategoryMenu = false;
				}
				
				// Handle search dropdown
				if (showSearchDropdown) {
					if (searchInputEl && searchInputEl.contains(t)) return;
					if (searchDropdownEl && searchDropdownEl.contains(t)) return;
					showSearchDropdown = false;
					selectedDemographic = null;
				}
				
				// Handle size dropdown
				if (showSizeDropdown) {
					if (sizeDropdownEl && sizeDropdownEl.contains(t)) return;
					if (sizeBtnEl && sizeBtnEl.contains(t)) return;
					showSizeDropdown = false;
				}
			};
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') { 
					showCategoryMenu = false; 
					showFilters = false; 
					showSearchDropdown = false;
					showSizeDropdown = false;
					selectedDemographic = null;
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

	function openFilters() {
		lastFocusedElement = document.activeElement as HTMLElement;
		showFilters = true;
		// Focus the first interactive element after a short delay
		setTimeout(() => {
			const firstButton = filterSheetEl?.querySelector('button');
			firstButton?.focus();
		}, 100);
	}

	function closeFilters() {
		showFilters = false;
		// Return focus to the trigger element
		if (lastFocusedElement) {
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	}

	// Focus trap for filter sheet
	function handleFilterSheetKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeFilters();
			return;
		}
		
		if (e.key === 'Tab' && filterSheetEl) {
			const focusableElements = filterSheetEl.querySelectorAll(
				'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			if (e.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}
		}
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
	let lastFocusedElement: HTMLElement | null = null;
	let sizeBtnEl = $state<HTMLButtonElement | null>(null);
	let sizeDropdownEl = $state<HTMLDivElement | null>(null);

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
	<title>Browse - Driplo | Discover Fashion</title>
	<meta name="description" content="Browse thousands of fashion items. Find your perfect style from vintage to designer pieces." />
</svelte:head>

<!-- Removed local <SearchHeader />; layout already renders mobile/desktop headers -->

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
				placeholder="Search items or @sellers"
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

					<!-- Category Dropdown -->
					{#if showSearchDropdown}
						<div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg dark:shadow-gray-900/50 z-50 max-h-96 overflow-y-auto">
							<div class="p-4" bind:this={searchDropdownEl}>
								<!-- Demographics -->
								<div class="mb-5">
									<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Browse by Category</h3>
									<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
										{#each demographics as demographic}
											<button 
												class="flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-150 {selectedDemographic === demographic.id ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
												onclick={() => handleDemographicClick(demographic.id)}
											>
												<span class="text-sm">{demographic.emoji}</span>
												<span class="text-sm font-medium">{demographic.name}</span>
												<ChevronDown size={14} class="transition-transform {selectedDemographic === demographic.id ? 'rotate-180' : ''}" />
											</button>
										{/each}
									</div>
								</div>
								
								<!-- Subcategories -->
								{#if selectedDemographic && currentDemographicSubcategories.length > 0}
									<div class="mb-5 pt-4 border-t border-gray-100 dark:border-gray-700">
										<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
											{demographics.find(d => d.id === selectedDemographic)?.name} Categories
										</h3>
										<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
											{#each currentDemographicSubcategories as subcategory}
												<button 
													class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-150 hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-gray-100 hover:-translate-y-0.5 hover:shadow-md min-w-fit"
													onclick={() => handleCategorySelect(subcategory.id)}
												>
													<span>{subcategory.emoji}</span>
													<span>{subcategory.name}</span>
												</button>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Quick Actions -->
								<div class="pt-4 border-t border-gray-100 dark:border-gray-700">
									<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Popular Searches</h3>
									<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
										<button class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-150 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('new-tags')}>
											<span>🏷️</span>
											<span>New with tags</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-150 hover:bg-green-500 hover:text-white hover:border-green-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('under-50')}>
											<span>💰</span>
											<span>Under 50лв</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-150 hover:bg-red-500 hover:text-white hover:border-red-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('trending')}>
											<span>🔥</span>
											<span>Trending</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-150 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('verified')}>
											<span>✅</span>
											<span>Verified sellers</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>


		<!-- Filter Pills Section -->
		<div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-3">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
						<!-- Sort Pill -->
						<button 
							class="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-full border transition-all duration-150 whitespace-nowrap {sortBy !== 'newest' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
							onclick={() => {
								if (sortBy === 'newest') sortBy = 'price-low';
								else if (sortBy === 'price-low') sortBy = 'price-high';
								else if (sortBy === 'price-high') sortBy = 'most-liked';
								else if (sortBy === 'most-liked') sortBy = 'trending';
								else sortBy = 'newest';
								updateURL();
							}}
						>
							{#if sortBy === 'newest'}Newest{/if}
							{#if sortBy === 'price-low'}Low Price{/if}
							{#if sortBy === 'price-high'}High Price{/if}
							{#if sortBy === 'most-liked'}Popular{/if}
							{#if sortBy === 'trending'}Trending{/if}
						</button>

					<!-- Active Filter Pills -->
					{#if filters.selectedCondition}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-900 dark:border-gray-100 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedCondition = null; updateURL(); }}
						>
							{conditions.find(c => c.id === filters.selectedCondition)?.name || 'Condition'}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					{#if filters.selectedBrand}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-900 dark:border-gray-100 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedBrand = ''; updateURL(); }}
						>
							{filters.selectedBrand.charAt(0).toUpperCase() + filters.selectedBrand.slice(1)}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					{#if filters.selectedSize}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-900 dark:border-gray-100 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedSize = ''; updateURL(); }}
						>
							Size {filters.selectedSize}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					</div>
					
					<!-- Filter Controls Row -->
					<div class="flex items-center gap-2 flex-shrink-0">
						<!-- Size Dropdown Button -->
						<div class="relative">
							<button 
								bind:this={sizeBtnEl}
								class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border whitespace-nowrap relative {filters.selectedSize ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}"
								onclick={() => showSizeDropdown = !showSizeDropdown}
								aria-label="Size dropdown"
							>
								<span>Размер</span>
								{#if filters.selectedSize}
									<span class="text-xs">({filters.selectedSize})</span>
								{/if}
								<ChevronDown size={12} class="transition-transform {showSizeDropdown ? 'rotate-180' : ''}" />
							</button>
							
							<!-- Size Dropdown -->
							{#if showSizeDropdown}
								<div class="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg dark:shadow-gray-900/50 z-50 min-w-48" bind:this={sizeDropdownEl}>
									<div class="p-3">
										<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Clothing Sizes</h3>
										<div class="grid grid-cols-3 gap-2 mb-3">
											{#each ['XS','S','M','L','XL','XXL'] as size}
												<button 
													class="px-2 py-1 text-xs font-medium rounded border text-center {filters.selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}"
													onclick={() => {
														filters.selectedSize = filters.selectedSize === size ? null : size;
														updateURL();
														showSizeDropdown = false;
													}}
												>
													{size}
												</button>
											{/each}
										</div>
										<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Shoe Sizes</h3>
										<div class="grid grid-cols-4 gap-2 mb-3">
											{#each ['36','37','38','39','40','41','42','43'] as size}
												<button 
													class="px-2 py-1 text-xs font-medium rounded border text-center {filters.selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}"
													onclick={() => {
														filters.selectedSize = filters.selectedSize === size ? null : size;
														updateURL();
														showSizeDropdown = false;
													}}
												>
													{size}
												</button>
											{/each}
										</div>
										{#if filters.selectedSize}
											<button 
												class="w-full px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-t border-gray-200 dark:border-gray-600 pt-2"
												onclick={() => {
													filters.selectedSize = null;
													updateURL();
													showSizeDropdown = false;
												}}
											>
												Clear Size
											</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- More Filters Button -->
						<button 
							class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border whitespace-nowrap relative {activeFiltersCount > 1 ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}"
							onclick={() => showFilters = true}
							aria-label="More filters"
						>
							<Filter size={12} />
							<span>Филтри</span>
							{#if activeFiltersCount > 1}
								<span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
									{activeFiltersCount - 1}
								</span>
							{/if}
						</button>

						<!-- View Toggle (Grid/List) -->
						<div class="view-toggle">
							<button 
								class="toggle-btn {viewMode === 'grid' ? 'active' : ''}"
								onclick={() => viewMode = 'grid'}
								aria-label="Grid view"
							>
								<Grid size={16} />
							</button>
							<button 
								class="toggle-btn {viewMode === 'list' ? 'active' : ''}"
								onclick={() => viewMode = 'list'}
								aria-label="List view"
							>
								<List size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>


		<!-- Main Content Area -->
		<div class="content-wrapper">
			<!-- Desktop Filter Rail -->
			<aside class="filter-rail desktop-only" id="desktop-filters" aria-label="Filters">
				<div class="filter-rail-content">
					<!-- Category -->
					<div class="filter-group">
						<h3>Category</h3>
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
								class="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full font-semibold transition-all duration-150 min-h-12 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg" 
								onclick={loadMore} 
								disabled={loadingMore}
							>
								{#if loadingMore}
									<div class="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
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
						<p class="text-sm leading-6 max-w-xs text-gray-500">Try adjusting your filters or search terms to find more items.</p>
					</div>
				{/if}
			</div>
		</div>
</main>

	<!-- Mobile/Overlay Filters Sheet -->
	{#if showFilters}
		<div
			class="filter-overlay"
			role="button"
			tabindex="0"
			onclick={closeFilters}
			onkeydown={(e) => e.key === 'Escape' && closeFilters()}
			aria-label="Close filters"
		></div>
		<div 
			bind:this={filterSheetEl}
			class="filter-sheet" 
			id="mobile-filters" 
			role="dialog" 
			aria-modal="true" 
			aria-labelledby="filter-sheet-title"
			tabindex="-1"
			onkeydown={handleFilterSheetKeyDown}
		>
			<div class="filter-header">
				<h2 id="filter-sheet-title">Filters</h2>
				<button class="close-filters" onclick={closeFilters} aria-label="Close filters">
					<X size={22} />
				</button>
			</div>

			<div class="filter-content">
				<!-- Category -->
				<div class="filter-group">
					<h3>Category</h3>
					<div class="row-wrap">
						{#each categories as c}
							<button
								class="chip outline {selectedCategory === c.id ? 'active' : ''}"
								aria-pressed={selectedCategory === c.id}
								onclick={() => {
									selectedCategory = selectedCategory === c.id ? null : c.id;
									selectedSubcategory = null;
								}}
							>
								<span class="emoji">{c.emoji}</span>{c.name}
							</button>
						{/each}
					</div>
					{#if selectedCategory && currentSubcategories.length > 0}
						<div class="row-wrap small-gap">
							{#each currentSubcategories as sub}
								<button
									class="chip subtle {selectedSubcategory === sub ? 'active' : ''}"
									aria-pressed={selectedSubcategory === sub}
									onclick={() => (selectedSubcategory = selectedSubcategory === sub ? null : sub)}
								>
									{sub}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Collections -->
				<div class="filter-group">
					<h3>Collections</h3>
					<div class="row-wrap">
						{#each collections as col}
							<button
								class="chip tone {col.color} {filters.selectedCollection === col.id ? 'active' : ''}"
								aria-pressed={filters.selectedCollection === col.id}
								onclick={() => (filters.selectedCollection = filters.selectedCollection === col.id ? null : col.id)}
							>
								<span class="emoji">{col.emoji}</span>{col.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- Subcategory -->
				{#if selectedCategory && currentSubcategories.length > 0}
					<div class="filter-group">
						<h3>Subcategory</h3>
						<div class="row-wrap">
							{#each currentSubcategories as sub}
								<button
									class="chip subtle {selectedSubcategory === sub ? 'active' : ''}"
									aria-pressed={selectedSubcategory === sub}
									onclick={() => (selectedSubcategory = selectedSubcategory === sub ? null : sub)}
								>
									{sub}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Condition -->
				<div class="filter-group">
					<h3>Condition</h3>
					<div class="row-wrap">
						{#each conditions as condition}
							<button
								class="chip subtle {filters.selectedCondition === condition.id ? 'active' : ''}"
								aria-pressed={filters.selectedCondition === condition.id}
								onclick={() => (filters.selectedCondition = filters.selectedCondition === condition.id ? null : condition.id)}
							>
								<span class="emoji">{condition.emoji}</span>{condition.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- Price -->
				<div class="filter-group">
					<h3>Price Range</h3>
					<div class="price-inputs">
						<input type="number" bind:value={filters.priceRange.min} placeholder="Min" class="price-input" />
						<span>-</span>
						<input type="number" bind:value={filters.priceRange.max} placeholder="Max" class="price-input" />
						<span>лв</span>
					</div>
				</div>

				<!-- Brand -->
				<div class="filter-group">
					<h3>Brand</h3>
					<input type="text" placeholder="e.g. Nike" class="price-input" bind:value={filters.selectedBrand} />
				</div>

				<!-- Size -->
				<div class="filter-group">
					<h3>Size</h3>
					<div class="row-wrap">
						{#each ['XS','S','M','L','XL','XXL','6','7','8','9','10','11','12','34','36','38','40','42','44','46'] as s}
							<button class="chip subtle {filters.selectedSize === s ? 'active' : ''}" aria-pressed={filters.selectedSize === s} onclick={() => (filters.selectedSize = filters.selectedSize === s ? null : s)}>{s}</button>
						{/each}
					</div>
				</div>

				<!-- Popular Brands -->
				<div class="filter-group">
					<h3>Popular Brands</h3>
					<div class="row-wrap">
						{#each ['Nike','Adidas','Zara','H&M','Gucci','Louis Vuitton','Chanel','Prada','Versace','Balenciaga','Off-White','Supreme'] as brand}
							<button 
								class="chip subtle {filters.selectedBrand && filters.selectedBrand.toLowerCase() === brand.toLowerCase() ? 'active' : ''}" 
								onclick={() => (filters.selectedBrand = filters.selectedBrand && filters.selectedBrand.toLowerCase() === brand.toLowerCase() ? '' : brand)}
							>
								{brand}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="filter-footer">
				<button class="reset-btn" onclick={clearFilters}>Reset</button>
				<button class="apply-btn" onclick={() => { updateURL(); closeFilters(); }}>Apply</button>
			</div>
		</div>
	{/if}

<style>
	:global(body) { overscroll-behavior-y: contain; }

	.main-content {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-bottom: 80px;
		/* Fix header overlap */
		padding-top: 56px;
	}

	@media (min-width: 768px) {
		.main-content {
			padding-top: 60px;
		}
	}

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
			width: 280px;
			flex-shrink: 0;
			background: var(--color-surface);
			border-right: 1px solid var(--color-border);
			height: fit-content;
			position: sticky;
			top: 120px;
			border-radius: 12px;
			margin-left: 1rem;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}
		
		.products-area {
			flex: 1;
			min-width: 0;
		}
	}

	/* Custom scrollbar hide for webkit browsers */
	.scrollbar-none {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
	
	/* Mobile Filter Sheet Chips */
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border-light);
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-dark);
		background: var(--color-surface);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
		height: 2.25rem;
	}
	
	.chip:hover {
		background: var(--color-surface-quaternary);
		border-color: var(--color-border-dark);
	}
	
	.chip.active {
		background: var(--color-surface-overlay);
		color: white;
		border-color: var(--color-border-darker);
	}
	
	.chip.outline {
		background: transparent;
		border-color: var(--color-border-dark);
	}
	
	.chip.subtle {
		background: var(--color-border-lighter);
		border-color: transparent;
	}
	
	.chip.tone.bg-yellow-100 { background: var(--color-surface-warning); border-color: var(--color-surface-warning); opacity: 0.2; }
	.chip.tone.bg-orange-100 { background: var(--color-surface-warning); border-color: var(--color-surface-warning); opacity: 0.3; }
	.chip.tone.bg-blue-100 { background: var(--color-brand-blue); border-color: var(--color-brand-blue); opacity: 0.2; }
	.chip.tone.bg-red-100 { background: var(--color-surface-error); border-color: var(--color-surface-error); opacity: 0.2; }
	.chip.tone.bg-green-100 { background: var(--color-surface-success); border-color: var(--color-surface-success); opacity: 0.2; }
	
	.chip .emoji {
		font-size: 0.875rem;
	}

	/* Filter Rail Styles */
	.filter-rail-content {
		padding: 1.5rem;
	}

	.filter-rail .filter-group {
		margin-bottom: 1.5rem;
	}

	.filter-rail .filter-group h3 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--color-text-dark);
		text-transform: uppercase;
		letter-spacing: 0.025em;
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
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		background: transparent;
		cursor: pointer;
		transition: all 0.15s;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: left;
		width: 100%;
		color: var(--color-text-quaternary);
	}

	.filter-option:hover {
		background: var(--color-border-lighter);
		color: var(--color-text-dark);
	}

	.filter-option.active {
		background: var(--color-surface-overlay);
		color: white;
		font-weight: 600;
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
		padding: 0.625rem;
		background: transparent;
		border: 1px solid var(--color-border-light);
		border-radius: 0.375rem;
		color: var(--color-text-quaternary);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		font-size: 0.875rem;
	}

	.clear-all-rail:hover {
		background: var(--color-surface-overlay);
		color: white;
		border-color: var(--color-border-darker);
	}

	.brand-input {
		width: 100%;
		padding: 0.625rem;
		background: var(--color-surface-quaternary);
		border: 1px solid var(--color-border-light);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.brand-input:focus {
		outline: none;
		border-color: var(--color-border-darker);
		background: var(--color-surface);
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

	/* Mobile Filter Sheet */
	.filter-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: var(--z-highest);
		backdrop-filter: blur(4px);
	}
	
	.filter-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-surface);
		z-index: var(--z-overlay);
		border-radius: 1.5rem 1.5rem 0 0;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
		animation: slideUp 0.3s ease;
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem 1.25rem;
		border-bottom: 1px solid var(--color-border-light);
		position: relative;
	}
	
	.filter-header::after {
		content: '';
		position: absolute;
		top: 0.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: 2.25rem;
		height: 0.25rem;
		background: var(--color-border-light);
		border-radius: 9999px;
	}
	
	.filter-header h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-dark);
		margin: 0;
	}
	
	.close-filters {
		width: 2rem;
		height: 2rem;
		background: var(--color-border-lighter);
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--color-text-muted);
	}
	
	.close-filters:hover {
		background: var(--color-border-light);
		color: var(--color-text-dark);
	}
	
	.filter-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.5rem;
	}
	
	.filter-group {
		margin-bottom: 1.5rem;
	}
	
	.filter-group h3 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--color-text-dark);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.row-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.row-wrap.small-gap {
		gap: 0.375rem;
	}
	
	.price-inputs {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.price-input {
		flex: 1;
		padding: 0.75rem;
		background: var(--color-surface-quaternary);
		border: 1px solid var(--color-border-light);
		border-radius: 0.5rem;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 500;
	}
	
	.price-input:focus {
		outline: none;
		border-color: var(--color-border-darker);
		background: var(--color-surface);
	}
	
	.filter-footer {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--color-border-light);
		background: var(--color-surface-quaternary);
	}
	
	.reset-btn {
		flex: 1;
		padding: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-text-quaternary);
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.reset-btn:hover {
		background: var(--color-border-lighter);
		border-color: var(--color-border-dark);
	}
	
	.apply-btn {
		flex: 2;
		padding: 1rem;
		background: var(--color-surface-overlay);
		color: white;
		border: none;
		border-radius: 0.75rem;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.apply-btn:hover {
		background: var(--color-text-primary);
		transform: translateY(-1px);
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

	/* View Toggle Styles - Consistent with Wishlist */
	.view-toggle {
		display: flex;
		background: var(--color-surface-tertiary);
		border-radius: var(--border-radius-lg);
		padding: 3px;
		gap: 2px;
		box-shadow: var(--shadow-xs);
		border: 1px solid var(--color-border-primary);
		flex-shrink: 0;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		border: none;
		min-width: 36px;
		height: 32px;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		position: relative;
	}

	.toggle-btn:hover:not(.active) {
		color: var(--color-text-primary);
		background: var(--color-surface-secondary);
	}

	.toggle-btn:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}

	.toggle-btn:active:not(.active) {
		transform: scale(0.95);
	}

	.toggle-btn.active {
		background: var(--color-surface-primary);
		color: var(--color-interactive-primary);
		box-shadow: var(--shadow-sm);
		font-weight: 500;
	}

	.toggle-btn.active::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: var(--border-radius-md);
		border: 2px solid var(--color-interactive-primary);
		opacity: 0.1;
	}

	/* Product Grid Container Styles */
	.products-grid-container {
		width: 100%;
	}

	.products-grid-container.list :global(.product-grid) {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.products-grid-container.list :global(.product-card) {
		display: flex;
		flex-direction: row;
		gap: var(--space-4);
		max-width: 100%;
		height: auto;
	}

	.products-grid-container.list :global(.product-card img) {
		width: 120px;
		height: 120px;
		flex-shrink: 0;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.view-toggle {
			display: none; /* Hide on mobile to save space */
		}
	}

	/* Dark mode support */
	:global(.dark) .view-toggle {
		background: var(--color-surface-tertiary);
		border-color: var(--color-border-secondary);
	}

	:global(.dark) .toggle-btn:hover:not(.active) {
		background: var(--color-surface-secondary);
	}

	:global(.dark) .toggle-btn.active {
		background: var(--color-surface-primary);
		color: var(--color-interactive-primary);
	}
</style>

