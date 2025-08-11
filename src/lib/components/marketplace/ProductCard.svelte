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

	let isSaved = $state(false);
	let isHovered = $state(false);

	function handleClick() {
		if (onclick) {
			onclick();
		} else {
			// Ensure we always scroll to top when navigating
			window.scrollTo(0, 0);
			goto(`/products/${product.id}`);
		}
	}

	async function handleLikeClick(e: MouseEvent) {
		e.stopPropagation();
		
		// Optimistic update
		const previousState = { ...likeState };
		likeState = toggleLikeState(likeState);
		
		try {
			// Call the new like API endpoint
			const response = await fetch(`/api/products/${product.id}/like`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to toggle like');
			}
			
			// Update with server response
			likeState = {
				isLiked: result.liked,
				likeCount: result.likeCount,
				isAnimating: true
			};
			
		} catch (error) {
			// Revert optimistic update on error
			likeState = previousState;
			console.error('Failed to toggle like:', error);
			
			// You could show a toast notification here
			// showToast('Failed to update like', 'error');
		}
	}

	async function handleSaveClick(e: MouseEvent) {
		e.stopPropagation();
		
		// Optimistic update
		const previousSaved = isSaved;
		isSaved = !isSaved;
		
		try {
			// Call the new save API endpoint
			const response = await fetch(`/api/products/${product.id}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to toggle save');
			}
			
			// Update with server response
			isSaved = result.saved;
			
		} catch (error) {
			// Revert optimistic update on error
			isSaved = previousSaved;
			console.error('Failed to toggle save:', error);
			
			// You could show a toast notification here
			// showToast('Failed to update save', 'error');
		}
	}

	async function handleQuickMessage(e: MouseEvent) {
		e.stopPropagation();
		
		// Ensure we have seller information
		if (!product.seller?.id) {
			console.error('No seller information available');
			return;
		}
		
		try {
			// Create or find existing conversation with seller
			const response = await fetch('/api/messages/conversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					otherUserId: product.seller.id,
					productId: product.id
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to create conversation');
			}
			
			const { conversationId } = await response.json();
			
			// Navigate to the specific conversation
			goto(`/messages/${conversationId}`);
			
		} catch (error) {
			console.error('Failed to start conversation:', error);
			// Fallback to general messages page
			goto('/messages');
		}
	}
</script>

<button 
	class="product-card"
	data-product-id={product.id}
	onmouseenter={() => isHovered = true}
	onmouseleave={() => isHovered = false}
	onclick={handleClick}
	type="button"
	aria-label="View {product.title}"
>
	<ProductMedia 
		{product}
		{likeState}
		{isSaved}
		{isHovered}
		onclick={handleClick}
		onLikeClick={handleLikeClick}
		onSaveClick={handleSaveClick}
		onQuickMessage={handleQuickMessage}
	/>
	
	<!-- Redesigned Product Info -->
	<div class="product-info">
		<!-- Title at top, bigger -->
		<div class="product-title">{product.title || 'Untitled'}</div>
		
		<!-- Category/Brand/Size info -->
		<div class="product-meta">
			{#if product.brand}
				<span class="meta-tag">{product.brand}</span>
			{/if}
			{#if product.size}
				<span class="meta-tag">Size {product.size}</span>
			{/if}
			{#if product.category_display || product.category}
				<span class="meta-tag">{product.category_display || product.category}</span>
			{/if}
		</div>
		
		<!-- Bottom row: seller with avatar on left, price on right -->
		<div class="bottom-row">
			<div class="product-seller">
				<img 
					src={product.seller?.avatar_url || product.seller?.avatar || `https://ui-avatars.com/api/?name=${product.seller?.username || 'U'}&background=random&size=20`} 
					alt={product.seller?.username || 'Seller'}
					class="seller-avatar"
				/>
				<span class="seller-name">{product.seller?.username || 'Anonymous'}</span>
				{#if product.seller?.verified || product.seller?.seller_verified}
					<span class="verified-badge">✓</span>
				{/if}
			</div>
			<div class="product-price">€{product.price}</div>
		</div>
	</div>
</button>

<style>
	.product-card {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		width: 100%;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		border: none;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
		position: relative;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		cursor: pointer;
		text-align: left;
		padding: 0;
		/* Typography baseline */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.product-card:focus {
		outline: none;
	}

	
	.product-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}
	
	.product-card:active {
		transform: translateY(-1px);
	}
	
	/* Product Info - Actually readable */
	.product-info {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: white;
		pointer-events: none;
		position: relative;
		flex-shrink: 0;
		min-height: 120px;
	}
	
	/* Title - Actually big and readable */
	.product-title {
		font-size: 18px;
		font-weight: 600;
		color: #111;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		white-space: normal;
		line-height: 1.3;
	}
	
	/* Meta tags - Visible badges */
	.product-meta {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		align-items: center;
	}
	
	.meta-tag {
		font-size: 13px;
		padding: 4px 8px;
		background: #f0f0f0;
		color: #444;
		border-radius: 6px;
		font-weight: 500;
		white-space: nowrap;
	}
	
	/* Bottom row - Actually visible */
	.bottom-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
	}
	
	.product-seller {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.seller-avatar {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #f0f0f0;
		flex-shrink: 0;
	}
	
	.seller-name {
		font-size: 14px;
		font-weight: 500;
		color: #555;
	}
	
	.verified-badge {
		width: 16px;
		height: 16px;
		background: #3897f0;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 700;
		flex-shrink: 0;
	}
	
	/* Price - Big and bold */
	.product-price {
		font-size: 20px;
		font-weight: 700;
		color: #111;
	}
	
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.product-card {
			border-radius: 10px;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		}
		
		.product-info {
			padding: 10px;
			min-height: 100px;
		}
		
		.product-title {
			font-size: 16px;
		}
		
		.product-price {
			font-size: 18px;
		}
		
		.meta-tag {
			font-size: 11px;
			padding: 3px 6px;
		}
		
		.seller-avatar {
			width: 24px;
			height: 24px;
		}
		
		.seller-name {
			font-size: 13px;
		}
		
		.product-card:hover {
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
			transform: translateY(-1px);
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