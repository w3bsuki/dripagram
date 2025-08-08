<script lang="ts">
	import '../app.css';
	import '$lib/utils/date';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Search, Home, Compass, PlusSquare, MessageCircle, User } from '@lucide/svelte';
	import SearchHeader from '$lib/components/navigation/SearchHeader.svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { setAuthContext } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';

	let { data, children }: { data: PageData; children?: any } = $props();
	let showUserMenu = $state(false);

	// Initialize auth context with SSR data
	const auth = setAuthContext(data.user, data.session);

	// Setup Supabase auth listener
	onMount(() => {
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

		return () => subscription.unsubscribe();
	});

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/browse', icon: Compass, label: 'Discover' },
		{ href: '/sell', icon: PlusSquare, label: 'Create listing' },
		{ href: '/messages', icon: MessageCircle, label: 'Messages' },
	];
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile Header -->
	<div class="md:hidden">
		<SearchHeader />
	</div>

	<!-- Desktop Header -->
	<header class="fixed top-0 right-0 left-0 z-50 hidden border-b border-gray-200 bg-white md:block">
		<div class="mx-auto flex h-15 max-w-5xl items-center justify-between px-5">
			<!-- Logo -->
			<div class="flex-1">
				<a
					href="/"
					class="text-3xl font-extrabold tracking-tight text-gray-900 transition-opacity hover:opacity-70"
				>
					driplo
				</a>
			</div>

			<!-- Search -->
			<div class="mx-8 w-64 flex-none">
				<div class="relative">
					<input
						type="search"
						placeholder="Search"
						class="w-full rounded-lg border-none bg-gray-100 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
					/>
					<Search size={16} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
				</div>
			</div>

			<!-- Nav Icons -->
			<nav class="flex flex-1 items-center justify-end gap-5">
				{#each navItems as item}
					<a
						href={item.href}
						class="relative text-gray-900 transition-transform hover:scale-110 active:scale-95"
						aria-label={item.label}
					>
						<item.icon size={24} strokeWidth={1.5} />
					</a>
				{/each}

				{#if data.session}
					<a
						href="/profile"
						class="relative transition-transform hover:scale-110 active:scale-95"
						aria-label="Profile"
					>
						{#if data.user?.user_metadata?.avatar_url}
							<img
								src={data.user.user_metadata.avatar_url}
								alt="Profile"
								class="h-6 w-6 rounded-full object-cover"
							/>
						{:else}
							<User size={24} strokeWidth={1.5} class="text-gray-900" />
						{/if}
					</a>
				{:else}
					<a
						href="/auth/login"
						class="text-sm font-medium text-gray-900 hover:text-gray-700"
					>
						Sign in
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="{$page.url.pathname.includes('/sell') || $page.url.pathname.includes('/onboarding') || $page.url.pathname.includes('/auth') ? 'pt-14 pb-0 md:pt-15' : 'pt-14 pb-20 md:pt-15 md:pb-0'}">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation (Mobile Only) - Hide on certain pages -->
	{#if !$page.url.pathname.includes('/sell') && !$page.url.pathname.includes('/onboarding') && !$page.url.pathname.includes('/auth')}
		<BottomNav />
	{/if}
	
	<!-- Toast Notifications -->
	<Toaster position="top-center" richColors closeButton />
</div>
