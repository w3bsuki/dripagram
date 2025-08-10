<script lang="ts">
	import { ArrowLeft, MessageCircle, Heart, Eye, Share2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createClient } from '$lib/supabase/client';
	
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
	
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}
	
	function handleMessage() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		goto(`/messages/${product.seller_id}?listing=${product.id}`);
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
						onclick={() => currentImageIndex = index}
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
	</div>
	
	<!-- Product Info -->
	<div class="product-info">
		<div class="price-section">
			<span class="price">{formattedPrice} лв</span>
			<div class="stats">
				<span class="stat">
					<Heart size={16} />
					{likeCount}
				</span>
				<span class="stat">
					<Eye size={16} />
					{viewCount}
				</span>
			</div>
		</div>
		
		<h2 class="product-title">{product.title}</h2>
		
		{#if product.description}
			<p class="description">{product.description}</p>
		{/if}
		
		<!-- Seller Info -->
		{#if product.seller}
			<div class="seller-info">
				<div class="seller-avatar">
					<img 
						src={product.seller.avatar_url || '/default-avatar.jpg'} 
						alt={product.seller.username}
						class="avatar"
					/>
				</div>
				<div class="seller-details">
					<span class="seller-name">{product.seller.username || 'Anonymous'}</span>
					<span class="seller-label">Seller</span>
				</div>
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
			Buy Now
		</button>
	{/if}
</div>

<style>
	.product-detail {
		min-height: 100vh;
		background: white;
		padding-bottom: 80px;
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
		padding: 20px;
	}
	
	.price-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	
	.price {
		font-size: 24px;
		font-weight: 700;
		color: #000;
	}
	
	.stats {
		display: flex;
		gap: 16px;
	}
	
	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #666;
		font-size: 14px;
	}
	
	.product-title {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 12px 0;
		line-height: 1.3;
	}
	
	.description {
		color: #666;
		line-height: 1.5;
		margin: 0 0 20px 0;
	}
	
	.seller-info {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0;
		border-top: 1px solid #efefef;
	}
	
	.seller-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.seller-details {
		display: flex;
		flex-direction: column;
	}
	
	.seller-name {
		font-weight: 600;
		font-size: 14px;
	}
	
	.seller-label {
		color: #666;
		font-size: 12px;
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
	
	@media (min-width: 768px) {
		.product-detail {
			max-width: 500px;
			margin: 0 auto;
		}
	}
</style>