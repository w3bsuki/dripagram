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
	import { setLocaleContext } from '$lib/stores/locale.svelte';
	import { setLocale } from '$lib/paraglide/runtime';
	import ConsentBanner from '$lib/components/system/ConsentBanner.svelte';
	import type { LayoutData } from './$types';
	import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

	let { data, children }: { data: LayoutData; children?: any } = $props();
	
	// Get Supabase from page data or create from environment
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	let showUserMenu = $state(false);

	// Set Supabase client in context for child components
	setContext('supabase', supabase);

	// Initialize auth context with SSR data
	const auth = setAuthContext(data.user, data.session);
	
	// Initialize locale context - using default 'bg' for Bulgarian-first approach
	const localeManager = setLocaleContext('bg', 'sofia');
	// Set Paraglide locale to Bulgarian
	setLocale('bg');

	// Setup Supabase auth listener
	onMount(() => {
		// Initialize CSS optimizations
		initializeCSSOptimizations();
		
		// Initialize locale manager from cookies
		localeManager.initialize();
		
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				// Update auth context immediately
				auth.setAuth(session, session?.user ?? null);
				// Invalidate all data to trigger re-fetch
				invalidate('supabase:auth');
			}
		});

		// Also check current session on mount to sync state
		supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
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
	.special-layout {
		padding-top: 0;
		padding-bottom: 0;
	}
</style>

<div class="min-h-screen bg-gray-50">
		<!-- Hide headers on auth pages -->
		{#if !$page.url.pathname.includes('/auth')}
			<!-- Mobile Header -->
			<div class="md:hidden">
				<AppHeader notificationCount={0} />
			</div>

			<!-- Desktop Header -->
			<div class="hidden md:block">
				<AppHeader notificationCount={0} showCreateButton={true} />
			</div>
		{/if}

		<!-- Main Content -->
		<main class="{$page.url.pathname.includes('/sell') || $page.url.pathname.includes('/onboarding') || $page.url.pathname.includes('/auth') || $page.url.pathname.includes('/messages') || $page.url.pathname.includes('/products') ? 'special-layout' : ''}">
			{@render children?.()}
		</main>

		<!-- Bottom Navigation (Mobile Only) - Hide on certain pages -->
		{#if !$page.url.pathname.includes('/auth')}
			<BottomNav />
		{/if}
		
		<!-- Toast Notifications -->
		<Toaster position="top-center" richColors closeButton />
		
	<!-- Consent Banner -->
	<ConsentBanner />
</div>
