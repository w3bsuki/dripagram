<script lang="ts">
	import { goto } from '$app/navigation';
	import { Heart, Star } from 'lucide-svelte';
	
	// Product type - using any for now since database structure is unclear
	type Product = any;

	interface Props {
		product: Product;
		onclick?: () => void;
	}

	let { product, onclick }: Props = $props();

	let isWishlisted = $state(product.isWishlisted || false);

	function handleClick(e?: MouseEvent | KeyboardEvent) {
		// Don't navigate if clicking on interactive elements
		if (e && 'target' in e && (e.target as HTMLElement).closest('button')) {
			return;
		}
		
		if (onclick) {
			onclick();
		} else {
			window.scrollTo(0, 0);
			goto(`/products/${product.id}`);
		}
	}

	async function handleWishlistClick(e: MouseEvent) {
		e.stopPropagation();
		
		// Optimistic update
		const previousState = isWishlisted;
		isWishlisted = !isWishlisted;
		
		try {
			const response = await fetch(`/api/products/${product.id}/wishlist`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			if (!response.ok) {
				throw new Error('Failed to toggle wishlist');
			}
			
			const result = await response.json();
			isWishlisted = result.wishlisted;
			
		} catch (error) {
			// Revert on error
			isWishlisted = previousState;
			console.error('Failed to toggle wishlist:', error);
		}
	}
	
	// Helper to get seller initials
	function getSellerInitials(name: string) {
		if (!name) return 'U';
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}
</script>

<div 
	class="product-card"
	data-product-id={product.id}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	aria-label="View {product.title}"
>
	<!-- Image section with overlays -->
	<div class="image-container">
		<img 
			src={product.thumbnail_url || product.images?.[0]?.url || product.images?.[0] || product.image_url || '/placeholder.jpg'} 
			alt={product.title}
			class="product-image"
			loading="lazy"
		/>
		
		<!-- Status tag (top-left) -->
		{#if product.condition === 'like-new' || product.condition === 'new'}
			<div class="status-tag">
				{product.condition === 'new' ? 'НОВО' : 'КАТО НОВО'}
			</div>
		{/if}
		
		<!-- Price tag (top-right) -->
		<div class="price-tag">
			{product.price} лв
		</div>
	</div>
	
	<!-- Content section -->
	<div class="content-section">
		<!-- Title and heart row -->
		<div class="title-row">
			<h3 class="title">{product.title || 'Untitled'}</h3>
			<button 
				class="heart-button"
				class:wishlisted={isWishlisted}
				onclick={handleWishlistClick}
				aria-label="Add to wishlist"
			>
				<Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
			</button>
		</div>
		
		<!-- Tags row -->
		<div class="tags-row">
			{#if product.brand}
				<span class="brand-tag">{product.brand}</span>
			{/if}
			{#if product.size}
				<span class="size-tag">{product.size}</span>
			{/if}
		</div>
		
		<!-- Seller info row -->
		<div class="seller-row">
			<div class="seller-info">
				{#if product.seller?.avatar_url}
					<img 
						src={product.seller.avatar_url} 
						alt={product.seller.username}
						class="seller-avatar"
					/>
				{:else}
					<div class="seller-avatar-placeholder">
						{getSellerInitials(product.seller?.username || 'U')}
					</div>
				{/if}
				<span class="seller-name">{product.seller?.username || 'tintin'}</span>
				<div class="seller-rating">
					<div class="stars">
						<Star size={12} fill="currentColor" />
						<Star size={12} fill="currentColor" />
						<Star size={12} fill="currentColor" />
						<Star size={12} fill="currentColor" />
						<Star size={12} fill={product.seller?.rating >= 4.5 ? 'currentColor' : 'none'} />
					</div>
					<span class="rating-text">4.5 ({product.seller?.review_count || 52})</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.product-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		width: 100%;
		transition: all 0.15s ease;
		display: flex;
		flex-direction: column;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		position: relative;
		outline: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		text-align: left;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	.product-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
	}
	
	.product-card:active {
		transform: translateY(-1px);
	}
	
	/* Image container with overlays */
	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: #f9fafb;
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	/* Status tag (top-left) */
	.status-tag {
		position: absolute;
		top: 8px;
		left: 8px;
		background: #14b8a6;
		color: white;
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}
	
	/* Price tag (top-right) */
	.price-tag {
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(17, 24, 39, 0.85);
		color: white;
		font-size: 14px;
		font-weight: 700;
		padding: 5px 10px;
		border-radius: 6px;
	}
	
	/* Content section */
	.content-section {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex-grow: 1;
	}
	
	/* Title and heart row */
	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 4px;
	}
	
	.title {
		font-size: 15px;
		font-weight: 600;
		color: #111827;
		margin: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.3;
	}
	
	.heart-button {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: #9ca3af;
		transition: all 0.15s ease;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.heart-button:hover {
		background: #f3f4f6;
	}
	
	.heart-button.wishlisted {
		color: #ef4444;
	}
	
	/* Tags row */
	.tags-row {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	
	.brand-tag {
		background: #dbeafe;
		color: #1e40af;
		font-size: 11px;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: 12px;
	}
	
	.size-tag {
		background: #f3f4f6;
		color: #374151;
		font-size: 11px;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: 12px;
	}
	
	/* Seller info row */
	.seller-row {
		margin-top: auto;
		padding-top: 10px;
		border-top: 1px solid #f3f4f6;
	}
	
	.seller-info {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}
	
	.seller-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}
	
	.seller-avatar-placeholder {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #a78bfa;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 700;
		flex-shrink: 0;
	}
	
	.seller-name {
		font-size: 12px;
		font-weight: 500;
		color: #374151;
		flex-shrink: 0;
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.seller-rating {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
	}
	
	.stars {
		display: flex;
		align-items: center;
		gap: 1px;
		color: #fbbf24;
		flex-shrink: 0;
	}
	
	.rating-text {
		font-size: 11px;
		color: #6b7280;
		white-space: nowrap;
	}
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.product-card {
			border-radius: 8px;
			border: 0.5px solid #e5e7eb;
		}
		
		.content-section {
			padding: 8px;
			gap: 6px;
		}
		
		.title {
			font-size: 13px;
			-webkit-line-clamp: 1;
		}
		
		.price-tag {
			font-size: 12px;
			padding: 3px 6px;
			top: 6px;
			right: 6px;
		}
		
		.status-tag {
			font-size: 9px;
			padding: 2px 5px;
			top: 6px;
			left: 6px;
			border-radius: 4px;
		}
		
		.tags-row {
			gap: 4px;
		}
		
		.brand-tag,
		.size-tag {
			font-size: 10px;
			padding: 2px 6px;
		}
		
		.seller-row {
			padding-top: 6px;
		}
		
		.seller-info {
			gap: 4px;
		}
		
		.seller-avatar,
		.seller-avatar-placeholder {
			width: 20px;
			height: 20px;
			font-size: 9px;
		}
		
		.seller-name {
			font-size: 11px;
			max-width: 60px;
		}
		
		.seller-rating {
			gap: 2px;
		}
		
		.stars {
			gap: 0;
		}
		
		.rating-text {
			font-size: 10px;
		}
		
		.heart-button {
			padding: 2px;
		}
	}
	
	@media (prefers-reduced-motion: reduce) {
		.product-card {
			transition: none;
		}
		
		.product-card:hover {
			transform: none;
		}
	}
</style>