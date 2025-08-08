<script lang="ts">
	import { ArrowLeft, MessageCircle, ShoppingBag, Heart, Eye, Share2, Bookmark, MoreHorizontal } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	
	// Product type - using any for now since database structure is unclear
	type Product = any;
	
	interface Props {
		product: Product;
		relatedProducts?: Product[];
	}
	
	let { product, relatedProducts = [] }: Props = $props();
	
	let currentImageIndex = $state(0);
	let currentUser = $derived($page.data.user);
	
	let images = $derived(
		product.images && product.images.length > 0
			? product.images
			: [product.thumbnail_url || '/placeholder.jpg']
	);
	
	let price = $derived(
		new Intl.NumberFormat('bg-BG', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(product.price)
	);
	
	let isOwnProduct = $derived(currentUser?.id === product.seller_id);
	let isLiked = $state(false);
	let isSaved = $state(false);
	let likeCount = $state(product.like_count || 0);
	let viewCount = $state(product.view_count || 0);
	
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}
	
	function handlePrimaryAction() {
		if (isOwnProduct) {
			goto(`/products/${product.id}/edit`);
		} else {
			// Add to cart logic
			goto('/cart');
		}
	}
	
	function handleMessage() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		goto(`/messages/${product.seller_id}?listing=${product.id}`);
	}
	
	function handleLike() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		isLiked = !isLiked;
		likeCount += isLiked ? 1 : -1;
		// TODO: Save to database
	}
	
	function handleSave() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		isSaved = !isSaved;
		// TODO: Save to database
	}
	
	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: product.title,
				text: `Check out ${product.title} on Driplo`,
				url: window.location.href
			});
		} else {
			// Fallback - copy to clipboard
			navigator.clipboard.writeText(window.location.href);
		}
	}
	
	function handleMore() {
		// More options menu - report, save link, etc.
		// TODO: Implement dropdown menu with options
	}
	
	function handleSellerClick() {
		if (product.seller?.username) {
			goto(`/user/${product.seller.username}`);
		}
	}
	
	function selectImage(index: number) {
		currentImageIndex = index;
	}
	
	// Touch handling for swipe
	let touchStartX = 0;
	let touchEndX = 0;
	
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}
	
	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}
	
	function handleSwipe() {
		if (touchEndX < touchStartX - 50 && currentImageIndex < images.length - 1) {
			currentImageIndex++;
		}
		if (touchEndX > touchStartX + 50 && currentImageIndex > 0) {
			currentImageIndex--;
		}
	}
</script>

<div class="product-page">
	<!-- Header with Breadcrumb -->
	<header class="header">
		<button onclick={goBack} class="header-btn" aria-label="Go back">
			<ArrowLeft size={24} />
		</button>
		
		<nav class="breadcrumb">
			<a href="/" class="breadcrumb-link">Home</a>
			<span class="breadcrumb-separator">/</span>
			{#if product.seller?.username}
				<a href="/user/{product.seller.username}" class="breadcrumb-link">
					{product.seller.username}
				</a>
				<span class="breadcrumb-separator">/</span>
			{/if}
			<span class="breadcrumb-current">{product.title}</span>
		</nav>
		
		<button onclick={handleMore} class="header-btn" aria-label="More options">
			<MoreHorizontal size={24} />
		</button>
	</header>
	
	<!-- Image Carousel -->
	<div 
		class="image-carousel"
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
	>
		<div class="image-container">
			<img 
				src={images[currentImageIndex]} 
				alt="{product.title} - Image {currentImageIndex + 1}" 
				class="product-image"
			/>
		</div>
		
		{#if images.length > 1}
			<div class="image-indicators">
				{#each images as _, index}
					<button
						class="indicator {currentImageIndex === index ? 'active' : ''}"
						onclick={() => selectImage(index)}
						aria-label="View image {index + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
	
	<!-- Content Section -->
	<div class="content">
		<!-- Action Bar -->
		<div class="action-bar">
			<div class="action-left">
				<button 
					onclick={handleLike}
					class="action-btn {isLiked ? 'liked' : ''}"
					aria-label="Like"
				>
					<Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
				</button>
				<button 
					onclick={handleMessage}
					class="action-btn"
					aria-label="Message"
				>
					<MessageCircle size={24} />
				</button>
				<button 
					onclick={handleShare}
					class="action-btn"
					aria-label="Share"
				>
					<Share2 size={24} />
				</button>
			</div>
			<button 
				onclick={handleSave}
				class="action-btn {isSaved ? 'saved' : ''}"
				aria-label="Save"
			>
				<Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
			</button>
		</div>
		
		<!-- Engagement Stats -->
		<div class="engagement">
			<div class="engagement-left">
				<p class="likes">{likeCount} likes</p>
				<p class="views">{viewCount} views</p>
			</div>
			<p class="price-tag">{price} лв</p>
		</div>
		
		<!-- Seller Info -->
		{#if product.seller}
			<div class="seller-section">
				<button 
					class="seller-link"
					onclick={handleSellerClick}
					disabled={!product.seller?.username}
				>
					<div class="seller-avatar">
						{#if product.seller?.avatar_url}
							<img 
								src={product.seller.avatar_url} 
								alt={product.seller.username || 'Seller'}
							/>
						{:else}
							<div class="avatar-placeholder">
								{(product.seller?.username || product.seller?.full_name || 'S')[0].toUpperCase()}
							</div>
						{/if}
					</div>
					<div class="seller-info">
						<p class="seller-name">
							{product.seller?.username || 'Anonymous'}
							{#if product.seller?.verified}
								<span class="verified">✓</span>
							{/if}
						</p>
						<p class="seller-label">Seller</p>
					</div>
				</button>
				<button class="follow-btn">
					Follow
				</button>
			</div>
		{/if}
		
		<!-- Product Info -->
		<div class="product-details">
			<h1 class="product-title">{product.title}</h1>
			
			{#if product.description}
				<div class="product-description">
					<p>{product.description}</p>
				</div>
			{/if}
			
			<!-- Product Specs -->
			<div class="product-specs">
				{#if product.brand}
					<div class="spec">
						<span class="spec-label">Brand</span>
						<span class="spec-value">{product.brand}</span>
					</div>
				{/if}
				{#if product.size}
					<div class="spec">
						<span class="spec-label">Size</span>
						<span class="spec-value">{product.size}</span>
					</div>
				{/if}
				{#if product.condition}
					<div class="spec">
						<span class="spec-label">Condition</span>
						<span class="spec-value">{product.condition}</span>
					</div>
				{/if}
				{#if product.category}
					<div class="spec">
						<span class="spec-label">Category</span>
						<span class="spec-value">{product.category?.name || 'Other'}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Bottom Actions -->
	<div class="bottom-actions">
		{#if isOwnProduct}
			<Button 
				onclick={handlePrimaryAction}
				class="action-button primary"
				variant="default"
			>
				Edit Listing
			</Button>
		{:else}
			<Button
				onclick={handleMessage}
				variant="outline"
				class="action-button secondary"
			>
				<MessageCircle size={20} />
				Message
			</Button>
			<Button 
				onclick={handlePrimaryAction}
				class="action-button primary"
				variant="default"
			>
				<ShoppingBag size={20} />
				Add to Cart
			</Button>
		{/if}
	</div>
</div>

<style>
	.product-page {
		min-height: 100vh;
		background: white;
		padding-bottom: 80px;
	}
	
	/* Header with Breadcrumb */
	.header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: white;
		border-bottom: 1px solid #efefef;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	/* Breadcrumb */
	.breadcrumb {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		overflow-x: auto;
		white-space: nowrap;
		scrollbar-width: none;
	}
	
	.breadcrumb::-webkit-scrollbar {
		display: none;
	}
	
	.breadcrumb-link {
		color: #8e8e8e;
		text-decoration: none;
		transition: color 0.2s;
		flex-shrink: 0;
	}
	
	.breadcrumb-link:hover {
		color: #262626;
	}
	
	.breadcrumb-separator {
		color: #c7c7c7;
		flex-shrink: 0;
	}
	
	.breadcrumb-current {
		color: #262626;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-shrink: 1;
	}
	
	.header-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: transparent;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: #262626;
	}
	
	.header-btn:hover {
		background: #f5f5f5;
	}
	
	.header-btn:active {
		transform: scale(0.95);
	}
	
	/* Image Carousel */
	.image-carousel {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: #f8f8f8;
		overflow: hidden;
	}
	
	.image-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.product-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.image-indicators {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 4px;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 100px;
		backdrop-filter: blur(10px);
	}
	
	.indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
		border: none;
		cursor: pointer;
		transition: all 0.3s;
	}
	
	.indicator.active {
		width: 20px;
		border-radius: 3px;
		background: white;
	}
	
	/* Content */
	.content {
		padding: 0;
	}
	
	/* Action Bar */
	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
	}
	
	.action-left {
		display: flex;
		gap: 16px;
	}
	
	.action-btn {
		background: none;
		border: none;
		color: #262626;
		cursor: pointer;
		padding: 0;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.action-btn:active {
		transform: scale(0.9);
	}
	
	.action-btn.liked {
		color: #ff3040;
		animation: likeAnimation 0.3s ease;
	}
	
	.action-btn.saved {
		color: #262626;
	}
	
	@keyframes likeAnimation {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.2); }
	}
	
	/* Engagement */
	.engagement {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: 0 16px 12px;
	}
	
	.engagement-left {
		flex: 1;
	}
	
	.likes {
		font-size: 14px;
		font-weight: 600;
		color: #262626;
		margin: 0 0 2px 0;
	}
	
	.views {
		font-size: 13px;
		color: #8e8e8e;
		margin: 0;
	}
	
	.price-tag {
		font-size: 22px;
		font-weight: 700;
		color: #262626;
		margin: 0;
	}
	
	/* Seller Section */
	.seller-section {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		width: 100%;
		border-top: 1px solid #efefef;
		border-bottom: 1px solid #efefef;
	}
	
	.seller-link {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: 0;
	}
	
	.seller-link:disabled {
		cursor: default;
	}
	
	.seller-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}
	
	.seller-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 18px;
		font-weight: 600;
	}
	
	.seller-info {
		flex: 1;
	}
	
	.seller-name {
		font-size: 14px;
		font-weight: 600;
		color: #262626;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	
	.verified {
		color: #3897f0;
		font-size: 12px;
	}
	
	.seller-label {
		font-size: 12px;
		color: #8e8e8e;
		margin: 2px 0 0 0;
	}
	
	.follow-btn {
		padding: 6px 16px;
		background: #0095f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.follow-btn:hover {
		background: #0081d6;
	}
	
	/* Product Details */
	.product-details {
		padding: 20px 16px;
	}
	
	.product-title {
		font-size: 16px;
		font-weight: 400;
		color: #262626;
		margin: 0 0 12px 0;
		line-height: 1.4;
	}
	
	.product-description {
		margin: 20px 0;
		padding: 16px 0;
		border-top: 1px solid #efefef;
	}
	
	.product-description p {
		font-size: 14px;
		line-height: 1.6;
		color: #262626;
		margin: 0;
		white-space: pre-wrap;
	}
	
	/* Product Specs */
	.product-specs {
		display: grid;
		gap: 16px;
		margin-top: 24px;
		padding: 20px;
		background: #fafafa;
		border-radius: 12px;
	}
	
	.spec {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.spec-label {
		font-size: 14px;
		color: #8e8e8e;
	}
	
	.spec-value {
		font-size: 14px;
		font-weight: 500;
		color: #262626;
	}
	
	/* Bottom Actions */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		gap: 12px;
		padding: 12px 16px;
		background: white;
		border-top: 1px solid #efefef;
		z-index: 100;
	}
	
	.bottom-actions :global(.action-button) {
		height: 44px;
		font-size: 15px;
		font-weight: 600;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	
	.bottom-actions :global(.secondary) {
		flex: 0.4;
	}
	
	.bottom-actions :global(.primary) {
		flex: 1;
	}
	
	/* Desktop */
	@media (min-width: 768px) {
		.product-page {
			max-width: 500px;
			margin: 0 auto;
			border-left: 1px solid #efefef;
			border-right: 1px solid #efefef;
		}
		
		.breadcrumb {
			font-size: 14px;
		}
		
		.image-carousel {
			border-radius: 0;
		}
	}
</style>