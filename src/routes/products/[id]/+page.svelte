<script lang="ts">
	import {
		Heart,
		Share2,
		MessageCircle,
		ArrowLeft,
		Bookmark,
		MoreHorizontal,
		ShoppingBag,
		Star,
		MapPin,
		Eye,
		ChevronLeft,
		ChevronRight,
		Users,
		Calendar,
		Package,
		Truck,
		Shield,
		Clock,
		Info,
		Verified,
		ExternalLink,
		Copy,
		Check
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database.types';
	import ProductCard from '$lib/components/marketplace/ProductCard.svelte';
	import { toast } from '$lib/utils/toast';

	const getSupabase = getContext<() => SupabaseClient<Database>>('supabase');
	const supabase = getSupabase?.();

	// Use props to get data from server
	let { data } = $props<{ data: any }>();

	let product = $derived(data?.product);
	let relatedProducts = $derived(data?.relatedProducts || []);
	let similarProducts = $derived(data?.similarProducts || []);
	let currentUser = $derived($page.data.user);

	// Component state
	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let isSaved = $state(false);
	let localLikesCount = $state(0);
	let showFullDescription = $state(false);
	let showDetailsModal = $state(false);
	let showShareModal = $state(false);
	let showReviewsModal = $state(false);
	let isImageLoaded = $state(false);
	let showHeart = $state(false);
	let isLoading = $state(false);
	let copySuccess = $state(false);
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let isFollowing = $state(false);

	// Update local state when product changes
	$effect(() => {
		if (product) {
			localLikesCount = product.like_count || 0;
			checkUserInteractions();
		}
	});

	// Derived values
	let allImages = $derived(
		product?.images && product.images.length > 0
			? product.images
			: product?.thumbnail_url
				? [product.thumbnail_url]
				: ['/placeholder.jpg']
	);

	let sellerName = $derived(product?.seller?.username || product?.seller?.full_name || 'Anonymous');
	let isLongDescription = $derived(product?.description && product.description.length > 200);
	let currentImage = $derived(allImages[currentImageIndex] || '/placeholder.jpg');
	let hasMultipleImages = $derived(allImages.length > 1);
	let productUrl = $derived(`${$page.url.origin}/products/${product?.id}`);
	let categoryName = $derived(product?.category?.name || 'Fashion');

	// Format condition display
	function getConditionLabel() {
		if (!product?.condition) return null;
		switch (product.condition) {
			case 'new_with_tags':
				return 'New with Tags';
			case 'new_without_tags':
				return 'New without Tags';
			case 'like_new':
				return 'Like New';
			case 'very_good':
				return 'Very Good';
			case 'good':
				return 'Good';
			case 'fair':
				return 'Fair';
			default:
				return product.condition;
		}
	}

	// Navigation
	function goBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}

	// Check user interactions (likes, saves, follows)
	async function checkUserInteractions() {
		if (!currentUser || !product?.id || !supabase) return;

		try {
			// Check if user has liked this product
			const { data: likeData } = await supabase
				.from('listing_likes')
				.select('id')
				.eq('listing_id', product.id)
				.eq('user_id', currentUser.id)
				.maybeSingle();

			isLiked = !!likeData;

			// Check if user has saved this product
			const { data: favoriteData } = await supabase
				.from('favorites')
				.select('id')
				.eq('listing_id', product.id)
				.eq('user_id', currentUser.id)
				.maybeSingle();

			isSaved = !!favoriteData;
		} catch (error) {
			console.error('Error checking user interactions:', error);
		}
	}

	// Like functionality
	async function toggleLike() {
		if (!product || !currentUser || isLoading || !supabase) return;

		isLoading = true;

		// Show heart animation
		showHeart = true;
		setTimeout(() => (showHeart = false), 1000);

		// Optimistic update
		const wasLiked = isLiked;
		isLiked = !isLiked;
		localLikesCount += isLiked ? 1 : -1;

		try {
			if (!wasLiked) {
				// Add like
				await supabase.from('listing_likes').insert({
					listing_id: product.id,
					user_id: currentUser.id,
				});
			} else {
				// Remove like
				await supabase
					.from('listing_likes')
					.delete()
					.eq('listing_id', product.id)
					.eq('user_id', currentUser.id);
			}

			// Update listing likes count
			const { data } = await supabase
				.from('listings')
				.update({ like_count: localLikesCount })
				.eq('id', product.id)
				.select('like_count')
				.single();

			if (data) {
				localLikesCount = data.like_count;
			}

			// Show toast notification
			toast.success(isLiked ? 'Added to likes!' : 'Removed from likes');
		} catch (error) {
			// Revert on error
			isLiked = wasLiked;
			localLikesCount += wasLiked ? 1 : -1;
			console.error('Error toggling like:', error);
			toast.error('Something went wrong. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	// Save functionality
	async function toggleSave() {
		if (!product || !currentUser || isLoading || !supabase) return;

		isLoading = true;
		const wasSaved = isSaved;
		isSaved = !isSaved;

		try {
			if (!wasSaved) {
				// Add to favorites
				await supabase.from('favorites').insert({
					listing_id: product.id,
					user_id: currentUser.id,
				});
			} else {
				// Remove from favorites
				await supabase
					.from('favorites')
					.delete()
					.eq('listing_id', product.id)
					.eq('user_id', currentUser.id);
			}

			toast.success(isSaved ? 'Saved to favorites!' : 'Removed from favorites');
		} catch (error) {
			isSaved = wasSaved;
			console.error('Error toggling save:', error);
			toast.error('Something went wrong. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	// Share functionality
	function shareProduct() {
		if (navigator.share) {
			navigator.share({
				title: product?.title,
				text: `Check out ${product?.title} on Driplo`,
				url: productUrl,
			});
		} else {
			showShareModal = true;
		}
	}

	// Image navigation
	function selectImage(index: number) {
		currentImageIndex = Math.max(0, Math.min(index, allImages.length - 1));
	}

	function nextImage() {
		if (hasMultipleImages && currentImageIndex < allImages.length - 1) {
			currentImageIndex += 1;
		}
	}

	function prevImage() {
		if (hasMultipleImages && currentImageIndex > 0) {
			currentImageIndex -= 1;
		}
	}

	// Touch gestures for image navigation
	function handleTouchStart(event: TouchEvent) {
		if (!hasMultipleImages) return;
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!hasMultipleImages) return;
		const touchEndX = event.changedTouches[0].clientX;
		const touchEndY = event.changedTouches[0].clientY;
		const deltaX = touchStartX - touchEndX;
		const deltaY = touchStartY - touchEndY;

		// Only handle horizontal swipes (not vertical scrolling)
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			if (deltaX > 0) {
				nextImage();
			} else {
				prevImage();
			}
		}
	}

	// Double tap to like
	function handleDoubleClick() {
		if (currentUser) {
			toggleLike();
		}
	}

	// Navigation functions
	function visitSeller() {
		if (product?.seller?.username) {
			goto(`/profile/${product.seller.username}`);
		} else {
			goto(`/profile/${product?.seller?.id}`);
		}
	}

	function messageSeller() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		goto(`/messages/${product?.seller?.id}?listing=${product?.id}`);
	}

	// Copy to clipboard
	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copySuccess = true;
			setTimeout(() => (copySuccess = false), 2000);
			toast.success('Copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy:', error);
			toast.error('Failed to copy link');
		}
		showShareModal = false;
	}

	// Format time ago
	function formatTimeAgo(dateString: string) {
		if (!dateString) return '';
		const now = new Date();
		const date = new Date(dateString);
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	// Buy now action
	function handleBuyNow() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		// TODO: Implement buy now functionality
		toast.info('Buy now feature coming soon!');
	}
</script>

<svelte:head>
	<title>{product?.title || 'Product'} - Driplo</title>
	<meta name="description" content={product?.description || 'Shop unique fashion on Driplo'} />
	<meta property="og:title" content={product?.title || 'Product'} />
	<meta property="og:description" content={product?.description || 'Shop unique fashion on Driplo'} />
	<meta property="og:image" content={product?.thumbnail_url || product?.images?.[0] || ''} />
	<meta property="og:url" content={productUrl} />
	<meta property="og:type" content="product" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={product?.title || 'Product'} />
	<meta name="twitter:description" content={product?.description || 'Shop unique fashion on Driplo'} />
	<meta name="twitter:image" content={product?.thumbnail_url || product?.images?.[0] || ''} />
</svelte:head>

{#if product}
	<!-- Product Detail Page -->
	<div class="relative mx-auto min-h-screen max-w-lg bg-white animate-fade-in">
		<!-- Header -->
		<header class="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md">
			<button onclick={goBack} class="action-button" aria-label="Go back">
				<ArrowLeft size={22} class="text-zinc-900" />
			</button>
			<h1 class="text-base font-semibold text-zinc-900 truncate px-4">{product.title}</h1>
			<button onclick={() => (showDetailsModal = true)} class="action-button" aria-label="More info">
				<Info size={20} class="text-zinc-900" />
			</button>
		</header>

		<!-- Seller Header -->
		<div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
			<button onclick={visitSeller} class="flex min-w-0 flex-1 items-center gap-3">
				<div class="relative">
					{#if product.seller.avatar_url}
						<img
							src={product.seller.avatar_url}
							alt={sellerName}
							class="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
							loading="lazy"
						/>
					{:else}
						<div class="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-sm">
							<span class="text-white font-semibold text-sm">
								{sellerName.charAt(0).toUpperCase()}
							</span>
						</div>
					{/if}
					{#if product.seller.verified}
						<div class="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
							<Verified size={8} class="text-white" />
						</div>
					{/if}
				</div>
				<div class="min-w-0 flex-1 text-left">
					<div class="flex items-center gap-2 mb-0.5">
						<span class="truncate text-sm font-semibold text-zinc-900">{sellerName}</span>
						{#if product.seller.seller_rating && product.seller.seller_rating > 0}
							<div class="flex items-center gap-1">
								<Star size={12} class="text-yellow-400 fill-current" />
								<span class="text-xs font-medium text-zinc-600">{product.seller.seller_rating.toFixed(1)}</span>
							</div>
						{/if}
					</div>
					<div class="flex items-center gap-3 text-xs text-zinc-500">
						{#if product.created_at}
							<span>{formatTimeAgo(product.created_at)}</span>
						{/if}
						{#if product.seller.total_sales > 0}
							<span>• {product.seller.total_sales} sales</span>
						{/if}
						<span>• {categoryName}</span>
					</div>
				</div>
			</button>
			{#if currentUser && currentUser.id !== product.seller_id}
				<button 
					class="px-4 py-1.5 text-sm font-medium rounded-full border transition-colors {isFollowing 
						? 'bg-zinc-100 text-zinc-700 border-zinc-200' 
						: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}"
					aria-label="{isFollowing ? 'Unfollow' : 'Follow'} seller"
				>
					{isFollowing ? 'Following' : 'Follow'}
				</button>
			{/if}
		</div>

		<!-- Image Carousel -->
		<div class="relative bg-black">
			<div
				class="relative aspect-square overflow-hidden bg-zinc-100 select-none"
				role="button"
				tabindex="0"
				ondblclick={handleDoubleClick}
				onkeydown={(e) => e.key === 'Enter' && handleDoubleClick()}
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
			>
				{#if !isImageLoaded}
					<div class="h-full w-full animate-pulse bg-zinc-200"></div>
				{/if}
				<img
					src={currentImage}
					alt={product.title}
					class="h-full w-full object-cover transition-opacity duration-300 {isImageLoaded
						? 'opacity-100'
						: 'opacity-0'}"
					loading="lazy"
					onload={() => (isImageLoaded = true)}
				/>

				<!-- Navigation Arrows -->
				{#if hasMultipleImages}
					<button
						onclick={prevImage}
						class="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex === 0 ? 'pointer-events-none opacity-30' : ''}"
						aria-label="Previous image"
						disabled={currentImageIndex === 0}
					>
						<ChevronLeft size={18} />
					</button>
					<button
						onclick={nextImage}
						class="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex === allImages.length - 1 ? 'pointer-events-none opacity-30' : ''}"
						aria-label="Next image"
						disabled={currentImageIndex === allImages.length - 1}
					>
						<ChevronRight size={18} />
					</button>
				{/if}

				<!-- Image Counter -->
				{#if hasMultipleImages}
					<div class="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
						{currentImageIndex + 1} of {allImages.length}
					</div>
				{/if}

				<!-- Condition Badge -->
				{#if getConditionLabel()}
					<div class="absolute top-4 left-4 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
						{getConditionLabel()}
					</div>
				{/if}

				<!-- Navigation Dots -->
				{#if hasMultipleImages}
					<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2">
						{#each allImages as _, index}
							<button
								class="h-2.5 w-2.5 rounded-full transition-all duration-300 {index === currentImageIndex ? 'scale-110 bg-white' : 'bg-white/50 hover:bg-white/70'}"
								onclick={() => selectImage(index)}
								aria-label="View image {index + 1}"
							></button>
						{/each}
					</div>
				{/if}

				<!-- Heart Animation Overlay -->
				{#if showHeart}
					<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
						<div class="animate-ping">
							<Heart size={80} class="text-red-500 drop-shadow-lg" fill="currentColor" />
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action Bar -->
		<div class="flex items-center justify-between px-4 py-3">
			<div class="flex items-center gap-4">
				<button
					class="action-button {isLiked ? 'text-red-500' : 'text-zinc-700'} {isLoading ? 'opacity-50' : ''}"
					onclick={toggleLike}
					disabled={isLoading}
					aria-label="{isLiked ? 'Unlike' : 'Like'} this product"
				>
					<Heart size={26} class={isLiked ? 'fill-current' : ''} />
				</button>
				<button class="action-button text-zinc-700" onclick={messageSeller} aria-label="Message seller">
					<MessageCircle size={26} />
				</button>
				<button class="action-button text-zinc-700" onclick={shareProduct} aria-label="Share product">
					<Share2 size={26} />
				</button>
			</div>
			<button
				class="action-button {isSaved ? 'text-blue-600' : 'text-zinc-700'} {isLoading ? 'opacity-50' : ''}"
				onclick={toggleSave}
				disabled={isLoading}
				aria-label="{isSaved ? 'Unsave' : 'Save'} this product"
			>
				<Bookmark size={26} class={isSaved ? 'fill-current' : ''} />
			</button>
		</div>

		<!-- Engagement Stats -->
		{#if localLikesCount > 0 || product.view_count > 0}
			<div class="px-4 py-2">
				<div class="flex items-center gap-4 text-sm">
					{#if localLikesCount > 0}
						<span class="font-semibold text-zinc-900">
							{localLikesCount.toLocaleString()} {localLikesCount === 1 ? 'like' : 'likes'}
						</span>
					{/if}
					{#if product.view_count > 0}
						<span class="flex items-center gap-1 font-medium text-zinc-500">
							<Eye size={14} />
							{product.view_count.toLocaleString()} {product.view_count === 1 ? 'view' : 'views'}
						</span>
					{/if}
					{#if product.share_count > 0}
						<span class="flex items-center gap-1 font-medium text-zinc-500">
							<Share2 size={14} />
							{product.share_count.toLocaleString()}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Product Info Section -->
		<div class="px-4 pb-4">
			<!-- Title and Price -->
			<div class="mb-4">
				<div class="mb-3 flex items-start justify-between gap-4">
					<h1 class="flex-1 text-xl font-bold text-zinc-900 leading-tight">{product.title}</h1>
					<div class="flex-shrink-0 text-right">
						<div class="text-2xl font-bold text-blue-600">
							{product.currency === 'BGN' ? 'лв' : '$'}{product.price.toLocaleString()}
						</div>
						{#if product.original_price && product.original_price > product.price}
							<div class="text-sm text-zinc-500 line-through">
								{product.currency === 'BGN' ? 'лв' : '$'}{product.original_price.toLocaleString()}
							</div>
						{/if}
					</div>
				</div>

				<!-- Product Details Pills -->
				<div class="flex flex-wrap gap-2 text-sm">
					{#if product.brand}
						<span class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-700 font-medium">
							<Star size={12} />
							{product.brand}
						</span>
					{/if}
					{#if product.size}
						<span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700 font-medium">
							<Package size={12} />
							Size {product.size}
						</span>
					{/if}
					{#if product.color}
						<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700 font-medium">
							{product.color}
						</span>
					{/if}
					{#if getConditionLabel()}
						<span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700 font-medium">
							<Shield size={12} />
							{getConditionLabel()}
						</span>
					{/if}
					{#if product.shipping_available}
						<span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-orange-700 font-medium">
							<Truck size={12} />
							{product.shipping_price === 0 ? 'Free Shipping' : `Shipping +${product.currency === 'BGN' ? 'лв' : '$'}${product.shipping_price}`}
						</span>
					{/if}
				</div>
			</div>

			<!-- Description -->
			{#if product.description}
				<div class="mb-4">
					<div class="text-sm leading-relaxed text-zinc-900">
						<button onclick={visitSeller} class="font-semibold text-zinc-900 hover:text-blue-600 transition-colors">
							{sellerName}
						</button>
						<span class="ml-2">
							{#if isLongDescription && !showFullDescription}
								{product.description.slice(0, 200)}...
								<button
									onclick={() => (showFullDescription = true)}
									class="font-medium text-zinc-500 hover:text-zinc-700 ml-1 transition-colors"
								>
									more
								</button>
							{:else}
								{product.description}
								{#if isLongDescription && showFullDescription}
									<button
										onclick={() => (showFullDescription = false)}
										class="font-medium text-zinc-500 hover:text-zinc-700 ml-1 transition-colors"
									>
										less
									</button>
								{/if}
							{/if}
						</span>
					</div>
				</div>
			{/if}

			<!-- Tags -->
			{#if product.tags && product.tags.length > 0}
				<div class="mb-4">
					<div class="flex flex-wrap gap-2">
						{#each product.tags.slice(0, 5) as tag}
							<a
								href="/search?tag={tag}"
								class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
							>
								#{tag}
							</a>
						{/each}
						{#if product.tags.length > 5}
							<span class="text-sm text-zinc-500">+{product.tags.length - 5} more</span>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Location and Shipping Info -->
			<div class="mb-4 p-3 bg-zinc-50 rounded-lg">
				<div class="flex items-start gap-3 text-sm">
					<div class="flex-1">
						{#if product.location || product.city}
							<div class="flex items-center gap-2 mb-2">
								<MapPin size={14} class="text-zinc-500" />
								<span class="text-zinc-700 font-medium">
									{product.city || product.location}
								</span>
							</div>
						{/if}
						<div class="flex items-center gap-4">
							{#if product.shipping_available}
								<div class="flex items-center gap-2">
									<Truck size={14} class="text-green-500" />
									<span class="text-green-700 font-medium">
										{product.shipping_price === 0 ? 'Free shipping' : `Shipping +${product.currency === 'BGN' ? 'лв' : '$'}${product.shipping_price}`}
									</span>
								</div>
							{:else}
								<div class="flex items-center gap-2">
									<Users size={14} class="text-blue-500" />
									<span class="text-blue-700 font-medium">Pickup only</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Related Products Section -->
		{#if relatedProducts.length > 0}
			<div class="border-t border-zinc-200 px-4 py-6 pb-24">
				<h2 class="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
					<ShoppingBag size={20} />
					More from {sellerName}
				</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each relatedProducts.slice(0, 4) as relatedProduct}
						<ProductCard product={relatedProduct} variant="grid" showQuickShop={true} />
					{/each}
				</div>
				{#if relatedProducts.length > 4}
					<button
						onclick={visitSeller}
						class="w-full mt-4 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium transition-colors"
					>
						View All Products ({relatedProducts.length})
					</button>
				{/if}
			</div>
		{/if}

		<!-- Similar Products Section -->
		{#if similarProducts.length > 0}
			<div class="border-t border-zinc-200 px-4 py-6 pb-24">
				<h2 class="flex items-center gap-2 text-lg font-bold text-zinc-900 mb-4">
					<Star size={20} />
					Similar items in {categoryName}
				</h2>
				<div class="grid grid-cols-2 gap-4">
					{#each similarProducts.slice(0, 4) as similarProduct}
						<ProductCard product={similarProduct} variant="grid" showQuickShop={true} />
					{/each}
				</div>
				{#if similarProducts.length > 4}
					<a
						href="/search?category={product.category?.slug}"
						class="block w-full mt-4 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium transition-colors text-center"
					>
						See More in {categoryName}
					</a>
				{/if}
			</div>
		{/if}

		<!-- Floating Action Buttons (Mobile) -->
		<div class="fixed bottom-0 left-1/2 w-full max-w-lg -translate-x-1/2 transform backdrop-blur-md bg-white/95 border-t border-zinc-200 p-4" style="padding-bottom: max(16px, env(safe-area-inset-bottom));">
			<div class="flex gap-3">
				{#if currentUser && currentUser.id !== product.seller_id}
					<button
						onclick={messageSeller}
						class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl font-semibold transition-colors"
					>
						<MessageCircle size={18} />
						Message
					</button>
					<button
						onclick={handleBuyNow}
						class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
					>
						<ShoppingBag size={18} />
						Buy Now
					</button>
				{:else if !currentUser}
					<button
						onclick={() => goto('/auth/login')}
						class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
					>
						<Users size={18} />
						Sign in to Buy
					</button>
				{:else}
					<div class="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 text-zinc-500 rounded-xl font-semibold">
						<Users size={18} />
						Your Product
					</div>
				{/if}
			</div>
		</div>

		<!-- Product Details Modal -->
		{#if showDetailsModal}
			<div
				class="fixed inset-0 flex items-end justify-center backdrop-blur-sm md:items-center bg-black/60 z-50 p-4"
				role="button"
				tabindex="0"
				onclick={() => (showDetailsModal = false)}
				onkeydown={(e) => e.key === 'Escape' && (showDetailsModal = false)}
			>
				<div
					class="max-h-[80vh] w-full max-w-md overflow-y-auto bg-white rounded-2xl shadow-2xl animate-slideUp"
					role="dialog"
					aria-modal="true"
					tabindex="-1"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.key === 'Enter' && e.stopPropagation()}
				>
					<!-- Modal Header -->
					<div class="sticky top-0 bg-white rounded-t-2xl p-6 pb-4 border-b border-zinc-200">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-bold text-zinc-900">Product Details</h3>
							<button
								onclick={() => (showDetailsModal = false)}
								class="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
								aria-label="Close"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>

					<!-- Modal Content -->
					<div class="p-6 space-y-6">
						<!-- Seller Info -->
						<div class="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
							{#if product.seller.avatar_url}
								<img
									src={product.seller.avatar_url}
									alt={sellerName}
									class="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
								/>
							{:else}
								<div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-sm">
									<span class="text-white font-semibold">{sellerName.charAt(0).toUpperCase()}</span>
								</div>
							{/if}
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1">
									<span class="font-semibold text-zinc-900">{sellerName}</span>
									{#if product.seller.verified}
										<div class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
											<Verified size={8} class="text-white" />
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-3 text-sm text-zinc-600">
									{#if product.seller.seller_rating && product.seller.seller_rating > 0}
										<span class="flex items-center gap-1">
											<Star size={12} class="text-yellow-400 fill-current" />
											{product.seller.seller_rating.toFixed(1)} rating
										</span>
									{/if}
									{#if product.seller.total_sales > 0}
										<span class="flex items-center gap-1">
											<ShoppingBag size={12} />
											{product.seller.total_sales} sales
										</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Product Specifications -->
						<div class="space-y-4">
							<h4 class="font-semibold text-zinc-900">Specifications</h4>
							<div class="grid grid-cols-2 gap-4 text-sm">
								{#if product.size}
									<div class="flex items-center gap-2">
										<Package size={16} class="text-zinc-500" />
										<span class="text-zinc-600">Size:</span>
										<span class="font-medium">{product.size}</span>
									</div>
								{/if}
								{#if getConditionLabel()}
									<div class="flex items-center gap-2">
										<Shield size={16} class="text-zinc-500" />
										<span class="text-zinc-600">Condition:</span>
										<span class="font-medium">{getConditionLabel()}</span>
									</div>
								{/if}
								{#if product.brand}
									<div class="flex items-center gap-2">
										<Star size={16} class="text-zinc-500" />
										<span class="text-zinc-600">Brand:</span>
										<span class="font-medium">{product.brand}</span>
									</div>
								{/if}
								<div class="flex items-center gap-2">
									<Calendar size={16} class="text-zinc-500" />
									<span class="text-zinc-600">Listed:</span>
									<span class="font-medium">{formatTimeAgo(product.created_at)}</span>
								</div>
							</div>
						</div>

						<!-- Shipping & Returns -->
						<div class="space-y-3">
							<h4 class="font-semibold text-zinc-900">Shipping & Returns</h4>
							<div class="text-sm space-y-2">
								{#if product.shipping_available}
									<div class="flex items-center gap-3">
										<Truck size={16} class="text-green-500" />
										<span class="text-zinc-600">
											{product.shipping_price === 0 ? 'Free shipping' : `Shipping costs ${product.currency === 'BGN' ? 'лв' : '$'}${product.shipping_price}`}
										</span>
									</div>
								{/if}
								<div class="flex items-center gap-3">
									<Clock size={16} class="text-blue-500" />
									<span class="text-zinc-600">Delivery in 2-3 business days</span>
								</div>
								<div class="flex items-center gap-3">
									<Shield size={16} class="text-green-600" />
									<span class="text-zinc-600">Buyer protection included</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Share Modal -->
		{#if showShareModal}
			<div
				class="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 z-50 p-4"
				role="button"
				tabindex="0"
				onclick={() => (showShareModal = false)}
				onkeydown={(e) => e.key === 'Escape' && (showShareModal = false)}
				aria-label="Close share modal"
			>
				<div
					class="w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slideUp"
					role="dialog"
					aria-modal="true"
					aria-labelledby="share-modal-title"
					tabindex="-1"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
				>
					<div class="p-6">
						<h3 id="share-modal-title" class="text-lg font-bold text-zinc-900 mb-4 text-center">
							Share this product
						</h3>
						<div class="space-y-3">
							<button
								onclick={() => copyToClipboard(productUrl)}
								class="w-full text-left p-3 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-3"
							>
								{#if copySuccess}
									<Check size={18} class="text-green-500" />
									<span class="font-medium text-green-700">Copied!</span>
								{:else}
									<Copy size={18} class="text-zinc-500" />
									<span class="font-medium">Copy link</span>
								{/if}
							</button>
							<button
								onclick={() => copyToClipboard(`Check out ${product.title} on Driplo: ${productUrl}`)}
								class="w-full text-left p-3 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-3"
							>
								<ExternalLink size={18} class="text-zinc-500" />
								<span class="font-medium">Copy with description</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<!-- Product not found -->
	<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
		<div class="text-6xl mb-4">🔍</div>
		<h2 class="text-xl font-bold text-zinc-900 text-center">Product not found</h2>
		<p class="text-zinc-600 text-center mb-6">
			This product might have been removed or doesn't exist.
		</p>
		<button
			onclick={goBack}
			class="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
		>
			Go Back
		</button>
	</div>
{/if}

<style>
	.action-button {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.action-button:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.action-button:disabled {
		cursor: not-allowed;
	}

	.animate-fade-in {
		animation: fadeIn 0.3s ease-out;
	}

	.animate-slideUp {
		animation: slideUp 0.3s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { 
			opacity: 0;
			transform: translateY(20px);
		}
		to { 
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>