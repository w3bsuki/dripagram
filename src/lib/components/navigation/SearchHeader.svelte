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

	function handleCategorySelect(type: string, value: string) {
		if (type === 'category') {
			goto(`/browse?category=${value}`);
		} else {
			goto(`/browse?filter=${value}`);
		}
		showCategories = false;
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
			<div class="dropdown-section">
				<h4 class="dropdown-label">Shop by Category</h4>
				<div class="category-grid">
					<button class="category-item" onclick={() => handleCategorySelect('category', 'women')}>
						<span class="cat-emoji">👗</span>
						<span>Women</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'men')}>
						<span class="cat-emoji">👔</span>
						<span>Men</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'shoes')}>
						<span class="cat-emoji">👟</span>
						<span>Shoes</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'bags')}>
						<span class="cat-emoji">👜</span>
						<span>Bags</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'accessories')}>
						<span class="cat-emoji">💍</span>
						<span>Accessories</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'kids')}>
						<span class="cat-emoji">👶</span>
						<span>Kids</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'vintage')}>
						<span class="cat-emoji">📿</span>
						<span>Vintage</span>
					</button>
					<button class="category-item" onclick={() => handleCategorySelect('category', 'luxury')}>
						<span class="cat-emoji">💎</span>
						<span>Luxury</span>
					</button>
			</div>
		</div>
		
		<div class="dropdown-section">
			<h4 class="dropdown-label">Quick Filters</h4>
			<div class="filter-list">
				<button class="filter-chip" onclick={() => handleCategorySelect('filter', 'new')}>
					🏷️ New with tags
				</button>
				<button class="filter-chip" onclick={() => handleCategorySelect('filter', 'under50')}>
					💰 Under 50лв
				</button>
				<button class="filter-chip" onclick={() => handleCategorySelect('filter', 'trending')}>
					🔥 Trending
				</button>
				<button class="filter-chip" onclick={() => handleCategorySelect('filter', 'sale')}>
					🎯 On Sale
				</button>
				<button class="filter-chip" onclick={() => handleCategorySelect('filter', 'verified')}>
					✅ Verified Only
				</button>
			</div>
		</div>
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
		z-index: 100;
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
		color: #262626;
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
		color: #262626;
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
		color: #1877f2;
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

	/* Categories Dropdown */
	.categories-dropdown {
		padding: 1rem;
		background: white;
		border-top: 1px solid var(--color-border);
		animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		max-height: calc(100vh - 56px);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.dropdown-section {
		margin-bottom: 1.25rem;
	}

	.dropdown-section:last-child {
		margin-bottom: 0;
	}

	.dropdown-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 0.75rem;
		padding: 0 0.25rem;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	@media (max-width: 360px) {
		.category-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.875rem 0.5rem;
		background: var(--color-gray-50);
		border: 1px solid transparent;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
		overflow: hidden;
	}

	.category-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1));
		opacity: 0;
		transition: opacity 0.2s;
	}

	.category-item:hover {
		background: white;
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.category-item:hover::before {
		opacity: 1;
	}

	.category-item:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
	}

	.cat-emoji {
		font-size: 1.5rem;
		line-height: 1;
	}

	.filter-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-chip {
		padding: 0.5rem 0.875rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.filter-chip:hover {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
	}

	.filter-chip:active {
		transform: translateY(0);
		box-shadow: 0 1px 4px rgba(59, 130, 246, 0.25);
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.header-content {
			padding: 0.625rem 0.875rem;
		}

		.logo {
			font-size: 1.5rem;
		}

		.action-btn {
			padding: 0.5rem;
		}

		.categories-dropdown {
			padding: 0.875rem;
		}

		.category-item {
			padding: 0.75rem 0.25rem;
			font-size: 0.7rem;
		}

		.cat-emoji {
			font-size: 1.25rem;
		}

		.filter-chip {
			font-size: 0.75rem;
			padding: 0.4375rem 0.75rem;
		}
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
