<script lang="ts">
	import { Heart, Eye, MessageCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	
	// Product type - using any for now since database structure is unclear
	type Product = any;
	
	interface Props {
		product: Product;
		onclick?: () => void;
	}
	
	let { product, onclick }: Props = $props();
	
	let isLiked = $state(false);
	let isHovered = $state(false);
	
	let imageUrl = $derived(
		product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'
	);
	
	let price = $derived(
		new Intl.NumberFormat('bg-BG', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(product.price || 0)
	);
	
	let likeCount = $state(
		product.like_count || product.likes?.[0]?.count || 0
	);
	
	let viewCount = $derived(product.view_count || 0);
	
	function handleClick() {
		if (onclick) {
			onclick();
		} else {
			goto(`/products/${product.id}`);
		}
	}
	
	function handleLikeClick(e: MouseEvent) {
		e.stopPropagation();
		isLiked = !isLiked;
		// Update like count when toggled
		if (isLiked) {
			likeCount = (likeCount || 0) + 1;
		} else {
			likeCount = Math.max(0, (likeCount || 0) - 1);
		}
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
	<!-- Image Container (clickable) -->
	<div 
		class="image-container"
		onclick={handleClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
		aria-label="View {product.title}"
	>
		<img 
			src={imageUrl} 
			alt={product.title} 
			loading="lazy"
			class="product-image"
		/>
		
		<!-- Overlay Actions (visible on hover) -->
		{#if isHovered}
			<div class="overlay-actions">
				<button 
					class="action-btn quick-message"
					onclick={handleQuickMessage}
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
			class="like-btn {isLiked ? 'liked' : ''}"
			onclick={handleLikeClick}
			aria-label={isLiked ? 'Unlike' : 'Like'}
			type="button"
		>
			<Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
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
	
	<!-- Product Info (also clickable) -->
	<div 
		class="product-info"
		onclick={handleClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
	>
		<!-- Seller Info -->
		{#if product.seller}
			<div class="seller-info">
				<img 
					src={product.seller.avatar_url || product.seller.avatar || '/default-avatar.jpg'} 
					alt={product.seller.username || 'Seller'}
					class="seller-avatar"
				/>
				<span class="seller-name">
					{product.seller.username || product.seller.full_name || 'Anonymous'}
				</span>
				{#if product.seller.verified || product.seller.seller_verified}
					<span class="verified-badge">✓</span>
				{/if}
			</div>
		{/if}
		
		<!-- Title -->
		<h3 class="product-title">{product.title || 'Untitled'}</h3>
		
		<!-- Meta Info -->
		<div class="meta-info">
			{#if product.size}
				<span class="meta-tag">Size {product.size}</span>
			{/if}
			{#if product.brand}
				<span class="meta-tag">{product.brand}</span>
			{/if}
		</div>
		
		<!-- Stats & Price Row -->
		<div class="stats-price-row">
			<div class="stats">
				<span class="stat">
					<Heart size={14} />
					{likeCount}
				</span>
				<span class="stat">
					<Eye size={14} />
					{viewCount}
				</span>
			</div>
			<div class="price-container">
				<span class="price">{price} лв</span>
				{#if product.original_price && product.original_price > product.price}
					<span class="original-price">
						{new Intl.NumberFormat('bg-BG').format(product.original_price)} лв
					</span>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.product-card {
		background: var(--color-background);
		border-radius: 8px;
		overflow: hidden;
		width: 100%;
		transition: all 200ms ease;
		display: flex;
		flex-direction: column;
	}
	
	.product-card:hover {
		/* Remove transform to prevent stacking issues in grid */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1;
	}
	
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
	
	.product-card:hover .product-image {
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
		font-size: 13px;
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
		z-index: 1;
	}
	
	.like-btn:hover {
		transform: scale(1.1);
	}
	
	.like-btn.liked {
		color: #ef4444;
		border-color: #ef4444;
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
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		pointer-events: none;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.9);
	}
	
	.condition-badge.new_with_tags,
	.condition-badge.new_without_tags {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}
	
	.condition-badge.like_new {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.condition-badge.very_good,
	.condition-badge.good {
		background: #f59e0b;
		color: white;
		border-color: #f59e0b;
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
	
	/* Seller Info */
	.seller-info {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
	}
	
	.seller-avatar {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--color-border);
	}
	
	.seller-name {
		color: var(--color-muted-foreground);
		font-weight: 500;
	}
	
	.verified-badge {
		background: #3b82f6;
		color: white;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: bold;
	}
	
	/* Title */
	.product-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		line-height: 1.2;
	}
	
	/* Stats & Price Row */
	.stats-price-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: auto;
		padding-top: 6px;
		border-top: 1px solid var(--color-border);
	}
	
	.stats {
		display: flex;
		gap: 12px;
	}
	
	.price-container {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	
	.price {
		font-size: 15px;
		font-weight: 700;
		color: var(--color-foreground);
	}
	
	.original-price {
		font-size: 11px;
		color: var(--color-muted-foreground);
		text-decoration: line-through;
	}
	
	/* Meta Info */
	.meta-info {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	
	.meta-tag {
		font-size: 11px;
		padding: 2px 6px;
		background: var(--color-secondary);
		color: var(--color-muted-foreground);
		border-radius: 4px;
	}
	
	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		color: var(--color-muted-foreground);
		font-weight: 500;
	}
	
	.stat :global(svg) {
		opacity: 0.7;
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
		.product-info {
			padding: 6px;
			gap: 3px;
		}
		
		.product-title {
			font-size: 12px;
		}
		
		.price {
			font-size: 14px;
		}
		
		.overlay-actions {
			display: none; /* Hide hover actions on mobile */
		}
		
		.stats {
			padding-top: 4px;
			gap: 10px;
		}
		
		.stat {
			font-size: 12px;
		}
	}
</style>