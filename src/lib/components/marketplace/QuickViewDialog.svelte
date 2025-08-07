<script lang="ts">
	import {
		Heart,
		Share2,
		MessageCircle,
		Bookmark,
		ShoppingBag,
		X,
		ChevronLeft,
		ChevronRight,
		Star,
		Eye,
		Package,
		Shield,
		Truck,
		MapPin,
		Verified,
		Copy,
		Check,
		ExternalLink
	} from '@lucide/svelte';
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/supabase/database.types';
	import { toast } from '$lib/utils/toast';

	const getSupabase = getContext<() => SupabaseClient<Database>>('supabase');
	const supabase = getSupabase?.();

	interface Props {
		product: {
			id: string;
			title: string;
			price: number;
			condition?: 'new' | 'like_new' | 'good' | 'fair' | string;
			description?: string;
			thumbnail_url?: string;
			images?: string[];
			video_url?: string;
			like_count: number;
			view_count?: number;
			size?: string;
			brand?: string;
			color?: string;
			tags?: string[];
			created_at?: string;
			currency?: string;
			original_price?: number;
			shipping_available?: boolean;
			shipping_price?: number;
			location?: string;
			city?: string;
			seller: {
				id: string;
				username?: string;
				full_name?: string;
				avatar_url?: string;
				verified?: boolean;
				seller_verified?: boolean;
				follower_count?: number;
				seller_rating?: number;
				total_sales?: number;
			};
			likes?: { count: number }[];
			is_liked?: { user_id: string }[];
		};
		isOpen: boolean;
		onClose: () => void;
	}

	let { product, isOpen, onClose }: Props = $props();

	// Component state
	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let isSaved = $state(false);
	let localLikesCount = $state(0);
	let showShareOptions = $state(false);
	let copySuccess = $state(false);
	let isLoading = $state(false);
	let showHeartAnimation = $state(false);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

	// Derived values
	let currentUser = $derived($page.data.user);
	let sellerName = $derived(product.seller?.username || product.seller?.full_name || 'Anonymous');
	let allImages = $derived(
		product.images && product.images.length > 0
			? product.images
			: product.thumbnail_url
				? [product.thumbnail_url]
				: ['/placeholder.jpg']
	);
	let currentImage = $derived(allImages[currentImageIndex] || '/placeholder.jpg');
	let hasMultipleImages = $derived(allImages.length > 1);
	let productUrl = $derived(`${$page.url.origin}/products/${product.id}`);

	// Initialize state when product changes
	$effect(() => {
		if (product) {
			localLikesCount = product.like_count || 0;
			if (currentUser && product.id) {
				checkUserInteractions();
			}
		}
	});

	// Reset states when dialog opens/closes
	$effect(() => {
		if (isOpen) {
			currentImageIndex = 0;
			showShareOptions = false;
			copySuccess = false;
			// Prevent body scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Restore body scroll
			document.body.style.overflow = '';
		}
	});

	function getConditionLabel() {
		if (!product.condition) return null;
		switch (product.condition) {
			case 'new':
				return 'New';
			case 'like_new':
				return 'Like New';
			case 'good':
				return 'Good';
			case 'fair':
				return 'Fair';
			default:
				return product.condition;
		}
	}

	function formatTimeAgo(dateString: string | undefined) {
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

	// Check user interactions (likes, saves)
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
			const { data: savedData } = await supabase
				.from('wishlists')
				.select('id')
				.eq('listing_id', product.id)
				.eq('user_id', currentUser.id)
				.maybeSingle();

			isSaved = !!savedData;
		} catch (error) {
			console.error('Error checking user interactions:', error);
		}
	}

	// Like functionality
	async function toggleLike() {
		if (!product || !currentUser || isLoading || !supabase) {
			if (!currentUser) {
				toast.info('Please sign in to like products');
			}
			return;
		}

		isLoading = true;

		// Show heart animation
		showHeartAnimation = true;
		setTimeout(() => (showHeartAnimation = false), 1000);

		// Optimistic update
		const wasLiked = isLiked;
		isLiked = !isLiked;
		localLikesCount += isLiked ? 1 : -1;

		try {
			if (!wasLiked) {
				await supabase.from('listing_likes').insert({
					listing_id: product.id,
					user_id: currentUser.id,
				});
			} else {
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
		if (!product || !currentUser || isLoading || !supabase) {
			if (!currentUser) {
				toast.info('Please sign in to save products');
			}
			return;
		}

		isLoading = true;
		const wasSaved = isSaved;
		isSaved = !isSaved;

		try {
			if (!wasSaved) {
				await supabase.from('wishlists').insert({
					listing_id: product.id,
					user_id: currentUser.id,
				});
			} else {
				await supabase
					.from('wishlists')
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
	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: product.title,
				text: `Check out ${product.title} on Driplo`,
				url: productUrl,
			});
		} else {
			showShareOptions = true;
		}
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
		showShareOptions = false;
	}

	// Image navigation
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

	function selectImage(index: number) {
		currentImageIndex = Math.max(0, Math.min(index, allImages.length - 1));
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

	// Navigation functions
	function visitSeller() {
		onClose();
		if (product.seller.username) {
			goto(`/profile/${product.seller.username}`);
		} else {
			goto(`/profile/${product.seller.id}`);
		}
	}

	function messageSeller() {
		if (!currentUser) {
			toast.info('Please sign in to message sellers');
			return;
		}
		onClose();
		goto(`/messages/${product.seller.id}?listing=${product.id}`);
	}

	function viewFullProduct() {
		onClose();
		goto(`/products/${product.id}`);
	}

	function handleBuyNow() {
		if (!currentUser) {
			toast.info('Please sign in to buy products');
			return;
		}
		// TODO: Implement buy now functionality
		toast.info('Buy now feature coming soon!');
	}

	// Handle ESC key and backdrop click
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={handleBackdropClick}
	>
		<!-- Dialog Content -->
		<div
			class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-zinc-200 p-4">
				<div class="flex items-center gap-3 min-w-0 flex-1">
					<!-- Seller Avatar -->
					<button onclick={visitSeller} class="flex-shrink-0">
						{#if product.seller.avatar_url}
							<img
								src={product.seller.avatar_url}
								alt={sellerName}
								class="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
							/>
						{:else}
							<div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-sm">
								<span class="text-white font-semibold text-xs">
									{sellerName.charAt(0).toUpperCase()}
								</span>
							</div>
						{/if}
					</button>

					<!-- Seller Info -->
					<div class="min-w-0 flex-1">
						<button onclick={visitSeller} class="flex items-center gap-1 group">
							<span class="truncate text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
								{sellerName}
							</span>
							{#if product.seller.verified || product.seller.seller_verified}
								<Verified size={14} class="text-blue-600 flex-shrink-0" />
							{/if}
						</button>
						<div class="flex items-center gap-2 text-xs text-zinc-500">
							{#if product.seller.seller_rating && product.seller.seller_rating > 0}
								<div class="flex items-center gap-1">
									<Star size={10} class="text-yellow-400 fill-current" />
									<span>{product.seller.seller_rating.toFixed(1)}</span>
								</div>
							{/if}
							{#if formatTimeAgo(product.created_at)}
								<span>• {formatTimeAgo(product.created_at)}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Close Button -->
				<button
					onclick={onClose}
					class="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors flex-shrink-0 ml-4"
					aria-label="Close"
				>
					<X size={16} />
				</button>
			</div>

			<!-- Main Content -->
			<div class="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
				<!-- Image Section -->
				<div class="relative flex-1 lg:max-w-[60%] bg-black">
					<div
						class="relative aspect-square lg:aspect-[4/5] overflow-hidden select-none bg-zinc-100"
						ontouchstart={handleTouchStart}
						ontouchend={handleTouchEnd}
					>
						<img
							src={currentImage}
							alt={product.title}
							class="h-full w-full object-cover transition-opacity duration-300"
							loading="lazy"
						/>

						<!-- Navigation Arrows -->
						{#if hasMultipleImages}
							<button
								onclick={prevImage}
								class="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex === 0 ? 'pointer-events-none opacity-30' : ''}"
								aria-label="Previous image"
								disabled={currentImageIndex === 0}
							>
								<ChevronLeft size={20} />
							</button>
							<button
								onclick={nextImage}
								class="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex === allImages.length - 1 ? 'pointer-events-none opacity-30' : ''}"
								aria-label="Next image"
								disabled={currentImageIndex === allImages.length - 1}
							>
								<ChevronRight size={20} />
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
						{#if showHeartAnimation}
							<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
								<div class="animate-ping">
									<Heart size={80} class="text-red-500 drop-shadow-lg" fill="currentColor" />
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Product Info Section -->
				<div class="flex-1 lg:max-w-[40%] overflow-y-auto">
					<div class="p-6 space-y-6">
						<!-- Title and Price -->
						<div>
							<h1 class="text-xl lg:text-2xl font-bold text-zinc-900 mb-2 leading-tight">
								{product.title}
							</h1>
							<div class="flex items-baseline gap-3">
								<span class="text-2xl lg:text-3xl font-bold text-blue-600">
									{product.currency === 'BGN' ? 'лв' : '$'}{product.price.toLocaleString()}
								</span>
								{#if product.original_price && product.original_price > product.price}
									<span class="text-lg text-zinc-500 line-through">
										{product.currency === 'BGN' ? 'лв' : '$'}{product.original_price.toLocaleString()}
									</span>
								{/if}
							</div>
						</div>

						<!-- Product Details -->
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
								<span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700 font-medium">
									{product.color}
								</span>
							{/if}
							{#if getConditionLabel()}
								<span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700 font-medium">
									<Shield size={12} />
									{getConditionLabel()}
								</span>
							{/if}
						</div>

						<!-- Description -->
						{#if product.description}
							<div>
								<p class="text-sm text-zinc-700 leading-relaxed line-clamp-3">
									{product.description}
								</p>
							</div>
						{/if}

						<!-- Shipping Info -->
						{#if product.shipping_available || product.location || product.city}
							<div class="p-4 bg-zinc-50 rounded-lg">
								<div class="space-y-2 text-sm">
									{#if product.location || product.city}
										<div class="flex items-center gap-2">
											<MapPin size={14} class="text-zinc-500" />
											<span class="text-zinc-700 font-medium">
												{product.city || product.location}
											</span>
										</div>
									{/if}
									{#if product.shipping_available}
										<div class="flex items-center gap-2">
											<Truck size={14} class="text-green-500" />
											<span class="text-green-700 font-medium">
												{product.shipping_price === 0 ? 'Free shipping' : `Shipping +${product.currency === 'BGN' ? 'лв' : '$'}${product.shipping_price}`}
											</span>
										</div>
									{/if}
								</div>
							</div>
						{/if}

						<!-- Engagement Stats -->
						{#if localLikesCount > 0 || product.view_count}
							<div class="flex items-center gap-4 text-sm text-zinc-600">
								{#if localLikesCount > 0}
									<span class="flex items-center gap-1">
										<Heart size={14} class="text-red-500" />
										{localLikesCount.toLocaleString()} {localLikesCount === 1 ? 'like' : 'likes'}
									</span>
								{/if}
								{#if product.view_count}
									<span class="flex items-center gap-1">
										<Eye size={14} class="text-zinc-500" />
										{product.view_count.toLocaleString()} {product.view_count === 1 ? 'view' : 'views'}
									</span>
								{/if}
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="space-y-3">
							<!-- Primary Actions -->
							<div class="grid grid-cols-2 gap-3">
								{#if currentUser && currentUser.id !== product.seller.id}
									<button
										onclick={messageSeller}
										class="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl font-semibold transition-colors"
									>
										<MessageCircle size={18} />
										Message
									</button>
									<button
										onclick={handleBuyNow}
										class="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
									>
										<ShoppingBag size={18} />
										Buy Now
									</button>
								{:else if !currentUser}
									<button
										onclick={() => toast.info('Please sign in to contact sellers')}
										class="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold transition-colors"
									>
										<MessageCircle size={18} />
										Message
									</button>
									<button
										onclick={() => toast.info('Please sign in to buy products')}
										class="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
									>
										<ShoppingBag size={18} />
										Buy Now
									</button>
								{:else}
									<div class="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 text-zinc-500 rounded-xl font-semibold">
										Your Product
									</div>
								{/if}
							</div>

							<!-- Secondary Actions -->
							<div class="flex items-center justify-center gap-6 py-3">
								<button
									onclick={toggleLike}
									disabled={isLoading}
									class="flex items-center gap-2 text-sm font-medium transition-colors {isLiked
										? 'text-red-500'
										: 'text-zinc-600 hover:text-red-500'} {isLoading ? 'opacity-50' : ''}"
								>
									<Heart size={16} class={isLiked ? 'fill-current' : ''} />
									{isLiked ? 'Liked' : 'Like'}
								</button>

								<button
									onclick={handleShare}
									class="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors"
								>
									<Share2 size={16} />
									Share
								</button>

								<button
									onclick={toggleSave}
									disabled={isLoading}
									class="flex items-center gap-2 text-sm font-medium transition-colors {isSaved
										? 'text-blue-600'
										: 'text-zinc-600 hover:text-blue-600'} {isLoading ? 'opacity-50' : ''}"
								>
									<Bookmark size={16} class={isSaved ? 'fill-current' : ''} />
									{isSaved ? 'Saved' : 'Save'}
								</button>
							</div>

							<!-- View Full Details -->
							<button
								onclick={viewFullProduct}
								class="w-full py-3 px-4 border border-zinc-300 hover:border-zinc-400 text-zinc-700 hover:text-zinc-900 rounded-xl font-medium transition-colors"
							>
								View Full Details
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Share Options Modal -->
			{#if showShareOptions}
				<div class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
					<div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-scale-in">
						<h3 class="text-lg font-bold text-zinc-900 mb-4 text-center">Share this product</h3>
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
						<button
							onclick={() => (showShareOptions = false)}
							class="w-full mt-4 py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-scale-in {
		animation: scaleIn 0.2s ease-out;
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>