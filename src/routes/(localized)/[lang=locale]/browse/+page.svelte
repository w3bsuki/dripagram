<script lang="ts">
	const { data } = $props() as { data: any };
	import { ChevronDown, Filter, Grid3x3, Search, SlidersHorizontal, X } from '@lucide/svelte';
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
	
	// Category state
	let selectedDemographic = $state<string | null>(null);
	let selectedCategory = $state<string | null>(null);
	let showCategoryMenu = $state(false);
	
	// Filter state
	let isMobile = $state(false);
	let showFilters = $state(false);
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
			};
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') { 
					showCategoryMenu = false; 
					showFilters = false; 
					showSearchDropdown = false;
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

<main class="main-content">
		<!-- Clean Search Section -->
		<section class="bg-white border-b border-gray-200 px-4 py-3 relative">
			<div class="max-w-7xl mx-auto">
				<div class="relative" bind:this={searchInputEl}>
					<div class="relative flex items-center">
						<Search size={18} class="absolute left-3 text-gray-400 pointer-events-none z-10" />
						<input
							type="search"
							placeholder={m['browse.search_placeholder']()}
							bind:value={searchQuery}
							onkeydown={(e) => e.key === 'Enter' && handleSearch(e)}
							onfocus={handleSearchFocus}
							class="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:border-gray-900 focus:bg-white focus:shadow-sm"
						/>
					</div>

					<!-- Category Dropdown -->
					{#if showSearchDropdown}
						<div class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
							<div class="p-4" bind:this={searchDropdownEl}>
								<!-- Demographics -->
								<div class="mb-5">
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{m['browse.browse_by_category']()}</h3>
									<div class="flex gap-2 overflow-x-auto pb-2">
										{#each demographics as demographic}
											<button 
												class="flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-150 {selectedDemographic === demographic.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}"
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
									<div class="mb-5 pt-4 border-t border-gray-100">
										<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
											{m[`browse.${selectedDemographic}_categories`]?.() || `${demographics.find(d => d.id === selectedDemographic)?.name} Categories`}
										</h3>
										<div class="flex gap-2 overflow-x-auto pb-2">
											{#each currentDemographicSubcategories as subcategory}
												<button 
													class="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-150 hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-md min-w-fit"
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
								<div class="pt-4 border-t border-gray-100">
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{m['browse.popular_searches']()}</h3>
									<div class="flex gap-2 overflow-x-auto pb-2">
										<button class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-150 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('new-tags')}>
											<span>🏷️</span>
											<span>{m['browse.new_with_tags']()}</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-150 hover:bg-green-500 hover:text-white hover:border-green-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('under-50')}>
											<span>💰</span>
											<span>{m['browse.under_50']()}</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-150 hover:bg-red-500 hover:text-white hover:border-red-500 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('trending')}>
											<span>🔥</span>
											<span>{m['browse.trending']()}</span>
										</button>
										<button class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap transition-all duration-150 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-0.5 hover:shadow-md" onclick={() => handleCategorySelect('verified')}>
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


		<!-- Filter Pills Section -->
		<div class="bg-white border-b border-gray-200 py-3">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
					<!-- Sort Pill -->
					<button 
						class="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-full border transition-all duration-150 whitespace-nowrap {sortBy !== 'newest' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}"
						onclick={() => {
							if (sortBy === 'newest') sortBy = 'price-low';
							else if (sortBy === 'price-low') sortBy = 'price-high';
							else if (sortBy === 'price-high') sortBy = 'most-liked';
							else if (sortBy === 'most-liked') sortBy = 'trending';
							else sortBy = 'newest';
							updateURL();
						}}
					>
						{#if sortBy === 'newest'}{m['browse.newest']()}{/if}
						{#if sortBy === 'price-low'}{m['browse.price_low_high']()}{/if}
						{#if sortBy === 'price-high'}{m['browse.price_high_low']()}{/if}
						{#if sortBy === 'most-liked'}{m['browse.most_liked']()}{/if}
						{#if sortBy === 'trending'}{m['browse.trending']()}{/if}
					</button>

					<!-- Active Filter Pills -->
					{#if filters.selectedCondition}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedCondition = null; updateURL(); }}
						>
							{conditions.find(c => c.id === filters.selectedCondition)?.name || 'Condition'}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					{#if filters.selectedBrand}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedBrand = ''; updateURL(); }}
						>
							{filters.selectedBrand.charAt(0).toUpperCase() + filters.selectedBrand.slice(1)}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					{#if filters.selectedSize}
						<button 
							class="flex items-center gap-1 px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
							onclick={() => { filters.selectedSize = ''; updateURL(); }}
						>
							{m['product.size']()} {filters.selectedSize}
							<X size={12} class="ml-1" />
						</button>
					{/if}

					<!-- More Filters Button -->
					<button 
						class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border transition-all duration-150 whitespace-nowrap relative {activeFiltersCount > 0 ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}"
						onclick={() => showFilters = true}
						aria-label="More filters"
					>
						<Filter size={12} />
						<span>{m['browse.filter']()}</span>
						{#if activeFiltersCount > 0}
							<span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white">
								{activeFiltersCount}
							</span>
						{/if}
					</button>
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
				{#if products?.length > 0}
					<ProductGrid 
						{products} 
						variant="grid"
						onLike={handleProductLike}
						onSave={handleProductSave}
						onShare={handleProductShare}
						onComment={handleProductComment}
					/>
					
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
					<h3>{m['search.categories']()}</h3>
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
		background: white;
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
		background: white;
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
		background: white;
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
		background: white;
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
</style>