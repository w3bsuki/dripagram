<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { Settings, Grid3x3, Plus, Package, Heart, LogOut } from '@lucide/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const auth = getAuthContext();
	
	let activeTab = $state<'listings' | 'sold' | 'liked'>('listings');
	
	// User profile data - prioritize profiles table data over user metadata
	let profile = $derived({
		username: data.profile?.username || 'user',
		full_name: data.profile?.full_name || '',
		bio: data.profile?.bio || '',
		avatar_url: data.profile?.avatar_url || '',
		is_brand: data.profile?.account_type === 'business' || data.profile?.account_type === 'brand',
		brand_name: data.profile?.brand_name || ''
	});
	
	// Helper function to build localized URLs
	function buildLocalizedUrl(path: string): string {
		const lang = data?.lang || 'bg';
		return `/${lang}${path}`;
	}
	
	function getInitials(name: string): string {
		if (!name || name.trim() === '') return 'U';
		const parts = name.trim().split(' ').filter(part => part.length > 0);
		if (parts.length === 0) return 'U';
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
	}
	
	async function handleSignOut() {
		const { error } = await data.supabase.auth.signOut();
		if (!error) {
			await invalidateAll();
			await goto(buildLocalizedUrl('/'));
		}
	}
</script>

<!-- Main Content Wrapper with Instagram-style background -->
<main class="profile-main">
	<!-- Profile Header Section -->
	<div class="profile-header">
		<div class="profile-container">
			<!-- Avatar Section -->
			<div class="profile-avatar">
				{#if profile.avatar_url}
					<img 
						src={profile.avatar_url} 
						alt={profile.username}
						loading="eager"
						decoding="sync"
						fetchpriority="high"
						width="150"
						height="150"
						class="avatar-image"
					/>
				{:else}
					<div class="avatar-placeholder">
						<span class="avatar-initials">
							{getInitials(profile.full_name && profile.full_name !== profile.username ? profile.full_name : profile.username)}
						</span>
					</div>
				{/if}
			</div>
			
			<!-- Profile Details -->
			<div class="profile-details">
				<!-- Username and Actions Row -->
				<div class="profile-header-row">
					<div class="username-group">
						<h1 class="profile-username">{profile.username}</h1>
						{#if profile.is_brand}
							<span class="verified-badge">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
								</svg>
							</span>
						{/if}
					</div>
					<div class="profile-actions">
						<button 
							onclick={() => goto(buildLocalizedUrl('/profile/edit'))}
							class="action-button primary"
						>
							Edit profile
						</button>
						<button 
							onclick={() => goto(buildLocalizedUrl('/profile/settings'))}
							class="action-button secondary"
							aria-label="Settings"
						>
							<Settings size={16} />
						</button>
						<button 
							onclick={handleSignOut}
							class="action-button secondary logout"
							aria-label="Sign Out"
						>
							<LogOut size={16} />
						</button>
					</div>
				</div>
				
				<!-- Stats Row -->
				<div class="profile-stats">
					<button class="stat-button" onclick={() => activeTab = 'listings'}>
						<span class="stat-number">{data.stats.listings}</span>
						<span class="stat-label">listings</span>
					</button>
					<span class="stat-divider"></span>
					<button class="stat-button">
						<span class="stat-number">{data.stats.followers}</span>
						<span class="stat-label">followers</span>
					</button>
					<span class="stat-divider"></span>
					<button class="stat-button">
						<span class="stat-number">{data.stats.following}</span>
						<span class="stat-label">following</span>
					</button>
				</div>
				
				<!-- Bio Section -->
				{#if profile.full_name || profile.bio}
					<div class="profile-bio">
						{#if profile.full_name && profile.full_name !== profile.username}
							<div class="bio-name">{profile.full_name}</div>
						{/if}
						{#if profile.bio}
							<div class="bio-text">{profile.bio}</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Navigation Tabs -->
	<div class="profile-nav">
		<div class="nav-container">
			<button 
				class="nav-tab {activeTab === 'listings' ? 'active' : ''}"
				onclick={() => activeTab = 'listings'}
			>
				<Grid3x3 size={12} />
				<span class="nav-label">Posts</span>
			</button>
			<button 
				class="nav-tab {activeTab === 'sold' ? 'active' : ''}"
				onclick={() => activeTab = 'sold'}
			>
				<Package size={12} />
				<span class="nav-label">Sold</span>
			</button>
			<button 
				class="nav-tab {activeTab === 'liked' ? 'active' : ''}"
				onclick={() => activeTab = 'liked'}
			>
				<Heart size={12} />
				<span class="nav-label">Saved</span>
			</button>
		</div>
	</div>
	
	<!-- Content Area -->
	<div class="profile-content">
		{#if activeTab === 'listings'}
			{#if data.listings.length === 0}
				<div class="empty-content">
					<div class="empty-circle">
						<Plus size={24} />
					</div>
					<h3 class="empty-title">Share Your First Listing</h3>
					<p class="empty-subtitle">When you list items for sale, they'll appear on your profile.</p>
					<button 
						onclick={() => goto(buildLocalizedUrl('/sell'))}
						class="empty-button"
					>
						Create Listing
					</button>
				</div>
			{:else}
				<div class="content-grid">
					{#each data.listings as listing}
						<a href={buildLocalizedUrl(`/products/${listing.id}`)} class="grid-item">
							<div class="item-image">
								<img 
									src={listing.thumbnail_url || '/placeholder.jpg'} 
									alt={listing.title}
									loading="lazy"
									decoding="async"
								/>
							</div>
							<div class="item-info">
								<span class="item-price">€{listing.price}</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		{:else if activeTab === 'sold'}
			<div class="empty-content">
				<div class="empty-circle">
					<Package size={24} />
				</div>
				<h3 class="empty-title">No Sold Items</h3>
				<p class="empty-subtitle">Items you've sold will appear here.</p>
			</div>
		{:else if activeTab === 'liked'}
			<div class="empty-content">
				<div class="empty-circle">
					<Heart size={24} />
				</div>
				<h3 class="empty-title">No Saved Items</h3>
				<p class="empty-subtitle">Items you save will appear here.</p>
			</div>
		{/if}
	</div>
</main>

<style>
	/* Main Layout */
	.profile-main {
		min-height: 100vh;
		background: #fafafa;
		padding-bottom: 80px;
	}
	
	/* Profile Header */
	.profile-header {
		background: white;
		border-bottom: 1px solid #e5e5e5;
		padding: 32px 0 24px;
	}
	
	.profile-container {
		max-width: 975px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		align-items: flex-start;
		gap: 44px;
	}
	
	/* Avatar */
	.profile-avatar {
		flex-shrink: 0;
	}
	
	.avatar-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #e5e5e5;
	}
	
	.avatar-placeholder {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: 1px solid #e5e5e5;
	}
	
	.avatar-initials {
		font-size: 28px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	
	/* Profile Details */
	.profile-details {
		flex: 1;
		min-width: 0;
	}
	
	.profile-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	
	.username-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.profile-username {
		font-size: 28px;
		font-weight: 300;
		line-height: 32px;
		margin: 0;
		color: #262626;
	}
	
	.verified-badge {
		color: #1877f2;
		display: flex;
		align-items: center;
	}
	
	.profile-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.action-button {
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	
	.action-button.primary {
		background: #efefef;
		color: #262626;
		padding: 7px 16px;
	}
	
	.action-button.primary:hover {
		background: #e0e0e0;
	}
	
	.action-button.secondary {
		background: #efefef;
		color: #262626;
		padding: 7px;
		width: 32px;
		height: 32px;
		justify-content: center;
	}
	
	.action-button.secondary:hover {
		background: #e0e0e0;
	}
	
	.action-button.logout {
		color: #ed4956;
	}
	
	.action-button.logout:hover {
		background: rgba(237, 73, 86, 0.1);
	}
	
	/* Stats */
	.profile-stats {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
	}
	
	.stat-button {
		display: flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		font-size: 16px;
		color: #262626;
	}
	
	.stat-number {
		font-weight: 600;
	}
	
	.stat-label {
		font-weight: 400;
	}
	
	.stat-divider {
		width: 1px;
		height: 16px;
		background: #dbdbdb;
		margin: 0 12px;
	}
	
	/* Bio */
	.profile-bio {
		font-size: 16px;
		line-height: 24px;
		color: #262626;
	}
	
	.bio-name {
		font-weight: 600;
		margin-bottom: 4px;
	}
	

	.bio-text {
		margin-bottom: 8px;
	}
	
	/* Navigation Tabs */
	.profile-nav {
		background: white;
		border-top: 1px solid #e5e5e5;
	}
	
	.nav-container {
		max-width: 975px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
	}
	
	.nav-tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 16px 12px;
		background: none;
		border: none;
		border-top: 1px solid transparent;
		color: #8e8e8e;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.2s ease;
		margin: 0 24px;
	}
	
	.nav-tab:hover {
		color: #262626;
	}
	
	.nav-tab.active {
		color: #262626;
		border-top-color: #262626;
	}
	
	.nav-label {
		display: none;
	}
	
	/* Content Area */
	.profile-content {
		max-width: 975px;
		margin: 0 auto;
		padding: 24px 20px;
	}
	
	.content-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
	}
	
	.grid-item {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: #f8f8f8;
		display: block;
	}
	
	.item-image {
		width: 100%;
		height: 100%;
	}
	
	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.2s ease;
	}
	
	.grid-item:hover .item-image img {
		transform: scale(1.03);
	}
	
	.item-info {
		position: absolute;
		bottom: 8px;
		left: 8px;
		right: 8px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	
	.grid-item:hover .item-info {
		opacity: 1;
	}
	
	/* Empty State */
	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 64px 24px;
		color: #262626;
	}
	
	.empty-circle {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		border: 2px solid #262626;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24px;
	}
	
	.empty-title {
		font-size: 28px;
		font-weight: 300;
		margin: 0 0 16px 0;
	}
	
	.empty-subtitle {
		font-size: 14px;
		color: #8e8e8e;
		margin: 0 0 24px 0;
		line-height: 20px;
	}
	
	.empty-button {
		background: #0095f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 8px 24px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.empty-button:hover {
		background: #1877f2;
	}
	
	/* Mobile Responsive */
	@media (max-width: 735px) {
		.profile-container {
			padding: 0 16px;
			gap: 28px;
		}
		
		.avatar-image,
		.avatar-placeholder {
			width: 77px;
			height: 77px;
		}
		
		.avatar-initials {
			font-size: 18px;
		}
		
		.profile-username {
			font-size: 24px;
		}
		
		.profile-header-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
		}
		
		.profile-actions {
			width: 100%;
			justify-content: flex-start;
		}
		
		.action-button.primary {
			flex: 1;
			justify-content: center;
		}
		
		.profile-stats {
			justify-content: space-around;
			margin: 16px 0;
		}
		
		.stat-divider {
			display: none;
		}
		
		.nav-tab {
			margin: 0 12px;
		}
		
		.nav-label {
			display: block;
		}
		
		.profile-content {
			padding: 16px;
		}
		
		.content-grid {
			gap: 2px;
		}
	}
</style>