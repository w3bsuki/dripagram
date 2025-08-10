<script lang="ts">
	import { Heart, MessageCircle, ShoppingBag, X } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { FeedProduct } from '$lib/types';

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

	// Lock body scroll when modal is open
	$effect(() => {
		if (isOpen && typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.width = '100%';
			document.body.style.top = `-${window.scrollY}px`;
			
			const scrollY = window.scrollY;
			
			return () => {
				document.body.style.overflow = '';
				document.body.style.position = '';
				document.body.style.width = '';
				document.body.style.top = '';
				window.scrollTo(0, scrollY);
			};
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
			// TODO: Open message with seller
			goto(`/messages?product=${product.id}`);
			onClose();
		}
	}

	function handleWishlist() {
		isWishlisted = !isWishlisted;
		// TODO: API call to add/remove from wishlist
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
		class="modal-wrapper"
		transition:fade={{ duration: 150 }}
	>
		<div 
			class="modal-overlay"
			onclick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="quick-view-title"
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
								<span class="meta-item">Size: {product.size}</span>
							{/if}
							{#if product.condition}
								<span class="meta-item">{product.condition}</span>
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
	</div>
{/if}

<style>
	.modal-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 99999;
	}

	.modal-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 20px;
		max-width: 400px;
		width: 100%;
		max-height: 90vh;
		padding: 0;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		overflow-y: auto;
		overflow-x: hidden;
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
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.7);
		transform: scale(1.1);
	}

	/* Product Image */
	.product-image-container {
		width: 100%;
		height: 300px;
		background: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Product Info */
	.product-info {
		padding: 1.25rem 1.25rem 0.75rem;
	}

	.product-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		line-height: 1.3;
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
		gap: 1rem;
		font-size: 0.875rem;
		color: #666;
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
		padding: 0.75rem 1.25rem;
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
		padding: 1.25rem;
	}

	.btn {
		border: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.9375rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
		padding: 0.875rem 1.25rem;
	}

	.btn-message {
		background: #f5f5f5;
		color: #111;
	}

	.btn-message:hover {
		background: #e8e8e8;
		transform: translateY(-1px);
	}

	.btn-wishlist {
		background: #f5f5f5;
		color: #666;
		padding: 0.875rem;
		width: 48px;
	}

	.btn-wishlist:hover {
		background: #ffe5e5;
		color: #ff4458;
	}

	.btn-wishlist.active {
		background: #ff4458;
		color: white;
	}

	.btn-buy {
		background: #111;
		color: white;
	}

	.btn-buy:hover {
		background: #000;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.modal-overlay {
			padding: 0.5rem;
		}

		.modal-content {
			max-width: calc(100% - 2rem);
			max-height: calc(100vh - 4rem);
			margin: 1rem;
		}

		.product-image-container {
			height: 250px;
		}

		.product-info {
			padding: 1rem;
		}

		.product-title {
			font-size: 1rem;
		}

		.product-price {
			font-size: 1.25rem;
		}

		.seller-section {
			padding: 0.75rem 1rem;
		}

		.action-buttons {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.modal-content {
			max-width: calc(100% - 1rem);
			margin: 0.5rem;
		}

		.product-image-container {
			height: 200px;
		}

		.btn {
			font-size: 0.875rem;
			padding: 0.75rem 1rem;
		}

		.btn-wishlist {
			width: 44px;
			padding: 0.75rem;
		}
	}
</style>