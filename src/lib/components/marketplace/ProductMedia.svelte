<script lang="ts">
	import { Heart, MessageCircle } from '@lucide/svelte';
	import type { LikeState } from '$lib/utils/likeLogic';
	import * as m from '$lib/paraglide/messages';

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
		class="product-image img-product"
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
				{m['conditions.new_with_tags']().toUpperCase()}
			{:else if product.condition === 'new_without_tags'}
				{m['conditions.new_without_tags']().toUpperCase()}
			{:else if product.condition === 'like_new'}
				{m['conditions.like_new']().toUpperCase()}
			{:else if product.condition === 'very_good'}
				{m['conditions.very_good']().toUpperCase()}
			{:else if product.condition === 'good'}
				{m['conditions.good']().toUpperCase()}
			{:else if product.condition === 'brand_new'}
				{m['conditions.brand_new']().toUpperCase()}
			{:else if product.condition === 'fair'}
				{m['conditions.fair']().toUpperCase()}
			{:else if product.condition === 'satisfactory'}
				{m['conditions.satisfactory']().toUpperCase()}
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
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}
	
	.image-container:focus {
		outline: none;
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
		padding: 3px 7px;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		pointer-events: none;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.9);
	}
	
	.condition-badge.new_with_tags {
		background: #10b981; /* Bright emerald green for new with tags */
		color: white;
		border-color: #10b981;
		box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
	}
	
	.condition-badge.new_without_tags {
		background: #059669; /* Slightly darker green for new without tags */
		color: white;
		border-color: #059669;
		box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
	}
	
	.condition-badge.like_new {
		background: #3b82f6; /* Blue for like new */
		color: white;
		border-color: #3b82f6;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
	}
	
	.condition-badge.very_good {
		background: #f59e0b; /* Amber for very good */
		color: white;
		border-color: #f59e0b;
		box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
	}
	
	.condition-badge.good {
		background: #ef4444; /* Red for good condition */
		color: white;
		border-color: #ef4444;
		box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
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