<script lang="ts">
	import { Heart, Grid, List } from '@lucide/svelte';
	import ProductCard from '$lib/components/marketplace/ProductCard.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	
	let { data } = $props();
	
	let viewMode = $state<'grid' | 'list'>('grid');
	let wishlistItems = $state([]);
	let isLoading = $state(true);
	
	// Helper function to build localized URLs
	function buildLocalizedUrl(path: string): string {
		const lang = data?.lang || 'bg';
		return `/${lang}${path}`;
	}
	
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
	<section class="bg-white border-b border-gray-200 px-4 py-3 sticky top-14 md:top-16 z-10">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Heart size={20} class="text-red-500" />
				<h1 class="text-lg font-semibold text-gray-900">{m.wishlist?.title?.() ?? 'Your Wishlist'}</h1>
			</div>
			
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button 
					class="px-2 py-1 rounded text-xs font-medium transition-all {viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
					onclick={() => viewMode = 'grid'}
					aria-label={m.wishlist?.grid_view?.() ?? 'Grid view'}
				>
					<Grid size={14} />
				</button>
				<button 
					class="px-2 py-1 rounded text-xs font-medium transition-all {viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
					onclick={() => viewMode = 'list'}
					aria-label={m.wishlist?.list_view?.() ?? 'List view'}
				>
					<List size={14} />
				</button>
			</div>
		</div>
	</section>

	<!-- Content Wrapper -->
	<div class="content-wrapper">
		<div class="products-content">
			{#if isLoading}
				<div class="flex flex-col items-center justify-center py-12">
					<div class="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
					<p class="text-sm text-gray-600">{m.wishlist?.loading?.() ?? 'Loading your wishlist...'}</p>
				</div>
			{:else if wishlistItems.length === 0}
				<div class="empty-state">
					<Heart size={48} class="text-gray-300 mb-4" />
					<h2 class="text-lg font-semibold text-gray-900 mb-2">{m.wishlist?.empty_title?.() ?? 'Your wishlist is empty'}</h2>
					<p class="text-sm text-gray-600 mb-6 max-w-xs text-center">{m.wishlist?.empty_description?.() ?? 'Save items you love to buy them later'}</p>
					<a 
						href={buildLocalizedUrl('/browse')}
						class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
					>
						{m.wishlist?.browse_products?.() ?? 'Browse Products'}
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
		background: #fafafa;
		min-height: 100vh;
		padding-bottom: 80px;
	}

	.content-wrapper {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0;
	}

	.products-content {
		padding: 16px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
	}

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
	}

	@media (min-width: 1024px) {
		.products-grid.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		}
	}
</style>