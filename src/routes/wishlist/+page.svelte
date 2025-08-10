<script lang="ts">
	import { Heart, Grid, List } from '@lucide/svelte';
	import ProductCard from '$lib/components/marketplace/ProductCard.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	
	let viewMode = $state<'grid' | 'list'>('grid');
	let wishlistItems = $state([]);
	let isLoading = $state(true);
	
	onMount(async () => {
		// TODO: Load wishlist items from API
		isLoading = false;
	});
</script>

<svelte:head>
	<title>Wishlist - Driplo</title>
	<meta name="description" content="Your saved fashion items - find them all in one place" />
</svelte:head>

<main class="main-content">
	<!-- Header Section -->
	<section class="header-section">
		<div class="header-container">
			<div class="header-content">
				<div class="header-title">
					<Heart size={20} class="heart-icon" />
					<h1 class="title-text">{m['wishlist.title']()}</h1>
				</div>
				
				<div class="view-toggle">
					<button 
						class="toggle-button {viewMode === 'grid' ? 'active' : ''}"
						onclick={() => viewMode = 'grid'}
						aria-label={m['wishlist.grid_view']()}
					>
						<Grid size={14} />
					</button>
					<button 
						class="toggle-button {viewMode === 'list' ? 'active' : ''}"
						onclick={() => viewMode = 'list'}
						aria-label={m['wishlist.list_view']()}
					>
						<List size={14} />
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Wrapper -->
	<div class="content-wrapper">
		<div class="products-content">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p class="loading-text">{m['wishlist.loading']()}</p>
				</div>
			{:else if wishlistItems.length === 0}
				<div class="empty-state">
					<Heart size={48} class="empty-icon" />
					<h2 class="empty-title">{m['wishlist.empty_title']()}</h2>
					<p class="empty-description">{m['wishlist.empty_description']()}</p>
					<a href="/browse" class="browse-button">
						{m['wishlist.browse_products']()}
					</a>
				</div>
			{:else}
				<div class="products-grid {viewMode === 'grid' ? 'grid-layout' : 'list-layout'}">
					{#each wishlistItems as item}
						<ProductCard product={item} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.main-content {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-bottom: 80px;
	}

	/* Header Section - Clean and Modern */
	.header-section {
		background: white;
		border-bottom: 1px solid var(--color-border-primary);
		padding: 16px;
		position: sticky;
		top: var(--header-height);
		z-index: 10;
	}

	.header-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 16px;
	}

	/* Mobile: Full width */
	@media (max-width: 768px) {
		.header-section {
			padding: 12px;
		}
		
		.header-container {
			padding: 0;
			max-width: none;
		}
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.heart-icon {
		color: var(--color-like);
		flex-shrink: 0;
	}

	.title-text {
		font-size: 18px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	/* View Toggle */
	.view-toggle {
		display: flex;
		background: var(--color-surface-tertiary);
		border-radius: 8px;
		padding: 2px;
		gap: 2px;
	}

	.toggle-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 8px;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		min-width: 32px;
		height: 28px;
	}

	.toggle-button:hover {
		color: var(--color-text-primary);
	}

	.toggle-button.active {
		background: white;
		color: var(--color-text-primary);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	/* Content */
	.content-wrapper {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0;
	}

	.products-content {
		padding: 16px;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 16px;
		text-align: center;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--color-border-primary);
		border-top: 2px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 12px;
	}

	.loading-text {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 16px;
		text-align: center;
	}

	.empty-icon {
		color: var(--color-text-disabled);
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 8px;
		margin: 0;
	}

	.empty-description {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin-bottom: 24px;
		max-width: 300px;
		line-height: 1.5;
		margin: 0 0 24px 0;
	}

	.browse-button {
		display: inline-flex;
		align-items: center;
		padding: 12px 24px;
		background: var(--color-interactive-primary);
		color: white;
		font-size: 14px;
		font-weight: 500;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.browse-button:hover {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	/* Product Grid */
	.products-grid.grid-layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 12px;
	}

	.products-grid.list-layout {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.products-grid.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		}
	}

	@media (min-width: 768px) {
		.main-content {
			padding-bottom: 20px;
		}
		
		.products-content {
			padding: 20px;
		}

		.products-grid.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: 16px;
		}

		.products-grid.list-layout {
			gap: 16px;
		}

		.header-section {
			top: var(--header-height-md);
		}
	}

	@media (min-width: 1024px) {
		.products-grid.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		}
	}

	/* Animation */
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>