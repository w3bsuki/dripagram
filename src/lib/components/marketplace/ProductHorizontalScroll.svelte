<script lang="ts">
	import { goto } from '$app/navigation';
	import { toggleLikeState, type LikeState } from '$lib/utils/likeLogic';
	import { Heart, MessageCircle } from '@lucide/svelte';
	import type { FeedProduct } from '$lib/types';
	
	interface Props {
		products: FeedProduct[];
		title?: string;
		showTitle?: boolean;
	}
	
	let { products = [], title = 'Products', showTitle = true }: Props = $props();
	
	function handleProductClick(productId: string) {
		goto(`/products/${productId}`);
	}
	
	function handleQuickMessage(e: MouseEvent, product: FeedProduct) {
		e.stopPropagation();
		goto(`/messages?listing=${product.id}`);
	}
	
	function handleQuickLike(e: MouseEvent, product: FeedProduct) {
		e.stopPropagation();
		// TODO: Implement quick like functionality
		console.log('Quick like for product:', product.id);
	}
	
	function formatPrice(price: number): string {
		return new Intl.NumberFormat('bg-BG', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(price);
	}
</script>

{#if products.length > 0}
	<section class="horizontal-scroll-section">
		{#if showTitle}
			<h2 class="section-title">{title}</h2>
		{/if}
		
		<div class="horizontal-scroll-container">
			<div class="horizontal-scroll">
				{#each products as product, index (product.id)}
					<div class="product-item" 
						onclick={() => handleProductClick(product.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && handleProductClick(product.id)}
					>
						<div class="product-image-container">
							<img 
								src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'} 
								alt={product.title}
								class="product-image"
								width="150"
								height="150"
								style="aspect-ratio: 1; object-fit: cover;"
								loading={index < 3 ? 'eager' : 'lazy'}
							/>
							
							<!-- Quick actions overlay -->
							<div class="quick-actions">
								<button 
									class="quick-action-btn heart-btn"
									onclick={(e) => handleQuickLike(e, product)}
									aria-label="Like product"
								>
									<Heart size={16} fill={product.isLiked ? 'currentColor' : 'none'} />
								</button>
								<button 
									class="quick-action-btn message-btn"
									onclick={(e) => handleQuickMessage(e, product)}
									aria-label="Message seller"
								>
									<MessageCircle size={16} />
								</button>
							</div>
						</div>
						
						<div class="product-info">
							<div class="product-meta">
								<span class="product-price">{formatPrice(product.price)} лв</span>
								{#if product.like_count}
									<span class="product-likes">{product.like_count} likes</span>
								{/if}
							</div>
							<h3 class="product-title">{product.title}</h3>
							{#if product.seller?.username}
								<p class="seller-name">@{product.seller.username}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.horizontal-scroll-section {
		width: 100%;
		margin: 0;
		background: #ffffff;
	}
	
	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #262626;
		margin: 0 0 16px 0;
		padding: 0 16px;
		line-height: 1.2;
	}
	
	.horizontal-scroll-container {
		position: relative;
		overflow-x: hidden;
	}
	
	.horizontal-scroll {
		display: flex;
		gap: 12px;
		padding: 0 16px;
		overflow-x: auto;
		scroll-behavior: smooth;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-snap-type: x mandatory;
		/* iOS momentum scrolling */
		-webkit-overflow-scrolling: touch;
	}
	
	.horizontal-scroll::-webkit-scrollbar {
		display: none;
	}
	
	.product-item {
		flex-shrink: 0;
		width: 140px;
		cursor: pointer;
		background: #ffffff;
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		scroll-snap-align: start;
		border: 1px solid #f0f0f0;
	}
	
	.product-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
		border-color: #e0e0e0;
	}
	
	.product-item:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.product-image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: #f8f8f8;
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}
	
	.product-item:hover .product-image {
		transform: scale(1.05);
	}
	
	.quick-actions {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	
	.product-item:hover .quick-actions {
		opacity: 1;
	}
	
	.quick-action-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.9);
		color: #262626;
	}
	
	.quick-action-btn:hover {
		transform: scale(1.1);
		background: rgba(255, 255, 255, 1);
	}
	
	.heart-btn.liked {
		color: #ff3040;
		background: rgba(255, 48, 64, 0.1);
	}
	
	.message-btn:hover {
		color: #3b82f6;
		background: rgba(59, 130, 246, 0.1);
	}
	
	.product-info {
		padding: 12px;
	}
	
	.product-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	
	.product-price {
		font-size: 0.875rem;
		font-weight: 600;
		color: #262626;
	}
	
	.product-likes {
		font-size: 0.75rem;
		color: #8e8e8e;
	}
	
	.product-title {
		font-size: 0.8125rem;
		font-weight: 400;
		color: #262626;
		margin: 0 0 4px 0;
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.seller-name {
		font-size: 0.75rem;
		color: #8e8e8e;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	/* Mobile optimizations */
	@media (max-width: 640px) {
		.product-item {
			width: 120px;
		}
		
		.section-title {
			font-size: 1rem;
			padding: 0 12px;
		}
		
		.horizontal-scroll {
			padding: 0 12px;
			gap: 10px;
		}
		
		.product-info {
			padding: 10px;
		}
		
		.product-title {
			font-size: 0.75rem;
		}
		
		.product-price {
			font-size: 0.8125rem;
		}
	}
	
	/* Tablet and larger */
	@media (min-width: 768px) {
		.product-item {
			width: 160px;
		}
		
		.section-title {
			font-size: 1.25rem;
			padding: 0 24px;
		}
		
		.horizontal-scroll {
			padding: 0 24px;
			gap: 16px;
		}
	}
	
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.product-item {
			transition: none;
		}
		
		.product-image {
			transition: none;
		}
		
		.horizontal-scroll {
			scroll-behavior: auto;
		}
	}
</style>