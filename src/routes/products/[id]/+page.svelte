<script lang="ts">
	import { page } from '$app/stores';
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
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import ProductCard from '$lib/components/marketplace/ProductCard.svelte';

	// Use props to get data from server
	let { data } = $props<{ data: any }>();

	let product = $derived(data?.product);
	let currentUser = $derived(data?.user);
	let currentImageIndex = $state(0);
	let isLiked = $state(false);
	let isSaved = $state(false);
	let localLikesCount = $state(0);
	let showFullDescription = $state(false);
	let showDetailsModal = $state(false);
	let showShareModal = $state(false);
	let isImageLoaded = $state(false);
	let showHeart = $state(false);
	let relatedProducts = $state([]);

	// Update local likes count when product changes
	$effect(() => {
		if (product?.like_count !== undefined) {
			localLikesCount = product.like_count;
			loadRelatedProducts();
		}
	});

	// Get all images including thumbnail
	let allImages = $derived(
		product?.images && product.images.length > 0
			? product.images
			: product?.thumbnail_url
				? [product.thumbnail_url]
				: ['/placeholder.jpg']
	);

	// Get seller display name
	let sellerName = $derived(product?.seller?.username || product?.seller?.full_name || 'Anonymous');

	// Check if description is long
	let isLongDescription = $derived(product?.description && product.description.length > 150);

	function goBack() {
		goto('/');
	}

	// Check if user has liked this product on mount
	$effect(() => {
		if (currentUser && product?.id) {
			checkUserLike();
		}
	});

	async function checkUserLike() {
		const { supabase } = $page.data;
		const { data } = await supabase
			.from('product_likes')
			.select('id')
			.eq('product_id', product.id)
			.eq('user_id', currentUser.id)
			.single();

		isLiked = !!data;
	}

	async function loadRelatedProducts() {
		if (!product) return;

		const { supabase } = $page.data;
		const { data } = await supabase
			.from('products')
			.select(
				`
        *,
        seller:profiles!seller_id(*)
      `
			)
			.neq('id', product.id)
			.limit(6);

		if (data) {
			relatedProducts = data;
		}
	}

	async function toggleLike() {
		if (!product || !currentUser) return;

		// Show heart animation
		showHeart = true;
		setTimeout(() => (showHeart = false), 1000);

		const { supabase } = $page.data;
		const wasLiked = isLiked;
		isLiked = !isLiked;
		localLikesCount += isLiked ? 1 : -1;

		try {
			if (!wasLiked) {
				// Add like
				await supabase.from('product_likes').insert({
					product_id: product.id,
					user_id: currentUser.id,
				});
			} else {
				// Remove like
				await supabase
					.from('product_likes')
					.delete()
					.eq('product_id', product.id)
					.eq('user_id', currentUser.id);
			}

			// Update product likes count
			const { data } = await supabase
				.from('products')
				.update({ like_count: localLikesCount })
				.eq('id', product.id)
				.select('like_count')
				.single();

			if (data) {
				localLikesCount = data.like_count;
			}
		} catch (error) {
			// Revert on error
			isLiked = wasLiked;
			localLikesCount += wasLiked ? 1 : -1;
			console.error('Error toggling like:', error);
		}
	}

	function toggleSave() {
		isSaved = !isSaved;
	}

	function shareProduct() {
		if (navigator.share) {
			navigator.share({
				title: product?.title,
				url: window.location.href,
			});
		} else {
			showShareModal = true;
		}
	}

	function selectImage(index: number) {
		currentImageIndex = index;
	}

	function nextImage() {
		if (currentImageIndex < allImages.length - 1) {
			currentImageIndex += 1;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex -= 1;
		}
	}

	function visitSeller() {
		goto(`/@${product?.seller.username}`);
	}

	function messagesSeller() {
		goto(`/messages?seller=${product?.seller.username}`);
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		showShareModal = false;
	}

	function formatTimeAgo(dateString: string) {
		const now = new Date();
		const date = new Date(dateString);
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;
		return `${Math.floor(diffInDays / 7)}w ago`;
	}

	function handleDoubleClick() {
		toggleLike();
	}
</script>

<svelte:head>
	<title>{product?.title || 'Product'} - Driplo</title>
	<meta name="description" content={product?.description || 'Shop unique fashion on Driplo'} />
</svelte:head>

{#if product}
	<!-- Product Detail Page -->
	<div class="animate-fade-in relative mx-auto min-h-screen max-w-lg bg-white">
		<!-- Header -->
		<header
			class="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-300 bg-white/95 px-4 py-3 backdrop-blur-md"
		>
			<button onclick={goBack} class="btn-icon" aria-label="Go back">
				<ArrowLeft size={22} class="text-zinc-900" />
			</button>
			<h1 class="text-base font-semibold text-zinc-900">Product</h1>
			<button onclick={() => (showDetailsModal = true)} class="btn-icon" aria-label="More info">
				<Info size={20} class="text-zinc-900" />
			</button>
		</header>

		<!-- Post Header (Seller Info) -->
		<div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
			<button onclick={visitSeller} class="flex min-w-0 flex-1 items-center gap-3">
				<div class="rounded-full p-0.5 ring-2 ring-blue-500">
					<img
						src={product.seller.avatar_url ||
							`https://ui-avatars.com/api/?name=${sellerName}&background=1877f2&color=fff`}
						alt={sellerName}
						class="h-9 w-9 rounded-full bg-white object-cover"
						loading="lazy"
					/>
				</div>
				<div class="min-w-0 flex-1 text-left">
					<div class="mb-0.5 flex items-center gap-1.5">
						<span class="truncate text-sm font-semibold text-zinc-900">{sellerName}</span>
						{#if product.seller.verified}
							<div
								class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600"
							>
								<svg viewBox="0 0 24 24" fill="white" class="h-2 w-2">
									<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
								</svg>
							</div>
						{/if}
					</div>
					{#if product.created_at}
						<span class="text-xs font-medium text-zinc-500"
							>{formatTimeAgo(product.created_at)}</span
						>
					{/if}
				</div>
			</button>
			<button class="btn-primary flex-shrink-0 px-4 py-1.5 text-sm">Follow</button>
		</div>

		<!-- Image Carousel with Enhanced Navigation -->
		<div class="relative bg-black">
			<div
				class="relative aspect-square overflow-hidden bg-zinc-100 select-none"
				role="button"
				tabindex="0"
				ondblclick={handleDoubleClick}
				onkeydown={(e) => e.key === 'Enter' && handleDoubleClick()}
			>
				{#if !isImageLoaded}
					<div class="h-full w-full animate-pulse bg-zinc-200"></div>
				{/if}
				<img
					src={allImages[currentImageIndex]}
					alt={product.title}
					class="h-full w-full object-cover transition-all duration-500 {isImageLoaded
						? 'opacity-100'
						: 'opacity-0'}"
					loading="lazy"
					onload={() => (isImageLoaded = true)}
				/>

				<!-- Navigation Arrows -->
				{#if allImages.length > 1}
					<button
						onclick={prevImage}
						class="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex ===
						0
							? 'pointer-events-none opacity-30'
							: ''}"
						aria-label="Previous image"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						onclick={nextImage}
						class="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/70 {currentImageIndex ===
						allImages.length - 1
							? 'pointer-events-none opacity-30'
							: ''}"
						aria-label="Next image"
					>
						<ChevronRight size={18} />
					</button>
				{/if}

				<!-- Image Counter -->
				{#if allImages.length > 1}
					<div
						class="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
					>
						{currentImageIndex + 1} of {allImages.length}
					</div>
				{/if}

				<!-- Navigation Dots -->
				{#if allImages.length > 1}
					<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2">
						{#each allImages as _, index}
							<button
								class="h-2.5 w-2.5 rounded-full transition-all duration-300 {index ===
								currentImageIndex
									? 'scale-110 bg-white'
									: 'bg-white/50 hover:bg-white/70'}"
								onclick={() => selectImage(index)}
								aria-label="View image {index + 1}"
							></button>
						{/each}
					</div>
				{/if}

				<!-- Heart Animation Overlay -->
				{#if showHeart}
					<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
						<Heart
							size={100}
							class="animate-bounce text-[var(--color-text-error)] drop-shadow-lg"
							fill="currentColor"
						/>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action Bar -->
		<div class="flex items-center justify-between px-4 py-3">
			<div class="flex items-center gap-4">
				<button
					class="btn-icon like-button {isLiked ? 'liked' : ''}"
					onclick={toggleLike}
					aria-label="{isLiked ? 'Unlike' : 'Like'} this product"
				>
					<Heart
						size={26}
						class={isLiked ? 'fill-current text-[var(--color-text-error)]' : 'text-zinc-700'}
					/>
				</button>
				<button class="btn-icon" onclick={messagesSeller} aria-label="Message seller">
					<MessageCircle size={26} class="text-zinc-700" />
				</button>
				<button class="btn-icon" onclick={shareProduct} aria-label="Share product">
					<Share2 size={26} class="text-zinc-700" />
				</button>
			</div>
			<button
				class="btn-icon like-button {isSaved ? 'liked' : ''}"
				onclick={toggleSave}
				aria-label="{isSaved ? 'Unsave' : 'Save'} this product"
			>
				<Bookmark size={26} class={isSaved ? 'fill-current text-blue-600' : 'text-zinc-700'} />
			</button>
		</div>

		<!-- Engagement Stats -->
		<div class="px-4 py-2">
			<div class="flex items-center gap-4 text-sm">
				{#if localLikesCount > 0}
					<span class="font-semibold text-zinc-900">{localLikesCount.toLocaleString()} likes</span>
				{/if}
				{#if product.views}
					<span class="flex items-center gap-1 font-medium text-zinc-500">
						<Eye size={14} />
						{product.views.toLocaleString()} views
					</span>
				{/if}
			</div>
		</div>

		<!-- Product Info Section -->
		<div class="px-4 pb-4">
			<!-- Title and Price -->
			<div class="mb-4">
				<div class="mb-2 flex items-start justify-between gap-3">
					<h1 class="flex-1 text-lg leading-tight font-bold text-zinc-900">{product.title}</h1>
					<div class="flex-shrink-0 text-2xl font-bold text-blue-600">
						{product.price} лв
					</div>
				</div>

				<!-- Size and Category -->
				<div class="flex items-center gap-3 text-sm">
					{#if product.size}
						<span class="rounded-full bg-zinc-200 px-3 py-1 font-medium text-zinc-700">
							Size {product.size}
						</span>
					{/if}
					{#if product.category}
						<span class="font-medium text-zinc-500">in {product.category}</span>
					{/if}
				</div>
			</div>

			<!-- Description -->
			{#if product.description}
				<div style="margin-bottom: var(--space-4);">
					<div class="text-sm leading-relaxed" style="color: var(--color-text-primary);">
						<button
							onclick={visitSeller}
							class="font-semibold transition-colors"
							style="color: var(--color-text-primary);"
						>
							{sellerName}
						</button>
						<span style="margin-left: var(--space-2);">
							{#if isLongDescription && !showFullDescription}
								{product.description.slice(0, 150)}...
								<button
									onclick={() => (showFullDescription = true)}
									class="font-medium transition-colors"
									style="color: var(--color-text-secondary); margin-left: var(--space-1);"
								>
									more
								</button>
							{:else}
								{product.description}
								{#if isLongDescription && showFullDescription}
									<button
										onclick={() => (showFullDescription = false)}
										class="font-medium transition-colors"
										style="color: var(--color-text-secondary); margin-left: var(--space-1);"
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
				<div style="margin-bottom: var(--space-4);">
					<div class="flex flex-wrap" style="gap: var(--space-2);">
						{#each product.tags.slice(0, 5) as tag}
							<a
								href="/search?tag={tag}"
								class="text-sm font-medium transition-colors"
								style="color: var(--color-interactive-primary);"
							>
								#{tag}
							</a>
						{/each}
						{#if product.tags.length > 5}
							<span class="text-sm" style="color: var(--color-text-secondary);"
								>+{product.tags.length - 5} more</span
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Related Products Section -->
		{#if relatedProducts.length > 0}
			<div
				style="border-top: var(--border-width-1) solid var(--color-border-secondary); padding: var(--space-6) var(--space-4) var(--space-24) var(--space-4);"
			>
				<h2
					class="flex items-center text-lg font-bold"
					style="color: var(--color-text-primary); margin-bottom: var(--space-4); gap: var(--space-2);"
				>
					<ShoppingBag size={20} />
					More from this seller
				</h2>
				<div class="grid grid-cols-2" style="gap: var(--space-4);">
					{#each relatedProducts.slice(0, 4) as relatedProduct}
						<ProductCard product={relatedProduct} variant="grid" showQuickShop={true} />
					{/each}
				</div>
				{#if relatedProducts.length > 4}
					<button
						onclick={visitSeller}
						class="button button--secondary w-full"
						style="margin-top: var(--space-4); padding: var(--space-3) 0;"
					>
						View All Products
					</button>
				{/if}
			</div>
		{/if}

		<!-- Floating Action Buttons (Mobile) -->
		<div
			class="fixed bottom-0 left-1/2 w-full max-w-lg -translate-x-1/2 transform backdrop-blur-md"
			style="background: rgba(255, 255, 255, 0.95); border-top: var(--border-width-1) solid var(--color-border-primary); padding: var(--space-3) var(--space-4); padding-bottom: env(safe-area-inset-bottom);"
		>
			<div class="flex" style="gap: var(--space-3);">
				<button
					onclick={messagesSeller}
					class="button button--secondary flex-1 font-semibold"
					style="padding: var(--space-3) 0;"
				>
					<MessageCircle size={18} style="display: inline; margin-right: var(--space-2);" />
					Message
				</button>
				<button
					class="button button--primary flex-1 font-semibold"
					style="padding: var(--space-3) 0;"
				>
					<ShoppingBag size={18} style="display: inline; margin-right: var(--space-2);" />
					Buy Now
				</button>
			</div>
		</div>
	</div>

	<!-- Product Details Modal -->
	{#if showDetailsModal}
		<div
			class="animate-fadeIn fixed inset-0 flex items-end justify-center backdrop-blur-sm md:items-center"
			style="background: rgba(0, 0, 0, 0.6); z-index: var(--z-modal); padding: var(--space-4);"
			role="button"
			tabindex="0"
			onclick={() => (showDetailsModal = false)}
			onkeydown={(e) => e.key === 'Escape' && (showDetailsModal = false)}
		>
			<div
				class="animate-slideUp max-h-[80vh] w-full max-w-md overflow-y-auto"
				style="background: var(--color-surface-primary); border-radius: var(--border-radius-2xl); box-shadow: var(--shadow-2xl);"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.key === 'Enter' && e.stopPropagation()}
			>
				<!-- Modal Header -->
				<div
					class="sticky top-0"
					style="background: var(--color-surface-primary); border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0; padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6); border-bottom: var(--border-width-1) solid var(--color-border-secondary);"
				>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-bold" style="color: var(--color-text-primary);">
							Product Details
						</h3>
						<button
							onclick={() => (showDetailsModal = false)}
							class="flex items-center justify-center transition-colors"
							style="width: var(--space-8); height: var(--space-8); border-radius: var(--border-radius-full); background: var(--color-surface-secondary);"
							aria-label="Close"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								style="width: 20px; height: 20px;"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Modal Content -->
				<div
					style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6);"
				>
					<!-- Seller Info -->
					<div
						class="flex items-center"
						style="gap: var(--space-4); padding: var(--space-4); background: var(--color-surface-secondary); border-radius: var(--border-radius-xl);"
					>
						<img
							src={product.seller.avatar_url ||
								`https://ui-avatars.com/api/?name=${sellerName}&background=1877f2&color=fff`}
							alt={sellerName}
							class="object-cover"
							style="width: 48px; height: 48px; border-radius: var(--border-radius-full); border: var(--border-width-2) solid var(--color-surface-primary); box-shadow: var(--shadow-sm);"
						/>
						<div class="flex-1">
							<div
								class="flex items-center"
								style="gap: var(--space-2); margin-bottom: var(--space-1);"
							>
								<span class="font-semibold" style="color: var(--color-text-primary);"
									>{sellerName}</span
								>
								{#if product.seller.verified}
									<div
										class="flex items-center justify-center"
										style="width: 16px; height: 16px; border-radius: var(--border-radius-full); background: var(--color-interactive-primary); color: var(--color-text-inverse);"
									>
										<svg viewBox="0 0 24 24" fill="currentColor" style="width: 8px; height: 8px;">
											<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
										</svg>
									</div>
								{/if}
							</div>
							<div
								class="flex items-center text-sm"
								style="color: var(--color-text-secondary); gap: var(--space-3);"
							>
								<span class="flex items-center" style="gap: var(--space-1);">
									<Star size={12} style="color: #f59e0b;" />
									4.8 rating
								</span>
								<span class="flex items-center" style="gap: var(--space-1);">
									<Users size={12} />
									1.2k followers
								</span>
							</div>
						</div>
					</div>

					<!-- Product Specifications -->
					<div style="display: flex; flex-direction: column; gap: var(--space-4);">
						<h4 class="font-semibold" style="color: var(--color-text-primary);">Specifications</h4>
						<div class="grid grid-cols-2 text-sm" style="gap: var(--space-4);">
							{#if product.size}
								<div class="flex items-center" style="gap: var(--space-2);">
									<Package size={16} style="color: var(--color-text-secondary);" />
									<span style="color: var(--color-text-secondary);">Size:</span>
									<span class="font-medium">{product.size}</span>
								</div>
							{/if}
							{#if product.condition}
								<div class="flex items-center" style="gap: var(--space-2);">
									<Shield size={16} style="color: var(--color-text-secondary);" />
									<span style="color: var(--color-text-secondary);">Condition:</span>
									<span class="font-medium">{product.condition}</span>
								</div>
							{/if}
							{#if product.brand}
								<div class="flex items-center" style="gap: var(--space-2);">
									<Star size={16} style="color: var(--color-text-secondary);" />
									<span style="color: var(--color-text-secondary);">Brand:</span>
									<span class="font-medium">{product.brand}</span>
								</div>
							{/if}
							<div class="flex items-center" style="gap: var(--space-2);">
								<Calendar size={16} style="color: var(--color-text-secondary);" />
								<span style="color: var(--color-text-secondary);">Listed:</span>
								<span class="font-medium">{formatTimeAgo(product.created_at)}</span>
							</div>
						</div>
					</div>

					<!-- Shipping & Returns -->
					<div style="display: flex; flex-direction: column; gap: var(--space-3);">
						<h4 class="font-semibold" style="color: var(--color-text-primary);">
							Shipping & Returns
						</h4>
						<div
							class="text-sm"
							style="display: flex; flex-direction: column; gap: var(--space-2);"
						>
							<div class="flex items-center" style="gap: var(--space-3);">
								<Truck size={16} style="color: var(--color-text-success);" />
								<span style="color: var(--color-text-secondary);"
									>Free shipping on orders over 50 лв</span
								>
							</div>
							<div class="flex items-center" style="gap: var(--space-3);">
								<Clock size={16} style="color: var(--color-interactive-primary);" />
								<span style="color: var(--color-text-secondary);"
									>Delivery in 2-3 business days</span
								>
							</div>
							<div class="flex items-center" style="gap: var(--space-3);">
								<Shield size={16} style="color: var(--color-text-brand);" />
								<span style="color: var(--color-text-secondary);">30-day return policy</span>
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
			class="animate-fadeIn fixed inset-0 flex items-center justify-center backdrop-blur-sm"
			style="background: rgba(0, 0, 0, 0.6); z-index: var(--z-modal); padding: var(--space-4);"
			role="button"
			tabindex="0"
			onclick={() => (showShareModal = false)}
			onkeydown={(e) => e.key === 'Enter' && (showShareModal = false)}
			aria-label="Close share modal"
		>
			<div
				class="animate-slideUp w-full max-w-sm"
				style="background: var(--color-surface-primary); border-radius: var(--border-radius-2xl); box-shadow: var(--shadow-2xl);"
				role="dialog"
				aria-modal="true"
				aria-labelledby="share-modal-title"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div style="padding: var(--space-6);">
					<h3
						id="share-modal-title"
						class="text-center text-lg font-bold"
						style="color: var(--color-text-primary); margin-bottom: var(--space-4);"
					>
						Share this product
					</h3>
					<div style="display: flex; flex-direction: column; gap: var(--space-3);">
						<button
							onclick={() => copyToClipboard(window.location.href)}
							class="share-button w-full text-left transition-colors"
							style="padding: var(--space-3); border-radius: var(--border-radius-lg);"
						>
							<span class="font-medium">Copy link</span>
						</button>
						<button
							onclick={() =>
								copyToClipboard(`Check out ${product.title} on Driplo: ${window.location.href}`)}
							class="share-button w-full text-left transition-colors"
							style="padding: var(--space-3); border-radius: var(--border-radius-lg);"
						>
							<span class="font-medium">Copy with description</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div
		class="flex min-h-screen flex-col items-center justify-center"
		style="gap: var(--space-4); padding: var(--space-8);"
	>
		<div class="text-6xl" style="margin-bottom: var(--space-4);">🔍</div>
		<h2 class="text-center text-xl font-bold" style="color: var(--color-text-primary);">
			Product not found
		</h2>
		<p
			class="text-center"
			style="color: var(--color-text-secondary); margin-bottom: var(--space-6);"
		>
			This product might have been removed or doesn't exist.
		</p>
		<button
			onclick={goBack}
			class="button button--primary"
			style="padding: var(--space-3) var(--space-8);">Go Back</button
		>
	</div>
{/if}

<style>
	.share-button:hover {
		background: var(--color-surface-secondary);
	}
</style>
