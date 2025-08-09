<script lang="ts">
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import AppHeader from '$lib/components/navigation/AppHeader.svelte';
	import NewListingsStories from '$lib/components/social/NewListingsStories.svelte';
	import FeedTabs from '$lib/components/social/FeedTabs.svelte';
	import ProductFeed from '$lib/components/social/ProductFeed.svelte';
	import UserModal from '$lib/components/social/UserModal.svelte';
	import FeedStateManager from '$lib/components/social/FeedStateManager.svelte';
	import LiveShoppingList from '$lib/components/social/LiveShoppingList.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	type User = {
		id: string;
		title: string;
		subtitle: string;
		imageUrl: string;
		isVerified: boolean;
		followerCount: number;
		productCount: number;
	};

	type FeedType = 'for-you' | 'following' | 'trending';

	let { data }: { data: PageData } = $props();
	
	let isMobile = $state(false);
	let isLoading = $state(false);
	let loadingMore = $state(false);
	let products = $state(data.products || []);
	let nextCursor = $state(data?.nextCursor || null);
	let feedType = $state<FeedType>(data?.currentTab || 'for-you');

	// Real registered users from database
	let registeredUsers = $state<User[]>(data?.registeredUsers?.map(user => ({
		id: user.username || user.id,
		title: user.username || 'User',
		subtitle: user.seller_verified ? 'Verified Seller' : 'Seller',
		imageUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=random`,
		isVerified: user.seller_verified || false,
		followerCount: 0,
		productCount: user.total_sales || 0
	})) || []);
	
	let selectedUser = $state<User | null>(null);
	let showUserModal = $state(false);

	// Update local state when data changes (after navigation)
	$effect(() => {
		products = data.products || [];
		nextCursor = data.nextCursor;
		feedType = (data.currentTab as FeedType) || 'for-you';
		
		// Only update registered users if we have fresh data
		if (data.registeredUsers && data.registeredUsers.length > 0) {
			registeredUsers = data.registeredUsers.map(user => ({
				id: user.username || user.id,
				title: user.username || 'User',
				subtitle: user.seller_verified ? 'Verified Seller' : 'Seller',
				imageUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=random`,
				isVerified: user.verified || false,
				followerCount: user.follower_count || 0,
				productCount: user.listing_count || 0
			}));
		}
	});


	function handleResize(mobile: boolean) {
		isMobile = mobile;
	}

	async function changeFeedType(type: FeedType) {
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
	function handleUserClick(user: User) {
		selectedUser = user;
		showUserModal = true;
	}
	
	const onUserClick = handleUserClick;
	
	// Close user modal
	function closeUserModal() {
		showUserModal = false;
		selectedUser = null;
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
					product.isSaved = !(product.isSaved ?? false);
				}
			}
		} catch (error) {
			// Revert optimistic update on error
			const product = products.find(p => p.id === productId);
			if (product) {
				product.isSaved = !(product.isSaved ?? false);
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

	function handleStoryClick(product: any) {
		// Navigate to product detail page
		goto(`/products/${product.id}`);
	}

	function handleAddListing() {
		// Navigate to sell page
		goto('/sell');
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
	<AppHeader showCreateButton={true} />
{/if}

<!-- Main Content -->
<main class="main-content">
	<!-- New Listings Stories (Instagram-style) -->
	<NewListingsStories 
		{products}
		onStoryClick={handleStoryClick}
		onAddListing={handleAddListing}
		currentUserId={data.session?.user?.id}
	/>

	<!-- Feed Tabs -->
	<FeedTabs 
		{feedType}
		{isLoading}
		onFeedChange={changeFeedType}
	/>

	<!-- Product Feed -->
	<ProductFeed 
		{products}
		{feedType}
		{isLoading}
		{loadingMore}
		{nextCursor}
		isAuthenticated={data.isAuthenticated}
		onLoadMore={loadMoreProducts}
		onProductLike={handleProductLike}
		onProductSave={handleProductSave}
		onProductShare={handleProductShare}
		onProductComment={handleProductComment}
	/>
</main>

<!-- Mobile Bottom Navigation -->
{#if isMobile}
	<BottomNav />
{/if}

<!-- User Modal -->
<UserModal 
	user={selectedUser}
	isVisible={showUserModal}
	onClose={closeUserModal}
/>

<!-- Feed State Manager (handles analytics and scroll events) -->
<FeedStateManager 
	{products}
	{feedType}
	{loadingMore}
	{nextCursor}
	onLoadMore={loadMoreProducts}
	onResize={handleResize}
/>

<style>
	.main-content {
		min-height: 100vh;
		background: #fafafa;
		padding-bottom: 80px; /* Space for mobile bottom nav */
		/* Performance optimizations */
		will-change: scroll-position;
		contain: layout;
	}
	
	@media (min-width: 768px) {
		.main-content {
			padding-top: 0; /* No header on desktop for now */
			padding-bottom: 0;
		}
	}
</style>
