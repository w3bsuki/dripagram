<script lang="ts">
	const { data } = $props() as { data: any };
	import { ChevronDown, Filter, Grid3x3, Grid, List, Search, SlidersHorizontal, X } from '@lucide/svelte';
	import { ProductGrid } from '$lib/components/marketplace';
	import BrowseSearchBar from '$lib/components/browse/BrowseSearchBar.svelte';
	import CategorySelector from '$lib/components/browse/CategorySelector.svelte';
	import FilterSheet from '$lib/components/browse/FilterSheet.svelte';
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

				// Handle filter dropdown
				if (showFilters) {
					if (filterContainerEl && filterContainerEl.contains(t)) return;
					if (filterSheetEl && filterSheetEl.contains(t)) return;
					showFilters = false;
				}
				
				// Handle sort dropdown
				if (showSortDropdown) {
					if (sortDropdownEl && sortDropdownEl.contains(t)) return;
					if (sortButtonEl && sortButtonEl.contains(t)) return;
					showSortDropdown = false;
				}
				
				// Handle condition dropdown
				if (showConditionDropdown) {
					if (conditionDropdownEl && conditionDropdownEl.contains(t)) return;
					if (conditionButtonEl && conditionButtonEl.contains(t)) return;
					showConditionDropdown = false;
				}
			};
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') { 
					showCategoryMenu = false; 
					showFilters = false;
					showSizeDropdown = false; 
					showSearchDropdown = false;
					showSortDropdown = false;
					showConditionDropdown = false;
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

<!-- Removed local <SearchHeader />; layout already renders mobile/desktop headers -->

<main class="main-content" style="margin-top: var(--header-height);">
		<!-- Search Section -->
		<section class="search-section">
			<div class="search-container">
				<div class="search-wrapper" bind:this={searchInputEl}>
					<div class="search-input-group">
						<Search size={18} class="search-icon" />
						<input
							type="search"
							placeholder={m['browse.search_placeholder']()}
							bind:value={searchQuery}
							onkeydown={(e) => e.key === 'Enter' && handleSearch(e)}
							onfocus={handleSearchFocus}
							class="search-input"
						/>
					</div>

					<!-- Category Dropdown -->
					{#if showSearchDropdown}
						<div class="search-dropdown" bind:this={searchDropdownEl}>
							<div class="dropdown-content">
								<!-- Demographics -->
								<div class="dropdown-section">
									<h3>{m['browse.browse_by_category']()}</h3>
									<div class="button-group">
										{#each demographics as demographic}
											<button 
												class="category-button {selectedDemographic === demographic.id ? 'active' : ''}"
												onclick={() => handleDemographicClick(demographic.id)}
											>
												<span>{demographic.emoji}</span>
												<span>{demographic.name}</span>
												<ChevronDown size={14} class="transition-transform {selectedDemographic === demographic.id ? 'rotate-180' : ''}" />
											</button>
										{/each}
									</div>
								</div>
								
								<!-- Subcategories -->
								{#if selectedDemographic && currentDemographicSubcategories.length > 0}
									<div class="dropdown-section">
										<h3>
											{selectedDemographic === 'men' ? m['browse.men_categories']?.() : 
											 selectedDemographic === 'women' ? m['browse.women_categories']?.() :
											 selectedDemographic === 'kids' ? m['browse.kids_categories']?.() :
											 `${demographics.find(d => d.id === selectedDemographic)?.name} Categories`}
										</h3>
										<div class="button-group">
											{#each currentDemographicSubcategories as subcategory}
												<button 
													class="subcategory-button"
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
								<div class="dropdown-section">
									<h3>{m['browse.popular_searches']()}</h3>
									<div class="button-group">
										<button class="subcategory-button" onclick={() => handleCategorySelect('new-tags')}>
											<span>🏷️</span>
											<span>{m['browse.new_with_tags']()}</span>
										</button>
										<button class="subcategory-button" onclick={() => handleCategorySelect('under-50')}>
											<span>💰</span>
											<span>{m['browse.under_50']()}</span>
										</button>
										<button class="subcategory-button" onclick={() => handleCategorySelect('trending')}>
											<span>🔥</span>
											<span>{m['browse.trending']()}</span>
										</button>
										<button class="subcategory-button" onclick={() => handleCategorySelect('verified')}>
											<span>✅</span>
											<span>{m['browse.verified_sellers']()}</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>


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
				</div>
			</aside>

			<!-- Product Grid -->
			<div class="products-area">
				<!-- Compact Filter Pills Above Products -->
				<div class="compact-filters">
					<div class="compact-filters-scroll">
						<!-- Sort Dropdown -->
						<div class="dropdown-trigger">
							<button 
								bind:this={sortButtonEl}
								class="compact-pill {sortBy !== 'newest' ? 'active' : ''}"
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									showSortDropdown = !showSortDropdown;
									showConditionDropdown = false;
									showFilters = false;
								}}
							>
								<span>
									{#if sortBy === 'newest'}{m['browse.newest']()}{/if}
									{#if sortBy === 'price-low'}{m['browse.price_low_high']()}{/if}
									{#if sortBy === 'price-high'}{m['browse.price_high_low']()}{/if}
									{#if sortBy === 'most-liked'}{m['browse.most_liked']()}{/if}
									{#if sortBy === 'trending'}{m['browse.trending']()}{/if}
								</span>
								<ChevronDown size={10} class="ml-1" />
							</button>
							
							{#if showSortDropdown}
								<div class="compact-dropdown" bind:this={sortDropdownEl} onclick={(e) => e.stopPropagation()}>
									<button 
										class="dropdown-item {sortBy === 'newest' ? 'active' : ''}"
										onclick={() => { sortBy = 'newest'; showSortDropdown = false; updateURL(); }}
									>
										{m['browse.newest']()}
									</button>
									<button 
										class="dropdown-item {sortBy === 'price-low' ? 'active' : ''}"
										onclick={() => { sortBy = 'price-low'; showSortDropdown = false; updateURL(); }}
									>
										{m['browse.price_low_high']()}
									</button>
									<button 
										class="dropdown-item {sortBy === 'price-high' ? 'active' : ''}"
										onclick={() => { sortBy = 'price-high'; showSortDropdown = false; updateURL(); }}
									>
										{m['browse.price_high_low']()}
									</button>
									<button 
										class="dropdown-item {sortBy === 'most-liked' ? 'active' : ''}"
										onclick={() => { sortBy = 'most-liked'; showSortDropdown = false; updateURL(); }}
									>
										{m['browse.most_liked']()}
									</button>
									<button 
										class="dropdown-item {sortBy === 'trending' ? 'active' : ''}"
										onclick={() => { sortBy = 'trending'; showSortDropdown = false; updateURL(); }}
									>
										{m['browse.trending']()}
									</button>
								</div>
							{/if}
						</div>

						<!-- Condition Dropdown -->
						<div class="dropdown-trigger">
							<button 
								bind:this={conditionButtonEl}
								class="compact-pill {filters.selectedCondition ? 'active' : ''}"
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									showConditionDropdown = !showConditionDropdown;
									showSortDropdown = false;
									showFilters = false;
								}}
							>
								<span>
									{filters.selectedCondition ? conditions.find(c => c.id === filters.selectedCondition)?.name : 'Condition'}
								</span>
								<ChevronDown size={10} class="ml-1" />
							</button>
							
							{#if showConditionDropdown}
								<div class="compact-dropdown" bind:this={conditionDropdownEl} onclick={(e) => e.stopPropagation()}>
									{#each conditions as condition}
										<button 
											class="dropdown-item {filters.selectedCondition === condition.id ? 'active' : ''}"
											onclick={() => { 
												filters.selectedCondition = filters.selectedCondition === condition.id ? null : condition.id;
												showConditionDropdown = false;
												updateURL();
											}}
										>
											<span>{condition.emoji}</span>
											<span>{condition.name}</span>
										</button>
									{/each}
									{#if filters.selectedCondition}
										<div class="dropdown-divider"></div>
										<button 
											class="dropdown-item clear"
											onclick={() => { 
												filters.selectedCondition = null;
												showConditionDropdown = false;
												updateURL();
											}}
										>
											Clear
										</button>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Active Filter Pills -->
						{#if filters.selectedBrand}
							<button 
								class="compact-pill active"
								onclick={() => { filters.selectedBrand = ''; updateURL(); }}
							>
								{filters.selectedBrand.charAt(0).toUpperCase() + filters.selectedBrand.slice(1)}
								<X size={10} />
							</button>
						{/if}

						{#if filters.selectedSize}
							<button 
								class="compact-pill active"
								onclick={() => { filters.selectedSize = ''; updateURL(); }}
							>
								{m['product.size']()} {filters.selectedSize}
								<X size={10} />
							</button>
						{/if}

						<!-- Size and More Filters Button and View Toggle -->
						<div class="filter-actions" bind:this={filterContainerEl}>
							<!-- Size Dropdown -->
							<div class="relative">
								<button 
									class="compact-pill {filters.selectedSize ? 'active' : ''}"
									onclick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										showSizeDropdown = !showSizeDropdown;
									}}
									aria-label="Size filter"
								>
									<span>Размер</span>
									{#if filters.selectedSize}
										<span class="text-xs">({filters.selectedSize})</span>
									{/if}
									<ChevronDown size={8} class="transition-transform {showSizeDropdown ? 'rotate-180' : ''}" />
								</button>
								
								{#if showSizeDropdown}
									<div class="compact-dropdown">
										<div style="padding: 8px;">
											<div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 6px; text-transform: uppercase;">Clothing</div>
											<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 8px;">
												{#each ['XS','S','M','L','XL','XXL'] as size}
													<button 
														class="dropdown-item {filters.selectedSize === size ? 'active' : ''}"
														style="padding: 4px 8px; font-size: 12px; min-height: auto; justify-content: center;"
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
											<div style="font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 6px; text-transform: uppercase;">Shoes</div>
											<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
												{#each ['36','37','38','39','40','41','42','43'] as size}
													<button 
														class="dropdown-item {filters.selectedSize === size ? 'active' : ''}"
														style="padding: 4px 8px; font-size: 12px; min-height: auto; justify-content: center;"
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
													class="dropdown-item clear"
													style="margin-top: 8px; padding: 6px 8px; border-top: 1px solid #e5e7eb; justify-content: center;"
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
							
							<button 
								class="compact-pill {activeFiltersCount > 1 ? 'active' : ''}"
								onclick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									showFilters = !showFilters;
												}}
								aria-label="More filters"
							>
								<Filter size={10} />
								<span>Филтри</span>
								{#if activeFiltersCount > 1}
									<span class="compact-badge">
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
									<Grid size={14} />
								</button>
								<button 
									class="toggle-btn {viewMode === 'list' ? 'active' : ''}"
									onclick={() => viewMode = 'list'}
									aria-label="List view"
								>
									<List size={14} />
								</button>
							</div>
						</div>
						
						<!-- Filter Dropdown (outside of filter-actions) -->
						{#if showFilters}
							<div class="filter-dropdown-container" bind:this={filterSheetEl}>
								<div class="filter-dropdown" onclick={(e) => e.stopPropagation()}>
									<div class="dropdown-content">
										<!-- Category Filter -->
										<div class="dropdown-section">
											<h3>{m['search.categories']()}</h3>
											<div class="button-group">
												{#each categories as c}
													<button
														class="category-button {selectedCategory === c.id ? 'active' : ''}"
														onclick={() => {
															selectedCategory = selectedCategory === c.id ? null : c.id;
															selectedSubcategory = null;
															updateURL();
														}}
													>
														<span>{c.emoji}</span>
														<span>{c.name}</span>
													</button>
												{/each}
											</div>
										</div>

										<!-- Condition Filter -->
										<div class="dropdown-section">
											<h3>Condition</h3>
											<div class="button-group">
												{#each conditions as condition}
													<button
														class="subcategory-button {filters.selectedCondition === condition.id ? 'active' : ''}"
														onclick={() => {
															filters.selectedCondition = filters.selectedCondition === condition.id ? null : condition.id;
															updateURL();
														}}
													>
														<span>{condition.emoji}</span>
														<span>{condition.name}</span>
													</button>
												{/each}
											</div>
										</div>

										<!-- Size Filter -->
										<div class="dropdown-section">
											<h3>Size</h3>
											<div class="button-group">
												{#each ['XS','S','M','L','XL','XXL','6','7','8','9','10','11','12'] as s}
													<button 
														class="subcategory-button {filters.selectedSize === s ? 'active' : ''}" 
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

										<!-- Clear All -->
										{#if activeFiltersCount > 0}
											<div class="dropdown-section">
												<button class="clear-all-button" onclick={clearFilters}>
													Clear all filters
												</button>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

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
</main>


<style>
	:global(body) { overscroll-behavior-y: contain; }

	.main-content {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-bottom: 80px;
	}

	/* Search Section - Clean and Modern */
	.search-section {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 16px;
		position: sticky;
		top: var(--header-height); /* Stick below header */
		z-index: 100; /* Above content but below header */
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
			top: var(--header-height); /* Mobile header height */
		}
		
		.search-container {
			padding: 0;
			max-width: none;
		}
	}

	.search-wrapper {
		position: relative;
		max-width: 100%;
	}

	.search-input-group {
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 24px;
		padding: 0 16px;
		transition: all 0.2s ease;
		height: 48px;
	}

	.search-input-group:focus-within {
		border-color: #3b82f6;
		background: white;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		color: #9ca3af;
		flex-shrink: 0;
		margin-right: 12px;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		font-size: 15px;
		color: #1e293b;
		outline: none;
		min-width: 0;
	}

	.search-input::placeholder {
		color: #94a3b8;
	}

	/* Search Dropdown - Clean */
	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 8px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		z-index: 1001; /* Higher than filter dropdown */
		max-height: 384px;
		overflow-y: auto;
	}

	.dropdown-content {
		padding: 16px;
	}

	.dropdown-section {
		margin-bottom: 20px;
	}

	.dropdown-section:last-child {
		margin-bottom: 0;
	}

	.dropdown-section h3 {
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 12px;
	}

	.button-group {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 8px;
	}

	.category-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 24px;
		background: white;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		transition: all 0.15s ease;
		cursor: pointer;
	}

	.category-button:hover {
		border-color: #9ca3af;
		background: #f9fafb;
	}

	.category-button.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	.subcategory-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		transition: all 0.15s ease;
		cursor: pointer;
	}

	.subcategory-button:hover {
		background: #111827;
		color: white;
		border-color: #111827;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	/* Compact Filter Pills Above Products */
	.compact-filters {
		padding: 12px 16px 16px 16px;
		background: #fafbfc;
		border-bottom: 1px solid #f1f3f4;
		position: relative;
		z-index: 10;
	}

	.compact-filters-scroll {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow-x: auto;
		overflow-y: visible;
		padding-bottom: 2px;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.compact-filters-scroll::-webkit-scrollbar {
		display: none;
	}

	.compact-pill {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border: 1px solid #e1e5e9;
		border-radius: 20px;
		background: white;
		color: #4a5568;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
		transition: all 0.15s ease;
		cursor: pointer;
		min-height: 28px;
	}

	.compact-pill:hover {
		background: #f7f8fa;
		border-color: #cbd5e0;
	}

	.compact-pill.active {
		background: #2d3748;
		color: white;
		border-color: #2d3748;
	}

	.compact-badge {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 14px;
		height: 14px;
		background: #e53e3e;
		color: white;
		font-size: 9px;
		font-weight: 600;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
	}

	/* Dropdown Trigger for Sort/Condition */
	.dropdown-trigger {
		position: relative;
		display: inline-block;
	}

	/* Compact Dropdown for Sort and Condition */
	.compact-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1002; /* Higher than filter dropdown (1000) and search dropdown (1001) */
		min-width: 180px;
		padding: 4px;
		animation: fadeInScale 0.15s ease-out;
	}
	
	/* Mobile adjustments for dropdowns */
	@media (max-width: 480px) {
		.compact-dropdown {
			left: -20px;
			right: -20px;
			min-width: auto;
			max-width: 240px;
		}
		
		.compact-filters {
			padding: 12px 8px 16px 8px;
		}
		
		.compact-filters-scroll {
			gap: 4px;
		}
		
		.filter-actions {
			gap: 4px;
		}
		
		.compact-pill {
			padding: 4px 8px;
			font-size: 11px;
			flex-shrink: 0;
		}
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 12px;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: #4a5568;
		font-size: 13px;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.dropdown-item:hover {
		background: #f7f8fa;
		color: #2d3748;
	}

	.dropdown-item.active {
		background: #e6f2ff;
		color: #2563eb;
	}

	.dropdown-item.clear {
		color: #ef4444;
		font-weight: 600;
	}

	.dropdown-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 4px 0;
	}

	/* Filter Dropdown Container */
	.filter-dropdown-container {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		z-index: 1000;
	}

	/* Filter Dropdown - Same styling as search dropdown */
	.filter-dropdown {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		max-height: 400px;
		overflow-y: auto;
		min-width: 320px;
	}
	
	/* Mobile specific filter dropdown */
	@media (max-width: 768px) {
		.filter-dropdown-container {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			right: auto;
			width: 90%;
			max-width: 400px;
		}
		
		.filter-dropdown-container::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: -1;
		}
		
		.filter-dropdown {
			max-height: 70vh;
		}
	}


	.clear-all-button {
		width: 100%;
		padding: 12px;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		color: #64748b;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.15s ease;
		cursor: pointer;
	}

	.clear-all-button:hover {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
	}

	/* Make subcategory buttons active state more visible */
	.subcategory-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
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
			background: white;
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
		background: white;
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

	/* View Toggle Styles - Matching Wishlist */
	.filter-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
		position: relative;
		flex-shrink: 0;
	}

	.view-toggle {
		display: inline-flex;
		background: var(--color-surface-tertiary);
		border-radius: var(--border-radius-lg);
		padding: 3px;
		gap: 2px;
		box-shadow: var(--shadow-xs);
		border: 1px solid var(--color-border-primary);
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

	/* Mobile adjustments - maintain consistency */
	@media (max-width: 640px) {
		.view-toggle {
			display: inline-flex;
			margin-left: 6px;
			padding: 2px;
		}
		
		.toggle-btn {
			min-width: 30px;
			height: 28px;
			padding: var(--space-1-5) var(--space-2);
		}
	}
</style>