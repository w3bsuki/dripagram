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
		background: #ffffff;
		border-radius: 12px; /* Slightly less rounded for cleaner look */
		overflow: hidden;
		width: 100%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		border: 1px solid oklch(0.95 0 0); /* OKLCH gray */
		box-shadow: 0 1px 2px oklch(0 0 0 / 0.04);
		position: relative;
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.product-card:focus {
		outline: none;
	}

	.product-info {
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.product-info:focus {
		outline: none;
	}
	
	.product-card:hover {
		box-shadow: 0 8px 20px oklch(0 0 0 / 0.08), 0 3px 8px oklch(0 0 0 / 0.04);
		transform: translateY(-1px); /* Subtler lift */
		border-color: oklch(0.88 0 0);
	}
	
	.product-card:active {
		transform: translateY(-1px);
	}
	
	/* Product Info - Cleaner, more compact */
	.product-info {
		padding: 10px 12px; /* Less vertical padding */
		display: flex;
		flex-direction: column;
		gap: 6px; /* Tighter gaps */
		cursor: pointer;
		min-height: 0;
		background: #ffffff;
		transition: background-color 0.2s ease;
	}
	
	.product-info:hover {
		background: #fafafa;
	}
	
	.product-info:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
		border-radius: 0 0 16px 16px;
	}
	
	/* Enhanced interaction states */
	.product-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 16px;
		padding: 1px;
		background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1), transparent);
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.product-card:hover::before {
		opacity: 1;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.product-card {
			border-radius: 12px;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
		}
		
		.product-info {
			padding: 8px 10px; /* Even more compact on mobile */
			gap: 4px;
		}
		
		.product-card:hover {
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
			transform: translateY(-1px);
		}
		
		.product-info:focus {
			border-radius: 0 0 12px 12px;
		}
	}
	
	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.product-card {
			transition: none;
		}
		
		.product-card:hover {
			transform: none;
		}
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.product-card {
			background: #1f2937;
			border-color: #374151;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		}
		
		.product-card:hover {
			box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2);
			border-color: #4b5563;
		}
		
		.product-info {
			background: #1f2937;
		}
		
		.product-info:hover {
			background: #374151;
		}
		
		.product-info:focus {
			outline-color: #60a5fa;
		}
	}
	
</style>