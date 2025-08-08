<script lang="ts">
	const { data } = $props() as { data: any };
	import { Filter, X, Camera, Grid3x3 } from '@lucide/svelte';
	// Removed local SearchHeader to avoid duplication; layout provides it
	import { ProductGrid } from '$lib/components/marketplace';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Dedicated search state
	let searchQuery = $state('');
	let showCategoryMenu = $state(false);
	let isMobile = $state(false);
	let showFilters = $state(false);

	// Filters & sorting
	let selectedCategory = $state<string | null>(null);
	let selectedSubcategory = $state<string | null>(null);
	let selectedCondition = $state<string | null>(null);
	let selectedCollection = $state<string | null>(null);
	let selectedBrand = $state<string | null>(null);
	let selectedSize = $state<string | null>(null);
	let priceRange = $state({ min: 0, max: 500 });
	let sortBy = $state('newest');

	// Data
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
		{ id: 'summer', name: 'Summer Sale', emoji: '🌞', color: 'bg-yellow-100' },
		{ id: 'vintage', name: 'Vintage Finds', emoji: '📸', color: 'bg-orange-100' },
		{ id: 'designer', name: 'Designer Deals', emoji: '💎', color: 'bg-blue-100' },
		{ id: 'trending', name: 'Trending Now', emoji: '🔥', color: 'bg-red-100' },
		{ id: 'eco', name: 'Eco Friendly', emoji: '🌿', color: 'bg-green-100' }
	];

	const subcategories = {
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
		selectedCategory ? subcategories[selectedCategory as keyof typeof subcategories] || [] : []
	);
	const activeFiltersCount = $derived(
		[
			selectedCategory,
			selectedSubcategory,
			selectedCondition,
			selectedCollection,
			selectedBrand,
			selectedSize,
			priceRange.min !== 0 ? 'min' : null,
			priceRange.max !== 500 ? 'max' : null
		].filter(Boolean).length
	);

	// Sync state from URL via store subscription
	$effect(() => {
		const unsubscribe = page.subscribe(($pg) => {
			const url = $pg.url;
			const sp = url.searchParams;
			selectedCategory = sp.get('category');
			selectedSubcategory = sp.get('subcategory');
			selectedCondition = sp.get('condition');
			selectedCollection = sp.get('collection');
			selectedBrand = sp.get('brand');
			selectedSize = sp.get('size');
			sortBy = sp.get('sort') || 'newest';
			const min = sp.get('price_min');
			const max = sp.get('price_max');
			priceRange = {
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
		setOrDelete('condition', selectedCondition);
		setOrDelete('collection', selectedCollection);
		setOrDelete('brand', selectedBrand);
		setOrDelete('size', selectedSize);
		setOrDelete('sort', sortBy);
		setOrDelete('price_min', priceRange.min !== 0 ? String(priceRange.min) : null);
		setOrDelete('price_max', priceRange.max !== 500 ? String(priceRange.max) : null);
		setOrDelete('q', searchQuery?.trim() ? searchQuery.trim() : null);
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		updateURL();
	}

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			const handleResize = () => (isMobile = window.innerWidth < 768);
			const handleDocClick = (e: Event) => {
				if (!showCategoryMenu) return;
				const t = e.target as Node;
				if (popoverEl && popoverEl.contains(t)) return;
				if (categoryBtnEl && categoryBtnEl.contains(t)) return;
				showCategoryMenu = false;
			};
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') { showCategoryMenu = false; showFilters = false; }
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
		selectedCondition = null;
		selectedCollection = null;
		selectedBrand = null;
		selectedSize = null;
		priceRange = { min: 0, max: 500 };
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
	let loadingMore = $state(false);
	let filterSheetEl: HTMLDivElement | null = null;
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
</script>

<svelte:head>
	<title>Browse - Driplo | Discover Fashion</title>
	<meta name="description" content="Browse thousands of fashion items. Find your perfect style from vintage to designer pieces." />
</svelte:head>

<!-- Removed local <SearchHeader />; layout already renders mobile/desktop headers -->

<div class="browse-page">
	<div class="content-wrap">
		<!-- Dedicated Browse Controls: Category (left) + Search + Camera (right) -->
		<div class="browse-controls">
			<form class="browse-search" onsubmit={handleSearch} role="search" aria-label="Browse search">
				<button
					type="button"
					class="icon-btn leading category-btn-inline"
					bind:this={categoryBtnEl}
					onclick={() => (showCategoryMenu = !showCategoryMenu)}
					aria-expanded={showCategoryMenu}
					aria-haspopup="true"
					aria-controls="browse-category-popover"
					aria-label="Browse categories"
				>
					<Grid3x3 size={18} />
				</button>
				<input
					type="search"
					placeholder="Search items, brands, or styles…"
					bind:value={searchQuery}
					class="browse-input"
					aria-label="Search items"
				/>
				<button type="button" class="icon-btn trailing visual-btn" aria-label="Visual search">
					<Camera size={18} />
				</button>

				{#if showCategoryMenu}
					<div id="browse-category-popover" class="category-popover left" role="menu" bind:this={popoverEl}>
						<button class="scroll-btn left" aria-label="Scroll left" onclick={() => popScrollEl?.scrollBy({ left: -240, behavior: 'smooth' })}>‹</button>
						<div class="category-scroll-pop">
							<div class="chip-scroll" bind:this={popScrollEl}>
								{#each categories as c}
									<button
										class="chip {selectedCategory === c.id ? 'active' : ''}"
										aria-pressed={selectedCategory === c.id}
										onclick={() => {
											// select category but keep dropdown open to show subcategories
											selectedCategory = c.id;
											selectedSubcategory = null;
										}}
									>
										<span class="emoji">{c.emoji}</span>
										<span>{c.name}</span>
									</button>
								{/each}
							</div>
							{#if selectedCategory && currentSubcategories.length > 0}
								<div class="chip-scroll sub-scroll">
									{#each currentSubcategories as sub}
										<button
											class="chip subtle {selectedSubcategory === sub ? 'active' : ''}"
											aria-pressed={selectedSubcategory === sub}
											onclick={() => {
												selectedSubcategory = sub === selectedSubcategory ? null : sub;
												updateURL();
												showCategoryMenu = false;
											}}
										>
											{sub}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<button class="scroll-btn right" aria-label="Scroll right" onclick={() => popScrollEl?.scrollBy({ left: 240, behavior: 'smooth' })}>›</button>
					</div>
				{/if}
			</form>
		</div>

		<!-- Category/Subcategory Tabs (dynamic) -->
		<div class="category-bar">
			<button class="top-scroll-btn left" aria-label="Scroll left" onclick={() => topScrollEl?.scrollBy({ left: -280, behavior: 'smooth' })}>‹</button>
			<div class="chip-scroll" bind:this={topScrollEl} role="tablist" aria-label="Browse navigation">
				{#if selectedCategory && currentSubcategories.length > 0}
					<button class="chip subtle" aria-pressed="false" onclick={() => { selectedCategory = null; selectedSubcategory = null; updateURL(); }}>
						← Всички категории
					</button>
					{#each currentSubcategories as sub}
						<button
							class="chip {selectedSubcategory === sub ? 'active' : ''}"
							aria-pressed={selectedSubcategory === sub}
							onclick={() => { selectedSubcategory = selectedSubcategory === sub ? null : sub; updateURL(); }}
						>
							{sub}
						</button>
					{/each}
				{:else}
					{#each categories as c}
						<button
							class="chip {selectedCategory === c.id ? 'active' : ''}"
							aria-pressed={selectedCategory === c.id}
							onclick={() => { selectedCategory = selectedCategory === c.id ? null : c.id; selectedSubcategory = null; updateURL(); }}
						>
							<span class="emoji">{c.emoji}</span>
							<span>{c.name}</span>
						</button>
					{/each}
				{/if}
			</div>
			<button class="top-scroll-btn right" aria-label="Scroll right" onclick={() => topScrollEl?.scrollBy({ left: 280, behavior: 'smooth' })}>›</button>
		</div>

		<!-- Active Filters -->
		{#if total}
			<div class="toolbar">
				<div class="left"><span class="results">{new Intl.NumberFormat('bg-BG').format(total)} items</span></div>
				<div class="right">
					<label class="sr-only" for="sort-select">Sort by</label>
					<select id="sort-select" class="sort-select" bind:value={sortBy} onchange={updateURL}>
						<option value="newest">Newest</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
						<option value="most-liked">Most Liked</option>
						<option value="trending">Trending</option>
					</select>
					<button class="filter-btn strong" onclick={openFilters} aria-controls="mobile-filters" aria-expanded={showFilters}>
						<Filter size={18} />
						<span>Filters{activeFiltersCount ? ` (${activeFiltersCount})` : ''}</span>
					</button>
				</div>
			</div>
		{/if}

		<!-- Active Filters Chips Row -->
		{#if activeFiltersCount}
			<div class="active-filters">
				{#if selectedCategory}
					<button class="filter-chip" onclick={() => { selectedCategory = null; selectedSubcategory = null; updateURL(); }}>
						Category: {getCategoryName(selectedCategory)} <X size={14} />
					</button>
				{/if}
				{#if selectedSubcategory}
					<button class="filter-chip" onclick={() => { selectedSubcategory = null; updateURL(); }}>
						Sub: {selectedSubcategory} <X size={14} />
					</button>
				{/if}
				{#if selectedBrand}
					<button class="filter-chip" onclick={() => { selectedBrand = null; updateURL(); }}>
						Brand: {selectedBrand} <X size={14} />
					</button>
				{/if}
				{#if selectedSize}
					<button class="filter-chip" onclick={() => { selectedSize = null; updateURL(); }}>
						Size: {selectedSize} <X size={14} />
					</button>
				{/if}
				{#if priceRange.min !== 0 || priceRange.max !== 500}
					<button class="filter-chip" onclick={() => { priceRange = { min: 0, max: 500 }; updateURL(); }}>
						Price: {priceRange.min}–{priceRange.max} <X size={14} />
					</button>
				{/if}
				<button class="clear-all" onclick={clearFilters}>Clear all</button>
			</div>
		{/if}

		<!-- Main Content Area with optional sidebar -->
		<div class="main-content">
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
									class="filter-option {selectedCondition === condition.id ? 'active' : ''}"
									aria-pressed={selectedCondition === condition.id}
									onclick={() => {
										selectedCondition = selectedCondition === condition.id ? null : condition.id;
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
									bind:value={priceRange.min} 
									placeholder="Min" 
									class="price-input"
									onchange={updateURL}
								/>
								<span>-</span>
								<input 
									type="number" 
									bind:value={priceRange.max} 
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
							{#each ['XS','S','M','L','XL'] as s}
								<button 
									class="filter-option size {selectedSize === s ? 'active' : ''}" 
									aria-pressed={selectedSize === s} 
									onclick={() => {
										selectedSize = selectedSize === s ? null : s;
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
						<button class="clear-all-rail" onclick={clearFilters}>
							Clear all filters
						</button>
					{/if}
				</div>
			</aside>

			<!-- Product Grid -->
			<div class="products-area">
				<ProductGrid {products} />
				{#if !products?.length}
					<div class="empty">No listings found. Try different filters.</div>
				{/if}
				{#if nextCursor}
					<div class="load-more-wrap">
						<button class="load-more" onclick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more'}</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

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
								class="chip tone {col.color} {selectedCollection === col.id ? 'active' : ''}"
								aria-pressed={selectedCollection === col.id}
								onclick={() => (selectedCollection = selectedCollection === col.id ? null : col.id)}
							>
								<span class="emoji">{col.emoji}</span>{col.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- Condition -->
				<div class="filter-group">
					<h3>Condition</h3>
					<div class="row-wrap">
						{#each conditions as condition}
							<button
								class="chip subtle {selectedCondition === condition.id ? 'active' : ''}"
								aria-pressed={selectedCondition === condition.id}
								onclick={() => (selectedCondition = selectedCondition === condition.id ? null : condition.id)}
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
						<input type="number" bind:value={priceRange.min} placeholder="Min" class="price-input" />
						<span>-</span>
						<input type="number" bind:value={priceRange.max} placeholder="Max" class="price-input" />
						<span>лв</span>
					</div>
				</div>

				<!-- Brand -->
				<div class="filter-group">
					<h3>Brand</h3>
					<input type="text" placeholder="e.g. Nike" class="price-input" bind:value={selectedBrand} />
				</div>

				<!-- Size -->
				<div class="filter-group">
					<h3>Size</h3>
					<div class="row-wrap">
						{#each ['XS','S','M','L','XL'] as s}
							<button class="chip subtle {selectedSize === s ? 'active' : ''}" aria-pressed={selectedSize === s} onclick={() => (selectedSize = selectedSize === s ? null : s)}>{s}</button>
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
</div>

<style>
	:global(body) { overscroll-behavior-y: contain; }

	.browse-page {
		min-height: 100vh;
		background: var(--color-surface);
		/* Remove extra top padding; main layout already offsets content */
		padding-top: 0;
		padding-bottom: 80px; /* space for mobile nav if present */
	}

	.content-wrap {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Dedicated browse controls: search + category button */
	.browse-controls {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: white;
		border-bottom: 1px solid var(--color-border);
	}
	@media (max-width: 480px) {
		.browse-controls { grid-template-columns: 1fr auto; }
	}
	.browse-search { position: relative; display: flex; align-items: center; }
	.browse-input {
		width: 100%; height: 50px; border-radius: 999px; border: 1px solid var(--color-border);
		background: var(--color-surface); padding: 0 3rem; font-size: 1rem; line-height: 1;
	}
	.icon-btn { width: 40px; height: 40px; background: transparent; border: none; color: var(--color-text-secondary); padding: 0; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; }
	.icon-btn.leading, .icon-btn.trailing { position: absolute; top: 50%; transform: translateY(-50%); }
	.icon-btn.leading { left: 0.5rem; }
	.icon-btn.trailing { right: 0.5rem; }
	.browse-input:focus { outline: none; border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(24,119,242,0.08); }

	/* Popover scroller & chevrons refinements */
	.category-popover { position: absolute; top: calc(100% + 8px); background: white; border: 1px solid var(--color-border); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 0.75rem 2.25rem; z-index: 60; width: min(420px, 92vw); }
	.category-popover .sub-scroll { margin-top: 0.5rem; padding-top: 0.25rem; border-top: 1px dashed var(--color-border); }
	.category-popover .scroll-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: white;
		border: 1px solid var(--color-border);
		width: 32px;
		height: 32px;
		border-radius: 999px;
		display: grid;
		place-items: center;
		color: var(--color-text-secondary);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 16px;
		font-weight: bold;
		z-index: 10;
	}
	.category-popover .scroll-btn:hover {
		background: var(--color-gray-50);
		border-color: var(--color-primary);
		color: var(--color-primary);
		transform: translateY(-50%) scale(1.05);
	}
	.category-popover .scroll-btn.left { left: 0.5rem; }
	.category-popover .scroll-btn.right { right: 0.5rem; }

	/* Hide Quick Pills entirely for now to reduce clutter */
	.collections-bar { display: none !important; }

	/* Keep category bar only on desktop; mobile uses dropdown */
	@media (max-width: 767px) { .category-bar { display: none; } }
	@media (min-width: 768px) { .category-bar { display: block; } }

	/* Horizontal chip scrollers */
	.category-bar,
	.collections-bar,
	.subcategory-bar {
		background: white;
		border-bottom: 1px solid var(--color-border);
	}

	.category-bar { position: relative; padding: 0.75rem 0; }
	.category-bar .chip-scroll { padding-left: 2.25rem; padding-right: 2.25rem; }
	.top-scroll-btn { 
		position: absolute; 
		top: 50%; 
		transform: translateY(-50%); 
		background: white; 
		border: 1px solid var(--color-border); 
		width: 32px; 
		height: 32px; 
		border-radius: 999px; 
		display: none; 
		place-items: center; 
		color: var(--color-text-secondary); 
		box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
		z-index: 100; 
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 16px;
		font-weight: bold;
	}
	.top-scroll-btn:hover {
		background: var(--color-gray-50);
		border-color: var(--color-primary);
		color: var(--color-primary);
		transform: translateY(-50%) scale(1.05);
	}
	.category-bar:hover .top-scroll-btn, .category-bar:focus-within .top-scroll-btn { display: grid; }
	@media (hover: none) { .top-scroll-btn { display: grid; opacity: 0.8; } }
	.top-scroll-btn.left { left: 6px; }
	.top-scroll-btn.right { right: 6px; }

	.collections-bar { position: relative; padding: 0.5rem 0; background: white; border-bottom: 1px solid var(--color-border); }
	.collections-bar .chip-scroll { padding-left: 2.25rem; padding-right: 2.25rem; }
	.collections-scroll-btn { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: 1px solid var(--color-border); width: 28px; height: 28px; border-radius: 999px; display: none; place-items: center; color: var(--color-text-secondary); box-shadow: 0 2px 10px rgba(0,0,0,0.06); z-index: 100; }
	.collections-bar:hover .collections-scroll-btn, .collections-bar:focus-within .collections-scroll-btn { display: grid; }
	@media (hover: none) { .collections-scroll-btn { display: grid; } }
	.collections-scroll-btn.left { left: 6px; }
	.collections-scroll-btn.right { right: 6px; }

	.chip-scroll {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		scroll-snap-type: x mandatory;
		/* Ensure no wrap - chips must stay on single line */
		flex-wrap: nowrap;
	}
	.chip-scroll::-webkit-scrollbar { display: none; }

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		background: white;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.2s;
		scroll-snap-align: start;
	}
	.chip:hover { background: var(--color-gray-50); }
	.chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
	.chip.outline { background: transparent; }
	.chip.subtle { background: var(--color-gray-50); border-color: transparent; }
	.chip.tone.bg-yellow-100 { background: #fef3c7; }
	.chip.tone.bg-orange-100 { background: #fed7aa; }
	.chip.tone.bg-blue-100 { background: #dbeafe; }
	.chip.tone.bg-red-100 { background: #fee2e2; }
	.chip.tone.bg-green-100 { background: #d1fae5; }
	.chip .emoji { font-size: 1rem; }

	/* Active filters */
	.active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: white;
		border-bottom: 1px solid var(--color-border);
	}
	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: var(--color-gray-50);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 0.8125rem;
		cursor: pointer;
	}
	.clear-all { margin-left: auto; background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; }

	/* Toolbar */
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border-bottom: 1px solid var(--color-border);
		min-height: 56px;
	}
	.toolbar .results { 
		font-size: 0.875rem; 
		color: var(--color-text-primary); 
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.toolbar .results::before {
		content: "📊";
		font-size: 1rem;
	}
	.toolbar .right { 
		display: flex; 
		align-items: center; 
		gap: 0.75rem; 
	}
	.sort-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: white;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 140px;
	}
	.sort-select:hover {
		border-color: var(--color-primary);
		background: var(--color-gray-50);
	}
	.sort-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(24,119,242,0.08);
	}
	.filter-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		min-height: 40px;
	}
	.filter-btn:hover {
		border-color: var(--color-primary);
		background: var(--color-gray-50);
	}
	.filter-btn.strong { 
		border-color: var(--color-primary); 
		color: var(--color-primary);
		background: rgba(24,119,242,0.05);
	}
	.filter-btn.strong:hover { 
		background: var(--color-primary); 
		color: white; 
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(24,119,242,0.2);
	}

	/* Main content layout */
	.main-content {
		display: flex;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Desktop Filter Rail */
	.filter-rail {
		width: 280px;
		flex-shrink: 0;
		background: white;
		border-right: 1px solid var(--color-border);
		height: fit-content;
		position: sticky;
		top: 56px;
	}

	.desktop-only {
		display: none;
	}

	@media (min-width: 1024px) {
		.desktop-only {
			display: block;
		}
	}

	.filter-rail-content {
		padding: 1.5rem;
	}

	.filter-rail .filter-group {
		margin-bottom: 2rem;
	}

	.filter-rail .filter-group h3 {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: var(--color-text-primary);
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
		border-left: 2px solid var(--color-border);
	}

	.filter-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: left;
		width: 100%;
	}

	.filter-option:hover {
		background: var(--color-gray-50);
		border-color: var(--color-primary);
	}

	.filter-option.active {
		background: rgba(24,119,242,0.08);
		border-color: var(--color-primary);
		color: var(--color-primary);
		font-weight: 600;
	}

	.filter-option.sub {
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
	}

	.filter-option.size {
		width: auto;
		min-width: 40px;
		justify-content: center;
		padding: 0.5rem 0.75rem;
	}

	.filter-option .emoji {
		font-size: 1rem;
	}

	.clear-all-rail {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-gray-50);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text-secondary);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-all-rail:hover {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	/* Products area */
	.products-area {
		flex: 1;
		padding: 1rem;
	}

	/* Responsive - hide rail on smaller screens */
	@media (max-width: 1023px) {
		.main-content {
			display: block;
		}
		
		.products-area {
			padding: 0;
		}
	}

	/* Products (mobile fallback) */
	.products { padding: 1rem; }
	.empty { text-align: center; color: var(--color-text-secondary); padding: 2rem 1rem; }
	
	/* Load more button */
	.load-more-wrap {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
	}
	
	.load-more {
		padding: 0.75rem 2rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}
	
	.load-more:hover:not(:disabled) {
		background: var(--color-primary-dark, #1a73e8);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(24,119,242,0.3);
	}
	
	.load-more:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	/* Filter sheet */
	.filter-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
	}
	.filter-sheet {
		position: fixed; left: 0; right: 0; bottom: 0; background: white; z-index: 201;
		border-radius: 16px 16px 0 0; max-height: 85vh; display: flex; flex-direction: column; animation: slideUp 0.25s ease;
	}
	@keyframes slideUp { from { transform: translateY(100%);} to { transform: translateY(0);} }
	.filter-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--color-border); }
	.filter-content { flex: 1; overflow-y: auto; padding: 1rem; }
	.filter-group { margin-bottom: 1.25rem; }
	.filter-group h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; }
	.row-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.row-wrap.small-gap { gap: 0.375rem; }
	.price-inputs { display: flex; align-items: center; gap: 0.5rem; }
	.price-input { width: 100%; max-width: 120px; padding: 0.5rem; background: var(--color-gray-50); border: 1px solid var(--color-border); border-radius: 8px; text-align: center; }
	.filter-footer { display: flex; gap: 0.75rem; padding: 1rem; border-top: 1px solid var(--color-border); }
	.reset-btn { flex: 1; padding: 0.75rem; background: white; border: 1px solid var(--color-border); border-radius: 10px; font-weight: 600; }
	.apply-btn { flex: 2; padding: 0.75rem; background: var(--color-primary); color: white; border: none; border-radius: 10px; font-weight: 700; }

	/* Responsive */
	@media (min-width: 768px) {
		.browse-page { padding-top: 56px; padding-bottom: 0; }
	}
</style>
