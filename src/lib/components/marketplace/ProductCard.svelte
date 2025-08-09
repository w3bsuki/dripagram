<script lang="ts">
	import { goto } from '$app/navigation';
	import { toggleLikeState, type LikeState } from '$lib/utils/likeLogic';
	import ProductMedia from './ProductMedia.svelte';
	import ProductSeller from './ProductSeller.svelte';
	import ProductInfo from './ProductInfo.svelte';
	import ProductStats from './ProductStats.svelte';

	// Product type - using any for now since database structure is unclear
	type Product = any;

	interface Props {
		product: Product;
		onclick?: () => void;
	}

	let { product, onclick }: Props = $props();

	let likeState = $state<LikeState>({
		isLiked: false,
		likeCount: product.like_count || product.likes?.[0]?.count || 0
	});

	let isHovered = $state(false);

	function handleClick() {
		if (onclick) {
			onclick();
		} else {
			goto(`/products/${product.id}`);
		}
	}

	function handleLikeClick(e: MouseEvent) {
		e.stopPropagation();
		likeState = toggleLikeState(likeState);
		// Note: In production, you'd also call handleLikeAction() to sync with database
	}

	function handleQuickMessage(e: MouseEvent) {
		e.stopPropagation();
		// Quick message to seller
		goto(`/messages?listing=${product.id}`);
	}
</script>

<div 
	class="product-card"
	data-product-id={product.id}
	onmouseenter={() => isHovered = true}
	onmouseleave={() => isHovered = false}
	role="article"
>
	<ProductMedia 
		{product}
		{likeState}
		{isHovered}
		onclick={handleClick}
		onLikeClick={handleLikeClick}
		onQuickMessage={handleQuickMessage}
	/>
	
	<!-- Product Info (also clickable) -->
	<div 
		class="product-info"
		onclick={handleClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
	>
		<ProductSeller seller={product.seller} />
		<ProductInfo {product} />
		<ProductStats {product} {likeState} />
	</div>
</div>

<style>
	.product-card {
		background: var(--color-background);
		border-radius: 12px;
		overflow: hidden;
		width: 100%;
		transition: all 200ms ease;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
	}
	
	.product-card:hover {
		/* Remove transform to prevent stacking issues in grid */
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		z-index: var(--z-behind);
		transform: translateY(-2px);
	}
	
	/* Product Info */
	.product-info {
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		cursor: pointer;
		min-height: 0; /* Prevent expansion */
	}
	
	.product-info:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.product-info {
			padding: 6px;
			gap: 3px;
		}
	}
</style>