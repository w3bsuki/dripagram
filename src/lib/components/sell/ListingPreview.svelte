<script lang="ts">
	import { CATEGORIES, CONDITIONS } from '$lib/data/categories';
	import type { ListingPreviewProps } from './types';

	let { listing, selectedCategory }: ListingPreviewProps = $props();

	let category = $derived(CATEGORIES.find((c) => c.id === selectedCategory));
	let conditionInfo = $derived(CONDITIONS.find((c) => c.id === listing.condition));
</script>

<div class="listing-preview">
	<div class="preview-header">
		<h2 class="preview-title">Preview Your Listing</h2>
		<p class="preview-subtitle">This is how your listing will appear to buyers</p>
	</div>

	<div class="preview-card">
		<!-- Images -->
		{#if listing.images && listing.images.length > 0}
			<div class="preview-image-container">
				<img src={listing.images[0]} alt={listing.title || 'Product'} class="preview-image" />
				{#if listing.images.length > 1}
					<div class="image-count-badge">
						+{listing.images.length - 1}
					</div>
				{/if}
			</div>
		{:else}
			<div class="preview-placeholder">
				<div class="placeholder-content">
					<div class="placeholder-icon">📷</div>
					<p class="placeholder-text">No photos added</p>
				</div>
			</div>
		{/if}

		<!-- Content -->
		<div class="preview-content">
			<!-- Title and Price -->
			<div class="title-price-section">
				<h3 class="preview-product-title">
					{listing.title || 'Untitled Item'}
				</h3>
				<p class="preview-price">
					{listing.price > 0 ? `${listing.price.toFixed(2)} BGN` : '0.00 BGN'}
				</p>
			</div>

			<!-- Details -->
			<div class="details-section">
				{#if category}
					<div class="detail-item">
						<span class="detail-icon">{category.emoji}</span>
						<span class="detail-text">{category.name}</span>
					</div>
				{/if}

				{#if conditionInfo}
					<div class="detail-item">
						<span class="detail-icon">{conditionInfo.emoji}</span>
						<span class="detail-text">{conditionInfo.name}</span>
					</div>
				{/if}

				{#if listing.brand}
					<div class="detail-item">
						<span class="detail-icon">🏷️</span>
						<span class="detail-text">{listing.brand}</span>
					</div>
				{/if}

				{#if listing.size}
					<div class="detail-item">
						<span class="detail-icon">📏</span>
						<span class="detail-text">Size {listing.size}</span>
					</div>
				{/if}

				{#if listing.location}
					<div class="detail-item">
						<span class="detail-icon">📍</span>
						<span class="detail-text">{listing.location}</span>
					</div>
				{/if}

				{#if listing.shipping_available}
					<div class="detail-item">
						<span class="detail-icon">🚚</span>
						<span class="detail-text">
							Shipping available {listing.shipping_price
								? `(${listing.shipping_price} BGN)`
								: ''}
						</span>
					</div>
				{/if}
			</div>

			<!-- Description -->
			{#if listing.description}
				<div class="description-section">
					<p class="description-text">{listing.description}</p>
				</div>
			{/if}

			<!-- Tags -->
			{#if listing.tags && listing.tags.length > 0}
				<div class="tags-section">
					<div class="tags-container">
						{#each listing.tags.slice(0, 3) as tag}
							<span class="tag-preview">#{tag}</span>
						{/each}
						{#if listing.tags.length > 3}
							<span class="tag-more">+{listing.tags.length - 3}</span>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.listing-preview {
		margin-bottom: var(--space-8);
	}

	.preview-header {
		margin-bottom: var(--space-6);
		text-align: center;
	}

	.preview-title {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.preview-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		line-height: 1.4;
		margin: 0;
	}

	.preview-card {
		margin: 0 auto;
		max-width: 28rem;
		overflow: hidden;
		border-radius: var(--border-radius-xl);
		border: 2px solid var(--color-border-primary);
		background: var(--color-surface-primary);
		box-shadow: var(--shadow-lg);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.preview-card:hover {
		border-color: var(--color-interactive-primary);
		box-shadow: var(--shadow-xl);
		transform: translateY(-2px);
	}

	/* Image Section */
	.preview-image-container {
		position: relative;
		aspect-ratio: 1;
		background: var(--color-surface-secondary);
	}

	.preview-image {
		height: 100%;
		width: 100%;
		object-fit: cover;
		display: block;
	}

	.image-count-badge {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		border-radius: var(--border-radius-full);
		background: rgba(0, 0, 0, 0.7);
		padding: var(--space-2) var(--space-2);
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: white;
		font-family: var(--font-family-sans);
		backdrop-filter: blur(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.preview-placeholder {
		display: flex;
		aspect-ratio: 1;
		align-items: center;
		justify-content: center;
		background: var(--color-surface-tertiary);
	}

	.placeholder-content {
		text-align: center;
		color: var(--color-text-tertiary);
	}

	.placeholder-icon {
		margin-bottom: var(--space-2);
		font-size: 48px;
		line-height: 1;
	}

	.placeholder-text {
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		font-weight: 500;
		margin: 0;
	}

	/* Content Section */
	.preview-content {
		padding: var(--space-4);
	}

	.title-price-section {
		margin-bottom: var(--space-3);
	}

	.preview-product-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.01em;
		margin: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.preview-price {
		margin-top: var(--space-1);
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		letter-spacing: -0.02em;
		margin-bottom: 0;
	}

	/* Details Section */
	.details-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.detail-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.detail-icon {
		font-size: 16px;
		line-height: 1;
		width: 20px;
		text-align: center;
		flex-shrink: 0;
	}

	.detail-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		line-height: 1.4;
		font-weight: 500;
	}

	/* Description Section */
	.description-section {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border-secondary);
	}

	.description-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		line-height: 1.5;
		margin: 0;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	/* Tags Section */
	.tags-section {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border-secondary);
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.tag-preview,
	.tag-more {
		border-radius: var(--border-radius-full);
		background: var(--color-surface-tertiary);
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-xs);
		font-weight: 500;
		font-family: var(--font-family-sans);
		line-height: 1.2;
	}

	.tag-preview {
		color: var(--color-text-secondary);
	}

	.tag-more {
		color: var(--color-text-tertiary);
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.preview-title {
			font-size: var(--font-size-2xl);
		}

		.preview-content {
			padding: var(--space-5);
		}

		.preview-product-title {
			font-size: var(--font-size-xl);
		}

		.preview-price {
			font-size: var(--font-size-3xl);
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.preview-card {
			border-width: 3px;
		}
		
		.image-count-badge {
			border: 2px solid white;
		}
		
		.description-section,
		.tags-section {
			border-top-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.preview-card {
			transition-duration: 0.01ms;
		}
		
		.preview-card:hover {
			transform: none;
		}
	}
</style>
