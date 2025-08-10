<script lang="ts">
	import { Home, Search, PlusCircle, MessageCircle, User } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { cn } from '$lib/utils';
	
	interface NavItem {
		icon: typeof Home;
		label: string;
		href: string;
		accent?: boolean;
		primary?: boolean;
		badge?: number;
		requiresAuth?: boolean;
	}
	
	// Props
	interface Props {
		class?: string;
	}
	
	let { class: className }: Props = $props();
	
	// Get auth context - will be null if not authenticated or context not available
	let auth: ReturnType<typeof getAuthContext> | null = null;
	try {
		auth = getAuthContext();
	} catch {
		// Context not available (not wrapped in layout)
		auth = null;
	}
	
	// Reactive state
	let currentPath = $derived($page.url.pathname);
	
	// Navigation items configuration - Sell button is now central and prominent
	let navItems = $derived([
		{ icon: Home, label: 'Home', href: '/' },
		{ icon: Search, label: 'Discover', href: '/browse' },
		{ icon: PlusCircle, label: 'Sell', href: auth?.isAuthenticated ? '/sell' : '/auth/login?redirectTo=/sell', accent: true, primary: true },
		{ icon: MessageCircle, label: 'Inbox', href: '/messages' },
		{ icon: User, label: 'Profile', href: auth?.isAuthenticated ? '/profile' : '/auth/login?redirectTo=/profile' },
	]);
	
	// Check if a path is active
	function isActive(itemHref: string): boolean {
		if (itemHref === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(itemHref);
	}
</script>

{#snippet navIcon(item: NavItem)}
	{@const IconComponent = item.icon}
	<div class="relative">
		<IconComponent 
			size={24} 
			strokeWidth={isActive(item.href) ? 2 : 1.5}
			class={cn(
				"transition-all duration-200",
				isActive(item.href) && "scale-110"
			)}
		/>
		{#if item.badge}
			<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
				{item.badge}
			</span>
		{/if}
	</div>
{/snippet}

<nav 
	class={cn(
		"fixed bottom-0 left-0 right-0 z-40",
		"bg-white border-t border-gray-200",
		"pb-safe-bottom",
		"md:hidden", // Hide on desktop
		className
	)}
	aria-label="Bottom navigation"
>
	<div class="flex h-14 items-stretch">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			{#if item.primary}
				<!-- Primary Sell Button (Instagram style) -->
				<a
					href={item.href}
					class={cn(
						"relative flex flex-1 items-center justify-center px-2",
						"transition-all duration-200",
						"touch-manipulation"
					)}
					aria-label={item.label}
				>
					<div class={cn(
						"flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200",
						"bg-gradient-to-r from-blue-600 to-blue-500 text-white",
						"shadow-lg shadow-blue-500/25",
						"hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30",
						"active:scale-95"
					)}>
						<PlusCircle size={26} strokeWidth={2.5} />
					</div>
				</a>
			{:else}
				<!-- Regular Nav Items -->
				<a
					href={item.href}
					class={cn(
						"relative flex flex-1 flex-col items-center justify-center gap-0.5 px-2",
						"text-gray-500 transition-all duration-200",
						"active:scale-95 active:bg-gray-50",
						"touch-manipulation",
						active && "text-gray-900",
						item.accent && !active && "text-blue-500"
					)}
					aria-label={item.label}
					aria-current={active ? 'page' : undefined}
				>
					{@render navIcon(item)}
					
					<span class={cn(
						"text-[10px] font-medium leading-tight",
						active && "font-semibold"
					)}>
						{item.label}
					</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>