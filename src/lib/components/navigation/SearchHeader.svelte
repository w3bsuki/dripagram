<script lang="ts">
	import { Search, Camera, ChevronDown, Grid3x3 } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// New prop to control initial/conditional open state from layout/routes
	let { defaultOpenSearch = false } = $props();

	let searchQuery = $state('');
	let showSearch = $state(false);
	let showCategories = $state(false);
	let isSticky = $state(false);
	let headerRef = $state<HTMLElement | null>(null);
	let openedOnce = $state(false);
	let selectedDemographic = $state<string | null>(null);

	// Category data
	const demographics = [
		{ id: 'men', name: 'Men', emoji: '👨' },
		{ id: 'women', name: 'Women', emoji: '👩' },
		{ id: 'kids', name: 'Kids', emoji: '👶' },
		{ id: 'pets', name: 'Pets', emoji: '🐾' }
	];

	const subcategories: Record<string, Array<{id: string; name: string; emoji: string; type?: string}>> = {
		men: [
			{ id: 'all-mens', name: "All Men's", emoji: '👔' },
			{ id: 'mens-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'mens-tshirts', name: 'T-shirts', emoji: '👕' },
			{ id: 'mens-jackets', name: 'Jackets', emoji: '🧥' },
			{ id: 'mens-jeans', name: 'Jeans', emoji: '👖' },
			{ id: 'mens-bags', name: 'Bags', emoji: '🎒' },
			{ id: 'new-tags', name: 'New with tags', emoji: '🏷️', type: 'filter' },
			{ id: 'fair', name: 'Fair', emoji: '👌', type: 'filter' },
			{ id: 'trending', name: 'Trending', emoji: '🔥', type: 'filter' }
		],
		women: [
			{ id: 'all-womens', name: "All Women's", emoji: '👗' },
			{ id: 'womens-shoes', name: 'Shoes', emoji: '👠' },
			{ id: 'womens-dresses', name: 'Dresses', emoji: '👗' },
			{ id: 'womens-tops', name: 'Tops', emoji: '👚' },
			{ id: 'womens-bags', name: 'Bags', emoji: '👜' },
			{ id: 'womens-accessories', name: 'Accessories', emoji: '💍' },
			{ id: 'new-tags', name: 'New with tags', emoji: '🏷️', type: 'filter' },
			{ id: 'fair', name: 'Fair', emoji: '👌', type: 'filter' },
			{ id: 'trending', name: 'Trending', emoji: '🔥', type: 'filter' }
		],
		kids: [
			{ id: 'all-kids', name: "All Kids'", emoji: '👶' },
			{ id: 'kids-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'kids-clothes', name: 'Clothes', emoji: '👕' },
			{ id: 'kids-toys', name: 'Toys', emoji: '🧸' },
			{ id: 'new-tags', name: 'New with tags', emoji: '🏷️', type: 'filter' },
			{ id: 'fair', name: 'Fair', emoji: '👌', type: 'filter' }
		],
		pets: [
			{ id: 'all-pets', name: 'All Pets', emoji: '🐾' },
			{ id: 'pet-clothes', name: 'Clothes', emoji: '🦺' },
			{ id: 'pet-accessories', name: 'Accessories', emoji: '🦴' },
			{ id: 'new-tags', name: 'New with tags', emoji: '🏷️', type: 'filter' }
		]
	};

	const conditions = [
		{ id: 'new-tags', name: 'New with tags', emoji: '🏷️' },
		{ id: 'new-no-tags', name: 'New without tags', emoji: '✨' },
		{ id: 'fair', name: 'Fair', emoji: '👌' },
		{ id: 'under50', name: 'Under 50лв', emoji: '💰' },
		{ id: 'trending', name: 'Trending', emoji: '🔥' },
		{ id: 'verified', name: 'Verified Only', emoji: '✅' }
	];

	// Open search once when requested (e.g., on /browse), but allow user to close it
	$effect(() => {
		if (defaultOpenSearch && !openedOnce) {
			showSearch = true;
			showCategories = false;
			openedOnce = true;
		}
	});

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
			showSearch = false;
		}
	}

	function openVisualSearch() {
	}

	function toggleCategories() {
		showCategories = !showCategories;
		if (showCategories) {
			showSearch = false;
		}
	}

	function handleDemographicClick(demographicId: string) {
		if (selectedDemographic === demographicId) {
			// If clicking the same demographic, deselect it (close subcategories)
			selectedDemographic = null;
		} else {
			// Otherwise, select it to show subcategories
			selectedDemographic = demographicId;
		}
	}

	function handleCategorySelect(type: string, value: string) {
		if (type === 'category') {
			goto(`/browse?category=${value}`);
		} else {
			goto(`/browse?filter=${value}`);
		}
		showCategories = false;
	}

	function scrollCategoryRow(direction: 'left' | 'right', rowElement: HTMLElement | null) {
		if (!rowElement) return;
		const scrollAmount = 200;
		rowElement.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	}

	// Handle scroll for sticky behavior
	onMount(() => {
		if (browser) {
			const handleScroll = () => {
				// Make sticky after scrolling past stories (approximately 200px)
				isSticky = window.scrollY > 200;
				
				// Close dropdowns when scrolling
				if (window.scrollY > 250 && (showCategories || showSearch)) {
					showCategories = false;
					showSearch = false;
				}
			};

			window.addEventListener('scroll', handleScroll, { passive: true });
			
			// Click outside to close
			const handleClickOutside = (e: MouseEvent) => {
				if (headerRef && !headerRef.contains(e.target as Node)) {
					showCategories = false;
					showSearch = false;
				}
			};
			
			document.addEventListener('click', handleClickOutside);
			
			return () => {
				window.removeEventListener('scroll', handleScroll);
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<header class="search-header {isSticky ? 'sticky' : ''}" bind:this={headerRef}>
	<div class="header-content">
		<!-- Logo (Instagram style - left aligned) -->
		<a href="/" class="logo" aria-label="Driplo Home">
			<span class="logo-text">driplo</span>
		</a>

		<!-- Actions (Instagram style - right aligned) -->
		<div class="header-actions">
			<!-- Search Button -->
			<button 
				class="action-btn search-trigger {showSearch ? 'active' : ''}" 
				onclick={() => { showSearch = !showSearch; showCategories = false; }} 
				aria-label="Search products"
				aria-expanded={showSearch}
			>
				<Search size={24} strokeWidth={1.5} />
			</button>

			<!-- Categories/Browse Button -->
			<button 
				class="action-btn categories-trigger {showCategories ? 'active' : ''}" 
				onclick={toggleCategories}
				aria-label="Browse categories"
				aria-expanded={showCategories}
			>
				<Grid3x3 size={24} strokeWidth={1.5} />
			</button>
		</div>
	</div>

	<!-- Expandable Search Bar -->
	{#if showSearch}
		<form class="search-form" onsubmit={handleSearch}>
			<div class="search-input-wrapper">
				<Search size={20} class="search-icon" />
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Search for items, brands, or sellers..."
					class="search-input"
					autofocus
				/>
				<button
					type="button"
					class="visual-search-btn"
					onclick={openVisualSearch}
					aria-label="Visual search"
				>
					<Camera size={20} />
				</button>
			</div>
		</form>
	{/if}

	<!-- Categories Dropdown -->
	{#if showCategories}
		<div class="categories-dropdown">
			<!-- Demographics Row -->
			<div class="category-row-container">
				<div class="category-row" id="demographics-row">
					{#each demographics as demographic}
						<button 
							class="category-pill {selectedDemographic === demographic.id ? 'active' : ''}" 
							onclick={() => handleDemographicClick(demographic.id)}
						>
							<span class="pill-emoji">{demographic.emoji}</span>
							<span>{demographic.name}</span>
							{#if selectedDemographic === demographic.id}
								<span class="pill-close">✕</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Dynamic Subcategories Row -->
			{#if selectedDemographic && subcategories[selectedDemographic]}
				<div class="category-row-container subcategories">
					<div class="category-row" id="subcategories-row">
						{#each subcategories[selectedDemographic] as subcategory}
							<button 
								class="category-pill subcategory" 
								onclick={() => handleCategorySelect(subcategory.type || 'category', subcategory.id)}
							>
								<span class="pill-emoji">{subcategory.emoji}</span>
								<span>{subcategory.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</header>

<style>
	.search-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: white;
		border-bottom: 1px solid rgb(219, 219, 219);
		z-index: var(--z-higher);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.search-header.sticky {
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.98);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		height: 56px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		transition: transform 0.2s;
	}

	.logo:active {
		transform: scale(0.95);
	}

	.logo-text {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		letter-spacing: -0.5px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}

	@media (max-width: 640px) {
		.logo svg {
			width: 28px;
			height: 28px;
		}
		
		.logo-text {
			font-size: 1.375rem;
		}
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.15s ease;
		border-radius: 50%;
		width: 44px;
		height: 44px;
	}

	.action-btn:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.action-btn.active {
		background: rgba(0, 0, 0, 0.1);
		color: var(--color-text-brand);
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.categories-trigger {
		position: relative;
	}

	.search-form {
		padding: 0 1rem 1rem;
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0 1rem;
		transition: all 0.2s;
	}

	.search-input-wrapper:focus-within {
		border-color: var(--color-primary);
		background: white;
		box-shadow:
			0 0 0 3px rgba(24, 119, 242, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.search-icon {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0.75rem;
		font-size: 1rem;
		color: var(--color-text-primary);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.visual-search-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.visual-search-btn:hover {
		color: var(--color-primary);
		background: var(--color-gray-50);
		border-radius: 50%;
	}

	/* Categories Dropdown - Clean Design */
	.categories-dropdown {
		padding: 1rem;
		animation: slideDown 0.2s ease;
		background: var(--color-surface);
		border-radius: 12px;
		margin: 0 1rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--color-border);
	}

	.category-row-container {
		margin-bottom: 0.75rem;
	}

	.category-row-container:last-child {
		margin-bottom: 0;
	}

	.category-row-container.subcategories {
		border-top: 1px solid var(--color-border);
		padding-top: 0.75rem;
	}

	.category-row {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding: 0.25rem 0;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.category-row::-webkit-scrollbar {
		display: none;
	}

	.category-pill {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.category-pill:hover {
		background: var(--color-surface-tertiary);
		border-color: var(--color-text-secondary);
	}

	.category-pill.active {
		background: #000;
		color: white;
		border-color: #000;
	}

	.category-pill.subcategory {
		background: var(--color-surface-secondary);
		font-size: 0.8125rem;
		padding: 0.4375rem 0.75rem;
	}

	.category-pill.subcategory:hover {
		background: #000;
		color: white;
		border-color: #000;
	}

	.pill-emoji {
		font-size: 1rem;
	}

	.pill-close {
		font-size: 0.875rem;
		font-weight: 600;
		opacity: 0.9;
	}

	.category-pill.subcategory .pill-emoji {
		font-size: 0.875rem;
	}

	/* Prevent body scroll when dropdown is open on mobile */
	:global(body:has(.search-header .categories-dropdown)) {
		overflow: hidden;
	}

	@media (min-width: 768px) {
		:global(body:has(.search-header .categories-dropdown)) {
			overflow: auto;
		}
	}
</style>
