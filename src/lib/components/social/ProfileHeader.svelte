<!--
ProfileHeader - Instagram-style profile header component
Displays user/brand profile with avatar, stats, bio, and action buttons
Responsive design with mobile/desktop variations
-->
<script lang="ts">
	import { MoreHorizontal, MessageCircle, UserPlus, UserCheck, Share2, Settings } from '@lucide/svelte';
	import Button from '$lib/components/ui/button';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import type { Profile } from '$lib/types';

	interface Props {
		profile: Profile;
		isOwnProfile?: boolean;
		isFollowing?: boolean;
		showStats?: boolean;
		showBio?: boolean;
		showActions?: boolean;
		compact?: boolean;
		onFollow?: () => void;
		onMessage?: () => void;
		onShare?: () => void;
		onEdit?: () => void;
		onSettings?: () => void;
	}

	let {
		profile,
		isOwnProfile = false,
		isFollowing = false,
		showStats = true,
		showBio = true,
		showActions = true,
		compact = false,
		onFollow,
		onMessage,
		onShare,
		onEdit,
		onSettings
	}: Props = $props();

	// Format large numbers
	function formatNumber(num: number): string {
		if (num < 1000) return num.toString();
		if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
		return `${(num / 1000000).toFixed(1)}m`;
	}

	// Generate initials for avatar fallback
	let initials = $derived(() => {
		const name = profile.full_name || profile.username;
		return name
			.split(' ')
			.map(word => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	});

	// Bio with link detection
	let bioWithLinks = $derived(() => {
		if (!profile.bio) return '';
		
		// Simple URL and mention detection
		return profile.bio
			.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" class="bio-link">$1</a>')
			.replace(/@(\w+)/g, '<a href="/user/$1" class="bio-mention">@$1</a>')
			.replace(/#(\w+)/g, '<a href="/search?tag=$1" class="bio-hashtag">#$1</a>');
	});
</script>

<div class="profile-header" class:compact>
	<!-- Mobile Layout -->
	<div class="mobile-layout md:hidden">
		<!-- Top row: Avatar and Stats -->
		<div class="mobile-top">
			<div class="avatar-section">
				<Avatar class="profile-avatar size-20">
					<AvatarImage src={profile.avatar_url} alt={profile.username} />
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
			</div>

			{#if showStats}
				<div class="stats-section">
					<div class="stat-item">
						<div class="stat-number">{formatNumber(profile.listing_count || 0)}</div>
						<div class="stat-label">posts</div>
					</div>
					<div class="stat-item">
						<div class="stat-number">{formatNumber(profile.follower_count || 0)}</div>
						<div class="stat-label">followers</div>
					</div>
					<div class="stat-item">
						<div class="stat-number">{formatNumber(profile.following_count || 0)}</div>
						<div class="stat-label">following</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- User info -->
		<div class="user-info">
			<div class="username-row">
				<h1 class="username">{profile.username}</h1>
				{#if profile.seller_verified}
					<Badge variant="secondary">✓</Badge>
				{/if}
				{#if profile.seller_badge}
					<Badge variant="outline">{profile.seller_badge}</Badge>
				{/if}
			</div>

			{#if profile.full_name}
				<div class="full-name">{profile.full_name}</div>
			{/if}
		</div>

		<!-- Bio -->
		{#if showBio && profile.bio}
			<div class="bio-section">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="bio-text">{@html bioWithLinks}</p>
			</div>
		{/if}

		<!-- Action buttons -->
		{#if showActions}
			<div class="actions-mobile">
				{#if isOwnProfile}
					<Button variant="secondary" onclick={onEdit} class="flex-1">
						Edit Profile
					</Button>
					<Button variant="ghost" size="icon" onclick={onSettings}>
						<Settings size={20} />
					</Button>
				{:else}
					<Button 
						variant={isFollowing ? "secondary" : "default"}
						onclick={onFollow}
						class="flex-1"
					>
						{#if isFollowing}
							<UserCheck size={16} class="mr-2" />
							Following
						{:else}
							<UserPlus size={16} class="mr-2" />
							Follow
						{/if}
					</Button>
					<Button variant="secondary" onclick={onMessage} class="flex-1">
						<MessageCircle size={16} class="mr-2" />
						Message
					</Button>
					<Button variant="ghost" size="icon" onclick={onShare}>
						<Share2 size={20} />
					</Button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Desktop Layout -->
	<div class="desktop-layout hidden md:block">
		<div class="desktop-content">
			<!-- Avatar -->
			<div class="avatar-section">
				<Avatar class="profile-avatar size-32">
					<AvatarImage src={profile.avatar_url} alt={profile.username} />
					<AvatarFallback class="text-2xl">{initials}</AvatarFallback>
				</Avatar>
			</div>

			<!-- Profile Info -->
			<div class="info-section">
				<!-- Username and actions -->
				<div class="username-actions">
					<div class="username-row">
						<h1 class="username">{profile.username}</h1>
						{#if profile.seller_verified}
							<Badge variant="secondary">✓</Badge>
						{/if}
					</div>

					{#if showActions}
						<div class="actions-desktop">
							{#if isOwnProfile}
								<Button variant="secondary" onclick={onEdit}>
									Edit Profile
								</Button>
								<Button variant="ghost" size="icon" onclick={onSettings}>
									<Settings size={20} />
								</Button>
							{:else}
								<Button 
									variant={isFollowing ? "secondary" : "default"}
									onclick={onFollow}
								>
									{#if isFollowing}
										<UserCheck size={16} class="mr-2" />
										Following
									{:else}
										<UserPlus size={16} class="mr-2" />
										Follow
									{/if}
								</Button>
								<Button variant="secondary" onclick={onMessage}>
									<MessageCircle size={16} class="mr-2" />
									Message
								</Button>
								<Button variant="ghost" size="icon" onclick={onShare}>
									<Share2 size={20} />
								</Button>
								<Button variant="ghost" size="icon">
									<MoreHorizontal size={20} />
								</Button>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Stats -->
				{#if showStats}
					<div class="stats-desktop">
						<div class="stat-item">
							<span class="stat-number">{formatNumber(profile.listing_count || 0)}</span>
							<span class="stat-label">posts</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">{formatNumber(profile.follower_count || 0)}</span>
							<span class="stat-label">followers</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">{formatNumber(profile.following_count || 0)}</span>
							<span class="stat-label">following</span>
						</div>
					</div>
				{/if}

				<!-- Full name and bio -->
				<div class="name-bio">
					{#if profile.full_name}
						<div class="full-name">{profile.full_name}</div>
					{/if}
					
					{#if profile.seller_badge}
						<Badge variant="outline" class="mb-2">{profile.seller_badge}</Badge>
					{/if}

					{#if showBio && profile.bio}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<p class="bio-text">{@html bioWithLinks}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Trust indicators -->
	{#if profile.seller_verified || profile.seller_rating}
		<Separator class="my-4" />
		<div class="trust-indicators">
			{#if profile.seller_verified}
				<div class="trust-item">
					<Badge variant="secondary">✓ Verified Seller</Badge>
				</div>
			{/if}
			{#if profile.username === 'w3bsuki'}
				<div class="trust-item">
					<Badge variant="destructive" class="admin-badge">ADMIN</Badge>
				</div>
			{:else if profile.rating_average}
				<div class="trust-item">
					<div class="rating">
						⭐ {profile.rating_average.toFixed(1)}
						{#if profile.rating_count}
							<span class="rating-count">({profile.rating_count} reviews)</span>
						{:else}
							<span class="rating-count">(1 review)</span>
						{/if}
					</div>
				</div>
			{:else if profile.username !== 'w3bsuki'}
				<div class="trust-item">
					<span class="new-seller">New seller</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.profile-header {
		background-color: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem;
	}

	.profile-header.compact {
		padding: 0.5rem;
	}

	/* Mobile Layout */
	.mobile-layout {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mobile-top {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.avatar-section {
		flex-shrink: 0;
	}

	.stats-section {
		flex: 1;
		display: flex;
		justify-content: space-around;
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		display: block;
		font-size: 1.125rem;
		font-weight: 700;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.username-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.username {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.full-name {
		font-weight: 500;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.bio-section {
		font-size: 0.875rem;
		line-height: 1.625;
	}

	.actions-mobile {
		display: flex;
		gap: 0.5rem;
	}

	/* Desktop Layout */
	.desktop-content {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.info-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.username-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.actions-desktop {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stats-desktop {
		display: flex;
		gap: 2rem;
	}

	.stats-desktop .stat-item {
		display: flex;
		gap: 0.25rem;
	}

	.name-bio {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Badges styled via Badge component props */

	/* Bio links */
	:global(.bio-link) {
		color: #3b82f6;
	}
	
	:global(.bio-link:hover) {
		text-decoration: underline;
	}

	:global(.bio-mention) {
		color: #3b82f6;
		font-weight: 500;
	}
	
	:global(.bio-mention:hover) {
		text-decoration: underline;
	}

	:global(.bio-hashtag) {
		color: #3b82f6;
	}
	
	:global(.bio-hashtag:hover) {
		text-decoration: underline;
	}

	/* Trust indicators */
	.trust-indicators {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}

	.rating {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
	}

	.rating-count {
		color: #6b7280;
	}
	
	.new-seller {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}
	
	:global(.admin-badge) {
		background: linear-gradient(to right, #dc2626, #b91c1c);
		color: white;
		font-weight: 700;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	/* Responsive adjustments */
	@media (max-width: 480px) {
		.mobile-top {
			gap: 0.5rem;
		}
		
		.stats-section {
			font-size: 0.875rem;
		}
		
		.stat-number {
			font-size: 1rem;
		}
	}
</style>