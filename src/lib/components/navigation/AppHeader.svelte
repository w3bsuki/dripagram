<script lang="ts">
	import { Bell, User, Plus, MessageCircle } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import AnimatedLogo from '$lib/components/branding/AnimatedLogo.svelte';
	
	interface Props {
		showCreateButton?: boolean;
		notificationCount?: number;
		class?: string;
	}
	
	let { 
		showCreateButton = true,
		notificationCount = 0,
		class: className = ''
	}: Props = $props();
	
	let isScrolled = $state(false);
	
	// Handle scroll for subtle shadow on scroll
	onMount(() => {
		if (browser) {
			const handleScroll = () => {
				isScrolled = window.scrollY > 10;
			};
			
			window.addEventListener('scroll', handleScroll, { passive: true });
			
			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});
	
	function handleCreatePost() {
		goto('/sell');
	}
	
	function handleNotifications() {
		goto('/notifications');
	}
	
	function handleMessages() {
		goto('/messages');
	}
	
	function handleProfile() {
		goto('/profile');
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
			{#if showCreateButton}
				<button 
					class="action-btn"
					onclick={handleCreatePost}
					aria-label="Create listing"
				>
					<Plus size={24} strokeWidth={1.5} />
				</button>
			{/if}
			
			<button 
				class="action-btn"
				onclick={handleMessages}
				aria-label="Messages"
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
				class="action-btn profile-btn"
				onclick={handleProfile}
				aria-label="Profile"
			>
				<User size={24} strokeWidth={1.5} />
			</button>
		</div>
	</div>
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
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		transition: opacity 0.2s ease;
	}
	
	.logo:hover {
		opacity: 0.7;
	}
	
	.logo:active {
		transform: scale(0.98);
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
		transition: all 0.15s ease;
	}
	
	@media (min-width: 768px) {
		.action-btn {
			width: 44px;
			height: 44px;
		}
	}
	
	.action-btn:hover {
		background: var(--color-gray-50);
		transform: scale(1.05);
	}
	
	.action-btn:active {
		transform: scale(0.95);
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
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.action-btn:nth-child(1) {
			display: none; /* Hide create button on mobile - it's in bottom nav */
		}
	}
</style>