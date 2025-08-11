<script lang="ts">
	import { 
		Search, Home, Grid3x3, Plus, Heart, User, ShoppingBag, 
		MessageCircle, Bell, Filter, MapPin, TrendingUp, Star,
		Camera, Sparkles, Clock, Shield, ChevronDown, MoreVertical,
		Eye, Share2, Bookmark, Package, Zap, Award
	} from '@lucide-svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	// State management
	let activeTab = $state<'discover' | 'trending' | 'following' | 'nearby'>('discover');
	let selectedCategory = $state<string>('all');
	let showNotificationDot = $state(true);
	let likedProducts = $state<Set<number>>(new Set([2, 5]));
	let savedProducts = $state<Set<number>>(new Set([1, 4]));
	
	// Story states
	let activeStoryUser = $state<string | null>(null);
	let viewedStories = $state<Set<string>>(new Set());
	
	// Enhanced demo data
	const stories = [
		{ id: 'user1', username: 'new_drops', avatar: '/api/placeholder/80/80', hasNew: true, gradient: 'from-purple-500 to-pink-500' },
		{ id: 'user2', username: 'flash_sale', avatar: '/api/placeholder/80/80', hasNew: true, gradient: 'from-red-500 to-orange-500' },
		{ id: 'user3', username: 'vintage_finds', avatar: '/api/placeholder/80/80', hasNew: true, gradient: 'from-blue-500 to-cyan-500' },
		{ id: 'user4', username: 'luxury_deals', avatar: '/api/placeholder/80/80', hasNew: false, gradient: 'from-yellow-500 to-amber-500' },
		{ id: 'user5', username: 'tech_zone', avatar: '/api/placeholder/80/80', hasNew: true, gradient: 'from-green-500 to-emerald-500' },
		{ id: 'user6', username: 'style_tips', avatar: '/api/placeholder/80/80', hasNew: false, gradient: 'from-indigo-500 to-purple-500' },
	];
	
	const products = [
		{ 
			id: 1, 
			images: ['/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500'],
			currentImage: 0,
			price: 89, 
			originalPrice: 129,
			title: 'Premium Leather Jacket', 
			description: 'Genuine leather, perfect condition',
			likes: 1234, 
			views: 5678,
			seller: { name: 'anna_style', avatar: '/api/placeholder/40/40', verified: true, rating: 4.8 },
			tags: ['trending', 'premium'],
			condition: 'Like New',
			size: 'M',
			brand: 'Zara'
		},
		{ 
			id: 2, 
			images: ['/api/placeholder/400/500', '/api/placeholder/400/500'],
			currentImage: 0,
			price: 149, 
			originalPrice: 220,
			title: 'Nike Air Jordan 1 Retro', 
			description: 'Authentic, worn 2x only',
			likes: 3456, 
			views: 12890,
			seller: { name: 'sneaker_hub', avatar: '/api/placeholder/40/40', verified: true, rating: 4.9 },
			tags: ['hot', 'authentic'],
			condition: 'Excellent',
			size: 'EU 42',
			brand: 'Nike'
		},
		{ 
			id: 3, 
			images: ['/api/placeholder/400/500'],
			currentImage: 0,
			price: 45, 
			title: 'Vintage Band T-Shirt', 
			description: 'Rare 90s concert tee',
			likes: 567, 
			views: 2340,
			seller: { name: 'retro_vibes', avatar: '/api/placeholder/40/40', verified: false, rating: 4.5 },
			tags: ['vintage'],
			condition: 'Good',
			size: 'L',
			brand: 'Vintage'
		},
		{ 
			id: 4, 
			images: ['/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500'],
			currentImage: 0,
			price: 320, 
			originalPrice: 580,
			title: 'Designer Handbag Collection', 
			description: 'Michael Kors limited edition',
			likes: 2890, 
			views: 8900,
			seller: { name: 'luxury_boutique', avatar: '/api/placeholder/40/40', verified: true, rating: 5.0 },
			tags: ['luxury', 'sale'],
			condition: 'New with Tags',
			brand: 'Michael Kors'
		},
		{ 
			id: 5, 
			images: ['/api/placeholder/400/500', '/api/placeholder/400/500'],
			currentImage: 0,
			price: 67, 
			title: 'Smart Watch Series 6', 
			description: 'Perfect working condition, all accessories',
			likes: 890, 
			views: 3456,
			seller: { name: 'tech_trader', avatar: '/api/placeholder/40/40', verified: true, rating: 4.7 },
			tags: ['tech'],
			condition: 'Like New',
			brand: 'Apple'
		},
		{ 
			id: 6, 
			images: ['/api/placeholder/400/500'],
			currentImage: 0,
			price: 155, 
			originalPrice: 200,
			title: 'Timberland Boots', 
			description: 'Classic 6-inch premium boots',
			likes: 1567, 
			views: 4567,
			seller: { name: 'boot_store', avatar: '/api/placeholder/40/40', verified: true, rating: 4.6 },
			tags: ['popular'],
			condition: 'Very Good',
			size: 'EU 43',
			brand: 'Timberland'
		},
	];
	
	const categories = [
		{ id: 'all', label: 'All', icon: Sparkles, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
		{ id: 'trending', label: 'Trending', icon: TrendingUp, color: 'bg-gradient-to-r from-red-500 to-orange-500' },
		{ id: 'women', label: 'Women', icon: null, emoji: '👗', color: 'bg-pink-500' },
		{ id: 'men', label: 'Men', icon: null, emoji: '👔', color: 'bg-blue-500' },
		{ id: 'shoes', label: 'Shoes', icon: null, emoji: '👟', color: 'bg-green-500' },
		{ id: 'bags', label: 'Bags', icon: ShoppingBag, color: 'bg-purple-500' },
		{ id: 'tech', label: 'Tech', icon: null, emoji: '📱', color: 'bg-cyan-500' },
		{ id: 'luxury', label: 'Luxury', icon: Award, color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
	];
	
	// Functions
	function toggleLike(productId: number) {
		if (likedProducts.has(productId)) {
			likedProducts.delete(productId);
		} else {
			likedProducts.add(productId);
		}
		likedProducts = new Set(likedProducts);
	}
	
	function toggleSave(productId: number) {
		if (savedProducts.has(productId)) {
			savedProducts.delete(productId);
		} else {
			savedProducts.add(productId);
		}
		savedProducts = new Set(savedProducts);
	}
	
	function viewStory(userId: string) {
		activeStoryUser = userId;
		viewedStories.add(userId);
		viewedStories = new Set(viewedStories);
		
		// Auto close after 5 seconds
		setTimeout(() => {
			activeStoryUser = null;
		}, 5000);
	}
	
	function nextImage(product: any) {
		if (product.currentImage < product.images.length - 1) {
			product.currentImage++;
		} else {
			product.currentImage = 0;
		}
	}
	
	function formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}
	
	function calculateDiscount(original: number, current: number): number {
		return Math.round(((original - current) / original) * 100);
	}
</script>

<div class="demo-app">
	<!-- Premium Status Bar -->
	<div class="status-bar">
		<div class="status-left">
			<span class="time">9:41</span>
			<MapPin size={12} />
			<span class="location">Sofia</span>
		</div>
		<div class="status-right">
			<div class="status-icons">
				<span>5G</span>
				<div class="signal-bars">
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div class="battery">
					<span>85%</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Enhanced Header -->
	<header class="app-header">
		<div class="header-main">
			<div class="logo-section">
				<h1 class="logo">driplo</h1>
				<span class="logo-badge">BETA</span>
			</div>
			<div class="header-actions">
				<button class="header-btn" onclick={() => showNotificationDot = false}>
					<Bell size={22} strokeWidth={1.5} />
					{#if showNotificationDot}
						<span class="notification-dot"></span>
					{/if}
				</button>
				<button class="header-btn">
					<MessageCircle size={22} strokeWidth={1.5} />
					<span class="badge">3</span>
				</button>
				<button class="header-btn">
					<Search size={22} strokeWidth={1.5} />
				</button>
			</div>
		</div>
	</header>

	<!-- Stories Section -->
	<div class="stories-section">
		<div class="stories-container">
			<button class="story add-story">
				<div class="story-avatar">
					<Camera size={24} />
				</div>
				<span class="story-username">Your Story</span>
			</button>
			
			{#each stories as story}
				<button 
					class="story {viewedStories.has(story.id) ? 'viewed' : ''}"
					onclick={() => viewStory(story.id)}
				>
					<div class="story-ring {story.hasNew && !viewedStories.has(story.id) ? 'active' : ''}">
						<div class="story-avatar">
							<img src={story.avatar} alt={story.username} />
						</div>
					</div>
					<span class="story-username">{story.username}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Premium Category Pills -->
	<div class="category-section">
		<button class="filter-button">
			<Filter size={18} />
		</button>
		<div class="category-scroll">
			<div class="category-container">
				{#each categories as category}
					<button 
						class="category-pill {selectedCategory === category.id ? 'active' : ''}"
						onclick={() => selectedCategory = category.id}
					>
						{#if category.emoji}
							<span class="category-icon">{category.emoji}</span>
						{:else if category.icon}
							<svelte:component this={category.icon} size={16} />
						{/if}
						<span>{category.label}</span>
						{#if category.id === 'trending'}
							<span class="pill-badge">HOT</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Enhanced Feed Tabs -->
	<div class="feed-tabs">
		<div class="tabs-container">
			<button 
				class="feed-tab {activeTab === 'discover' ? 'active' : ''}"
				onclick={() => activeTab = 'discover'}
			>
				<Sparkles size={16} />
				<span>Discover</span>
			</button>
			<button 
				class="feed-tab {activeTab === 'trending' ? 'active' : ''}"
				onclick={() => activeTab = 'trending'}
			>
				<TrendingUp size={16} />
				<span>Trending</span>
				<span class="tab-badge">24</span>
			</button>
			<button 
				class="feed-tab {activeTab === 'following' ? 'active' : ''}"
				onclick={() => activeTab = 'following'}
			>
				<Heart size={16} />
				<span>Following</span>
			</button>
			<button 
				class="feed-tab {activeTab === 'nearby' ? 'active' : ''}"
				onclick={() => activeTab = 'nearby'}
			>
				<MapPin size={16} />
				<span>Nearby</span>
			</button>
		</div>
	</div>

	<!-- Premium Product Grid -->
	<div class="product-grid">
		{#each products as product}
			<div class="product-card premium">
				<!-- Image Carousel -->
				<div class="product-images">
					<div class="image-container" onclick={() => nextImage(product)}>
						<img src={product.images[product.currentImage]} alt={product.title} />
						
						{#if product.tags?.includes('hot')}
							<div class="product-badge hot">
								<Zap size={12} />
								HOT
							</div>
						{:else if product.tags?.includes('sale')}
							<div class="product-badge sale">
								{calculateDiscount(product.originalPrice || 0, product.price)}% OFF
							</div>
						{:else if product.tags?.includes('trending')}
							<div class="product-badge trending">
								<TrendingUp size={12} />
								Trending
							</div>
						{/if}
						
						{#if product.images.length > 1}
							<div class="image-dots">
								{#each product.images as _, i}
									<span class="dot {i === product.currentImage ? 'active' : ''}"></span>
								{/each}
							</div>
						{/if}
					</div>
					
					<div class="product-actions">
						<button 
							class="action-btn like {likedProducts.has(product.id) ? 'active' : ''}"
							onclick={() => toggleLike(product.id)}
						>
							<Heart size={18} fill={likedProducts.has(product.id) ? 'currentColor' : 'none'} />
						</button>
						<button 
							class="action-btn save {savedProducts.has(product.id) ? 'active' : ''}"
							onclick={() => toggleSave(product.id)}
						>
							<Bookmark size={18} fill={savedProducts.has(product.id) ? 'currentColor' : 'none'} />
						</button>
					</div>
				</div>
				
				<!-- Product Info -->
				<div class="product-info">
					<div class="price-section">
						<div class="price-main">
							<span class="currency">€</span>
							<span class="price">{product.price}</span>
						</div>
						{#if product.originalPrice}
							<span class="original-price">€{product.originalPrice}</span>
						{/if}
					</div>
					
					<h3 class="product-title">{product.title}</h3>
					<p class="product-description">{product.description}</p>
					
					<div class="product-meta">
						{#if product.brand}
							<span class="meta-tag brand">{product.brand}</span>
						{/if}
						{#if product.size}
							<span class="meta-tag size">{product.size}</span>
						{/if}
						{#if product.condition}
							<span class="meta-tag condition">{product.condition}</span>
						{/if}
					</div>
					
					<!-- Seller Info -->
					<div class="seller-section">
						<div class="seller-info">
							<img src={product.seller.avatar} alt={product.seller.name} class="seller-avatar" />
							<div class="seller-details">
								<div class="seller-name">
									<span>{product.seller.name}</span>
									{#if product.seller.verified}
										<Shield size={14} class="verified-icon" />
									{/if}
								</div>
								<div class="seller-rating">
									<Star size={12} fill="currentColor" />
									<span>{product.seller.rating}</span>
								</div>
							</div>
						</div>
						<button class="follow-btn">Follow</button>
					</div>
					
					<!-- Engagement Stats -->
					<div class="engagement-stats">
						<div class="stat">
							<Heart size={14} />
							<span>{formatNumber(product.likes)}</span>
						</div>
						<div class="stat">
							<Eye size={14} />
							<span>{formatNumber(product.views)}</span>
						</div>
						<div class="stat">
							<Share2 size={14} />
							<span>Share</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Premium Bottom Navigation -->
	<nav class="bottom-nav premium">
		<button class="nav-item active">
			<div class="nav-icon">
				<Home size={22} strokeWidth={1.8} />
			</div>
			<span class="nav-label">Home</span>
		</button>
		
		<button class="nav-item">
			<div class="nav-icon">
				<Search size={22} strokeWidth={1.8} />
			</div>
			<span class="nav-label">Search</span>
		</button>
		
		<button class="nav-item nav-center">
			<div class="nav-add">
				<Plus size={28} strokeWidth={2} />
			</div>
		</button>
		
		<button class="nav-item">
			<div class="nav-icon">
				<ShoppingBag size={22} strokeWidth={1.8} />
				<span class="nav-badge">2</span>
			</div>
			<span class="nav-label">Cart</span>
		</button>
		
		<button class="nav-item">
			<div class="nav-icon">
				<User size={22} strokeWidth={1.8} />
			</div>
			<span class="nav-label">Profile</span>
		</button>
	</nav>

	<!-- Story Viewer Modal -->
	{#if activeStoryUser}
		<div class="story-viewer" onclick={() => activeStoryUser = null}>
			<div class="story-content">
				<div class="story-header">
					<div class="story-progress">
						<div class="progress-bar"></div>
					</div>
					<div class="story-user-info">
						<img src={stories.find(s => s.id === activeStoryUser)?.avatar} alt="" />
						<span>{stories.find(s => s.id === activeStoryUser)?.username}</span>
						<span class="story-time">2h ago</span>
					</div>
					<button class="close-story">✕</button>
				</div>
				<div class="story-image">
					<img src="/api/placeholder/400/700" alt="" />
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.demo-app {
		min-height: 100vh;
		background: linear-gradient(to bottom, #fafafa, #f5f5f5);
		padding-bottom: 70px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* Premium Status Bar */
	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 20px;
		background: white;
		font-size: 13px;
		font-weight: 600;
		border-bottom: 1px solid rgba(0,0,0,0.08);
	}

	.status-left {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #262626;
	}

	.location {
		color: #8e8e8e;
		font-size: 12px;
	}

	.status-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.status-icons {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.signal-bars {
		display: flex;
		gap: 2px;
		align-items: flex-end;
	}

	.signal-bars span {
		width: 3px;
		background: #262626;
		border-radius: 1px;
	}

	.signal-bars span:nth-child(1) { height: 4px; }
	.signal-bars span:nth-child(2) { height: 6px; }
	.signal-bars span:nth-child(3) { height: 8px; }
	.signal-bars span:nth-child(4) { height: 10px; }

	.battery {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #262626;
	}

	/* Enhanced Header */
	.app-header {
		background: white;
		border-bottom: 1px solid rgba(0,0,0,0.08);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
	}

	.logo-section {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.logo {
		font-size: 32px;
		font-weight: 900;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -1px;
	}

	.logo-badge {
		padding: 2px 6px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 9px;
		font-weight: 700;
		border-radius: 4px;
		letter-spacing: 0.5px;
	}

	.header-actions {
		display: flex;
		gap: 20px;
	}

	.header-btn {
		position: relative;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: #262626;
		transition: transform 0.2s;
	}

	.header-btn:active {
		transform: scale(0.95);
	}

	.notification-dot {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 8px;
		height: 8px;
		background: #ff3b30;
		border-radius: 50%;
		border: 2px solid white;
	}

	.badge {
		position: absolute;
		top: -8px;
		right: -8px;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 11px;
		font-weight: 700;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Stories Section */
	.stories-section {
		background: white;
		padding: 12px 0;
		border-bottom: 1px solid rgba(0,0,0,0.08);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.stories-section::-webkit-scrollbar {
		display: none;
	}

	.stories-container {
		display: flex;
		gap: 12px;
		padding: 0 16px;
	}

	.story {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		cursor: pointer;
		min-width: 72px;
	}

	.add-story .story-avatar {
		width: 64px;
		height: 64px;
		border-radius: 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.story-ring {
		padding: 2px;
		border-radius: 22px;
		background: transparent;
		transition: all 0.3s;
	}

	.story-ring.active {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.story.viewed .story-ring {
		background: #dbdbdb;
		padding: 1px;
	}

	.story-avatar {
		width: 64px;
		height: 64px;
		border-radius: 20px;
		overflow: hidden;
		background: white;
	}

	.story-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.story-username {
		font-size: 11px;
		color: #262626;
		font-weight: 500;
		max-width: 72px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Category Section */
	.category-section {
		display: flex;
		align-items: center;
		background: white;
		border-bottom: 1px solid rgba(0,0,0,0.08);
	}

	.filter-button {
		padding: 12px 16px;
		background: none;
		border: none;
		border-right: 1px solid rgba(0,0,0,0.08);
		cursor: pointer;
		color: #262626;
	}

	.category-scroll {
		flex: 1;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.category-scroll::-webkit-scrollbar {
		display: none;
	}

	.category-container {
		display: flex;
		gap: 8px;
		padding: 12px 16px;
	}

	.category-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		background: #f7f7f7;
		border: 1px solid transparent;
		border-radius: 20px;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.3s;
		color: #262626;
	}

	.category-pill:hover {
		background: #efefef;
	}

	.category-pill.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.category-icon {
		font-size: 16px;
	}

	.pill-badge {
		padding: 2px 4px;
		background: #ff3b30;
		color: white;
		font-size: 9px;
		font-weight: 700;
		border-radius: 4px;
		margin-left: 4px;
	}

	/* Feed Tabs */
	.feed-tabs {
		background: white;
		border-bottom: 1px solid rgba(0,0,0,0.08);
		position: sticky;
		top: 56px;
		z-index: 90;
	}

	.tabs-container {
		display: flex;
	}

	.feed-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 14px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 14px;
		font-weight: 600;
		color: #8e8e8e;
		cursor: pointer;
		transition: all 0.3s;
		position: relative;
	}

	.feed-tab:hover {
		background: rgba(0,0,0,0.02);
	}

	.feed-tab.active {
		color: #262626;
		border-bottom-color: transparent;
		background: linear-gradient(to bottom, transparent, rgba(103, 126, 234, 0.05));
	}

	.feed-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 20%;
		right: 20%;
		height: 2px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 2px;
	}

	.tab-badge {
		padding: 2px 6px;
		background: #ff3b30;
		color: white;
		font-size: 10px;
		font-weight: 700;
		border-radius: 10px;
	}

	/* Product Grid */
	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		padding: 12px;
	}

	.product-card.premium {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0,0,0,0.08);
		transition: all 0.3s;
	}

	.product-card.premium:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0,0,0,0.12);
	}

	.product-images {
		position: relative;
		aspect-ratio: 4/5;
		overflow: hidden;
		background: #f5f5f5;
	}

	.image-container {
		width: 100%;
		height: 100%;
		position: relative;
		cursor: pointer;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 4px 8px;
		border-radius: 8px;
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 4px;
		backdrop-filter: blur(10px);
	}

	.product-badge.hot {
		background: linear-gradient(135deg, #ff6b6b, #ff3b30);
		color: white;
	}

	.product-badge.sale {
		background: linear-gradient(135deg, #ffd93d, #ffb800);
		color: #262626;
	}

	.product-badge.trending {
		background: rgba(103, 126, 234, 0.9);
		color: white;
	}

	.image-dots {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 4px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255,255,255,0.5);
		transition: all 0.3s;
	}

	.dot.active {
		width: 16px;
		border-radius: 3px;
		background: white;
	}

	.product-actions {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.action-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: rgba(255,255,255,0.95);
		backdrop-filter: blur(10px);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #262626;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		transition: all 0.3s;
	}

	.action-btn:hover {
		transform: scale(1.1);
	}

	.action-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.product-info {
		padding: 12px;
	}

	.price-section {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 6px;
	}

	.price-main {
		display: flex;
		align-items: baseline;
	}

	.currency {
		font-size: 14px;
		font-weight: 600;
		color: #8e8e8e;
	}

	.price {
		font-size: 20px;
		font-weight: 800;
		color: #262626;
		margin-left: 2px;
	}

	.original-price {
		font-size: 14px;
		color: #8e8e8e;
		text-decoration: line-through;
	}

	.product-title {
		font-size: 14px;
		font-weight: 600;
		color: #262626;
		margin-bottom: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-description {
		font-size: 12px;
		color: #8e8e8e;
		margin-bottom: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-meta {
		display: flex;
		gap: 6px;
		margin-bottom: 10px;
		flex-wrap: wrap;
	}

	.meta-tag {
		padding: 3px 8px;
		background: #f7f7f7;
		border-radius: 6px;
		font-size: 10px;
		font-weight: 600;
		color: #262626;
	}

	.meta-tag.brand {
		background: rgba(103, 126, 234, 0.1);
		color: #667eea;
	}

	.seller-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-top: 1px solid rgba(0,0,0,0.05);
		border-bottom: 1px solid rgba(0,0,0,0.05);
		margin-bottom: 8px;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.seller-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-details {
		display: flex;
		flex-direction: column;
	}

	.seller-name {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 600;
		color: #262626;
	}

	.verified-icon {
		color: #3897f0;
	}

	.seller-rating {
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 11px;
		color: #ffd700;
	}

	.follow-btn {
		padding: 4px 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.follow-btn:active {
		transform: scale(0.95);
	}

	.engagement-stats {
		display: flex;
		gap: 16px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #8e8e8e;
		cursor: pointer;
	}

	.stat:hover {
		color: #262626;
	}

	/* Premium Bottom Navigation */
	.bottom-nav.premium {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 8px 0 12px;
		background: rgba(255,255,255,0.98);
		backdrop-filter: blur(20px);
		border-top: 1px solid rgba(0,0,0,0.08);
		z-index: 200;
	}

	.nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 4px;
		background: none;
		border: none;
		color: #8e8e8e;
		cursor: pointer;
		transition: all 0.3s;
		position: relative;
	}

	.nav-item.active {
		color: #667eea;
	}

	.nav-icon {
		position: relative;
	}

	.nav-badge {
		position: absolute;
		top: -4px;
		right: -8px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		background: #ff3b30;
		color: white;
		font-size: 10px;
		font-weight: 700;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-label {
		font-size: 10px;
		font-weight: 600;
	}

	.nav-center .nav-add {
		width: 48px;
		height: 48px;
		border-radius: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(103, 126, 234, 0.3);
		transition: transform 0.3s;
	}

	.nav-center:active .nav-add {
		transform: scale(0.95);
	}

	/* Story Viewer Modal */
	.story-viewer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: black;
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.story-content {
		width: 100%;
		max-width: 500px;
		height: 100%;
		position: relative;
	}

	.story-header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: 20px;
		background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
		z-index: 10;
	}

	.story-progress {
		height: 2px;
		background: rgba(255,255,255,0.3);
		border-radius: 2px;
		margin-bottom: 12px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: white;
		animation: storyProgress 5s linear;
	}

	@keyframes storyProgress {
		from { width: 0; }
		to { width: 100%; }
	}

	.story-user-info {
		display: flex;
		align-items: center;
		gap: 12px;
		color: white;
	}

	.story-user-info img {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid white;
	}

	.story-user-info span {
		font-size: 14px;
		font-weight: 600;
	}

	.story-time {
		opacity: 0.8;
		font-weight: 400;
	}

	.close-story {
		position: absolute;
		top: 20px;
		right: 20px;
		background: none;
		border: none;
		color: white;
		font-size: 24px;
		cursor: pointer;
	}

	.story-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.story-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	/* Tablet/Desktop */
	@media (min-width: 768px) {
		.demo-app {
			max-width: 500px;
			margin: 0 auto;
			box-shadow: 0 0 60px rgba(0,0,0,0.1);
			border-radius: 20px;
			overflow: hidden;
		}

		.status-bar {
			border-radius: 20px 20px 0 0;
		}

		.product-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
			padding: 16px;
		}

		.bottom-nav.premium {
			max-width: 500px;
			left: 50%;
			transform: translateX(-50%);
			border-radius: 0 0 20px 20px;
		}
	}

	/* Animations */
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.product-card {
		animation: fadeIn 0.5s ease backwards;
	}

	.product-card:nth-child(1) { animation-delay: 0.05s; }
	.product-card:nth-child(2) { animation-delay: 0.1s; }
	.product-card:nth-child(3) { animation-delay: 0.15s; }
	.product-card:nth-child(4) { animation-delay: 0.2s; }
	.product-card:nth-child(5) { animation-delay: 0.25s; }
	.product-card:nth-child(6) { animation-delay: 0.3s; }

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	.notification-dot {
		animation: pulse 2s infinite;
	}
</style>