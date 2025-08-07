<script lang="ts">
	import {
		Heart,
		Share2,
		Bookmark,
		Eye,
		MoreHorizontal,
		ShoppingBag,
		User,
		Play,
	} from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/supabase/database.types';
	import { page } from '$app/stores';
	import QuickViewDialog from './QuickViewDialog.svelte';

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
		variant?: 'grid' | 'feed';
		showQuickShop?: boolean;
		showVideo?: boolean;
		showSellerInfo?: boolean;
		showEngagement?: boolean;
		showTimestamp?: boolean;
		enableDoubleTab?: boolean;
		enableQuickView?: boolean;
	}

	let {
		product,
		variant = 'grid',
		showQuickShop = false,
		showVideo = false,
		showSellerInfo = false,
		showEngagement = true,
		showTimestamp = false,
		enableDoubleTab = true,
		enableQuickView = true,
	}: Props = $props();

	// Reactive state using $state()
	let isLiked = $state(product.is_liked && product.is_liked.length > 0);
	let likesCount = $state(product.likes?.[0]?.count || product.like_count || 0);
	let viewCount = $state(product.view_count || 0);
	let saved = $state(false);
	let showQuickShopModal = $state(false);
	let showQuickViewDialog = $state(false);
	let selectedSize = $state('');
	let showHeartAnimation = $state(false);
	let isLoading = $state(false);
	let imageLoaded = $state(false);
	let currentImageIndex = $state(0);
	let touchStartTime = $state(0);
	let lastTap = $state(0);
	let showLongPressMenu = $state(false);
	let cardElement = $state<HTMLElement | null>(null);
	let touchActive = $state(false);

	// Derived values using $derived()
	let currentUser = $derived($page.data.user);
	let sellerName = $derived(product.seller?.username || product.seller?.full_name || 'Anonymous');
	let primaryImage = $derived(product.thumbnail_url || product.images?.[0] || '/placeholder.jpg');
	let hasMultipleImages = $derived(product.images && product.images.length > 1);
	let currentImage = $derived(product.images?.[currentImageIndex] || primaryImage);
	function getConditionLabel() {
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
				return null;
		}
	}

	function getTimeAgo() {
		if (!product.created_at) return '';
		const date = new Date(product.created_at);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return '1 day ago';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
		return date.toLocaleDateString();
	}

	// Check if user has liked this product on mount
	$effect(() => {
		if (currentUser && product.id) {
			checkUserLike();
			checkUserSaved();
		}
	});

	async function checkUserLike() {
		if (!currentUser || !supabase) return;

		try {
			const { data } = await supabase
				.from('listing_likes')
				.select('id')
				.eq('listing_id', product.id)
				.eq('user_id', currentUser.id)
				.maybeSingle();

			isLiked = !!data;
		} catch (error) {
			console.error('Error checking like status:', error);
		}
	}

	async function checkUserSaved() {
		if (!currentUser || !supabase) return;

		try {
			const { data } = await supabase
				.from('wishlists')
				.select('id')
				.eq('listing_id', product.id)
				.eq('user_id', currentUser.id)
				.maybeSingle();

			saved = !!data;
		} catch (error) {
			console.error('Error checking saved status:', error);
		}
	}

	async function toggleLike() {
		if (!currentUser || isLoading || !supabase) return;

		isLoading = true;

		// Show heart animation
		showHeartAnimation = true;
		setTimeout(() => (showHeartAnimation = false), 1000);

		// Optimistically update UI
		const wasLiked = isLiked;
		isLiked = !isLiked;
		likesCount += isLiked ? 1 : -1;

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

			// Update the listing's like count
			const { data } = await supabase
				.from('listings')
				.update({ like_count: likesCount })
				.eq('id', product.id)
				.select('like_count')
				.single();

			if (data) {
				likesCount = data.like_count;
			}
		} catch (error) {
			// Revert optimistic update on error
			isLiked = wasLiked;
			likesCount += wasLiked ? 1 : -1;
			console.error('Error toggling like:', error);
		} finally {
			isLoading = false;
		}
	}

	async function toggleSave() {
		if (!currentUser || isLoading || !supabase) return;

		isLoading = true;
		const wasSaved = saved;
		saved = !saved;

		try {
			if (!wasSaved) {
				await supabase
					.from('wishlists')
					.insert({ user_id: currentUser.id, listing_id: product.id });
			} else {
				await supabase
					.from('wishlists')
					.delete()
					.eq('listing_id', product.id)
					.eq('user_id', currentUser.id);
			}
		} catch (error) {
			saved = wasSaved;
			console.error('Error toggling save:', error);
		} finally {
			isLoading = false;
		}
	}

	function share() {
		const url = `/products/${product.id}`;
		if (navigator.share) {
			navigator.share({
				title: product.title,
				text: `Check out ${product.title} on Driplo`,
				url: window.location.origin + url,
			});
		} else {
			navigator.clipboard.writeText(window.location.origin + url);
		}
	}

	function handleImageTap(event: TouchEvent | MouseEvent | KeyboardEvent) {
		if (!enableDoubleTab || !hasMultipleImages) return;

		const currentTime = Date.now();
		const tapLength = currentTime - touchStartTime;

		if (tapLength < 500 && currentTime - lastTap < 300) {
			// Double tap detected - like the product
			event.preventDefault();
			toggleLike();
		} else {
			// Single tap - cycle through images
			if (hasMultipleImages) {
				currentImageIndex = (currentImageIndex + 1) % product.images!.length;
			}
		}

		lastTap = currentTime;
	}

	function handleLongPress(event: TouchEvent | MouseEvent) {
		event.preventDefault();
		showLongPressMenu = true;
		setTimeout(() => (showLongPressMenu = false), 3000);
	}

	function quickAddToCart() {
		if (!selectedSize && product.size) return;
		showQuickShopModal = false;
		// TODO: Add to cart logic
	}

	function handleTouchStart() {
		touchActive = true;
		if (cardElement) {
			cardElement.classList.add('touch-active');
		}
	}

	function handleTouchEnd() {
		// Keep the touch active state for a brief moment to allow interaction
		setTimeout(() => {
			touchActive = false;
			if (cardElement) {
				cardElement.classList.remove('touch-active');
			}
		}, 100);
	}
</script>

{#if variant === 'feed'}
	<!-- Feed Style Card (Instagram-like) -->
	<article class="feed-card mb-section" data-product-id={product.id}>
		<!-- Seller Header -->
		<div class="p-component flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/profile/{product.seller.username || product.seller.id}" class="flex-shrink-0">
					{#if product.seller.avatar_url}
						<img
							src={product.seller.avatar_url}
							alt={sellerName}
							class="border-border-secondary h-8 w-8 rounded-full border object-cover"
						/>
					{:else}
						<div class="bg-surface-secondary flex h-8 w-8 items-center justify-center rounded-full">
							<User size={16} class="text-text-tertiary" />
						</div>
					{/if}
				</a>
				<div class="min-w-0 flex-1">
					<a
						href="/profile/{product.seller.username || product.seller.id}"
						class="group flex items-center gap-1"
					>
						<span
							class="text-text-primary group-hover:text-interactive-primary truncate text-sm font-semibold transition-colors"
						>
							{sellerName}
						</span>
						{#if product.seller.verified}
							<div
								class="bg-interactive-primary flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
							>
								<svg viewBox="0 0 16 16" fill="white" class="h-2.5 w-2.5">
									<path
										d="M6.267 7.2l1.4 1.4 3.733-3.733.933.933L7.667 10.467l-2.333-2.334.933-.933z"
									/>
								</svg>
							</div>
						{/if}
					</a>
					<div class="text-text-tertiary text-xs">{getTimeAgo()}</div>
				</div>
			</div>

			<button
				onclick={() => (showLongPressMenu = !showLongPressMenu)}
				class="action-button"
				aria-label="More options"
			>
				<MoreHorizontal size={16} class="text-secondary" />
			</button>
		</div>

		<!-- Image Container -->
		<div
			class="bg-surface-secondary relative aspect-square select-none"
			role="button"
			tabindex="0"
			aria-label="Product image - {hasMultipleImages
				? 'tap to cycle through images, double-tap to like'
				: 'double-tap to like'}"
			ontouchstart={(e) => (touchStartTime = Date.now())}
			ontouchend={handleImageTap}
			onclick={handleImageTap}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleImageTap(e);
				}
			}}
			oncontextmenu={handleLongPress}
		>
			<!-- Main Image -->
			{#if !imageLoaded}
				<div class="skeleton-loader absolute inset-0"></div>
			{/if}

			<img
				src={currentImage}
				alt={product.title}
				loading="lazy"
				class="h-full w-full object-cover transition-opacity duration-300 {imageLoaded
					? 'opacity-100'
					: 'opacity-0'}"
				onload={() => (imageLoaded = true)}
			/>

			<!-- Video Indicator -->
			{#if showVideo && product.video_url}
				<div
					class="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[var(--color-primitive-black)]/70 px-2 py-1 text-xs text-[var(--color-text-inverse)] backdrop-blur-sm"
				>
					<Play size={12} />
					<span>Video</span>
				</div>
			{/if}

			<!-- Multiple Images Indicator -->
			{#if hasMultipleImages}
				<div
					class="absolute top-3 right-3 rounded-full bg-[var(--color-primitive-black)]/70 px-2.5 py-1 text-xs font-medium text-[var(--color-text-inverse)] backdrop-blur-sm"
				>
					{currentImageIndex + 1}/{product.images!.length}
				</div>

				<!-- Navigation Dots -->
				<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-1.5">
					{#each product.images || [] as _, index}
						<button
							class="h-2 w-2 rounded-full transition-all duration-200 {index === currentImageIndex
								? 'bg-[var(--color-surface-primary)]'
								: 'bg-[var(--color-surface-primary)]/40'}"
							onclick={() => (currentImageIndex = index)}
							aria-label="View image {index + 1}"
						></button>
					{/each}
				</div>
			{/if}

			<!-- Price Badge -->
			<div
				class="absolute bottom-4 left-4 rounded-full bg-[var(--color-surface-primary)]/95 px-3 py-2 shadow-lg backdrop-blur-sm"
			>
				<span class="text-interactive-primary font-mono text-lg font-bold">${product.price}</span>
			</div>

			<!-- Condition Badge -->
			{#if getConditionLabel()}
				<div
					class="bg-surface-success text-text-inverse absolute top-3 left-3 rounded-full px-2 py-1 text-xs font-medium"
				>
					{getConditionLabel()}
				</div>
			{/if}

			<!-- Heart Animation -->
			{#if showHeartAnimation}
				<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<Heart size={80} class="text-text-error animate-ping" fill="currentColor" />
				</div>
			{/if}
		</div>

		<!-- Actions Bar -->
		<div class="p-component flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button
					onclick={toggleLike}
					disabled={isLoading}
					class="action-button {isLoading ? 'opacity-50' : ''}"
					aria-label="{isLiked ? 'Unlike' : 'Like'} this product"
				>
					<Heart size={24} class={isLiked ? 'text-text-error fill-current' : 'text-text-primary'} />
				</button>

				<button onclick={share} class="action-button" aria-label="Share this product">
					<Share2 size={24} class="text-primary" />
				</button>

				<div class="text-text-tertiary flex items-center gap-2">
					<Eye size={16} />
					<span class="text-sm font-medium">{viewCount}</span>
				</div>
			</div>

			<button
				onclick={toggleSave}
				disabled={isLoading}
				class="action-button {isLoading ? 'opacity-50' : ''}"
				aria-label="{saved ? 'Unsave' : 'Save'} this product"
			>
				<Bookmark
					size={24}
					class={saved ? 'text-interactive-primary fill-current' : 'text-text-primary'}
				/>
			</button>
		</div>

		<!-- Likes Count -->
		{#if likesCount > 0}
			<div class="px-component pb-2">
				<div class="text-text-primary text-sm font-semibold">
					{likesCount.toLocaleString()}
					{likesCount === 1 ? 'like' : 'likes'}
				</div>
			</div>
		{/if}

		<!-- Product Info -->
		<div class="px-component pb-component">
			<div class="text-text-primary text-sm leading-relaxed">
				<a
					href="/products/{product.id}"
					class="hover:text-interactive-primary line-clamp-2 font-semibold transition-colors"
				>
					{product.title}
				</a>
				{#if product.description}
					<div class="text-text-secondary mt-1 line-clamp-3">{product.description}</div>
				{/if}
				{#if product.size}
					<div
						class="bg-surface-secondary text-text-primary mt-2 inline-block rounded-full px-2 py-1 text-xs"
					>
						Size: {product.size}
					</div>
				{/if}
			</div>
		</div>
	</article>
{:else}
	<!-- Grid Style Card -->
	<article 
		class="product-card group relative" 
		bind:this={cardElement}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
	>
		<a href="/products/{product.id}" class="block">
			<!-- Image Container -->
			<div class="bg-surface-secondary relative aspect-square overflow-hidden">
				{#if !imageLoaded}
					<div class="skeleton-loader absolute inset-0"></div>
				{/if}

				<img
					src={primaryImage}
					alt={product.title}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 {imageLoaded
						? 'opacity-100'
						: 'opacity-0'}"
					onload={() => (imageLoaded = true)}
				/>

				<!-- Price Badge -->
				<div
					class="absolute bottom-3 left-3 rounded-full bg-[var(--color-surface-primary)]/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"
				>
					<span class="text-interactive-primary font-mono text-sm font-bold">${product.price}</span>
				</div>

				<!-- Mobile Quick View Button -->
				{#if enableQuickView}
					<button
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							showQuickViewDialog = true;
						}}
						class="mobile-quick-view-btn md:hidden absolute bottom-3 right-3 bg-[var(--color-surface-primary)]/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-[var(--color-surface-primary)] transition-all duration-200"
						aria-label="Quick view"
					>
						<Eye size={16} class="text-interactive-primary" />
					</button>
				{/if}

				<!-- Multiple Images Indicator -->
				{#if hasMultipleImages}
					<div
						class="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[var(--color-primitive-black)]/70 px-2 py-1 text-xs text-[var(--color-text-inverse)] backdrop-blur-sm"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3">
							<path
								d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
							/>
							<path d="M14.5 12l-2.5 3-1.5-1.5L9 15l3-4 2.5 3.5z" />
						</svg>
					</div>
				{/if}

				<!-- Condition Badge -->
				{#if getConditionLabel()}
					<div
						class="bg-surface-success text-text-inverse absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-medium"
					>
						{getConditionLabel()}
					</div>
				{/if}

				<!-- Hover Stats Overlay -->
				<div class="product-overlay">
					<div class="text-text-inverse flex items-center gap-6">
						<div class="flex items-center gap-2">
							<Heart size={20} fill="currentColor" />
							<span class="font-semibold">{likesCount}</span>
						</div>
						<div class="flex items-center gap-2">
							<Eye size={20} />
							<span class="font-semibold">{viewCount}</span>
						</div>
					</div>
				</div>

				<!-- Action Buttons Overlay -->
				<div class="product-card__actions">
					<button 
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							toggleLike();
						}} 
						class="action-button" 
						aria-label="Like"
					>
						<Heart
							size={16}
							class={isLiked ? 'text-text-error fill-current' : 'text-text-secondary'}
						/>
					</button>

					{#if enableQuickView}
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								showQuickViewDialog = true;
							}}
							class="action-button bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover"
							aria-label="Quick view"
						>
							<Eye size={16} />
						</button>
					{/if}

					{#if showQuickShop}
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								showQuickShopModal = true;
							}}
							class="action-button bg-interactive-primary text-text-inverse hover:bg-interactive-primary-hover"
							aria-label="Quick shop"
						>
							<ShoppingBag size={16} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Product Info -->
			<div class="product-card__info">
				<!-- Seller Info -->
				<div class="mb-2 flex items-center gap-2">
					{#if product.seller.avatar_url}
						<img
							src={product.seller.avatar_url}
							alt={sellerName}
							class="border-border-secondary h-5 w-5 rounded-full border object-cover"
						/>
					{:else}
						<div class="bg-surface-secondary flex h-5 w-5 items-center justify-center rounded-full">
							<User size={12} class="text-text-tertiary" />
						</div>
					{/if}
					<span class="text-text-secondary truncate text-sm">
						{sellerName}
						{#if product.seller.verified}
							<span class="text-interactive-primary ml-1">✓</span>
						{/if}
					</span>
				</div>

				<!-- Product Title -->
				<h3
					class="text-text-primary group-hover:text-interactive-primary mb-1 line-clamp-2 leading-tight font-semibold transition-colors"
				>
					{product.title}
				</h3>

				<!-- Size and Tags -->
				<div class="mb-2 flex items-center gap-2">
					{#if product.size}
						<span class="bg-surface-secondary text-text-primary rounded-full px-2 py-1 text-xs">
							{product.size}
						</span>
					{/if}
					{#if product.tags && product.tags.length > 0}
						<span class="text-text-tertiary text-xs">
							#{product.tags[0]}
						</span>
					{/if}
				</div>

				<!-- Stats -->
				<div class="text-text-tertiary flex items-center justify-between text-sm">
					<div class="flex items-center gap-3">
						<span class="flex items-center gap-1">
							<Heart size={14} />
							{likesCount}
						</span>
						<span>{getTimeAgo()}</span>
					</div>
				</div>
			</div>
		</a>
	</article>
{/if}

<!-- Quick Shop Modal -->
{#if showQuickShopModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-primitive-black)]/60 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && (showQuickShopModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showQuickShopModal = false)}
	>
		<div class="card w-full max-w-sm rounded-2xl shadow-2xl">
			<!-- Modal Header -->
			<div class="border-primary relative border-b p-6">
				<div class="mb-3 flex items-center gap-3">
					<img
						src={primaryImage}
						alt={product.title}
						class="border-primary h-12 w-12 rounded-lg border object-cover"
					/>
					<div class="flex-1">
						<h3 class="text-primary line-clamp-1 text-lg font-semibold">{product.title}</h3>
						<p class="text-secondary text-sm">{sellerName}</p>
					</div>
				</div>
				<div class="text-brand font-mono text-2xl font-bold">${product.price}</div>

				<!-- Close Button -->
				<button
					onclick={() => (showQuickShopModal = false)}
					class="bg-surface-secondary hover:bg-surface-tertiary absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
					aria-label="Close"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-4 w-4">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Modal Content -->
			<div class="p-6">
				{#if product.size}
					<div class="mb-6">
						<label for="size-select" class="text-primary mb-3 block text-sm font-semibold">
							Select Size
						</label>
						<select id="size-select" bind:value={selectedSize} class="input text-sm">
							<option value="">Choose your size</option>
							<option value={product.size}>{product.size}</option>
						</select>
					</div>
				{/if}

				<!-- Action Buttons -->
				<div class="space-y-3">
					<button
						onclick={quickAddToCart}
						class="btn-primary w-full rounded-lg px-4 py-3 text-base font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
						disabled={!!product.size && !selectedSize}
					>
						Add to Cart
					</button>

					<a
						href="/products/{product.id}"
						class="btn-secondary block w-full rounded-lg px-4 py-3 text-center text-base font-semibold transition-all duration-150 active:scale-[0.98]"
					>
						View Details
					</a>
				</div>

				<!-- Quick Actions -->
				<div class="border-primary mt-6 flex items-center justify-center gap-6 border-t pt-4">
					<button
						onclick={toggleLike}
						class="flex items-center gap-2 text-sm font-medium transition-colors {isLiked
							? 'text-danger'
							: 'text-secondary hover:text-danger'}"
					>
						<Heart size={16} class={isLiked ? 'fill-current' : ''} />
						{isLiked ? 'Liked' : 'Like'}
					</button>

					<button
						onclick={share}
						class="text-secondary hover:text-brand flex items-center gap-2 text-sm font-medium transition-colors"
					>
						<Share2 size={16} />
						Share
					</button>

					<button
						onclick={toggleSave}
						class="flex items-center gap-2 text-sm font-medium transition-colors {saved
							? 'text-primary'
							: 'text-secondary hover:text-primary'}"
					>
						<Bookmark size={16} class={saved ? 'fill-current' : ''} />
						{saved ? 'Saved' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Long Press Menu -->
{#if showLongPressMenu}
	<div
		class="bg-surface-inverse text-inverse fixed top-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-4 py-2 text-sm font-medium shadow-xl"
	>
		Quick actions menu
	</div>
{/if}

<!-- Quick View Dialog -->
<QuickViewDialog
	{product}
	isOpen={showQuickViewDialog}
	onClose={() => (showQuickViewDialog = false)}
/>

<style>
	/* Product Card - Container-Aware */
	.product-card {
		container-type: inline-size;
		background: var(--color-surface-primary);
		border: var(--border-width-1) solid var(--color-border-secondary);
		border-radius: var(--border-radius-xl);
		overflow: hidden;
		transition: all var(--duration-fast) var(--ease-out);
		transform: translateY(0);
	}

	.product-card:hover {
		border-color: var(--color-border-primary);
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	/* Feed Card */
	.feed-card {
		container-type: inline-size;
		background: var(--color-surface-primary);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: all var(--duration-fast) var(--ease-out);
	}

	/* Product Card Info */
	.product-card__info {
		padding: var(--space-4);
	}

	/* Product Overlay */
	.product-overlay {
		position: absolute;
		inset: 0;
		background: var(--color-primitive-black) / 40;
		opacity: 0;
		transition: opacity var(--duration-normal) var(--ease-out);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.product-card:hover .product-overlay {
		opacity: 1;
	}

	/* Product Card Actions */
	.product-card__actions {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		opacity: 0;
		transform: translateY(var(--space-2));
		transition: all var(--duration-normal) var(--ease-out);
	}

	.product-card:hover .product-card__actions {
		opacity: 1;
		transform: translateY(0);
	}

	/* Action Button */
	.action-button {
		width: var(--size-touch-comfortable);
		height: var(--size-touch-comfortable);
		background: var(--color-surface-primary) / 90;
		backdrop-filter: blur(8px);
		border: none;
		border-radius: var(--border-radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		padding: var(--space-2);
	}

	.action-button:hover {
		background: var(--color-surface-primary);
		transform: scale(1.05);
	}

	/* Container Query Adaptations */
	@container (max-width: 200px) {
		.product-card__info {
			padding: var(--space-2);
		}

		.product-card__actions {
			display: none;
		}
	}

	@container (min-width: 250px) {
		.product-card__info {
			padding: var(--space-3);
		}

		.product-card__actions {
			display: flex;
		}
	}

	@container (min-width: 320px) {
		.product-card__info {
			padding: var(--space-4);
		}

		.product-card__actions {
			opacity: 0;
			transform: translateY(var(--space-2));
			transition: all var(--duration-normal) var(--ease-out);
		}

		/* Show actions on hover OR on touch/focus for better accessibility */
		.product-card:hover .product-card__actions,
		.product-card:focus-within .product-card__actions,
		.product-card.touch-active .product-card__actions {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile quick view button */
	.mobile-quick-view-btn {
		z-index: 10;
	}

	/* Ensure quick view works on touch devices */
	@media (hover: none) and (pointer: coarse) {
		.product-card__actions {
			opacity: 0.8;
			transform: translateY(0);
		}
	}
</style>
