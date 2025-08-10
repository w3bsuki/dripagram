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
		background: white;
		border-radius: 8px; /* Cleaner, less rounded */
		overflow: hidden;
		width: 100%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
		transform: translateY(-2px); /* Slightly more noticeable lift */
		border-color: #d1d5db;
	}
	
	.product-card:active {
		transform: translateY(-1px);
	}
	
	/* Product Info - Cleaner, more compact */
	.product-info {
		padding: 12px; /* Consistent padding */
		display: flex;
		flex-direction: column;
		gap: 8px; /* Slightly more breathing room */
		cursor: pointer;
		min-height: 0;
		background: white;
		transition: background-color 0.2s ease;
	}
	
	.product-info:hover {
		background: #fafbfc; /* Very subtle hover effect */
	}
	
	.product-info:focus {
		outline: 2px solid hsl(var(--primary));
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
		background: linear-gradient(135deg, transparent, hsl(var(--primary) / 0.1), transparent);
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
			border-radius: 8px;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
		}
		
		.product-info {
			padding: 10px; /* Keep readable on mobile */
			gap: 6px;
		}
		
		.product-card:hover {
			box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
			transform: translateY(-1px);
		}
		
		.product-info:focus {
			border-radius: 0 0 8px 8px;
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
	
	/* Dark mode support - now handled by design tokens */
	
</style>