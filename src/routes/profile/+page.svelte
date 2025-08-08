<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { Settings, Grid3x3, Plus, Package, Heart } from '@lucide/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const auth = getAuthContext();
	
	let activeTab = $state<'listings' | 'sold' | 'liked'>('listings');
	
	// User profile data - prioritize profiles table data over user metadata
	let profile = $derived({
		username: data.profile?.username || data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'user',
		full_name: data.profile?.full_name || data.user?.user_metadata?.full_name || '',
		bio: data.profile?.bio || data.user?.user_metadata?.bio || '',
		avatar_url: data.profile?.avatar_url || data.user?.user_metadata?.avatar_url || '',
		is_brand: data.profile?.account_type === 'brand' || data.user?.user_metadata?.account_type === 'brand',
		brand_name: data.profile?.brand_name || data.user?.user_metadata?.brand_name || ''
	});
	
	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}
	
	async function handleSignOut() {
		const { error } = await data.supabase.auth.signOut();
		if (!error) {
			await invalidateAll();
			await goto('/');
		}
	}
</script>

<div class="profile-page">
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
		</div>
		
		<!-- Right Section -->
		<div class="profile-right">
			<!-- Username and Settings Row -->
			<div class="username-row">
				<h1 class="username">{profile.username}</h1>
				<button 
					onclick={() => goto('/profile/settings')}
					class="settings-btn"
					aria-label="Settings"
				>
					<Settings size={20} />
				</button>
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
			
			<!-- Bio in same container -->
			<div class="bio-content">
				<div class="bio-header">
					<div>
						<div class="full-name">{profile.full_name || ''}</div>
						{#if profile.is_brand && profile.brand_name}
							<div class="brand-name">{profile.brand_name}</div>
						{/if}
						{#if profile.bio}
							<div class="bio">{profile.bio}</div>
						{/if}
					</div>
					<button 
						onclick={() => goto('/profile/edit')}
						class="edit-profile-btn"
					>
						Edit profile
					</button>
				</div>
			</div>
		</div>
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
			class="tab {activeTab === 'sold' ? 'active' : ''}"
			onclick={() => activeTab = 'sold'}
		>
			<Package size={20} />
			<span class="tab-label">SOLD</span>
		</button>
		<button 
			class="tab {activeTab === 'liked' ? 'active' : ''}"
			onclick={() => activeTab = 'liked'}
		>
			<Heart size={20} />
			<span class="tab-label">LIKED</span>
		</button>
	</div>
	
	<!-- Content Grid -->
	<div class="content-grid">
		{#if activeTab === 'listings'}
			{#if data.listings.length === 0}
				<!-- Empty State -->
				<div class="empty-state">
					<button 
						onclick={() => goto('/sell')}
						class="add-listing-btn"
						aria-label="Add listing"
					>
						<Plus size={48} />
					</button>
					<h3>Share Your Style</h3>
					<p>When you list items, they'll appear here</p>
					<button 
						onclick={() => goto('/sell')}
						class="btn btn-primary"
					>
						Create Your First Listing
					</button>
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
						</a>
					{/each}
				</div>
			{/if}
		{:else if activeTab === 'sold'}
			<!-- Sold Tab -->
			<div class="empty-state">
				<Package size={48} class="empty-icon" />
				<h3>Sold Items</h3>
				<p>Items you've sold will appear here</p>
			</div>
		{:else if activeTab === 'liked'}
			<!-- Liked Tab -->
			<div class="empty-state">
				<Heart size={48} class="empty-icon" />
				<h3>Liked Items</h3>
				<p>Items you've liked will appear here</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.profile-page {
		min-height: 100vh;
		background: var(--color-background);
		padding-bottom: 60px; /* Space for bottom nav */
	}
	
	/* Profile Info */
	.profile-info {
		display: flex;
		align-items: flex-start;
		gap: 32px;
		padding: 30px 16px 20px;
		max-width: 935px;
		margin: 0 auto;
	}
	
	/* Profile Right Section */
	.profile-right {
		flex: 1;
	}
	
	/* Username Row */
	.username-row {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 20px;
	}
	
	.username {
		font-size: 28px;
		font-weight: 300;
		margin: 0;
		line-height: 32px;
	}
	
	.edit-profile-btn {
		padding: 7px 16px;
		font-size: 14px;
		font-weight: 600;
		background: var(--color-secondary);
		color: var(--color-foreground);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		transition: background 200ms;
	}
	
	.edit-profile-btn:hover {
		background: var(--color-muted);
	}
	
	.settings-btn {
		background: none;
		border: none;
		color: var(--color-foreground);
		cursor: pointer;
		padding: 8px;
	}
	
	.avatar-section {
		position: relative;
		flex-shrink: 0;
	}
	
	.avatar {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--color-border);
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
	
	/* Stats */
	.stats-section {
		display: flex;
		gap: 40px;
		margin-bottom: 20px;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		font-size: 16px;
	}
	
	.stat-count {
		font-weight: 600;
		color: var(--color-foreground);
	}
	
	.stat-label {
		font-weight: 400;
		color: var(--color-foreground);
	}
	
	/* Bio Content */
	.bio-content {
		font-size: 14px;
		line-height: 18px;
	}
	
	.bio-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}
	
	.full-name {
		font-weight: 600;
		margin-bottom: 2px;
	}
	
	.brand-name {
		color: #3b82f6;
		margin-bottom: 2px;
	}
	
	.bio {
		color: var(--color-foreground);
	}
	
	
	/* Tabs */
	.profile-tabs {
		display: flex;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		max-width: 935px;
		margin: 20px auto 0;
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
	
	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48px 16px;
		text-align: center;
	}
	
	.add-listing-btn {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 2px dashed var(--color-border);
		background: none;
		color: var(--color-muted-foreground);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
		transition: all 200ms;
	}
	
	.add-listing-btn:hover {
		border-color: var(--color-foreground);
		color: var(--color-foreground);
	}
	
	.empty-state h3 {
		font-size: 20px;
		font-weight: 600;
		margin: 16px 0 8px 0;
	}
	
	.empty-state p {
		font-size: 14px;
		color: var(--color-muted-foreground);
		margin: 0 0 24px 0;
	}
	
	.empty-icon {
		color: var(--color-muted-foreground);
		margin-bottom: 16px;
	}
	
	/* Mobile optimization */
	@media (max-width: 735px) {
		.profile-info {
			padding: 16px;
			gap: 28px;
		}
		
		.avatar {
			width: 77px;
			height: 77px;
		}
		
		.username {
			font-size: 20px;
		}
		
		.username-row {
			flex-wrap: wrap;
			gap: 8px;
		}
		
		.bio-header {
			flex-direction: column;
			gap: 8px;
		}
		
		.edit-profile-btn {
			width: 100%;
		}
		
		.stats-section {
			gap: 12px;
			font-size: 14px;
		}
	}
	
</style>