<script lang="ts">
	import { Heart, Grid, List, ShoppingBag, Sparkles } from '@lucide/svelte';
	import ProductCard from '$lib/components/marketplace/ProductCard.svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	
	let viewMode = $state<'grid' | 'list'>('grid');
	let wishlistItems = $state([]);
	let isLoading = $state(true);
	
	onMount(async () => {
		// Simulate loading
		setTimeout(() => {
			// TODO: Load wishlist items from API
			isLoading = false;
		}, 800);
	});
</script>

<svelte:head>
	<title>Wishlist - Driplo</title>
	<meta name="description" content="Your saved fashion items - find them all in one place" />
</svelte:head>

<main class="main-content">
	<!-- Header Section -->
	<section class="header-section">
		<div class="header-container">
			<div class="header-content">
				<div class="header-left">
					<div class="title-wrapper">
						<div class="heart-badge">
							<Heart size={20} />
						</div>
						<div class="title-group">
							<h1 class="page-title">{m['wishlist.title']()}</h1>
							<p class="item-count">
								{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
							</p>
						</div>
					</div>
				</div>
				
				<div class="header-right">
					<div class="view-toggle">
						<button 
							class="toggle-btn {viewMode === 'grid' ? 'active' : ''}"
							onclick={() => viewMode = 'grid'}
							aria-label={m['wishlist.grid_view']()}
						>
							<Grid size={16} />
						</button>
						<button 
							class="toggle-btn {viewMode === 'list' ? 'active' : ''}"
							onclick={() => viewMode = 'list'}
							aria-label={m['wishlist.list_view']()}
						>
							<List size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Wrapper -->
	<div class="content-wrapper">
		<div class="products-container">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-content">
						<div class="spinner-wrapper">
							<div class="spinner"></div>
							<div class="pulse-ring"></div>
						</div>
						<p class="loading-text">{m['wishlist.loading']()}</p>
					</div>
				</div>
			{:else if wishlistItems.length === 0}
				<div class="empty-state">
					<div class="empty-content">
						<div class="empty-icon-wrapper">
							<div class="icon-circle">
								<Heart size={32} />
							</div>
							<Sparkles size={24} class="sparkle sparkle-1" />
							<Sparkles size={16} class="sparkle sparkle-2" />
							<Sparkles size={20} class="sparkle sparkle-3" />
						</div>
						<h2 class="empty-title">{m['wishlist.empty_title']()}</h2>
						<p class="empty-description">{m['wishlist.empty_description']()}</p>
						<div class="action-buttons">
							<a href="/browse" class="primary-action">
								<ShoppingBag size={18} />
								{m['wishlist.browse_products']()}
							</a>
						</div>
					</div>
				</div>
			{:else}
				<div class="products-grid {viewMode}">
					{#each wishlistItems as item}
						<ProductCard product={item} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.main-content {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-top: var(--header-height);
		padding-bottom: calc(var(--bottom-nav-height) + 24px);
		font-family: var(--font-family-sans);
	}

	/* Header Section */
	.header-section {
		background: var(--color-surface-primary);
		border-bottom: 2px solid var(--color-border-primary);
		position: sticky;
		top: var(--header-height);
		z-index: 100;
		box-shadow: var(--shadow-sm);
	}

	.header-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-4) var(--space-5);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.header-left {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.title-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.heart-badge {
		width: 40px;
		height: 40px;
		border-radius: var(--border-radius-lg);
		background: linear-gradient(135deg, #ff6b6b, #ff4757);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(255, 71, 87, 0.25);
		flex-shrink: 0;
	}

	.title-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.page-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
		font-family: var(--font-family-sans);
	}

	.item-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
		font-weight: 500;
		font-family: var(--font-family-sans);
	}

	.header-right {
		display: flex;
		align-items: center;
	}

	/* View Toggle */
	.view-toggle {
		display: flex;
		background: var(--color-surface-tertiary);
		border-radius: var(--border-radius-lg);
		padding: 3px;
		gap: 2px;
		box-shadow: var(--shadow-xs);
		border: 1px solid var(--color-border-primary);
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		border: none;
		min-width: 36px;
		height: 32px;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		position: relative;
	}

	.toggle-btn:hover:not(.active) {
		color: var(--color-text-primary);
		background: var(--color-surface-secondary);
	}

	.toggle-btn:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}

	.toggle-btn:active:not(.active) {
		transform: scale(0.95);
	}

	.toggle-btn.active {
		background: var(--color-surface-primary);
		color: var(--color-interactive-primary);
		box-shadow: var(--shadow-sm);
		font-weight: 500;
	}

	.toggle-btn.active::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: var(--border-radius-md);
		border: 2px solid var(--color-interactive-primary);
		opacity: 0.1;
	}

	/* Content */
	.content-wrapper {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0;
	}

	.products-container {
		padding: var(--space-5) var(--space-4);
	}

	/* Loading State */
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: var(--space-8) var(--space-4);
	}

	.loading-content {
		text-align: center;
	}

	.spinner-wrapper {
		position: relative;
		width: 48px;
		height: 48px;
		margin: 0 auto var(--space-4);
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 3px solid var(--color-border-primary);
		border-top: 3px solid var(--color-interactive-primary);
		border-radius: var(--border-radius-full);
		animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
		box-shadow: var(--shadow-sm);
	}

	.pulse-ring {
		position: absolute;
		inset: -8px;
		border-radius: var(--border-radius-full);
		background: var(--color-interactive-primary);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		opacity: 0.2;
	}

	.loading-text {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin: 0;
		font-weight: 500;
		font-family: var(--font-family-sans);
		letter-spacing: -0.01em;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: var(--space-8) var(--space-4);
	}

	.empty-content {
		max-width: 400px;
		text-align: center;
	}

	.empty-icon-wrapper {
		position: relative;
		margin-bottom: var(--space-6);
		display: inline-flex;
	}

	.icon-circle {
		width: 80px;
		height: 80px;
		border-radius: var(--border-radius-full);
		background: linear-gradient(135deg, #ffeef0, #ffe0e3);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ff4757;
		box-shadow: 0 8px 24px rgba(255, 71, 87, 0.15);
		position: relative;
		animation: float 3s ease-in-out infinite;
	}

	.sparkle {
		position: absolute;
		color: #ffd93d;
		animation: sparkle 2s ease-in-out infinite;
	}

	.sparkle-1 {
		top: -8px;
		right: -12px;
		animation-delay: 0s;
	}

	.sparkle-2 {
		bottom: 4px;
		left: -10px;
		animation-delay: 0.5s;
	}

	.sparkle-3 {
		top: 10px;
		left: -20px;
		animation-delay: 1s;
	}

	.empty-title {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-3) 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
		font-family: var(--font-family-sans);
	}

	.empty-description {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-6) 0;
		line-height: 1.6;
		font-family: var(--font-family-sans);
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-items: center;
	}

	.primary-action {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		background: var(--color-interactive-primary);
		color: white;
		font-size: var(--font-size-base);
		font-weight: 600;
		font-family: var(--font-family-sans);
		border-radius: var(--border-radius-lg);
		text-decoration: none;
		transition: all var(--duration-fast) var(--ease-out);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
		letter-spacing: -0.01em;
		outline: none;
		position: relative;
		overflow: hidden;
	}

	.primary-action::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
		transform: translateX(-100%);
		transition: transform 0.6s;
	}

	.primary-action:hover {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
	}

	.primary-action:hover::before {
		transform: translateX(100%);
	}

	.primary-action:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 8px 20px rgba(37, 99, 235, 0.35);
	}

	.primary-action:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
	}

	/* Product Grid */
	.products-grid {
		display: grid;
		gap: var(--space-3);
	}

	.products-grid.grid {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	}

	.products-grid.list {
		grid-template-columns: 1fr;
		gap: var(--space-4);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.header-container {
			padding: var(--space-3) var(--space-4);
		}

		.page-title {
			font-size: var(--font-size-lg);
		}

		.heart-badge {
			width: 36px;
			height: 36px;
		}

		.products-container {
			padding: var(--space-4) var(--space-3);
		}

		.products-grid.grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: var(--space-2);
		}
	}

	@media (min-width: 640px) {
		.products-grid.grid {
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		}
	}

	@media (min-width: 768px) {
		.main-content {
			padding-top: var(--header-height-md);
			padding-bottom: var(--space-8);
		}

		.header-section {
			top: var(--header-height-md);
		}

		.products-container {
			padding: var(--space-6) var(--space-5);
		}

		.products-grid.grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--space-4);
		}

		.page-title {
			font-size: var(--font-size-2xl);
		}

		.empty-title {
			font-size: var(--font-size-3xl);
		}

		.empty-description {
			font-size: var(--font-size-lg);
		}
	}

	@media (min-width: 1024px) {
		.products-grid.grid {
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		}

		.header-container {
			padding: var(--space-5) var(--space-6);
		}

		.products-container {
			padding: var(--space-8) var(--space-6);
		}
	}

	@media (min-width: 1280px) {
		.products-grid.grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: var(--space-5);
		}
	}

	/* Animations */
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.2;
			transform: scale(1);
		}
		50% {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes sparkle {
		0%, 100% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.header-section {
			border-bottom-width: 3px;
		}

		.toggle-btn.active {
			border: 2px solid var(--color-interactive-primary);
		}

		.view-toggle {
			border-width: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: spin 2s linear infinite;
		}

		.pulse-ring,
		.sparkle,
		.icon-circle {
			animation: none;
		}

		.primary-action::before {
			display: none;
		}

		.primary-action:hover,
		.toggle-btn:active {
			transform: none;
		}
	}
</style>