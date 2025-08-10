<script lang="ts">
	import { Heart, MessageCircle, ShoppingBag, X } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { FeedProduct } from '$lib/types';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		product: FeedProduct | null;
		isOpen: boolean;
		onClose: () => void;
		onNext?: () => void;
		onPrevious?: () => void;
		hasNext?: boolean;
		hasPrevious?: boolean;
	}

	let { 
		product, 
		isOpen, 
		onClose,
		onNext,
		onPrevious,
		hasNext = false,
		hasPrevious = false
	}: Props = $props();

	let isWishlisted = $state(false);

	$effect(() => {
		if (product) {
			isWishlisted = product.isSaved || false;
		}
	});

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleBuyNow() {
		if (product) {
			goto(`/products/${product.id}`);
			onClose();
		}
	}

	function handleMessage() {
		if (product) {
			goto(`/messages?product=${product.id}`);
			onClose();
		}
	}

	function handleWishlist() {
		isWishlisted = !isWishlisted;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && product}
	<div 
		class="modal-overlay"
		onclick={handleOverlayClick}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		}}
		transition:fade={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="quick-view-title"
		tabindex="0"
	>
		<div class="modal-content">
			<!-- Close Button -->
			<button 
				class="close-btn"
				onclick={onClose}
				aria-label="Close"
			>
				<X size={20} />
			</button>

			<!-- Product Image -->
			<div class="product-image-container">
				<img 
					src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'}
					alt={product.title}
					class="product-image"
				/>
			</div>

			<!-- Product Info -->
			<div class="product-info">
				<h3 id="quick-view-title" class="product-title">{product.title}</h3>
				<div class="product-price">{product.price} лв</div>
				
				{#if product.size || product.condition}
					<div class="product-meta">
						{#if product.size}
							<span class="meta-item">{m['product.size']()}: {product.size}</span>
						{/if}
						{#if product.condition}
							<span class="meta-item">
								{#if product.condition === 'new_with_tags'}
									{m['conditions.new_with_tags']()}
								{:else if product.condition === 'new_without_tags'}
									{m['conditions.new_without_tags']()}
								{:else if product.condition === 'like_new'}
									{m['conditions.like_new']()}
								{:else if product.condition === 'very_good'}
									{m['conditions.very_good']()}
								{:else if product.condition === 'good'}
									{m['conditions.good']()}
								{:else if product.condition === 'brand_new'}
									{m['conditions.brand_new']()}
								{:else if product.condition === 'fair'}
									{m['conditions.fair']()}
								{:else if product.condition === 'satisfactory'}
									{m['conditions.satisfactory']()}
								{:else}
									{product.condition.replace('_', ' ')}
								{/if}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Seller Info -->
			{#if product.seller}
				<div class="seller-section">
					<img 
						src={product.seller.avatar_url || '/default-avatar.png'}
						alt={product.seller.username}
						class="seller-avatar"
					/>
					<div class="seller-info">
						<div class="seller-name">
							{product.seller.username}
							{#if product.seller.verified}
								<svg class="verified-icon" width="16" height="16" viewBox="0 0 16 16" fill="#1DA1F2">
									<path d="M8 0L9.5 1.5L11.5 1L12 3L14 3.5L14 5.5L15.5 7L14 8.5L14 10.5L12 11L11.5 13L9.5 12.5L8 14L6.5 12.5L4.5 13L4 11L2 10.5L2 8.5L0.5 7L2 5.5L2 3.5L4 3L4.5 1L6.5 1.5L8 0Z"/>
									<path d="M6.5 9.5L4.5 7.5L5.2 6.8L6.5 8.1L10.3 4.3L11 5L6.5 9.5Z" fill="white"/>
								</svg>
							{/if}
						</div>
						<div class="seller-rating">⭐ 4.8 (234 reviews)</div>
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="action-buttons">
				<button 
					class="btn btn-message"
					onclick={handleMessage}
				>
					<MessageCircle size={18} />
					Message
				</button>
				<button 
					class="btn btn-wishlist {isWishlisted ? 'active' : ''}"
					onclick={handleWishlist}
				>
					<Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
				</button>
				<button 
					class="btn btn-buy"
					onclick={handleBuyNow}
				>
					<ShoppingBag size={18} />
					Buy Now
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: var(--z-highest);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem 1rem;
		padding-top: 15vh;
	}

	.modal-content {
		background: white;
		border-radius: 20px;
		width: 100%;
		max-width: 400px;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		outline: none;
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		color: white;
		border: none;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
	}

	/* Product Image */
	.product-image-container {
		width: 100%;
		height: 250px;
		background: #f8f8f8;
		overflow: hidden;
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Product Info */
	.product-info {
		padding: 1rem;
	}

	.product-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: #111;
	}

	.product-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111;
		margin-bottom: 0.5rem;
	}

	.product-meta {
		display: flex;
		gap: 0.5rem;
	}

	.meta-item {
		padding: 0.25rem 0.75rem;
		background: #f5f5f5;
		border-radius: 12px;
		font-size: 0.8125rem;
	}

	/* Seller Section */
	.seller-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}

	.seller-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-info {
		flex: 1;
	}

	.seller-name {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 600;
		font-size: 0.9375rem;
		color: #111;
	}

	.verified-icon {
		width: 16px;
		height: 16px;
	}

	.seller-rating {
		font-size: 0.8125rem;
		color: #666;
		margin-top: 0.125rem;
	}

	/* Action Buttons */
	.action-buttons {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.75rem;
		padding: 1rem;
	}

	.btn {
		border: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
		padding: 0.75rem;
		outline: none;
	}

	.btn:focus {
		outline: none;
	}

	.btn-message {
		background: #f5f5f5;
		color: #111;
	}

	.btn-wishlist {
		background: #f5f5f5;
		color: #666;
		width: 44px;
	}

	.btn-wishlist.active {
		background: #ff4458;
		color: white;
	}

	.btn-buy {
		background: #111;
		color: white;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.modal-overlay {
			padding: 0.75rem;
			padding-top: 10vh;
		}

		.product-image-container {
			height: 220px;
		}

		.product-title {
			font-size: 1rem;
		}

		.product-price {
			font-size: 1.25rem;
		}
	}

	@media (max-width: 480px) {
		.modal-overlay {
			padding: 0.5rem;
			padding-top: 8vh;
		}

		.product-image-container {
			height: 200px;
		}
	}
</style>