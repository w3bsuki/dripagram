<script lang="ts">
	import { 
		Settings, User, Bell, Shield, LogOut, ChevronRight, ArrowLeft,
		CreditCard, MapPin, HelpCircle, Info, Globe, Moon, 
		Smartphone, Archive, Trash2, Eye
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const auth = getAuthContext();
	
	let profile = $derived({
		username: data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'user',
		full_name: data.user?.user_metadata?.full_name || '',
		avatar_url: data.user?.user_metadata?.avatar_url || '',
		email: data.user?.email || ''
	});
	
	async function handleSignOut() {
		const { error } = await data.supabase.auth.signOut();
		if (!error) {
			await goto('/');
		}
	}
	
	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}
	
	const settingsSections = [
		{
			title: 'Account',
			items: [
				{ icon: User, label: 'Edit Profile', href: '/profile/edit', description: 'Name, username, bio' },
				{ icon: Shield, label: 'Privacy and Security', href: '/profile/settings/privacy', description: 'Account privacy, password' },
				{ icon: Bell, label: 'Notifications', href: '/profile/settings/notifications', description: 'Push, email, SMS' },
				{ icon: Eye, label: 'Account Status', href: '/profile/settings/account-status', description: 'Download your data' },
			]
		},
		{
			title: 'How you use Driplo',
			items: [
				{ icon: CreditCard, label: 'Payments and Payouts', href: '/profile/settings/payments', description: 'Payment methods, payouts' },
				{ icon: MapPin, label: 'Addresses', href: '/profile/settings/addresses', description: 'Shipping and billing' },
				{ icon: Archive, label: 'Close Friends', href: '/profile/settings/close-friends', description: 'Manage your list' },
			]
		},
		{
			title: 'More info and support',
			items: [
				{ icon: HelpCircle, label: 'Help', href: '/help', description: 'Support requests, help center' },
				{ icon: Info, label: 'About', href: '/about', description: 'Policies and terms' },
			]
		}
	];
</script>

<div class="settings-page">
	<!-- Header -->
	<header class="settings-header">
		<div class="header-content">
			<button 
				onclick={() => goto('/profile')}
				class="back-btn"
				aria-label="Back to profile"
			>
				<ArrowLeft size={24} />
			</button>
			<h1 class="header-title">Settings</h1>
		</div>
	</header>

	<!-- Profile Summary -->
	<div class="profile-summary">
		<div class="profile-avatar">
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
		</div>
		<div class="profile-info">
			<h2 class="profile-name">{profile.full_name || profile.username}</h2>
			<p class="profile-username">@{profile.username}</p>
		</div>
	</div>

	<!-- Settings Sections -->
	<div class="settings-content">
		{#each settingsSections as section}
			<div class="settings-section">
				<h3 class="section-title">{section.title}</h3>
				<div class="section-items">
					{#each section.items as item, index}
						{@const IconComponent = item.icon}
						<button
							onclick={() => goto(item.href)}
							class="setting-item"
						>
							<div class="item-icon">
								<IconComponent size={20} />
							</div>
							<div class="item-content">
								<span class="item-label">{item.label}</span>
								<span class="item-description">{item.description}</span>
							</div>
							<div class="item-chevron">
								<ChevronRight size={16} />
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/each}
		
		<!-- Sign Out -->
		<div class="settings-section">
			<div class="section-items">
				<button
					onclick={handleSignOut}
					class="setting-item logout-item"
				>
					<div class="item-icon logout-icon">
						<LogOut size={20} />
					</div>
					<div class="item-content">
						<span class="item-label logout-label">Log Out</span>
					</div>
				</button>
			</div>
		</div>
		
		<!-- Account Info -->
		<div class="account-info">
			<p class="info-text">Signed in as {profile.email}</p>
			<p class="info-text">Member since {data.user ? new Date(data.user.created_at).toLocaleDateString() : 'N/A'}</p>
		</div>
	</div>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		background: var(--color-background);
		padding-bottom: 60px; /* Space for bottom nav */
	}
	
	/* Header */
	.settings-header {
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
		gap: 16px;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.back-btn {
		background: none;
		border: none;
		color: var(--color-foreground);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.header-title {
		font-size: 20px;
		font-weight: 600;
		margin: 0;
	}
	
	/* Profile Summary */
	.profile-summary {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px 16px;
		border-bottom: 1px solid var(--color-border);
		max-width: 600px;
		margin: 0 auto;
	}
	
	.profile-avatar {
		flex-shrink: 0;
	}
	
	.avatar {
		width: 64px;
		height: 64px;
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
		font-size: 20px;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.profile-info {
		flex: 1;
	}
	
	.profile-name {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 2px 0;
		color: var(--color-foreground);
	}
	
	.profile-username {
		font-size: 14px;
		color: var(--color-muted-foreground);
		margin: 0;
	}
	
	/* Settings Content */
	.settings-content {
		max-width: 600px;
		margin: 0 auto;
	}
	
	.settings-section {
		margin-bottom: 32px;
	}
	
	.section-title {
		font-size: 16px;
		font-weight: 600;
		padding: 0 16px 8px;
		margin: 0;
		color: var(--color-foreground);
	}
	
	.section-items {
		background: var(--color-background);
	}
	
	.setting-item {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		padding: 16px;
		background: none;
		border: none;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		text-align: left;
		transition: background-color 200ms;
	}
	
	.setting-item:hover {
		background: var(--color-secondary);
	}
	
	.setting-item:last-child {
		border-bottom: none;
	}
	
	.item-icon {
		flex-shrink: 0;
		color: var(--color-muted-foreground);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.item-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	
	.item-label {
		font-size: 16px;
		font-weight: 500;
		color: var(--color-foreground);
	}
	
	.item-description {
		font-size: 14px;
		color: var(--color-muted-foreground);
	}
	
	.item-chevron {
		flex-shrink: 0;
		color: var(--color-muted-foreground);
	}
	
	/* Logout Item */
	.logout-item {
		border-top: 1px solid var(--color-border);
		margin-top: 16px;
	}
	
	.logout-icon {
		color: #ef4444;
	}
	
	.logout-label {
		color: #ef4444;
	}
	
	/* Account Info */
	.account-info {
		text-align: center;
		padding: 20px 16px;
		border-top: 1px solid var(--color-border);
		margin-top: 20px;
	}
	
	.info-text {
		font-size: 12px;
		color: var(--color-muted-foreground);
		margin: 4px 0;
	}
	
	/* Mobile optimization */
	@media (min-width: 640px) {
		.profile-summary {
			gap: 20px;
			padding: 24px 16px;
		}
		
		.avatar {
			width: 80px;
			height: 80px;
		}
		
		.initials {
			font-size: 24px;
		}
	}
</style>