<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { Settings, LogOut, Verified } from '@lucide/svelte';
	import Button from '$lib/components/native/Button.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

	let { data } = $props();
	const auth = getAuthContext();

	let profile = $derived({
		username: data.profile?.username || 'user',
		full_name: data.profile?.full_name || '',
		bio: data.profile?.bio || '',
		avatar_url: data.profile?.avatar_url || '',
		is_brand: data.profile?.account_type === 'business' || data.profile?.account_type === 'brand',
		brand_name: data.profile?.brand_name || ''
	});

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

<header class="profile-header">
	<div class="profile-container">
		<div class="profile-avatar">
			{#if profile.avatar_url}
				<img 
					src={profile.avatar_url} 
					alt={profile.username}
					class="avatar-image"
				/>
			{:else}
				<div class="avatar-placeholder">
					<span class="avatar-initials">
						{getInitials(profile.full_name || profile.username)}
					</span>
				</div>
			{/if}
		</div>

		<div class="profile-info">
			<div class="profile-header-row">
				<div class="username-section">
					<h1 class="username">{profile.username}</h1>
					{#if profile.is_brand}
						<Verified class="verified-badge" />
					{/if}
				</div>
				<div class="profile-actions">
					<button 
						class="edit-profile-btn"
						onclick={() => goto(buildLocalizedUrl('/profile/edit'))}
					>
						Edit profile
					</button>
					<button 
						class="icon-btn"
						onclick={() => goto(buildLocalizedUrl('/profile/settings'))}
					>
						<Settings size={20} />
					</button>
					<button 
						class="icon-btn logout-btn"
						onclick={handleSignOut}
					>
						<LogOut size={20} />
					</button>
				</div>
			</div>
            <div class="hidden md:block">
                <slot name="stats" />
            </div>
			<div>
                <slot name="bio" />
            </div>
		</div>
	</div>
    <div class="mobile-stats md:hidden">
        <slot name="stats" />
    </div>
</header>

<style>
	.profile-header {
		background: white;
		border-bottom: 1px solid #dbdbdb;
	}

	.profile-container {
		max-width: 935px;
		margin: 0 auto;
		padding: 30px 20px;
		display: flex;
		align-items: flex-start;
		gap: 30px;
	}

	.profile-avatar {
		flex-shrink: 0;
	}

	.avatar-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: #405de6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-initials {
		color: white;
		font-size: 48px;
		font-weight: 600;
	}

	.profile-info {
		flex: 1;
		min-width: 0;
	}

	.profile-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.username-section {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.username {
		font-size: 28px;
		font-weight: 300;
		color: #262626;
		margin: 0;
	}

	.verified-badge {
		width: 18px;
		height: 18px;
		color: #3897f0;
	}

	.profile-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.edit-profile-btn {
		background: #efefef;
		border: 1px solid #dbdbdb;
		border-radius: 4px;
		padding: 7px 16px;
		font-size: 14px;
		font-weight: 600;
		color: #262626;
		cursor: pointer;
		transition: background 0.2s;
	}

	.edit-profile-btn:hover {
		background: #e4e4e4;
	}

	.icon-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		color: #262626;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.icon-btn:hover {
		background: #f5f5f5;
	}

	.logout-btn {
		color: #ed4956;
	}

	.logout-btn:hover {
		background: #fef7f7;
	}

	.mobile-stats {
		padding: 0 20px 16px;
		border-top: 1px solid #efefef;
		margin-top: 16px;
	}

	@media (max-width: 735px) {
		.profile-container {
			padding: 16px;
			gap: 16px;
		}

		.avatar-image,
		.avatar-placeholder {
			width: 77px;
			height: 77px;
		}

		.avatar-initials {
			font-size: 24px;
		}

		.username {
			font-size: 28px;
		}

		.profile-header-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.profile-actions {
			width: 100%;
		}

		.edit-profile-btn {
			flex: 1;
		}
	}
</style>
