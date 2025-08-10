<script lang="ts">
	import '../app.css';
	import '$lib/utils/date';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { onMount, setContext } from 'svelte';
	import { initializeCSSOptimizations } from '$lib/utils/css-optimization';
	// Icons removed - now handled by AppHeader and BottomNav
	import AppHeader from '$lib/components/navigation/AppHeader.svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { setAuthContext } from '$lib/stores/auth.svelte';
	import ConsentBanner from '$lib/components/system/ConsentBanner.svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children?: any } = $props();
	let showUserMenu = $state(false);

	// Set Supabase client in context for child components
	setContext('supabase', data.supabase);

	// Initialize auth context with SSR data
	const auth = setAuthContext(data.user, data.session);

	// Setup Supabase auth listener
	onMount(() => {
		// Initialize CSS optimizations
		initializeCSSOptimizations();
		
		const { data: { subscription } } = data.supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				// Update auth context immediately
				auth.setAuth(session, session?.user ?? null);
				// Invalidate all data to trigger re-fetch
				invalidate('supabase:auth');
			}
		});

		// Also check current session on mount to sync state
		data.supabase.auth.getSession().then(({ data: { session } }) => {
			if (session && !auth.isAuthenticated) {
				auth.setAuth(session, session.user);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	// Navigation items moved to AppHeader and BottomNav components
</script>

<style>
	.main-content {
		transition: padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.main-content.default-layout {
		padding-top: var(--header-height);
		padding-bottom: var(--bottom-nav-height);
	}
	
	.main-content.special-layout {
		padding-top: var(--header-height);
		padding-bottom: 0;
	}
	
	
	@media (min-width: 768px) {
		.main-content.default-layout {
			padding-top: var(--header-height-md);
			padding-bottom: 0;
		}
		
		.main-content.special-layout {
			padding-top: var(--header-height-md);
		}
		
	}
</style>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile Header -->
	<div class="md:hidden">
		<AppHeader notificationCount={0} />
	</div>

	<!-- Desktop Header -->
	<div class="hidden md:block">
		<AppHeader notificationCount={0} showCreateButton={true} />
	</div>

	<!-- Main Content -->
	<main class="main-content {$page.url.pathname.includes('/sell') || $page.url.pathname.includes('/onboarding') || $page.url.pathname.includes('/auth') || $page.url.pathname.includes('/messages') || $page.url.pathname.includes('/products') ? 'special-layout' : 'default-layout'}">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation (Mobile Only) - Hide on certain pages -->
	{#if !$page.url.pathname.includes('/sell') && !$page.url.pathname.includes('/onboarding') && !$page.url.pathname.includes('/auth') && !$page.url.pathname.includes('/messages') && !$page.url.pathname.includes('/products')}
		<BottomNav />
	{/if}
	
	<!-- Toast Notifications -->
	<Toaster position="top-center" richColors closeButton />
	
	<!-- Consent Banner -->
	<ConsentBanner />
</div>
