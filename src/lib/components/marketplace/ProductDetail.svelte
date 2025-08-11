<script lang="ts">
	import { ArrowLeft, MessageCircle, Heart, Eye, Share2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createClient } from '$lib/supabase/client';
	import Breadcrumb, { type BreadcrumbItem } from '$lib/components/ui/Breadcrumb.svelte';
	
	type Product = any;
	
	interface Props {
		product: Product;
		relatedProducts?: Product[];
		isLiked?: boolean;
		isSaved?: boolean;
	}
	
	let { product, relatedProducts = [], isLiked: initialIsLiked = false, isSaved: initialIsSaved = false }: Props = $props();
	
	let currentImageIndex = $state(0);
	let isLoading = $state(false);
	
	let currentUser = $derived($page.data.user);
	const supabase = createClient();
	
	let images = $derived(
		product.images && product.images.length > 0
			? product.images
			: [product.thumbnail_url || '/placeholder.jpg']
	);
	
	let formattedPrice = $derived(
		new Intl.NumberFormat('bg-BG', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(product.price)
	);
	
	let isOwnProduct = $derived(currentUser?.id === product.seller_id);
	let isLiked = $state(initialIsLiked);
	let isSaved = $state(initialIsSaved);
	let likeCount = $state(product.like_count ?? 0);
	let viewCount = $state(product.views ?? 0);
	
	// Breadcrumb generation
	let breadcrumbItems = $derived((): BreadcrumbItem[] => {
		const items: BreadcrumbItem[] = [
			{ label: 'Home', href: '/' },
			{ label: 'Browse', href: '/browse' }
		];
		
		// Add category if available
		if (product.category) {
			const categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
			items.push({ 
				label: categoryName, 
				href: `/browse?category=${product.category}` 
			});
		}
		
		// Add current product (no href for current page)
		const productTitle = product.title?.length > 30 
			? product.title.slice(0, 30) + '...' 
			: product.title;
		items.push({ label: productTitle });
		
		return items;
	});
	
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}
	
	async function handleMessage() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		
		// Ensure we have seller information
		if (!product.seller_id) {
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
					otherUserId: product.seller_id,
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
	
	function handleBuy() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		// Simulate purchase flow
		handleMessage();
	}
	
	function nextImage() {
		if (currentImageIndex < images.length - 1) {
			currentImageIndex++;
		}
	}
	
	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}
	
	async function handleLike() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		
		const wasLiked = isLiked;
		isLiked = !isLiked;
		likeCount += isLiked ? 1 : -1;
		
		try {
			if (isLiked) {
				const { error } = await supabase
					.from('product_likes')
					.insert({ 
						user_id: currentUser.id, 
						product_id: product.id 
					});
				if (error) throw error;
			} else {
				const { error } = await supabase
					.from('product_likes')
					.delete()
					.match({ 
						user_id: currentUser.id, 
						product_id: product.id 
					});
				if (error) throw error;
			}
		} catch (error) {
			console.error('Error updating like:', error);
			isLiked = wasLiked;
			likeCount += wasLiked ? 1 : -1;
		}
	}
	
	async function handleSave() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		
		const wasSaved = isSaved;
		isSaved = !isSaved;
		
		try {
			if (isSaved) {
				const { error } = await supabase
					.from('product_saves')
					.insert({ 
						user_id: currentUser.id, 
						product_id: product.id 
					});
				if (error) throw error;
			} else {
				const { error } = await supabase
					.from('product_saves')
					.delete()
					.match({ 
						user_id: currentUser.id, 
						product_id: product.id 
					});
				if (error) throw error;
			}
		} catch (error) {
			console.error('Error updating wishlist:', error);
			isSaved = wasSaved;
		}
	}
</script>

<div class="product-detail">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" onclick={goBack}>
			<ArrowLeft size={24} />
		</button>
		<h1 class="title">{product.title}</h1>
		<button class="share-btn">
			<Share2 size={24} />
		</button>
	</div>
	
	<!-- Breadcrumb Navigation -->
	<Breadcrumb items={breadcrumbItems()} />
	
	<!-- Image Carousel -->
	<div class="image-container">
		<img 
			src={images[currentImageIndex]} 
			alt={product.title}
			class="product-image"
		/>
		
		{#if images.length > 1}
			<div class="image-indicators">
				{#each images as _, index}
					<div 
						class="indicator {currentImageIndex === index ? 'active' : ''}"
						role="button"
						tabindex="0"
						onclick={() => currentImageIndex = index}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								currentImageIndex = index;
							}
						}}
						aria-label="Go to image {index + 1}"
					></div>
				{/each}
			</div>
		{/if}
		
		<!-- Action buttons overlay -->
		<div class="image-actions">
			<button 
				class="action-btn like-btn {isLiked ? 'liked' : ''}"
				onclick={handleLike}
			>
				<Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
			</button>
		</div>
		
		<!-- Stats overlay (bottom right) -->
		<div class="image-stats">
			<div class="stat-item">
				<Heart size={14} fill="white" />
				{likeCount}
			</div>
			<div class="stat-item">
				<Eye size={14} fill="white" />
				{viewCount}
			</div>
		</div>
	</div>
	
	<!-- Product Info -->
	<div class="product-info">
		<!-- Seller Info (moved up, compact) -->
		{#if product.seller}
			<a href="/user/{product.seller.username}" class="seller-info">
				<div class="seller-avatar">
					<img 
						src={product.seller.avatar_url || '/default-avatar.jpg'} 
						alt={product.seller.username}
						class="avatar"
					/>
				</div>
				<div class="seller-details">
					<span class="seller-name">{product.seller.username || 'Anonymous'}</span>
					<div class="seller-rating">
						{#if product.seller.username === 'w3bsuki'}
							<span class="admin-badge">ADMIN</span>
						{:else if product.seller.rating_average && product.seller.rating_count}
							⭐ {product.seller.rating_average.toFixed(1)} ({product.seller.rating_count} reviews)
						{:else if product.seller.rating_average}
							⭐ {product.seller.rating_average.toFixed(1)}
						{:else}
							New seller
						{/if}
					</div>
				</div>
			</a>
		{/if}
		
		<div class="product-header">
			<h2 class="product-title">{product.title}</h2>
			
			<!-- Product Details Chips -->
			<div class="product-details">
				{#if product.size}
					<span class="detail-chip">Size {product.size}</span>
				{/if}
				{#if product.color}
					<span class="detail-chip">Color {product.color}</span>
				{/if}
				{#if product.category}
					<span class="detail-chip">{product.category}</span>
				{/if}
				{#if product.condition}
					<span class="detail-chip condition">{product.condition}</span>
				{/if}
				{#if product.brand}
					<span class="detail-chip brand">{product.brand}</span>
				{/if}
			</div>
		</div>
		
		{#if product.description}
			<div class="description-section">
				<p class="description">{product.description}</p>
			</div>
		{/if}
	</div>
</div>

<!-- Fixed Bottom Actions -->
<div class="bottom-actions">
	<button 
		class="action-btn wishlist-btn {isSaved ? 'saved' : ''}"
		onclick={handleSave}
	>
		<Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
	</button>
	
	{#if isOwnProduct}
		<button class="primary-btn edit-btn" onclick={() => goto(`/products/${product.id}/edit`)}>
			Edit Listing
		</button>
	{:else}
		<button class="secondary-btn message-btn" onclick={handleMessage}>
			<MessageCircle size={16} />
			Message
		</button>
		<button class="primary-btn buy-btn" onclick={handleBuy} disabled={isLoading}>
			Buy - {formattedPrice}лв
		</button>
	{/if}
</div>

<style>
	.product-detail {
		background: white;
		padding-bottom: 88px;
		margin-bottom: 0;
	}
	
	.header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid #efefef;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		height: 56px;
	}
	
	.back-btn, .share-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}
	
	.back-btn:hover, .share-btn:hover {
		background: #f5f5f5;
	}
	
	.title {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
		max-width: 200px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	
	.image-container {
		position: relative;
		aspect-ratio: 1;
		background: #f5f5f5;
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
		gap: 8px;
		background: rgba(0, 0, 0, 0.3);
		padding: 8px 12px;
		border-radius: 20px;
	}
	
	.indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.indicator.active {
		background: white;
		transform: scale(1.2);
	}
	
	.image-actions {
		position: absolute;
		top: 16px;
		right: 16px;
	}
	
	.action-btn {
		background: rgba(255, 255, 255, 0.9);
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(10px);
	}
	
	.like-btn.liked {
		color: #e91e63;
		background: rgba(233, 30, 99, 0.1);
	}
	
	.product-info {
		padding: 1rem 1rem 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	/* Image stats overlay */
	.image-stats {
		position: absolute;
		bottom: 12px;
		right: 12px;
		display: flex;
		gap: 8px;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		font-size: 12px;
		font-weight: 500;
		border-radius: 12px;
		backdrop-filter: blur(8px);
	}
	
	.product-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.product-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
		color: #111;
	}
	
	.product-details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin: 0;
	}
	
	.detail-chip {
		padding: 0.25rem 0.625rem;
		background: #f8f9fa;
		border-radius: 8px;
		font-size: 0.75rem;
		color: #495057;
		font-weight: 500;
		border: 1px solid #e9ecef;
	}
	
	.detail-chip.condition {
		background: #e8f5e8;
		color: #2d6a2d;
	}
	
	.detail-chip.brand {
		background: #f0f8ff;
		color: #1e5ba8;
		font-weight: 500;
	}
	
	.description-section {
		padding-top: 0.25rem;
	}
	
	.description {
		color: #374151;
		line-height: 1.6;
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 400;
	}
	
	.seller-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f1f3f4;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		cursor: pointer;
	}
	
	.seller-info:hover {
		background-color: #f8f9fa;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		margin: 0 -0.75rem;
	}
	
	.seller-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.seller-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	
	.seller-name {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #111;
	}
	
	.seller-rating {
		color: #666;
		font-size: 0.8125rem;
	}
	
	.admin-badge {
		background: linear-gradient(135deg, #dc2626, #991b1b);
		color: white;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 1px 3px rgba(220, 38, 38, 0.3);
	}
	
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-top: 1px solid #efefef;
		padding: 12px 16px;
		display: flex;
		gap: 12px;
		z-index: 10;
	}
	
	.wishlist-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: white;
		border: 1px solid #ddd;
	}
	
	.wishlist-btn.saved {
		background: #e91e63;
		color: white;
		border-color: #e91e63;
	}
	
	.message-btn, .buy-btn, .edit-btn {
		flex: 1;
		height: 48px;
		border-radius: 24px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	
	.message-btn {
		background: white;
		color: #000;
		border: 1px solid #ddd;
	}
	
	.buy-btn, .edit-btn {
		background: #000;
		color: white;
	}
	
	.buy-btn:hover, .edit-btn:hover {
		background: #333;
	}
	
	.message-btn:hover {
		background: #f5f5f5;
	}
	
	/* Responsive Design - Match main page dimensions */
	@media (min-width: 768px) {
		.product-detail {
			max-width: 600px;
			margin: 0 auto;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
			border-radius: 16px;
			overflow: hidden;
			margin-top: 1rem;
		}
		
		.header {
			border-radius: 0;
		}
		
		.product-info {
			padding: 1.5rem 1.5rem 1rem 1.5rem;
		}
		
		.seller-info:hover {
			margin: 0 -1.5rem;
			padding: 0.5rem 1.5rem;
		}
		
		.bottom-actions {
			position: static;
			border-top: 1px solid #eee;
			background: white;
			border-radius: 0 0 16px 16px;
			margin-top: 1rem;
		}
	}
	
	@media (max-width: 480px) {
		.product-info {
			padding: 0.875rem 0.875rem 0.5rem 0.875rem;
		}
		
		.product-title {
			font-size: 1.125rem;
		}
		
		.detail-chip {
			font-size: 0.75rem;
			padding: 0.1875rem 0.625rem;
		}
		
		.seller-info {
			padding: 0.5rem 0;
		}
		
		.seller-info:hover {
			padding: 0.5rem 0.625rem;
			margin: 0 -0.625rem;
		}
	}
</style>