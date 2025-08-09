<script lang="ts">
	import PostCard from '$lib/components/social/PostCard.svelte';
	import ProductCard from './ProductCard.svelte';
	import type { FeedProduct } from '$lib/types';
	
	interface Props {
		products: FeedProduct[];
		onLike?: (productId: string) => void;
		onSave?: (productId: string) => void;
		onShare?: (productId: string) => void;
		onComment?: (productId: string) => void;
		variant?: 'feed' | 'grid';
	}
	
	let { 
		products = [], 
		onLike,
		onSave,
		onShare,
		onComment,
		variant = 'feed'
	}: Props = $props();

	// Handle like action
	function handleLike(productId: string) {
		// Optimistic update - toggle like status
		const product = products.find(p => p.id === productId);
		if (product) {
			product.isLiked = !product.isLiked;
			product.like_count = (product.like_count || 0) + (product.isLiked ? 1 : -1);
		}
		
		onLike?.(productId);
	}

	// Handle save action
	function handleSave(productId: string) {
		// Optimistic update
		const product = products.find(p => p.id === productId);
		if (product) {
			product.isSaved = !product.isSaved;
		}
		
		onSave?.(productId);
	}

	// Handle share action
	function handleShare(productId: string) {
		onShare?.(productId);
	}

	// Handle comment action
	function handleComment(productId: string) {
		onComment?.(productId);
	}
</script>

<div class="product-feed {variant}">
	{#each products as product (product.id)}
		{#if variant === 'grid'}
			<ProductCard 
				{product}
			/>
		{:else}
			<div class="feed-item">
				<PostCard 
					post={product} 
					showHeader={true}
					showActions={true}
					showCaption={true}
					showComments={false}
					compact={false}
					onLike={() => handleLike(product.id)}
					onSave={() => handleSave(product.id)}
					onShare={() => handleShare(product.id)}
					onComment={() => handleComment(product.id)}
				/>
			</div>
		{/if}
	{/each}
	
	{#if products.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📷</div>
			<h3>No posts yet</h3>
			<p>When people share product posts, they'll appear here.</p>
		</div>
	{/if}
</div>

<style>
	/* Instagram-style feed layout */
	.product-feed {
		width: 100%;
		background: var(--color-surface-secondary);
	}

	.product-feed.feed {
		display: flex;
		flex-direction: column;
		gap: 0; /* Posts are flush against each other */
		max-width: 468px; /* Instagram post width */
		margin: 0 auto;
	}

	.product-feed.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px; /* Proper spacing between items */
		padding: 12px;
		width: 100%;
		margin: 0 auto;
		background: transparent;
	}

	.feed-item {
		background: white;
		border-bottom: 1px solid var(--color-border-secondary);
	}

	.product-feed.grid .feed-item {
		border: none;
		border-radius: 0;
	}

	/* Smooth scrolling */
	.product-feed {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}

	/* Empty state - Instagram style */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: var(--color-text-tertiary);
		width: 100%;
		grid-column: 1 / -1; /* Span full width in grid */
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.7;
	}

	.empty-state h3 {
		font-size: 1.375rem;
		font-weight: 300;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		font-size: 0.875rem;
		line-height: 1.5;
		max-width: 300px;
	}

	/* Responsive adjustments */
	@media (max-width: 468px) {
		.product-feed.feed {
			max-width: 100%;
		}
	}

	@media (min-width: 768px) {
		.product-feed.grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;
			padding: 16px;
			max-width: 1200px;
		}
	}

	@media (min-width: 1024px) {
		.product-feed.grid {
			grid-template-columns: repeat(5, 1fr);
			gap: 20px;
			padding: 20px;
			max-width: 1400px;
		}
	}

	@media (min-width: 1400px) {
		.product-feed.grid {
			grid-template-columns: repeat(6, 1fr);
			gap: 24px;
			padding: 24px;
			max-width: 1600px;
		}
	}

	/* Performance optimizations for 60fps scrolling */
	.feed-item {
		contain: layout style paint;
		will-change: transform;
		transform: translateZ(0); /* Force GPU layer */
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		perspective: 1000px;
	}

	/* Intersection observer optimization for virtualization */
	.feed-item:not(.visible) {
		content-visibility: auto;
		contain-intrinsic-size: 500px;
	}

	/* Smooth scrolling optimizations */
	.product-feed {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}

	/* Image loading optimizations */
	.feed-item img {
		transform: translateZ(0);
		will-change: opacity;
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.product-feed {
			scroll-behavior: auto;
		}
		
		.feed-item {
			will-change: auto;
			transform: none;
		}
		
		:global(.heart-burst) {
			animation: none !important;
		}
	}
</style>