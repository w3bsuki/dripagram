<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import ProductGridActions from './ProductGridActions.svelte';
	import type { ProductGridCardProps } from './types';

	let { product, onProductClick, onLikeToggle, onQuickView, onAddToBag }: ProductGridCardProps = $props();

	function handleCardClick() {
		onProductClick?.(product.id);
	}
</script>

<button class="product-card" onclick={handleCardClick} aria-label="View {product.title}">
	<div class="product-image-wrapper">
		<img src={product.image} alt={product.title} class="product-image" loading="lazy" />

		<ProductGridActions 
			{product} 
			{onLikeToggle}
			{onQuickView} 
			{onAddToBag} 
		/>

		<!-- Seller Badge -->
		<div class="seller-badge">
			<img src={product.seller.avatar} alt={product.seller.username} />
			{#if product.seller.verified}
				<span class="verified">✓</span>
			{/if}
		</div>
	</div>

	<div class="product-info">
		<div class="product-header">
			<h3 class="product-title">{product.title}</h3>
			<span class="product-price">{product.price} лв</span>
		</div>

		<div class="product-meta">
			{#if product.brand}
				<span class="meta-tag">{product.brand}</span>
			{/if}
			{#if product.size}
				<span class="meta-tag">Size {product.size}</span>
			{/if}
			{#if product.condition}
				<span class="meta-tag condition">{product.condition}</span>
			{/if}
		</div>

		<div class="product-footer">
			<span class="seller-name">@{product.seller.username}</span>
			<span class="likes-count">
				<Heart size={14} />
				{product.likes}
			</span>
		</div>
	</div>
</button>

<style>
	.product-card {
		background: var(--color-background);
		border: none;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		transition: all 0.3s;
		cursor: pointer;
		padding: 0;
		width: 100%;
		text-align: left;
	}

	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.product-image-wrapper {
		position: relative;
		aspect-ratio: 4/5;
		overflow: hidden;
		background: var(--color-gray-100);
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.product-card:hover .product-image {
		transform: scale(1.05);
	}

	.seller-badge {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		display: flex;
		align-items: center;
	}

	.seller-badge img {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.seller-badge .verified {
		position: absolute;
		bottom: -2px;
		right: -2px;
		background: var(--color-success);
		color: white;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 700;
		border: 2px solid white;
	}

	.product-info {
		padding: 0.75rem;
	}

	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.product-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.product-price {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-primary);
		white-space: nowrap;
	}

	.product-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.meta-tag {
		font-size: 0.625rem;
		padding: 2px 6px;
		background: var(--color-gray-100);
		color: var(--color-text-secondary);
		border-radius: 4px;
		white-space: nowrap;
	}

	.meta-tag.condition {
		background: var(--color-success-light);
		color: var(--color-success);
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.seller-name {
		font-weight: 500;
	}

	.likes-count {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.likes-count :global(svg) {
		color: var(--color-text-muted);
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.product-info {
			padding: 0.5rem;
		}

		.product-title {
			font-size: 0.75rem;
		}

		.product-price {
			font-size: 0.875rem;
		}

		.meta-tag {
			font-size: 0.5625rem;
		}
	}
</style>