<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Listing } from '$lib/types';
	import FeedCard from './FeedCard.svelte';
	import StoryBar from './StoryBar.svelte';
	import { createClient } from '$lib/supabase/client';

	const supabase = createClient();

	let feedItems = $state<Listing[]>([]);
	let loading = $state(true);
	let hasMore = $state(true);
	let loadingMore = $state(false);
	let feedType = $state<'for-you' | 'following' | 'trending'>('for-you');

	const ITEMS_PER_PAGE = 10;
	let currentPage = $state(0);

	// Intersection Observer for infinite scroll
	let observerTarget = $state<HTMLElement | null>(null);
	let observer: IntersectionObserver;

	async function loadFeed(append = false) {
		if (loadingMore && append) return;

		if (append) {
			loadingMore = true;
		} else {
			loading = true;
		}

		try {
			let query = supabase
				.from('listings')
				.select(
					`
          *,
          seller:profiles!seller_id (
            id,
            username,
            avatar_url,
            seller_verified,
            follower_count
          ),
          likes:product_likes(count),
          is_liked:product_likes!inner(user_id)
        `
				)
				.eq('status', 'active')
				.range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

			// Apply different sorting based on feed type
			if (feedType === 'trending') {
				query = query.order('like_count', { ascending: false });
			} else {
				query = query.order('created_at', { ascending: false });
			}

			const { data, error } = await query;

			if (error) throw error;

			if (data) {
				if (append) {
					feedItems = [...feedItems, ...data];
				} else {
					feedItems = data;
				}

				hasMore = data.length === ITEMS_PER_PAGE;
				currentPage++;
			}
		} catch (err) {
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	function setupInfiniteScroll() {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && hasMore && !loadingMore) {
						loadFeed(true);
					}
				});
			},
			{ threshold: 0.1 }
		);

		if (observerTarget) {
			observer.observe(observerTarget);
		}
	}

	function changeFeedType(type: typeof feedType) {
		feedType = type;
		currentPage = 0;
		feedItems = [];
		loadFeed();
	}

	onMount(() => {
		loadFeed();
		setupInfiniteScroll();

		return () => {
			observer?.disconnect();
		};
	});
</script>

<div class="feed-container">
	<!-- Story Bar -->
	<StoryBar />

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

	<!-- Feed Items -->
	<div class="feed-items">
		{#if loading}
			{#each Array(3) as _}
				<div class="skeleton-card">
					<div class="skeleton-image"></div>
					<div class="skeleton-content">
						<div class="skeleton-line"></div>
						<div class="skeleton-line short"></div>
					</div>
				</div>
			{/each}
		{:else if feedItems.length === 0}
			<div class="empty-state">
				<p>No items to show</p>
				<button class="cta-button">Start Exploring</button>
			</div>
		{:else}
			{#each feedItems as item (item.id)}
				<FeedCard item={item as any} />
			{/each}
		{/if}

		<!-- Infinite scroll trigger -->
		{#if hasMore && !loading}
			<div bind:this={observerTarget} class="load-more-trigger">
				{#if loadingMore}
					<div class="spinner"></div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.feed-container {
		max-width: 600px;
		margin: 0 auto;
		padding-bottom: 80px; /* Space for bottom nav */
	}

	.feed-selector {
		display: flex;
		justify-content: space-around;
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 60px;
		z-index: var(--z-low);
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.95);
	}

	.feed-tab {
		flex: 1;
		padding: 1rem;
		background: none;
		border: none;
		font-weight: 600;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
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

	.feed-items {
		min-height: 100vh;
	}

	.skeleton-card {
		margin: 1rem;
		border-radius: 12px;
		overflow: hidden;
		background: var(--color-surface);
	}

	.skeleton-image {
		aspect-ratio: 4/5;
		background: linear-gradient(90deg, var(--color-surface-secondary) 25%, var(--color-surface-tertiary) 50%, var(--color-surface-secondary) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	.skeleton-content {
		padding: 1rem;
	}

	.skeleton-line {
		height: 12px;
		background: linear-gradient(90deg, var(--color-surface-secondary) 25%, var(--color-surface-tertiary) 50%, var(--color-surface-secondary) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		margin-bottom: 0.5rem;
		border-radius: 6px;
	}

	.skeleton-line.short {
		width: 60%;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-secondary);
	}

	.cta-button {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 1rem;
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(184, 169, 201, 0.3);
	}

	.load-more-trigger {
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.feed-container {
			max-width: 100%;
		}

		.feed-selector {
			top: 56px;
		}
	}
</style>
