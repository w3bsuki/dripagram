<script lang="ts">
	import { User, Settings, CreditCard, Package, BarChart3, Bell, Shield, LogOut } from '@lucide/svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';
	
	const auth = getAuthContext();
	
	let salesData = $state({
		totalSales: 12,
		totalEarnings: 1250.50,
		activeListings: 8,
		soldThisMonth: 4
	});
	
	function handleLogout() {
		auth?.signOut();
		goto('/');
	}
	
	const accountSections = [
		{
			title: 'Selling',
			items: [
				{ icon: Package, label: 'My Listings', href: '/profile/listings', description: 'Manage your active and sold items' },
				{ icon: BarChart3, label: 'Sales Analytics', href: '/account/analytics', description: 'View your sales performance' },
				{ icon: CreditCard, label: 'Payouts', href: '/account/payouts', description: 'Manage your payment methods' },
			]
		},
		{
			title: 'Account',
			items: [
				{ icon: User, label: 'Personal Info', href: '/profile/edit', description: 'Update your profile and details' },
				{ icon: Settings, label: 'Settings', href: '/profile/settings', description: 'App preferences and privacy' },
				{ icon: Bell, label: 'Notifications', href: '/account/notifications', description: 'Manage your notification preferences' },
				{ icon: Shield, label: 'Security', href: '/account/security', description: 'Password and account security' },
			]
		}
	];
</script>

<svelte:head>
	<title>Account - Driplo</title>
</svelte:head>

<div class="account-page">
	<!-- Account Header -->
	<div class="account-header">
		<div class="user-info">
			<div class="avatar">
				<User size={24} />
			</div>
			<div class="user-details">
				<h1>{auth?.user?.email || 'Your Account'}</h1>
				<p class="user-type">Personal Account</p>
			</div>
		</div>
	</div>

	<!-- Quick Stats -->
	<div class="quick-stats">
		<div class="stat-card">
			<div class="stat-value">{salesData.totalSales}</div>
			<div class="stat-label">Total Sales</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">€{salesData.totalEarnings}</div>
			<div class="stat-label">Earnings</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{salesData.activeListings}</div>
			<div class="stat-label">Active Listings</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{salesData.soldThisMonth}</div>
			<div class="stat-label">Sold This Month</div>
		</div>
	</div>

	<!-- Account Sections -->
	<div class="account-content">
		{#each accountSections as section}
			<div class="section">
				<h2 class="section-title">{section.title}</h2>
				<div class="section-items">
					{#each section.items as item}
						<a href={item.href} class="account-item">
							<div class="item-icon">
								<svelte:component this={item.icon} size={20} />
							</div>
							<div class="item-content">
								<h3 class="item-title">{item.label}</h3>
								<p class="item-description">{item.description}</p>
							</div>
							<div class="item-arrow">→</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}

		<!-- Logout Section -->
		<div class="section">
			<div class="section-items">
				<button class="account-item logout-item" onclick={handleLogout}>
					<div class="item-icon">
						<LogOut size={20} />
					</div>
					<div class="item-content">
						<h3 class="item-title">Sign Out</h3>
						<p class="item-description">Sign out of your account</p>
					</div>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.account-page {
		min-height: 100vh;
		background: var(--color-gray-50);
		padding-top: var(--header-height);
		padding-bottom: calc(var(--bottom-nav-height) + 1rem);
	}

	.account-header {
		background: var(--color-white);
		padding: 1.5rem 1rem;
		border-bottom: 1px solid var(--color-gray-200);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.avatar {
		width: 60px;
		height: 60px;
		background: var(--color-gray-100);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-gray-600);
	}

	.user-details h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-gray-900);
		margin: 0;
	}

	.user-type {
		color: var(--color-gray-600);
		font-size: 0.875rem;
		margin: 0.25rem 0 0;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		.quick-stats {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.stat-card {
		background: var(--color-white);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-gray-200);
		text-align: center;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-gray-900);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gray-600);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.account-content {
		padding: 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.section {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-gray-900);
		margin: 0 0 1rem;
		padding: 0 0.5rem;
	}

	.section-items {
		background: var(--color-white);
		border-radius: 8px;
		border: 1px solid var(--color-gray-200);
		overflow: hidden;
	}

	.account-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		text-decoration: none;
		color: inherit;
		border: none;
		background: none;
		width: 100%;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.account-item:hover {
		background: var(--color-gray-50);
	}

	.account-item:not(:last-child) {
		border-bottom: 1px solid var(--color-gray-100);
	}

	.item-icon {
		width: 40px;
		height: 40px;
		background: var(--color-gray-100);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-gray-600);
		flex-shrink: 0;
	}

	.item-content {
		flex: 1;
		text-align: left;
	}

	.item-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-gray-900);
		margin: 0;
	}

	.item-description {
		font-size: 0.875rem;
		color: var(--color-gray-600);
		margin: 0.25rem 0 0;
	}

	.item-arrow {
		color: var(--color-gray-400);
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.logout-item .item-icon {
		background: var(--color-red-50);
		color: var(--color-red-600);
	}

	.logout-item .item-title {
		color: var(--color-red-600);
	}

	.logout-item:hover {
		background: var(--color-red-50);
	}
</style>