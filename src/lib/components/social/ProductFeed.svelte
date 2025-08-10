<script lang="ts">
	import { ProductGrid } from '$lib/components/marketplace';
	import type { FeedProduct } from '$lib/types';
	import * as m from '$lib/paraglide/messages';

	type FeedType = 'for-you' | 'following' | 'trending';

	let { 
		products,
		feedType,
		isLoading,
		loadingMore,
		nextCursor,
		isAuthenticated,
		onLoadMore,
		onProductLike,
		onProductSave,
		onProductShare,
		onProductComment
	}: {
		products: FeedProduct[];
		feedType: FeedType;
		isLoading: boolean;
		loadingMore: boolean;
		nextCursor: string | null;
		isAuthenticated: boolean;
		onLoadMore: () => Promise<void>;
		onProductLike: (productId: string) => Promise<void>;
		onProductSave: (productId: string) => Promise<void>;
		onProductShare: (productId: string) => void;
		onProductComment: (productId: string) => void;
	} = $props();
</script>

<!-- Instagram-style Product Feed -->
{#if isLoading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Loading your feed...</p>
	</div>
{:else}
	<ProductGrid 
		{products} 
		variant="grid"
		onLike={onProductLike}
		onSave={onProductSave}
		onShare={onProductShare}
		onComment={onProductComment}
	/>
{/if}

<!-- Load More Indicator -->
{#if loadingMore}
	<div class="load-more-container">
		<div class="loading-spinner small"></div>
		<p>{m['feed_messages.loading_more']()}</p>
	</div>
{:else if !nextCursor && products.length > 0}
	<div class="end-of-feed">
		<p>{m['feed_messages.end_of_feed']()}</p>
	</div>
{/if}

<!-- Empty State -->
{#if !isLoading && products.length === 0}
	<div class="empty-state">
		{#if feedType === 'following' && !isAuthenticated}
			<h3>Sign in to see products from people you follow</h3>
			<p>Create an account or sign in to follow sellers and see their latest listings here.</p>
			<a href="/auth/login" class="cta-button">Sign In</a>
		{:else if feedType === 'following'}
			<h3>No products from followed sellers</h3>
			<p>Follow some sellers to see their products here, or discover new ones in the For You tab.</p>
		{:else}
			<h3>No products available</h3>
			<p>Check back later for new listings, or try a different tab.</p>
		{/if}
	</div>
{/if}

<style>
	/* Loading States */
	.loading-container,
	.load-more-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 1rem;
	}
	
	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.loading-spinner.small {
		width: 20px;
		height: 20px;
		border-width: 2px;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		max-width: 400px;
		margin: 0 auto;
	}
	
	.empty-state h3 {
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}
	
	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}
	
	.cta-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: background-color 0.2s;
	}
	
	.cta-button:hover {
		background: color-mix(in srgb, var(--color-primary) 90%, black);
	}
	
	/* End of Feed */
	.end-of-feed {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary);
	}
</style>