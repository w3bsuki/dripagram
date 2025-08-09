<script lang="ts">
	import { Heart, MessageCircle } from '@lucide/svelte';
	import type { LikeState } from '$lib/utils/likeLogic';

	interface Props {
		product: any;
		likeState: LikeState;
		isHovered: boolean;
		onclick: () => void;
		onLikeClick: (e: MouseEvent) => void;
		onQuickMessage: (e: MouseEvent) => void;
		priority?: boolean;
	}

	let { product, likeState, isHovered, onclick, onLikeClick, onQuickMessage, priority = false }: Props = $props();

	let imageUrl = $derived(
		product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'
	);
</script>

<!-- Image Container (clickable) -->
<div 
	class="image-container"
	{onclick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick()}
	aria-label="View {product.title}"
>
	<img 
		src={imageUrl} 
		alt={product.title || 'Product image'} 
		loading={priority ? 'eager' : 'lazy'}
		decoding={priority ? 'sync' : 'async'}
		fetchpriority={priority ? 'high' : 'auto'}
		width="400"
		height="400"
		class="product-image"
	/>
	
	<!-- Overlay Actions (visible on hover) -->
	{#if isHovered}
		<div class="overlay-actions">
			<button 
				class="action-btn quick-message"
				onclick={onQuickMessage}
				aria-label="Message seller"
				type="button"
			>
				<MessageCircle size={18} />
				Message
			</button>
		</div>
	{/if}
	
	<!-- Like Button -->
	<button 
		class="like-btn {likeState.isLiked ? 'liked' : ''}"
		onclick={onLikeClick}
		aria-label={likeState.isLiked ? 'Unlike' : 'Like'}
		type="button"
	>
		<Heart size={16} fill={likeState.isLiked ? 'currentColor' : 'none'} />
	</button>
	
	<!-- Condition Badge (moved to top-left) -->
	{#if product.condition}
		<span class="condition-badge {product.condition}">
			{#if product.condition === 'new_with_tags'}
				NEW
			{:else if product.condition === 'new_without_tags'}
				NEW
			{:else if product.condition === 'like_new'}
				LIKE NEW
			{:else if product.condition === 'very_good'}
				V.GOOD
			{:else if product.condition === 'good'}
				GOOD
			{:else}
				{product.condition.replace('_', ' ')}
			{/if}
		</span>
	{/if}
</div>

<style>
	/* Image Container */
	.image-container {
		position: relative;
		aspect-ratio: 1; /* Square for Instagram-style grid */
		overflow: hidden;
		background: var(--color-gray-50);
		cursor: pointer;
		flex: 0 0 auto;
	}
	
	.image-container:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 200ms ease;
		pointer-events: none;
	}
	
	.image-container:hover .product-image {
		transform: scale(1.05);
	}
	
	/* Overlay Actions */
	.overlay-actions {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 200ms ease;
		pointer-events: none;
	}
	
	.action-btn {
		background: var(--color-background);
		color: var(--color-foreground);
		border: none;
		padding: 8px 16px;
		border-radius: 20px;
		font-size: var(--font-size-13);
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: transform 200ms ease;
		pointer-events: auto;
	}
	
	.action-btn:hover {
		transform: scale(1.05);
	}
	
	/* Like Button */
	.like-btn {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 200ms ease;
		z-index: var(--z-behind);
	}
	
	.like-btn:hover {
		transform: scale(1.1);
	}
	
	.like-btn.liked {
		color: var(--color-text-error);
		border-color: var(--color-surface-error);
	}
	
	/* Condition Badge */
	.condition-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 4px 8px;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: var(--font-size-2xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		pointer-events: none;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.9);
	}
	
	.condition-badge.new_with_tags,
	.condition-badge.new_without_tags {
		background: var(--color-surface-success);
		color: white;
		border-color: var(--color-surface-success);
	}
	
	.condition-badge.like_new {
		background: var(--color-interactive-primary);
		color: white;
		border-color: var(--color-interactive-primary);
	}
	
	.condition-badge.very_good,
	.condition-badge.good {
		background: var(--color-surface-warning);
		color: white;
		border-color: var(--color-surface-warning);
	}
	
	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.overlay-actions {
			display: none; /* Hide hover actions on mobile */
		}
	}
</style>