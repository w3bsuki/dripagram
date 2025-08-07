<script lang="ts">
	import ProductGrid from '$lib/components/marketplace/ProductGrid.svelte';
	import BrandShowcase from '$lib/components/social/BrandShowcase.svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import SearchHeader from '$lib/components/navigation/SearchHeader.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	let isMobile = $state(false);
	let feedType = $state<'for-you' | 'following' | 'trending'>('for-you');

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			window.addEventListener('resize', () => {
				isMobile = window.innerWidth < 768;
			});
		}
	});

	function changeFeedType(type: typeof feedType) {
		feedType = type;
	}
</script>

<svelte:head>
	<title>Driplo - The Amazon of Clothing | Shop & Sell Fashion</title>
	<meta
		name="description"
		content="Discover and sell fashion on Bulgaria's #1 social commerce platform. Join thousands buying and selling designer clothes, streetwear, and vintage finds."
	/>
	<meta
		name="keywords"
		content="fashion marketplace, social shopping, buy sell clothes, designer fashion, streetwear, vintage clothing, Bulgaria"
	/>
	<meta property="og:title" content="Driplo - The Amazon of Clothing" />
	<meta
		property="og:description"
		content="Shop and sell fashion with style. Join the social commerce revolution."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<!-- Header (Mobile) -->
{#if isMobile}
	<SearchHeader />
{/if}

<!-- Main Content -->
<main class="main-content">
	<!-- Brand Showcase (Stories) -->
	<BrandShowcase />

	<!-- Feed Type Selector -->
	<div class="feed-selector">
		<button
			class="feed-tab {feedType === 'for-you' ? 'active' : ''}"
			onclick={() => changeFeedType('for-you')}
		>
			For You
		</button>
		<button
			class="feed-tab {feedType === 'following' ? 'active' : ''}"
			onclick={() => changeFeedType('following')}
		>
			Following
		</button>
		<button
			class="feed-tab {feedType === 'trending' ? 'active' : ''}"
			onclick={() => changeFeedType('trending')}
		>
			Trending 🔥
		</button>
	</div>

	<!-- Product Grid -->
	<ProductGrid products={data.products || []} />
</main>

<!-- Mobile Bottom Navigation -->
{#if isMobile}
	<BottomNav />
{/if}

<style>
	.main-content {
		min-height: 100vh;
		background: var(--color-surface);
		padding-bottom: 80px; /* Space for mobile bottom nav */
	}


	/* Feed Selector */
	.feed-selector {
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 40;
	}

	.feed-tab {
		flex: 1;
		max-width: 200px;
		padding: 1rem;
		background: none;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}

	@media (max-width: 640px) {
		.feed-tab {
			font-size: 0.875rem;
			padding: 0.875rem 0.5rem;
		}
	}

	.feed-tab:hover {
		color: var(--color-text-primary);
	}

	.feed-tab.active {
		color: var(--color-text-primary);
	}

	.feed-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--color-primary);
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@media (min-width: 768px) {
		.main-content {
			padding-top: 0; /* No header on desktop for now */
			padding-bottom: 0;
		}

		.feed-selector {
			top: 0; /* No header offset on desktop */
		}
	}
</style>
