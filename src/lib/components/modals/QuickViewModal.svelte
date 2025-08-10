<script lang="ts">
	import { Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
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

	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let isWishlisted = $state(false);

	$effect(() => {
		if (product) {
			currentImageIndex = 0;
			isLiked = product.isLiked || false;
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
		}
	}

	function handleLike() {
		isLiked = !isLiked;
		// TODO: API call to like/unlike
	}

	function handleWishlist() {
		isWishlisted = !isWishlisted;
		// TODO: API call to add/remove from wishlist
	}

	function nextImage() {
		if (product?.images && currentImageIndex < product.images.length - 1) {
			currentImageIndex++;
		}
	}

	function previousImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		
		switch(e.key) {
			case 'Escape':
				onClose();
				break;
			case 'ArrowLeft':
				if (hasPrevious && onPrevious) onPrevious();
				break;
			case 'ArrowRight':
				if (hasNext && onNext) onNext();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && product}
	<div 
		class="modal-overlay"
		onclick={handleOverlayClick}
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="quick-view-title"
	>
		<div 
			class="modal-content"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Close Button -->
			<button 
				class="close-btn"
				onclick={onClose}
				aria-label="Close modal"
			>
				<X size={24} />
			</button>

			<!-- Navigation Arrows -->
			{#if hasPrevious && onPrevious}
				<button 
					class="nav-btn prev"
					onclick={onPrevious}
					aria-label="Previous product"
				>
					<ChevronLeft size={24} />
				</button>
			{/if}
			
			{#if hasNext && onNext}
				<button 
					class="nav-btn next"
					onclick={onNext}
					aria-label="Next product"
				>
					<ChevronRight size={24} />
				</button>
			{/if}

			<div class="modal-grid">
				<!-- Left: Product Image -->
				<div class="image-section">
					<div class="image-container">
						<img 
							src={product.images?.[currentImageIndex] || product.thumbnail_url || '/placeholder.jpg'}
							alt={product.title}
							class="product-image"
						/>
						
						<!-- Image Navigation Dots -->
						{#if product.images && product.images.length > 1}
							<div class="image-dots">
								{#each product.images as _, index}
									<button 
										class="dot {currentImageIndex === index ? 'active' : ''}"
										onclick={() => currentImageIndex = index}
										aria-label="View image {index + 1}"
									/>
								{/each}
							</div>
						{/if}

						<!-- Like Button Overlay -->
						<button 
							class="like-overlay {isLiked ? 'liked' : ''}"
							onclick={handleLike}
							aria-label={isLiked ? 'Unlike' : 'Like'}
						>
							<Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
						</button>
					</div>
				</div>

				<!-- Right: Product Info -->
				<div class="info-section">
					<!-- Seller Info -->
					{#if product.seller}
						<div class="seller-info">
							<img 
								src={product.seller.avatar_url || '/default-avatar.png'}
								alt={product.seller.username}
								class="seller-avatar"
							/>
							<div>
								<div class="seller-name">
									{product.seller.username}
									{#if product.seller.verified}
										<span class="verified-badge">✓</span>
									{/if}
								</div>
								<div class="seller-subtitle">Premium Seller</div>
							</div>
						</div>
					{/if}

					<!-- Product Title & Price -->
					<h2 id="quick-view-title" class="product-title">{product.title}</h2>
					<div class="price-section">
						<span class="price">{product.price} лв</span>
						{#if product.original_price && product.original_price > product.price}
							<span class="original-price">{product.original_price} лв</span>
							<span class="discount">
								-{Math.round((1 - product.price/product.original_price) * 100)}%
							</span>
						{/if}
					</div>

					<!-- Product Details -->
					<div class="product-details">
						{#if product.condition}
							<div class="detail-item">
								<span class="detail-label">Condition:</span>
								<span class="detail-value">{product.condition}</span>
							</div>
						{/if}
						{#if product.size}
							<div class="detail-item">
								<span class="detail-label">Size:</span>
								<span class="detail-value">{product.size}</span>
							</div>
						{/if}
						{#if product.brand}
							<div class="detail-item">
								<span class="detail-label">Brand:</span>
								<span class="detail-value">{product.brand}</span>
							</div>
						{/if}
					</div>

					<!-- Description -->
					{#if product.description}
						<div class="description">
							<p>{product.description.slice(0, 150)}{product.description.length > 150 ? '...' : ''}</p>
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="action-buttons">
						<button 
							class="btn-primary"
							onclick={handleBuyNow}
						>
							<ShoppingBag size={20} />
							Buy Now
						</button>
						<button 
							class="btn-secondary {isWishlisted ? 'wishlisted' : ''}"
							onclick={handleWishlist}
						>
							<Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
							{isWishlisted ? 'Saved' : 'Save'}
						</button>
					</div>

					<!-- View Full Details Link -->
					<a 
						href="/products/{product.id}"
						class="view-details"
						onclick={onClose}
					>
						View Full Details →
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		max-width: 900px;
		width: 100%;
		max-height: 85vh;
		overflow: hidden;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.close-btn:hover {
		background: white;
		transform: scale(1.1);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.nav-btn.prev {
		left: -20px;
	}

	.nav-btn.next {
		right: -20px;
	}

	.nav-btn:hover {
		background: white;
		transform: translateY(-50%) scale(1.1);
	}

	.modal-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100%;
		max-height: 85vh;
	}

	/* Image Section */
	.image-section {
		background: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.image-dots {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		padding: 0.5rem;
		border-radius: 20px;
		backdrop-filter: blur(8px);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.dot.active {
		background: white;
		width: 24px;
		border-radius: 4px;
	}

	.like-overlay {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: #262626;
	}

	.like-overlay.liked {
		color: #ed4956;
	}

	.like-overlay:hover {
		transform: scale(1.1);
		background: white;
	}

	/* Info Section */
	.info-section {
		padding: 2rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.seller-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-name {
		font-weight: 600;
		font-size: 0.9375rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.verified-badge {
		color: #1d9bf0;
		font-size: 0.875rem;
	}

	.seller-subtitle {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.product-title {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
		margin: 0;
	}

	.price-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.price {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
	}

	.original-price {
		font-size: 1.25rem;
		color: #9ca3af;
		text-decoration: line-through;
	}

	.discount {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.product-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	.detail-label {
		color: #6b7280;
		min-width: 80px;
	}

	.detail-value {
		color: #111827;
		font-weight: 500;
	}

	.description {
		color: #4b5563;
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		margin-top: auto;
	}

	.btn-primary,
	.btn-secondary {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.9375rem;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background: #1d4ed8;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #e5e7eb;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.btn-secondary.wishlisted {
		background: #fef2f2;
		color: #dc2626;
		border-color: #fecaca;
	}

	.view-details {
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.2s;
	}

	.view-details:hover {
		color: #2563eb;
		text-decoration: underline;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.modal-content {
			max-height: 90vh;
		}

		.modal-grid {
			grid-template-columns: 1fr;
			grid-template-rows: 60% 40%;
		}

		.nav-btn {
			display: none;
		}

		.info-section {
			padding: 1.5rem;
			gap: 1rem;
		}

		.product-title {
			font-size: 1.25rem;
		}

		.price {
			font-size: 1.5rem;
		}

		.action-buttons {
			position: sticky;
			bottom: 0;
			background: white;
			padding: 1rem 0 0;
			margin-top: 1rem;
			border-top: 1px solid #e5e7eb;
		}
	}

	@media (max-width: 480px) {
		.modal-overlay {
			padding: 0;
		}

		.modal-content {
			border-radius: 16px 16px 0 0;
			max-height: 95vh;
			position: fixed;
			bottom: 0;
			max-width: 100%;
		}

		.close-btn {
			background: rgba(0, 0, 0, 0.5);
			color: white;
		}

		.modal-grid {
			grid-template-rows: 50% 50%;
		}
	}
</style>