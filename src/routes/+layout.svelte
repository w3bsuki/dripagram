<script lang="ts">
	import '../app.css';
	import '$lib/utils/date'; // Import date utilities
	import { page } from '$app/stores';
	import { Search, ShoppingBag, User, Bell, Menu } from '@lucide/svelte';
	import SearchHeader from '$lib/components/navigation/SearchHeader.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children?: any } = $props();
	let showUserMenu = $state(false);
	let cartCount = $state(3); // TODO: Get from cart store
</script>

<div class="app-layout">
	<!-- Mobile Header -->
	<div class="md:hidden">
		<SearchHeader />
	</div>

	<!-- Desktop Header -->
	<header class="desktop-header">
		<div class="header-container">
			<!-- Left Section -->
			<div class="header-left">
				<!-- Logo -->
				<a href="/" class="logo">
					driplo
				</a>
			</div>

			<!-- Center Section - Search -->
			<div class="header-center">
				<div class="search-wrapper">
					<input 
						type="search" 
						placeholder="Search"
						class="search-input"
					/>
					<Search size={16} class="search-icon" />
				</div>
			</div>

			<!-- Right Section - Actions -->
			<div class="header-right">
				<nav class="nav-actions">
					<a href="/" class="nav-icon" aria-label="Home">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
							<polyline points="9 22 9 12 15 12 15 22"/>
						</svg>
					</a>
					
					<a href="/discover" class="nav-icon" aria-label="Discover">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"/>
							<path d="m21 21-4.35-4.35"/>
						</svg>
					</a>
					
					<a href="/sell" class="nav-icon" aria-label="Create listing">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
							<line x1="12" y1="8" x2="12" y2="16"/>
							<line x1="8" y1="12" x2="16" y2="12"/>
						</svg>
					</a>
					
					<a href="/cart" class="nav-icon" aria-label="Shopping bag">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
							<line x1="3" y1="6" x2="21" y2="6"/>
							<path d="M16 10a4 4 0 0 1-8 0"/>
						</svg>
						{#if cartCount > 0}
							<span class="nav-badge">{cartCount}</span>
						{/if}
					</a>
					
					<button class="nav-icon profile-btn" aria-label="Profile" onclick={() => showUserMenu = !showUserMenu}>
						{#if data.user?.avatar_url}
							<img src={data.user.avatar_url} alt="Profile" class="profile-img" />
						{:else}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
						{/if}
					</button>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		{@render children?.()}
	</main>

	<!-- Toast Notifications -->
	<Toast />
</div>

<style>
	.app-layout {
		min-height: 100vh;
		background: var(--color-gray-50);
	}

	/* Desktop Header - Instagram Style */
	.desktop-header {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: white;
		border-bottom: 1px solid rgb(219, 219, 219);
	}

	@media (min-width: 768px) {
		.desktop-header {
			display: block;
		}
	}

	.header-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 975px;
		margin: 0 auto;
		padding: 0 20px;
		height: 60px;
	}

	/* Left Section */
	.header-left {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.logo {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 1.75rem;
		font-weight: 800;
		color: #262626;
		text-decoration: none;
		letter-spacing: -1px;
		transition: opacity 0.2s;
	}

	.logo:hover {
		opacity: 0.7;
	}

	/* Center Section - Search */
	.header-center {
		flex: 0 1 268px;
		min-width: 125px;
	}

	.search-wrapper {
		position: relative;
		width: 100%;
	}

	.search-input {
		width: 100%;
		background: #efefef;
		border: none;
		border-radius: 8px;
		padding: 3px 16px;
		height: 36px;
		font-size: 14px;
		color: #262626;
		outline: none;
		transition: background 0.2s;
	}

	.search-input::placeholder {
		color: #8e8e8e;
		font-weight: 300;
	}

	.search-input:focus {
		padding-left: 16px;
	}

	.search-wrapper :global(.search-icon) {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: #8e8e8e;
		pointer-events: none;
		transition: opacity 0.2s;
	}

	.search-input:focus ~ :global(.search-icon) {
		opacity: 0;
	}

	/* Right Section - Navigation */
	.header-right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 22px;
	}

	.nav-icon {
		position: relative;
		color: #262626;
		text-decoration: none;
		cursor: pointer;
		transition: transform 0.2s;
		background: none;
		border: none;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-icon:hover {
		transform: scale(1.08);
	}

	.nav-icon:active {
		transform: scale(0.92);
		opacity: 0.7;
	}

	.nav-icon svg {
		display: block;
	}

	.nav-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		background: #ff3040;
		color: white;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 5px;
		border-radius: 999px;
		min-width: 18px;
		text-align: center;
		line-height: 1;
	}

	.profile-btn {
		width: 24px;
		height: 24px;
		overflow: hidden;
		border-radius: 50%;
	}

	.profile-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Main Content */
	.main-content {
		padding-top: 56px; /* Mobile header height */
		padding-bottom: 80px; /* Mobile bottom nav space */
	}

	@media (min-width: 768px) {
		.main-content {
			padding-top: 60px; /* Desktop header height */
			padding-bottom: 0;
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 767px) {
		.desktop-header {
			display: none;
		}
	}
</style>