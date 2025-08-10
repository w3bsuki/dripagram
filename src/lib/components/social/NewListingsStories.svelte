<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import QuickViewModal from '$lib/components/modals/QuickViewModal.svelte';
	import type { FeedProduct } from '$lib/types';

	type Story = {
		id: string;
		product: FeedProduct;
		isNew: boolean; // Posted within last 24 hours
		hasMultipleImages: boolean;
	};

	let { 
		products,
		onStoryClick,
		onAddListing,
		currentUserId
	}: {
		products: FeedProduct[];
		onStoryClick?: (product: FeedProduct) => void;
		onAddListing?: () => void;
		currentUserId?: string;
	} = $props();

	let selectedProduct = $state<FeedProduct | null>(null);
	let selectedProductIndex = $state<number>(-1);
	let showQuickView = $state(false);

	// Transform products into stories (last 20 newest)
	const stories = $derived(
		products
			.slice(0, 20)
			.map(product => ({
				id: product.id,
				product,
				isNew: isWithin24Hours(product.created_at),
				hasMultipleImages: (product.images?.length ?? 0) > 1
			}))
	);

	function isWithin24Hours(dateString: string): boolean {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		return diff < 24 * 60 * 60 * 1000;
	}

	function handleStoryClick(story: Story, index: number) {
		selectedProduct = story.product;
		selectedProductIndex = index;
		showQuickView = true;
		
		// Call original handler if provided
		if (onStoryClick) {
			onStoryClick(story.product);
		}
	}

	function closeQuickView() {
		showQuickView = false;
		selectedProduct = null;
		selectedProductIndex = -1;
	}

	function showNextProduct() {
		if (selectedProductIndex < stories.length - 1) {
			selectedProductIndex++;
			selectedProduct = stories[selectedProductIndex].product;
		}
	}

	function showPreviousProduct() {
		if (selectedProductIndex > 0) {
			selectedProductIndex--;
			selectedProduct = stories[selectedProductIndex].product;
		}
	}

	function formatTimeAgo(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		
		if (diffHours < 1) {
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
		}
		if (diffHours < 24) {
			return `${diffHours}h ago`;
		}
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}
</script>

<!-- Instagram-style Stories Bar for New Listings -->
<div class="stories-bar">
	<div class="stories-container">
		<!-- Add Your Listing Story (First Position) -->
		{#if onAddListing}
			<button 
				class="story-item add-story"
				onclick={onAddListing}
				aria-label="Add new listing"
			>
				<div class="story-circle">
					<div class="add-icon-wrapper">
						<Plus size={28} strokeWidth={2.5} />
					</div>
				</div>
				<span class="story-label">Your Story</span>
			</button>
		{/if}

		<!-- Product Stories -->
		{#each stories as story, index (story.id)}
			<button 
				class="story-item {story.isNew ? 'has-new' : ''}"
				onclick={() => handleStoryClick(story, index)}
				aria-label="View {story.product.title}"
			>
				<div class="story-circle">
					<!-- Gradient ring for new items -->
					{#if story.isNew}
						<div class="story-ring"></div>
					{/if}
					
					<!-- Product Image -->
					<div class="story-image-wrapper">
						<img 
							src={story.product.thumbnail_url || story.product.images?.[0] || '/placeholder.jpg'} 
							alt={story.product.title}
							class="img-story"
							loading="lazy"
						/>

						<!-- Multiple Images Indicator -->
						{#if story.hasMultipleImages}
							<div class="multi-image-indicator">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="white">
									<rect x="1" y="1" width="10" height="10" fill="white" opacity="0.8" />
									<rect x="4" y="4" width="10" height="10" fill="white" />
								</svg>
							</div>
						{/if}
					</div>

					<!-- Price Badge -->
					<div class="price-badge">
						{story.product.price}лв
					</div>

					<!-- Seller Avatar (small overlay) -->
					{#if story.product.seller?.avatar_url}
						<div class="seller-avatar">
							<img 
								src={story.product.seller.avatar_url} 
								alt={story.product.seller.username}
								class="img-avatar-sm"
							/>
							{#if story.product.seller.verified}
								<div class="verified-tick">✓</div>
							{/if}
						</div>
					{/if}
				</div>
				
				<!-- Story Label -->
				<span class="story-label">
					<span class="seller-name">{story.product.seller?.username || 'Seller'}</span>
					<span class="time-ago">{formatTimeAgo(story.product.created_at)}</span>
				</span>
			</button>
		{/each}
	</div>
</div>

<!-- Quick View Modal -->
<QuickViewModal 
	product={selectedProduct}
	isOpen={showQuickView}
	onClose={closeQuickView}
	onNext={selectedProductIndex < stories.length - 1 ? showNextProduct : undefined}
	onPrevious={selectedProductIndex > 0 ? showPreviousProduct : undefined}
	hasNext={selectedProductIndex < stories.length - 1}
	hasPrevious={selectedProductIndex > 0}
/>

<style>
	.stories-bar {
		background: white;
		border-bottom: 1px solid var(--color-gray-300);
		height: 130px; /* Increased for premium visibility */
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.stories-container {
		display: flex;
		gap: 0.75rem;
		padding: 0 1rem;
		overflow-x: auto;
		overflow-y: visible;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
		height: 100%;
		align-items: center;
	}

	.stories-container::-webkit-scrollbar {
		display: none;
	}

	.story-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: transform 0.2s;
		width: 80px; /* Increased for premium visibility */
		height: 110px; /* Increased height */
	}

	.story-item:active {
		transform: scale(0.95);
	}

	/* Add Story Button - Black border */
	.add-story .story-circle {
		width: 76px;
		height: 76px;
		border-radius: 50%;
		background: transparent;
		border: 1.5px solid #000000; /* Black border */
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.2s ease;
	}

	.add-story:hover .story-circle {
		border-color: #333; /* Slightly lighter border on hover */
		transform: scale(1.05);
	}

	.add-icon-wrapper {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #000000; /* Black icon */
	}

	/* Product Story Circle - Clean Instagram style */
	.story-circle {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		position: relative;
		padding: 0; /* No padding */
	}

	/* Gradient ring for new stories - Instagram style */
	.story-ring {
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4);
		z-index: -1;
		padding: 2px;
	}

	.story-image-wrapper {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid white; /* White separator from gradient */
		background: white;
		position: relative;
		box-sizing: border-box;
	}

	.story-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Price Badge */
	.price-badge {
		position: absolute;
		bottom: -3px;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8));
		color: white;
		padding: 3px 8px;
		border-radius: 12px;
		font-size: 10px;
		font-weight: 600;
		white-space: nowrap;
		backdrop-filter: blur(8px);
		z-index: 2;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		border: 0.5px solid rgba(255, 255, 255, 0.1);
	}

	/* Multiple Images Indicator */
	.multi-image-indicator {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Seller Avatar Overlay */
	.seller-avatar {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid white;
		overflow: hidden;
		background: white;
		z-index: 3;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.seller-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.verified-tick {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 12px;
		height: 12px;
		background: #1d9bf0;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: bold;
		border: 1px solid white;
	}

	/* Story Label */
	.story-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		width: 66px;
		height: 28px; /* Fixed height for label area */
		text-align: center;
		overflow: hidden;
	}

	.seller-name {
		font-size: 11px;
		font-weight: 500;
		color: #1f2937;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
		line-height: 1.2;
	}

	.time-ago {
		font-size: 9px;
		color: #6b7280;
		font-weight: 400;
		line-height: 1.2;
	}

	.add-story .story-label {
		font-size: 11px;
		font-weight: 500;
		color: #1f2937;
	}

	/* Hover effects for desktop */
	@media (hover: hover) {
		.story-item:hover {
			transform: translateY(-2px);
		}

		.story-item:hover .story-image-wrapper {
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}
	}

	/* Mobile optimizations - FIXED borders */
	@media (max-width: 640px) {
		.stories-bar {
			height: 120px;
			/* Force GPU acceleration for smooth rendering */
			transform: translateZ(0);
			-webkit-transform: translateZ(0);
		}

		.stories-container {
			padding: 0 0.75rem;
			gap: 0.625rem;
		}

		.story-item {
			width: 72px;
			height: 100px;
		}

		.story-circle {
			width: 64px; /* Smaller regular stories on mobile */
			height: 64px;
		}

		.story-image-wrapper {
			width: 100%;
			height: 100%;
			border: 2px solid white; /* Clean white separator */
		}

		.add-story .story-circle {
			width: 68px;
			height: 68px;
			border: 1px solid #000000; /* Thin black border on mobile */
			background: transparent;
		}

		.add-icon-wrapper {
			width: 64px; /* Adjusted for bigger "Your Story" */
			height: 64px;
		}

		.story-label {
			width: 66px;
			height: 26px;
		}

		/* Instagram gradient on mobile */
		.story-ring {
			inset: -2px;
			padding: 2px;
		}
	}
</style>