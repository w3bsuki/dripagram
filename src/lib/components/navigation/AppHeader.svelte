<script lang="ts">
	import { Bell, User, MessageCircle, Search } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import AnimatedLogo from '$lib/components/branding/AnimatedLogo.svelte';
	import { LocaleSwitcher } from '$lib/components/ui/locale-switcher';
	import ThemeToggle from '$lib/components/ui/ThemeToggle/ThemeToggle.svelte';
	import * as m from '$lib/paraglide/messages';
	
	interface Props {
		notificationCount?: number;
		class?: string;
	}
	
	let { 
		notificationCount = 0,
		class: className = ''
	}: Props = $props();
	
	let isScrolled = $state(false);
	let showMobileSearch = $state(false);
	let searchQuery = $state('');
	let searchInputRef = $state<HTMLInputElement | null>(null);
	
	// Check if current page should show sticky search
	const shouldShowStickySearch = $derived(() => {
		const pathname = $page.url.pathname;
		// Don't show on browse pages since they have their own search
		if (pathname.includes('/browse')) return false;
		return pathname === '/' || pathname === '/bg' || pathname === '/bg/';
	});

	// Handle scroll for subtle shadow and search bar appearance
	onMount(() => {
		if (browser) {
			const handleScroll = () => {
				const scrollY = window.scrollY;
				isScrolled = scrollY > 10;
				// Show mobile search after scrolling past 100px - only on allowed pages
				showMobileSearch = scrollY > 100 && shouldShowStickySearch();
			};
			
			window.addEventListener('scroll', handleScroll, { passive: true });
			
			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});
	
	function handleNotifications() {
		goto('/notifications');
	}
	
	function handleMessages() {
		goto('/messages');
	}
	
	function handleAccount() {
		goto('/account');
	}
	
	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
			searchQuery = '';
		}
	}
	
	function toggleSearch() {
		showMobileSearch = !showMobileSearch;
		if (showMobileSearch && searchInputRef) {
			setTimeout(() => searchInputRef?.focus(), 100);
		}
	}
</script>

<header class="app-header {isScrolled ? 'scrolled' : ''} {className}">
	<div class="header-content">
		<!-- Logo -->
		<a href="/" class="logo" aria-label="Driplo Home">
			<AnimatedLogo size="medium" showText={true} />
		</a>
		
		<!-- Actions -->
		<div class="header-actions">
			<!-- Locale Switcher - appears first on desktop -->
			<div class="locale-switcher-container">
				<LocaleSwitcher compact={true} />
			</div>
			
			<!-- Theme Toggle -->
			<div class="theme-toggle-container">
				<ThemeToggle size={24} />
			</div>
			
			<button 
				class="action-btn"
				onclick={handleMessages}
				aria-label={m['nav.messages']()}
			>
				<MessageCircle size={24} strokeWidth={1.5} />
			</button>
			
			<button 
				class="action-btn notification-btn"
				onclick={handleNotifications}
				aria-label="Notifications"
			>
				<Bell size={24} strokeWidth={1.5} />
				{#if notificationCount > 0}
					<span class="notification-badge">
						{notificationCount > 9 ? '9+' : notificationCount}
					</span>
				{/if}
			</button>
			
			<button 
				class="action-btn account-btn"
				onclick={handleAccount}
				aria-label="Account"
			>
				<User size={24} strokeWidth={1.5} />
			</button>
		</div>
	</div>
	
	<!-- Mobile Compact Search Bar (only show on main/browse pages) -->
	{#if shouldShowStickySearch()}
		<div class="search-spacer {showMobileSearch ? 'active' : ''} md:hidden">
			<div class="mobile-search-bar">
				<form class="search-form" onsubmit={handleSearch}>
					<div class="search-input-wrapper">
						<Search size={18} class="search-icon" />
						<input
							bind:this={searchInputRef}
							type="search"
							bind:value={searchQuery}
							placeholder={m['homepage.search_placeholder']()}
							class="search-input"
							autocomplete="off"
						/>
					</div>
				</form>
			</div>
		</div>
	{/if}
</header>

<style>
	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: var(--color-white);
		border-bottom: 1px solid var(--color-gray-300);
		z-index: var(--z-higher);
	}
	
	.app-header.scrolled {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.98);
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem;
		height: 56px;
		max-width: 100%;
		margin: 0 auto;
	}
	
	@media (min-width: 768px) {
		.header-content {
			padding: 0 2rem;
			height: 60px;
			max-width: 1200px;
		}
	}
	
	/* Logo */
	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
	}
	
	.logo:hover {
		opacity: 0.7;
	}
	
	.logo-text {
		font-size: 1.625rem;
		font-weight: 800;
		color: var(--color-gray-900);
		letter-spacing: -0.5px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}
	
	@media (max-width: 640px) {
		.logo-text {
			font-size: 1.5rem;
		}
	}
	
	/* Actions */
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	@media (min-width: 768px) {
		.header-actions {
			gap: 0.5rem;
		}
	}
	
	.action-btn {
		position: relative;
		background: none;
		border: none;
		color: var(--color-gray-900);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		width: 40px;
		height: 40px;
	}
	
	@media (min-width: 768px) {
		.action-btn {
			width: 44px;
			height: 44px;
		}
	}
	
	.action-btn:hover {
		background: var(--color-gray-50);
	}
	
	.action-btn:active {
		background: var(--color-gray-100);
	}
	
	/* Notification Badge */
	.notification-btn {
		position: relative;
	}
	
	.notification-badge {
		position: absolute;
		top: 6px;
		right: 6px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		background: var(--color-danger);
		color: white;
		border-radius: 999px;
		font-size: 0.625rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-white);
	}
	
	/* Mobile adjustments - no longer needed since we removed the create button */
	
	/* Mobile Search Bar - clean implementation */
	.search-spacer {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		z-index: calc(var(--z-higher) - 1);
	}
	
	.mobile-search-bar {
		background: var(--color-white);
		border-bottom: 1px solid var(--color-gray-200);
		padding: 0.5rem 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		height: var(--search-bar-height);
		display: flex;
		align-items: center;
	}
	
	
	.search-form {
		width: 100%;
	}
	
	.search-input-wrapper {
		display: flex;
		align-items: center;
		background: var(--color-gray-50);
		border: 1px solid var(--color-gray-200);
		border-radius: 999px;
		padding: 0 0.75rem;
		height: 36px;
	}
	
	.search-input-wrapper:focus-within {
		border-color: var(--color-primary);
		background: var(--color-white);
		box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.1);
	}
	
	.search-icon {
		color: var(--color-gray-500);
		flex-shrink: 0;
		margin-right: 0.5rem;
	}
	
	.search-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		font-size: 0.875rem;
		color: var(--color-gray-900);
		outline: none;
		min-width: 0;
	}
	
	.search-input::placeholder {
		color: var(--color-gray-500);
	}
	
	.search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		appearance: none;
	}
	
	/* Locale Switcher Container */
	.locale-switcher-container {
		margin-right: 0.5rem;
	}
	
	/* Theme Toggle Container */
	.theme-toggle-container {
		margin-right: 0.5rem;
	}
	
	/* Hide locale switcher on very small mobile screens */
	@media (max-width: 480px) {
		.locale-switcher-container {
			display: none;
		}
	}
	
	/* Hide theme toggle on very small mobile screens to save space */
	@media (max-width: 360px) {
		.theme-toggle-container {
			display: none;
		}
	}
</style>