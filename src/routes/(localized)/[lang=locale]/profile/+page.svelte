<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Grid3x3, Plus, Package, Heart, Settings, LogOut, MoreVertical } from '@lucide/svelte';
	import FollowersModal from '$lib/components/profile/FollowersModal.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let activeTab = $state<'listings' | 'sold' | 'liked'>('listings');
	let showFollowersModal = $state(false);
	let followersModalTitle = $state('');
	let followersModalType = $state<'followers' | 'following'>('followers');

	function handleFollowersModal() {
		followersModalTitle = 'Followers';
		followersModalType = 'followers';
		showFollowersModal = true;
	}

	function handleFollowingModal() {
		followersModalTitle = 'Following';
		followersModalType = 'following';
		showFollowersModal = true;
	}

	function closeFollowersModal() {
		showFollowersModal = false;
	}

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

<div class="profile">
	<!-- Mobile Header -->
	<header class="profile-header">
		<h1 class="header-username">{data.profile?.username || 'user'}</h1>
		<button class="menu-btn" onclick={() => console.log('menu')}>
			<MoreVertical size={24} />
		</button>
	</header>

	<!-- Profile Info Section -->
	<div class="profile-info">
		<div class="info-container">
			<!-- Avatar -->
			<div class="avatar-wrapper">
				{#if data.profile?.avatar_url}
					<img 
						src={data.profile.avatar_url} 
						alt={data.profile.username}
						class="avatar"
					/>
				{:else}
					<div class="avatar-placeholder">
						{getInitials(data.profile?.full_name || data.profile?.username || 'U')}
					</div>
				{/if}
			</div>

			<!-- Stats -->
			<div class="stats-wrapper">
				<button class="stat" onclick={() => activeTab = 'listings'}>
					<span class="stat-number">{data.stats.listings}</span>
					<span class="stat-label">posts</span>
				</button>
				<button class="stat" onclick={handleFollowersModal}>
					<span class="stat-number">{data.stats.followers}</span>
					<span class="stat-label">followers</span>
				</button>
				<button class="stat" onclick={handleFollowingModal}>
					<span class="stat-number">{data.stats.following}</span>
					<span class="stat-label">following</span>
				</button>
			</div>
		</div>

		<!-- Name & Bio -->
		<div class="bio-section">
			{#if data.profile?.full_name}
				<div class="fullname">{data.profile.full_name}</div>
			{/if}
			{#if data.profile?.bio}
				<div class="bio">{data.profile.bio}</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons">
			<button 
				class="btn-primary"
				onclick={() => goto(buildLocalizedUrl('/profile/edit'))}
			>
				Edit profile
			</button>
			<button 
				class="btn-secondary"
				onclick={() => goto(buildLocalizedUrl('/profile/settings'))}
			>
				<Settings size={18} />
			</button>
			<button 
				class="btn-secondary logout"
				onclick={handleSignOut}
			>
				<LogOut size={18} />
			</button>
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button 
			class="tab {activeTab === 'listings' ? 'active' : ''}"
			onclick={() => activeTab = 'listings'}
		>
			<Grid3x3 size={24} />
		</button>
		<button 
			class="tab {activeTab === 'sold' ? 'active' : ''}"
			onclick={() => activeTab = 'sold'}
		>
			<Package size={24} />
		</button>
		<button 
			class="tab {activeTab === 'liked' ? 'active' : ''}"
			onclick={() => activeTab = 'liked'}
		>
			<Heart size={24} />
		</button>
	</div>

	<!-- Content -->
	<div class="content">
		{#if activeTab === 'listings'}
			{#if data.listings.length === 0}
				<div class="empty">
					<div class="empty-icon">
						<Plus size={40} />
					</div>
					<h3>Share Photos</h3>
					<p>When you share photos, they will appear on your profile.</p>
					<button 
						class="share-btn"
						onclick={() => goto(buildLocalizedUrl('/sell'))}
					>
						Share your first photo
					</button>
				</div>
			{:else}
				<div class="grid">
					{#each data.listings as listing}
						<a href={buildLocalizedUrl(`/products/${listing.id}`)} class="grid-item">
							<img 
								src={listing.thumbnail_url || '/placeholder.jpg'} 
								alt={listing.title}
								loading="lazy"
							/>
							<div class="overlay">
								<span>€{listing.price}</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		{:else if activeTab === 'sold'}
			<div class="empty">
				<div class="empty-icon">
					<Package size={40} />
				</div>
				<h3>No Sold Items</h3>
				<p>Items you've sold will appear here.</p>
			</div>
		{:else}
			<div class="empty">
				<div class="empty-icon">
					<Heart size={40} />
				</div>
				<h3>No Saved Items</h3>
				<p>Save photos and videos that you want to see again.</p>
			</div>
		{/if}
	</div>
</div>

<FollowersModal
	isOpen={showFollowersModal}
	title={followersModalTitle}
	userId={data.user?.id || ''}
	currentUser={data.user}
	onClose={closeFollowersModal}
	on:follow={() => invalidateAll()}
	on:unfollow={() => invalidateAll()}
/>

<style>
	.profile {
		min-height: 100vh;
		background: white;
		padding-bottom: 60px; /* Bottom nav space */
	}

	/* Header */
	.profile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid #efefef;
		position: sticky;
		top: 0;
		background: white;
		z-index: 10;
	}

	.header-username {
		font-size: 22px;
		font-weight: 600;
		margin: 0;
	}

	.menu-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
	}

	/* Profile Info */
	.profile-info {
		padding: 16px;
	}

	.info-container {
		display: flex;
		align-items: center;
		gap: 28px;
		margin-bottom: 12px;
	}

	.avatar-wrapper {
		flex-shrink: 0;
	}

	.avatar, .avatar-placeholder {
		width: 77px;
		height: 77px;
		border-radius: 50%;
	}

	.avatar {
		object-fit: cover;
	}

	.avatar-placeholder {
		background: #efefef;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		color: #8e8e8e;
		font-weight: 300;
	}

	.stats-wrapper {
		flex: 1;
		display: flex;
		justify-content: space-around;
	}

	.stat {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-number {
		font-size: 16px;
		font-weight: 600;
		color: #262626;
	}

	.stat-label {
		font-size: 13px;
		color: #8e8e8e;
	}

	.bio-section {
		margin-bottom: 12px;
	}

	.fullname {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.bio {
		font-size: 14px;
		line-height: 18px;
	}

	.action-buttons {
		display: flex;
		gap: 8px;
	}

	.btn-primary {
		flex: 1;
		padding: 7px 0;
		background: white;
		border: 1px solid #dbdbdb;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary {
		padding: 7px 11px;
		background: white;
		border: 1px solid #dbdbdb;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #262626;
	}

	.btn-secondary.logout {
		color: #ed4956;
	}

	/* Tabs */
	.tabs {
		display: flex;
		border-top: 1px solid #efefef;
	}

	.tab {
		flex: 1;
		padding: 12px;
		background: none;
		border: none;
		border-bottom: 1px solid transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #8e8e8e;
	}

	.tab.active {
		color: #262626;
		border-bottom-color: #262626;
	}

	/* Content */
	.content {
		min-height: 400px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2px;
	}

	.grid-item {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: #000;
	}

	.grid-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
		color: white;
		font-weight: 600;
	}

	.grid-item:active .overlay {
		opacity: 1;
	}

	.empty {
		padding: 60px 44px;
		text-align: center;
	}

	.empty-icon {
		width: 62px;
		height: 62px;
		border: 2px solid #262626;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.empty h3 {
		font-size: 24px;
		font-weight: 300;
		margin: 0 0 12px;
	}

	.empty p {
		font-size: 14px;
		color: #8e8e8e;
		margin: 0 0 24px;
		line-height: 18px;
	}

	.share-btn {
		background: #0095f6;
		border: none;
		border-radius: 8px;
		color: white;
		padding: 7px 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	/* Desktop adjustments */
	@media (min-width: 736px) {
		.profile {
			max-width: 600px;
			margin: 0 auto;
		}

		.avatar, .avatar-placeholder {
			width: 150px;
			height: 150px;
		}

		.avatar-placeholder {
			font-size: 40px;
		}

		.info-container {
			gap: 40px;
		}

		.stat-number {
			font-size: 18px;
		}

		.stat-label {
			font-size: 14px;
		}
	}
</style>