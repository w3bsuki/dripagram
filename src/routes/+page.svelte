<script lang="ts">
	import { ProductGrid } from '$lib/components/marketplace';
	import StoryCircle from '$lib/components/social/StoryCircle.svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import SearchHeader from '$lib/components/navigation/SearchHeader.svelte';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { setupViewTracking, cleanupViewTracking, trackProductViews } from '$lib/utils/view-tracker';

	let { data }: { data: PageData } = $props();
	
	let isMobile = $state(false);
	let isLoading = $state(false);
	let loadingMore = $state(false);
	let products = $state(data.products || []);
	let nextCursor = $state(data.nextCursor);
	let feedType = $state(data.currentTab || 'for-you');

	// Real registered users from database
	let registeredUsers = $state(data.registeredUsers?.map(user => ({
		id: user.username || user.id,
		title: user.username || user.full_name || 'User',
		subtitle: user.verified ? 'Verified Seller' : 'Seller',
		imageUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.full_name || 'U')}&background=random`,
		isVerified: user.verified || false,
		followerCount: user.follower_count || 0,
		productCount: user.listing_count || user.product_count || 0
	})) || []);
	
	let selectedUser = $state<typeof registeredUsers[0] | null>(null);
	let showUserModal = $state(false);

	// Update local state when data changes (after navigation)
	$effect(() => {
		products = data.products || [];
		nextCursor = data.nextCursor;
		feedType = data.currentTab || 'for-you';
		
		// Only update registered users if we have fresh data
		if (data.registeredUsers && data.registeredUsers.length > 0) {
			registeredUsers = data.registeredUsers.map(user => ({
				id: user.username || user.id,
				title: user.username || user.full_name || 'User',
				subtitle: user.verified ? 'Verified Seller' : 'Seller',
				imageUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.full_name || 'U')}&background=random`,
				isVerified: user.verified || false,
				followerCount: user.follower_count || 0,
				productCount: user.listing_count || user.product_count || 0
			}));
		}
	});

	// Track views when products change (separate effect to avoid loops)
	let lastTrackedProducts = $state<string[]>([]);
	
	$effect(() => {
		if (browser && products.length > 0) {
			// Get current product IDs
			const currentProductIds = products.map(p => p.id).filter(Boolean);
			
			// Check if products have actually changed
			const hasChanged = currentProductIds.some(id => !lastTrackedProducts.includes(id));
			
			if (hasChanged) {
				// Schedule view tracking after DOM updates
				const timer = setTimeout(() => {
					setupViewTracking();
					// Track only new products that haven't been tracked
					const newProductIds = currentProductIds
						.slice(0, 5)
						.filter(id => !lastTrackedProducts.includes(id));
					
					if (newProductIds.length > 0) {
						trackProductViews(newProductIds);
						lastTrackedProducts = [...lastTrackedProducts, ...newProductIds];
					}
				}, 500);
				
				return () => clearTimeout(timer);
			}
		}
	});

	onMount(() => {
		if (browser) {
			isMobile = window.innerWidth < 768;
			const handleResize = () => {
				isMobile = window.innerWidth < 768;
			};
			window.addEventListener('resize', handleResize);
			
			// Setup view tracking
			setupViewTracking();
			
			// Setup infinite scroll
			const handleScroll = () => {
				if (loadingMore || !nextCursor) return;
				
				const scrollPosition = window.innerHeight + window.scrollY;
				const documentHeight = document.documentElement.scrollHeight;
				
				// Load more when user is 200px from bottom
				if (scrollPosition >= documentHeight - 200) {
					loadMoreProducts();
				}
			};
			
			window.addEventListener('scroll', handleScroll);
			
			return () => {
				window.removeEventListener('resize', handleResize);
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});
	
	onDestroy(() => {
		// Clean up view tracking when component is destroyed
		cleanupViewTracking();
	});

	async function changeFeedType(type: typeof feedType) {
		if (type === feedType || isLoading) return;
		
		isLoading = true;
		feedType = type;
		
		try {
			// Update URL with new tab parameter
			const url = new URL(window.location.href);
			url.searchParams.set('tab', type);
			url.searchParams.delete('cursor'); // Reset cursor for new feed
			
			// Navigate to new URL (this will trigger server load)
			await goto(url.toString(), { replaceState: true });
		} catch (error) {
			// Error changing feed type
		} finally {
			isLoading = false;
		}
	}

	async function loadMoreProducts() {
		if (loadingMore || !nextCursor) return;
		
		loadingMore = true;
		
		try {
			const params = new URLSearchParams({
				tab: feedType,
				cursor: nextCursor
			});
			
			const response = await fetch(`/api/feed?${params}`, {
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (!response.ok) throw new Error('Failed to load more products');
			
			const result = await response.json();
			
			// Append new products to existing list
			products = [...products, ...result.products];
			nextCursor = result.nextCursor;
		} catch (error) {
			// Error loading more products
		} finally {
			loadingMore = false;
		}
	}

	// Handle user circle click - show quick view modal
	function handleUserClick(user: typeof registeredUsers[0]) {
		selectedUser = user;
		showUserModal = true;
	}
	
	// Close user modal
	function closeUserModal() {
		showUserModal = false;
		selectedUser = null;
	}
	
	// Navigate to user profile
	function visitUserProfile(userId: string) {
		closeUserModal();
		goto(`/user/${userId}`);
	}

	// Handle product actions
	async function handleProductLike(productId: string) {
		try {
			const response = await fetch(`/api/products/${productId}/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) {
				// Revert optimistic update if API call fails
				const product = products.find(p => p.id === productId);
				if (product) {
					product.isLiked = !product.isLiked;
					product.like_count = (product.like_count || 0) + (product.isLiked ? 1 : -1);
				}
			}
		} catch (error) {
			// Revert optimistic update on error
			const product = products.find(p => p.id === productId);
			if (product) {
				product.isLiked = !product.isLiked;
				product.like_count = (product.like_count || 0) + (product.isLiked ? 1 : -1);
			}
		}
	}

	async function handleProductSave(productId: string) {
		try {
			const response = await fetch(`/api/products/${productId}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) {
				// Revert optimistic update
				const product = products.find(p => p.id === productId);
				if (product) {
					product.isSaved = !product.isSaved;
				}
			}
		} catch (error) {
			// Revert optimistic update on error
			const product = products.find(p => p.id === productId);
			if (product) {
				product.isSaved = !product.isSaved;
			}
		}
	}

	function handleProductShare(productId: string) {
		// Use Web Share API if available, otherwise copy to clipboard
		const product = products.find(p => p.id === productId);
		if (!product) return;

		const shareData = {
			title: product.title,
			text: `Check out this ${product.title} for €${product.price}`,
			url: `${window.location.origin}/products/${productId}`
		};

		if (navigator.share && navigator.canShare(shareData)) {
			navigator.share(shareData);
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(shareData.url).then(() => {
				// Could show a toast notification here
			});
		}
	}

	function handleProductComment(productId: string) {
		// Navigate to product detail page with focus on comments
		goto(`/products/${productId}#comments`);
	}
</script>

<svelte:head>
	<title>Driplo - The Amazon of Clothing | Shop & Sell Fashion</title>
	<meta
		name="description"
		content="Discover and sell fashion on Bulgaria's #1 social commerce platform. Join thousands buying and selling designer clothes, streetwear, and vintage finds."
	/>
	<meta
		name="keywords"
		content="fashion marketplace, social shopping, buy sell clothes, designer fashion, streetwear, vintage clothing, Bulgaria"
	/>
	<meta property="og:title" content="Driplo - The Amazon of Clothing" />
	<meta
		property="og:description"
		content="Shop and sell fashion with style. Join the social commerce revolution."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<!-- Header (Mobile) -->
{#if isMobile}
	<SearchHeader />
{/if}

<!-- Main Content -->
<main class="main-content">
	<!-- Registered Users Bar (NOT sticky, just scrollable) -->
	<div class="brands-bar">
		<div class="brands-container">
			{#each registeredUsers as user (user.id)}
				<button 
					class="brand-circle"
					onclick={() => handleUserClick(user)}
					aria-label="View {user.title} profile"
				>
					<div class="brand-image-wrapper">
						<img 
							src={user.imageUrl} 
							alt={user.title}
							loading="lazy"
						/>
						{#if user.isVerified}
							<div class="verified-badge">
								<svg width="10" height="8" viewBox="0 0 10 8" fill="white">
									<path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" fill="none"/>
								</svg>
							</div>
						{/if}
					</div>
					<span class="brand-name">{user.title}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Instagram-style Feed Tabs -->
	<div class="feed-tabs">
		<div class="tabs-container">
			<button
				class="feed-tab {feedType === 'for-you' ? 'active' : ''}"
				onclick={() => changeFeedType('for-you')}
				disabled={isLoading}
			>
				For you
			</button>
			<button
				class="feed-tab {feedType === 'following' ? 'active' : ''}"
				onclick={() => changeFeedType('following')}
				disabled={isLoading}
			>
				Following
			</button>
			<button
				class="feed-tab {feedType === 'trending' ? 'active' : ''}"
				onclick={() => changeFeedType('trending')}
				disabled={isLoading}
			>
				Trending
			</button>
		</div>
	</div>

	<!-- Instagram-style Product Feed -->
	{#if isLoading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>Loading your feed...</p>
		</div>
	{:else}
		<ProductGrid 
			{products} 
			variant="grid"
			onLike={handleProductLike}
			onSave={handleProductSave}
			onShare={handleProductShare}
			onComment={handleProductComment}
		/>
	{/if}
	
	<!-- Load More Indicator -->
	{#if loadingMore}
		<div class="load-more-container">
			<div class="loading-spinner small"></div>
			<p>Loading more...</p>
		</div>
	{:else if !nextCursor && products.length > 0}
		<div class="end-of-feed">
			<p>You've reached the end!</p>
		</div>
	{/if}
	
	<!-- Empty State -->
	{#if !isLoading && products.length === 0}
		<div class="empty-state">
			{#if feedType === 'following' && !data.isAuthenticated}
				<h3>Sign in to see products from people you follow</h3>
				<p>Create an account or sign in to follow sellers and see their latest listings here.</p>
				<a href="/auth/login" class="cta-button">Sign In</a>
			{:else if feedType === 'following'}
				<h3>No products from followed sellers</h3>
				<p>Follow some sellers to see their products here, or discover new ones in the For You tab.</p>
			{:else}
				<h3>No products available</h3>
				<p>Check back later for new listings, or try a different tab.</p>
			{/if}
		</div>
	{/if}
</main>

<!-- Mobile Bottom Navigation -->
{#if isMobile}
	<BottomNav />
{/if}

<!-- User Quick View Modal -->
{#if showUserModal && selectedUser}
	<div class="modal-overlay" onclick={closeUserModal}>
		<div class="brand-modal" onclick={(e) => e.stopPropagation()}>
			<button class="modal-close" onclick={closeUserModal}>✕</button>
			
			<div class="brand-modal-header">
				<img 
					src={selectedUser.imageUrl} 
					alt={selectedUser.title}
					class="brand-modal-image"
				/>
				<div class="brand-modal-info">
					<div class="brand-modal-title">
						{selectedUser.title}
						{#if selectedUser.isVerified}
							<svg class="verified-icon" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
					<div class="brand-modal-subtitle">{selectedUser.subtitle}</div>
					<div class="brand-stats">
						<div class="stat">
							<strong>{selectedUser.followerCount.toLocaleString()}</strong>
							<span>Followers</span>
						</div>
						<div class="stat">
							<strong>{selectedUser.productCount}</strong>
							<span>Products</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="brand-modal-actions">
				<button class="follow-btn">Follow</button>
				<button class="visit-store-btn" onclick={() => visitUserProfile(selectedUser.id)}>
					Visit Profile
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.main-content {
		min-height: 100vh;
		background: #fafafa;
		padding-bottom: 80px; /* Space for mobile bottom nav */
		/* Performance optimizations */
		will-change: scroll-position;
		contain: layout;
	}

	/* Verified Brands Bar */
	.brands-bar {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem 0;
		overflow: hidden; /* Prevent any overflow */
		touch-action: pan-x; /* Only horizontal touch */
		position: relative;
		z-index: 20; /* Below feed-tabs but visible */
	}

	.brands-container {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		overflow-y: hidden; /* Prevent vertical scroll */
		padding: 0 16px;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-snap-type: x mandatory;
		scroll-padding: 0 16px;
		touch-action: pan-x; /* Only allow horizontal panning */
		user-select: none; /* Prevent text selection */
		-webkit-user-select: none;
	}

	.brands-container::-webkit-scrollbar {
		display: none;
	}

	.brand-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: transform 0.2s;
		scroll-snap-align: start;
		/* (100vw - 32px padding - 64px gaps) / 5 = each circle width */
		width: calc((100vw - 32px - 64px) / 5);
		max-width: 72px; /* Cap size on larger screens */
	}

	.brand-circle:hover {
		transform: scale(1.05);
	}

	.brand-image-wrapper {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		max-width: 64px;
		border-radius: 50%;
		border: 2px solid #dbdbdb;
		background: white;
		overflow: visible;
	}

	.brand-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		overflow: hidden;
	}

	.verified-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid white;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.verified-badge svg {
		width: 12px;
		height: 12px;
	}

	.brand-name {
		font-size: 0.7rem;
		color: #374151;
		font-weight: 500;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}


	/* Instagram-style Feed Tabs */
	.feed-tabs {
		background: white;
		border-bottom: 1px solid #dbdbdb;
		position: sticky;
		top: 56px; /* Below SearchHeader only */
		z-index: 25;
	}

	.tabs-container {
		display: flex;
		max-width: 468px;
		margin: 0 auto;
	}

	.feed-tab {
		flex: 1;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		font-size: 0.875rem;
		font-weight: 600;
		color: #8e8e8e;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
		text-transform: capitalize;
	}
	
	.feed-tab:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.feed-tab {
			font-size: 0.875rem;
			padding: 0.875rem 0.5rem;
		}
	}

	.feed-tab:hover {
		color: #262626;
	}

	.feed-tab.active {
		color: #262626;
	}

	.feed-tab.active::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 1px;
		background: #262626;
		animation: slideIn 0.2s ease;
	}

	@keyframes slideIn {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	/* Loading States */
	.loading-container,
	.load-more-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 1rem;
	}
	
	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	.loading-spinner.small {
		width: 20px;
		height: 20px;
		border-width: 2px;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		max-width: 400px;
		margin: 0 auto;
	}
	
	.empty-state h3 {
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}
	
	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: 1.5rem;
	}
	
	.cta-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: background-color 0.2s;
	}
	
	.cta-button:hover {
		background: color-mix(in srgb, var(--color-primary) 90%, black);
	}
	
	/* End of Feed */
	.end-of-feed {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary);
	}
	
	/* Brand Quick View Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}
	
	.brand-modal {
		background: white;
		border-radius: 12px;
		max-width: 400px;
		width: 100%;
		padding: 1.5rem;
		position: relative;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}
	
	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}
	
	.modal-close:hover {
		background: #f3f4f6;
	}
	
	.brand-modal-header {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.brand-modal-image {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #e5e7eb;
	}
	
	.brand-modal-info {
		flex: 1;
	}
	
	.brand-modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.verified-icon {
		background: #000;
		color: white;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		padding: 2px;
	}
	
	.verified-icon svg {
		width: 100%;
		height: 100%;
	}
	
	.brand-modal-subtitle {
		color: #6b7280;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}
	
	.brand-stats {
		display: flex;
		gap: 2rem;
		margin-top: 1rem;
	}
	
	.stat {
		display: flex;
		flex-direction: column;
	}
	
	.stat strong {
		font-size: 1.125rem;
		color: #111827;
	}
	
	.stat span {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.brand-modal-actions {
		display: flex;
		gap: 1rem;
	}
	
	.follow-btn,
	.visit-store-btn {
		flex: 1;
		padding: 0.75rem;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.follow-btn {
		background: #3b82f6;
		color: white;
		border: none;
	}
	
	.follow-btn:hover {
		background: #2563eb;
	}
	
	.visit-store-btn {
		background: white;
		color: #3b82f6;
		border: 2px solid #3b82f6;
	}
	
	.visit-store-btn:hover {
		background: #eff6ff;
	}
	
	@media (min-width: 768px) {
		.main-content {
			padding-top: 0; /* No header on desktop for now */
			padding-bottom: 0;
		}

		.feed-selector {
			top: 0; /* No header offset on desktop */
		}
	}
</style>
