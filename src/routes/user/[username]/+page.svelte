<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { Settings, Grid3x3, Bookmark, MessageCircle, UserPlus, MoreHorizontal } from '@lucide/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const auth = getAuthContext();
	
	let activeTab = $state<'listings' | 'saved'>('listings');
	let isFollowing = $state(data.isFollowing);
	let followLoading = $state(false);
	let stats = $state({
		listings: data.stats.listings,
		followers: data.stats.followers,
		following: data.stats.following
	});
	
	// Check if this is the current user's own profile
	let isOwnProfile = $derived(auth.user?.id === data.profile.id);
	
	// Profile data
	let profile = $derived({
		id: data.profile.id,
		username: data.profile.username || 'user',
		full_name: data.profile.full_name || '',
		bio: data.profile.bio || '',
		avatar_url: data.profile.avatar_url || '',
		is_brand: data.profile.account_type === 'brand',
		brand_name: data.profile.brand_name || '',
		verified: data.profile.seller_verified || false
	});
	
	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}
	
	async function handleMessage() {
		if (!auth.user) {
			goto('/auth/login');
			return;
		}
		
		
		try {
			// First, check if a conversation already exists or create one
			const response = await fetch('/api/messages/conversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					otherUserId: profile.id
				}),
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				console.error('Failed to create conversation:', data);
				throw new Error(data.error || 'Failed to create conversation');
			}
			
			if (!data.conversationId) {
				console.error('No conversation ID returned:', data);
				throw new Error('No conversation ID returned');
			}
			
			goto(`/messages/${data.conversationId}`);
		} catch (error: any) {
			console.error('Error creating conversation:', error);
			alert(`Failed to start conversation: ${error?.message || 'Unknown error'}`);
			// Don't redirect on error so user can see what happened
		}
	}
	
	async function handleFollow() {
		if (!auth.user) {
			goto('/auth/login');
			return;
		}

		followLoading = true;
		
		try {
			const response = await fetch('/api/users/follow', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetUserId: profile.id,
					action: isFollowing ? 'unfollow' : 'follow'
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update follow status');
			}

			const result = await response.json();
			isFollowing = result.isFollowing;
			
			// Update stats
			stats.followers = result.followerCount;
			
		} catch (error) {
		} finally {
			followLoading = false;
		}
	}
</script>

<div class="profile-page">
	<!-- Header -->
	<header class="profile-header">
		<div class="header-content">
			<button 
				onclick={() => window.history.back()}
				class="back-btn"
				aria-label="Go back"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6"/>
				</svg>
			</button>
			<h1 class="username">{profile.username}</h1>
			<button 
				class="more-btn"
				aria-label="More options"
			>
				<MoreHorizontal size={24} />
			</button>
		</div>
	</header>
	
	<!-- Profile Info -->
	<div class="profile-info">
		<!-- Avatar Section -->
		<div class="avatar-section">
			{#if profile.avatar_url}
				<img 
					src={profile.avatar_url} 
					alt={profile.username}
					class="avatar"
				/>
			{:else}
				<div class="avatar avatar-placeholder">
					<span class="initials">
						{getInitials(profile.full_name || profile.username)}
					</span>
				</div>
			{/if}
			{#if profile.is_brand}
				<span class="brand-badge">Brand</span>
			{/if}
			{#if profile.verified}
				<span class="verified-badge" title="Verified Seller">✓</span>
			{/if}
		</div>
		
		<!-- Stats Section -->
		<div class="stats-section">
			<button class="stat-item" onclick={() => activeTab = 'listings'}>
				<span class="stat-count">{stats.listings}</span>
				<span class="stat-label">listings</span>
			</button>
			<button class="stat-item">
				<span class="stat-count">{stats.followers}</span>
				<span class="stat-label">followers</span>
			</button>
			<button class="stat-item">
				<span class="stat-count">{stats.following}</span>
				<span class="stat-label">following</span>
			</button>
		</div>
	</div>
	
	<!-- Bio Section -->
	<div class="bio-section">
		<h2 class="full-name">{profile.full_name || profile.username}</h2>
		{#if profile.is_brand && profile.brand_name}
			<p class="brand-name">{profile.brand_name}</p>
		{/if}
		
		<!-- User Rating -->
		<div class="user-rating">
			{#if profile.username === 'w3bsuki'}
				<span class="admin-badge">ADMIN</span>
			{:else if data.profile.rating_average && data.profile.rating_count}
				<div class="rating">
					⭐ {data.profile.rating_average.toFixed(1)} ({data.profile.rating_count} reviews)
				</div>
			{:else if data.profile.rating_average}
				<div class="rating">
					⭐ {data.profile.rating_average.toFixed(1)} (1 review)
				</div>
			{:else}
				<span class="new-seller">New seller</span>
			{/if}
		</div>
		
		{#if profile.bio}
			<p class="bio">{profile.bio}</p>
		{/if}
	</div>
	
	<!-- Action Buttons -->
	<div class="action-buttons">
		{#if isOwnProfile}
			<button 
				onclick={() => goto('/profile/edit')}
				class="btn btn-primary"
			>
				Edit Profile
			</button>
			<button 
				onclick={() => goto('/profile/insights')}
				class="btn btn-secondary"
			>
				View Insights
			</button>
		{:else}
			<button 
				onclick={handleFollow}
				disabled={followLoading}
				class="btn {isFollowing ? 'btn-secondary' : 'btn-primary'}"
			>
				{followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
			</button>
			<button 
				onclick={handleMessage}
				class="btn btn-secondary"
			>
				Message
			</button>
		{/if}
	</div>
	
	<!-- Tabs -->
	<div class="profile-tabs">
		<button 
			class="tab {activeTab === 'listings' ? 'active' : ''}"
			onclick={() => activeTab = 'listings'}
		>
			<Grid3x3 size={20} />
			<span class="tab-label">LISTINGS</span>
		</button>
		<button 
			class="tab {activeTab === 'saved' ? 'active' : ''}"
			onclick={() => activeTab = 'saved'}
		>
			<Bookmark size={20} />
			<span class="tab-label">SAVED</span>
		</button>
	</div>
	
	<!-- Content Grid -->
	<div class="content-grid">
		{#if activeTab === 'listings'}
			{#if data.listings.length === 0}
				<!-- Empty State -->
				<div class="empty-state">
					<Grid3x3 size={48} class="empty-icon" />
					<h3>No Listings Yet</h3>
					<p>{profile.username} hasn't listed any items</p>
				</div>
			{:else}
				<div class="listings-grid">
					{#each data.listings as listing}
						<a href="/products/{listing.id}" class="grid-item">
							<img 
								src={listing.thumbnail_url || '/placeholder.jpg'} 
								alt={listing.title}
							/>
							<div class="item-overlay">
								<span class="item-price">{listing.price} лв</span>
							</div>
							{#if listing.status === 'sold'}
								<div class="sold-overlay">
									<span>SOLD</span>
								</div>
							{/if}
						</a>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Saved Tab (not accessible for other users) -->
			<div class="empty-state">
				<Bookmark size={48} class="empty-icon" />
				<h3>Private Collection</h3>
				<p>Saved items are private</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.profile-page {
		min-height: 100vh;
		background: var(--color-background);
		padding-bottom: 60px;
	}
	
	/* Header */
	.profile-header {
		position: sticky;
		top: 0;
		z-index: var(--z-higher);
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		padding: 12px 16px;
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.back-btn,
	.more-btn {
		background: none;
		border: none;
		color: var(--color-foreground);
		cursor: pointer;
		padding: 4px;
	}
	
	.username {
		font-size: var(--font-size-xl);
		font-weight: 600;
		margin: 0;
		flex: 1;
		text-align: center;
	}
	
	/* Profile Info */
	.profile-info {
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 20px 16px;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.avatar-section {
		position: relative;
		flex-shrink: 0;
	}
	
	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-border);
	}
	
	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.initials {
		font-size: var(--font-size-3xl);
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.brand-badge {
		position: absolute;
		bottom: -4px;
		right: -4px;
		background: #3b82f6;
		color: white;
		font-size: var(--font-size-2xs);
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 12px;
		border: 2px solid var(--color-background);
		text-transform: uppercase;
	}
	
	.verified-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #10b981;
		color: white;
		font-size: var(--font-size-xs);
		font-weight: bold;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-background);
	}
	
	/* Stats */
	.stats-section {
		display: flex;
		gap: 32px;
		flex: 1;
	}
	
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}
	
	.stat-count {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-foreground);
	}
	
	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-muted-foreground);
		margin-top: 2px;
	}
	
	/* Bio Section */
	.bio-section {
		padding: 0 16px;
		max-width: 600px;
		margin: 0 auto 16px;
	}
	
	.full-name {
		font-size: var(--font-size-sm);
		font-weight: 600;
		margin: 0 0 4px 0;
	}
	
	.brand-name {
		font-size: var(--font-size-sm);
		color: #3b82f6;
		margin: 0 0 8px 0;
	}
	
	.bio {
		font-size: var(--font-size-sm);
		line-height: 1.4;
		color: var(--color-foreground);
		margin: 0;
	}
	
	.user-rating {
		margin: 4px 0 8px 0;
	}
	
	.rating {
		font-size: var(--font-size-sm);
		color: var(--color-foreground);
		display: flex;
		align-items: center;
		gap: 4px;
	}
	
	.new-seller {
		font-size: var(--font-size-sm);
		color: var(--color-muted-foreground);
		font-style: italic;
	}
	
	.admin-badge {
		background: linear-gradient(135deg, #dc2626, #991b1b);
		color: white;
		padding: 4px 10px;
		border-radius: 6px;
		font-size: var(--font-size-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
		display: inline-block;
	}
	
	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: 8px;
		padding: 0 16px;
		max-width: 600px;
		margin: 0 auto 16px;
	}
	
	.btn {
		flex: 1;
		padding: 8px 16px;
		font-size: var(--font-size-sm);
		font-weight: 600;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 200ms;
	}
	
	.btn-primary {
		background: var(--color-foreground);
		color: var(--color-background);
	}
	
	.btn-secondary {
		background: var(--color-secondary);
		color: var(--color-foreground);
		border: 1px solid var(--color-border);
	}
	
	/* Tabs */
	.profile-tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		max-width: 600px;
		margin: 0 auto;
	}
	
	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-muted-foreground);
		cursor: pointer;
		transition: all 200ms;
	}
	
	.tab.active {
		color: var(--color-foreground);
		border-bottom-color: var(--color-foreground);
	}
	
	.tab-label {
		font-size: var(--font-size-xs);
		font-weight: 600;
		letter-spacing: 0.5px;
	}
	
	/* Content Grid */
	.content-grid {
		max-width: 600px;
		margin: 0 auto;
	}
	
	.listings-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2px;
	}
	
	.grid-item {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--color-secondary);
	}
	
	.grid-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 200ms;
	}
	
	.grid-item:hover img {
		transform: scale(1.05);
	}
	
	.item-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 8px;
		background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
		color: white;
		opacity: 0;
		transition: opacity 200ms;
	}
	
	.grid-item:hover .item-overlay {
		opacity: 1;
	}
	
	.item-price {
		font-size: var(--font-size-xs);
		font-weight: 600;
	}
	
	.sold-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 600;
		font-size: var(--font-size-sm);
		letter-spacing: 0.5px;
	}
	
	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48px 16px;
		text-align: center;
	}
	
	.empty-icon {
		color: var(--color-muted-foreground);
		margin-bottom: 16px;
	}
	
	.empty-state h3 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		margin: 16px 0 8px 0;
	}
	
	.empty-state p {
		font-size: var(--font-size-sm);
		color: var(--color-muted-foreground);
		margin: 0;
	}
	
	/* Mobile optimization */
	@media (min-width: 640px) {
		.profile-info {
			gap: 48px;
		}
		
		.avatar {
			width: 100px;
			height: 100px;
		}
		
		.stats-section {
			gap: 48px;
		}
	}
</style>