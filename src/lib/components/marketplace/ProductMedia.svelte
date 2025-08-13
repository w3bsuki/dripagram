<script lang="ts">
	import { Heart, MessageCircle, Bookmark } from '@lucide/svelte';
	import type { LikeState } from '$lib/utils/likeLogic';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		product: any;
		likeState: LikeState;
		isSaved: boolean;
		isHovered: boolean;
		onclick: () => void;
		onLikeClick: (e: MouseEvent) => void;
		onSaveClick: (e: MouseEvent) => void;
		onQuickMessage: (e: MouseEvent) => void;
		priority?: boolean;
	}

	let { product, likeState, isSaved, isHovered, onclick, onLikeClick, onSaveClick, onQuickMessage, priority = false }: Props = $props();

	let imageUrl = $derived(
		product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'
	);
</script>

<!-- Image Container -->
<div class="image-container">
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
				onclick={(e) => { e.stopPropagation(); onQuickMessage(e); }}
				aria-label="Message seller"
				type="button"
			>
				<MessageCircle size={18} />
				Message
			</button>
		</div>
	{/if}
	
	<!-- Action Buttons Container -->
	<div class="action-buttons">
		<!-- Like Button -->
		<button 
			class="action-btn like-btn {likeState.isLiked ? 'liked' : ''}"
			onclick={(e) => { e.stopPropagation(); onLikeClick(e); }}
			aria-label={likeState.isLiked ? 'Unlike' : 'Like'}
			type="button"
		>
			<Heart size={16} fill={likeState.isLiked ? 'currentColor' : 'none'} />
		</button>
		
		<!-- Save Button -->
		<button 
			class="action-btn save-btn {isSaved ? 'saved' : ''}"
			onclick={(e) => { e.stopPropagation(); onSaveClick(e); }}
			aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
			type="button"
		>
			<Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
		</button>
	</div>
	
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
	/* Image Container - Vinted-style aspect ratio */
	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1.2; /* Slightly taller than square, like Vinted */
		overflow: hidden;
		background: #f5f5f5; /* Light gray background */
		pointer-events: none; /* Let parent handle clicks */
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover; /* Cover for consistent grid */
		transition: transform 0.2s ease;
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
	
	.quick-message {
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
		position: relative;
		z-index: 10;
	}
	
	.quick-message:hover {
		transform: scale(1.05);
	}
	
	/* Action Buttons Container */
	.action-buttons {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		z-index: 10;
	}
	
	/* Action Button Base Styles - Cleaner, more subtle */
	.action-btn {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		pointer-events: auto;
		color: #262626;
	}
	
	.action-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
	}
	
	/* Like Button */
	.like-btn.liked {
		color: #ed4956;
		background: rgba(255, 255, 255, 0.95);
	}
	
	/* Save Button */
	.save-btn.saved {
		color: #262626;
		background: rgba(255, 255, 255, 0.95);
	}
	
	/* Condition Badge */
	.condition-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		pointer-events: none;
		backdrop-filter: blur(10px);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
		color: #262626;
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