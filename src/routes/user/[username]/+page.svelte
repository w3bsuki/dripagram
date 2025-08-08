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
	
	function handleMessage() {
		if (!auth.user) {
			goto('/auth/login');
			return;
		}
		goto(`/messages/${profile.id}`);
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
			data.stats.followers = result.followerCount;
			
		} catch (error) {
			console.error('Error updating follow status:', error);
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
				<span class="stat-count">{data.stats.listings}</span>
				<span class="stat-label">listings</span>
			</button>
			<button class="stat-item">
				<span class="stat-count">{data.stats.followers}</span>
				<span class="stat-label">followers</span>
			</button>
			<button class="stat-item">
				<span class="stat-count">{data.stats.following}</span>
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
		z-index: 100;
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
		font-size: 20px;
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
		font-size: 28px;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.brand-badge {
		position: absolute;
		bottom: -4px;
		right: -4px;
		background: #3b82f6;
		color: white;
		font-size: 10px;
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
		font-size: 12px;
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
		font-size: 18px;
		font-weight: 600;
		color: var(--color-foreground);
	}
	
	.stat-label {
		font-size: 14px;
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
		font-size: 14px;
		font-weight: 600;
		margin: 0 0 4px 0;
	}
	
	.brand-name {
		font-size: 14px;
		color: #3b82f6;
		margin: 0 0 8px 0;
	}
	
	.bio {
		font-size: 14px;
		line-height: 1.4;
		color: var(--color-foreground);
		margin: 0;
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
		font-size: 14px;
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
		font-size: 12px;
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
		font-size: 12px;
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
		font-size: 14px;
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
		font-size: 20px;
		font-weight: 600;
		margin: 16px 0 8px 0;
	}
	
	.empty-state p {
		font-size: 14px;
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