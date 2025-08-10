<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
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

	// Transform products into stories (last 20 newest)
	const stories = $derived(
		products
			.slice(0, 20)
			.map(product => ({
				id: product.id,
				product,
				isNew: isWithin24Hours(product.created_at),
				hasMultipleImages: product.images?.length > 1
			}))
	);

	function isWithin24Hours(dateString: string): boolean {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		return diff < 24 * 60 * 60 * 1000;
	}

	function handleStoryClick(story: Story) {
		if (onStoryClick) {
			onStoryClick(story.product);
		} else {
			// Default: navigate to product page
			window.location.href = `/products/${story.product.id}`;
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
		{#each stories as story (story.id)}
			<button 
				class="story-item {story.isNew ? 'has-new' : ''}"
				onclick={() => handleStoryClick(story)}
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

<style>
	.stories-bar {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		height: 120px; /* Fixed height to prevent layout shift */
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
		width: 72px; /* Fixed width */
		height: 100px; /* Fixed height */
	}

	.story-item:active {
		transform: scale(0.95);
	}

	/* Add Story Button */
	.add-story .story-circle {
		width: 66px;
		height: 66px;
		border-radius: 50%;
		background: transparent;
		border: 1px solid #2563eb; /* Thin blue border only */
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.2s ease;
	}

	.add-story:hover .story-circle {
		border-color: #1d4ed8;
		transform: scale(1.05);
	}

	.add-icon-wrapper {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2563eb;
	}

	/* Product Story Circle */
	.story-circle {
		width: 66px;
		height: 66px;
		border-radius: 50%;
		position: relative;
		padding: 2px;
	}

	/* Gradient ring for new stories */
	.story-ring {
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		background: linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
		z-index: -1;
		animation: rotate 3s linear infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.story-image-wrapper {
		width: 62px;
		height: 62px;
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid white;
		background: white;
		position: relative;
	}

	.story-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Price Badge */
	.price-badge {
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 10px;
		font-size: 9px;
		font-weight: 600;
		white-space: nowrap;
		backdrop-filter: blur(4px);
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
		top: 25%;
		right: -2px;
		transform: translateY(-50%);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid white;
		overflow: hidden;
		background: white;
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

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.stories-bar {
			height: 110px; /* Slightly smaller on mobile */
		}

		.stories-container {
			padding: 0 0.75rem;
			gap: 0.5rem;
		}

		.story-item {
			width: 66px;
			height: 94px;
		}

		.story-circle {
			width: 60px;
			height: 60px;
		}

		.story-image-wrapper {
			width: 56px;
			height: 56px;
		}

		.add-icon-wrapper {
			width: 54px;
			height: 54px;
		}

		.story-label {
			width: 60px;
			height: 26px;
		}
	}
</style>