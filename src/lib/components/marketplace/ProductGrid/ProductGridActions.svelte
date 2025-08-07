<script lang="ts">
	import { Heart, ShoppingBag, Eye } from '@lucide/svelte';
	import type { ProductGridActionsProps } from './types';

	let { product, onLikeToggle, onQuickView, onAddToBag }: ProductGridActionsProps = $props();

	function handleLike(e: Event) {
		e.stopPropagation();
		onLikeToggle?.(product);
	}

	function handleQuickView(e: Event) {
		e.stopPropagation();
		onQuickView?.(product);
	}

	function handleAddToBag(e: Event) {
		e.stopPropagation();
		onAddToBag?.(product);
	}
</script>

<!-- Quick Actions -->
<div class="quick-actions">
	<button
		class="action-btn like-btn {product.isLiked ? 'liked' : ''}"
		onclick={handleLike}
		aria-label={product.isLiked ? 'Unlike' : 'Like'}
	>
		<Heart size={18} fill={product.isLiked ? 'currentColor' : 'none'} />
	</button>
	<button class="action-btn" aria-label="Quick view" onclick={handleQuickView}>
		<Eye size={18} />
	</button>
	<button class="action-btn" aria-label="Add to bag" onclick={handleAddToBag}>
		<ShoppingBag size={18} />
	</button>
</div>

<style>
	.quick-actions {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		opacity: 0;
		transform: translateX(10px);
		transition: all 0.3s;
	}

	:global(.product-card:hover) .quick-actions {
		opacity: 1;
		transform: translateX(0);
	}

	.action-btn {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-text-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.action-btn:hover {
		transform: scale(1.1);
		background: white;
	}

	.action-btn.like-btn.liked {
		color: #ff4458;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.quick-actions {
			opacity: 1;
			transform: translateX(0);
		}

		.action-btn {
			width: 32px;
			height: 32px;
		}
	}
</style>