<script lang="ts">
	import { Home, Search, Plus, Heart, User } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { getLocaleContext } from '$lib/stores/locale.svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
	
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
	
	// Get locale context for building localized URLs
	let locale: ReturnType<typeof getLocaleContext> | null = null;
	try {
		locale = getLocaleContext();
	} catch {
		// Context not available - fallback to current URL locale detection
		locale = null;
	}
	
	// Reactive state
	let currentPath = $derived($page.url.pathname);
	
	// Helper function to build localized URLs
	function buildLocalizedUrl(path: string): string {
		// Extract current locale from URL path or use context
		const currentLocale = locale?.locale || getCurrentLocaleFromPath();
		
		// If path is already localized, return as-is
		if (path.match(/^\/(bg|en)/)) {
			return path;
		}
		
		// Build localized path
		return `/${currentLocale}${path}`;
	}
	
	// Helper function to get current locale from URL if context is not available
	function getCurrentLocaleFromPath(): string {
		const pathMatch = currentPath.match(/^\/(bg|en)/);
		return pathMatch ? pathMatch[1] : 'bg'; // Default to Bulgarian
	}
	
	// Navigation items configuration - Sell button is now central and prominent
	let navItems = $derived([
		{ icon: Home, label: m['nav.home'](), href: buildLocalizedUrl('/') },
		{ icon: Search, label: m['nav.browse'](), href: buildLocalizedUrl('/browse') },
		{ icon: Plus, label: m['nav.sell'](), href: auth?.isAuthenticated ? buildLocalizedUrl('/sell') : buildLocalizedUrl(`/auth/login?redirectTo=${encodeURIComponent(buildLocalizedUrl('/sell'))}`), accent: true, primary: true },
		{ icon: Heart, label: m['nav.wishlist'](), href: buildLocalizedUrl('/wishlist') },
		{ icon: User, label: m['nav.profile'](), href: auth?.isAuthenticated ? buildLocalizedUrl('/profile') : buildLocalizedUrl(`/auth/login?redirectTo=${encodeURIComponent(buildLocalizedUrl('/profile'))}`) },
	]);
	
	// Check if a path is active
	function isActive(itemHref: string): boolean {
		// Remove locale prefix from both paths for comparison
		const normalizePathForComparison = (path: string) => {
			return path.replace(/^\/(bg|en)/, '') || '/';
		};
		
		const normalizedCurrentPath = normalizePathForComparison(currentPath);
		const normalizedItemPath = normalizePathForComparison(itemHref);
		
		if (normalizedItemPath === '/') {
			return normalizedCurrentPath === '/';
		}
		return normalizedCurrentPath.startsWith(normalizedItemPath);
	}
</script>

{#snippet navIcon(item: NavItem)}
	{@const IconComponent = item.icon}
	<div class="relative">
		<IconComponent 
			size={24} 
			strokeWidth={isActive(item.href) ? 2 : 1.5}
		/>
		{#if item.badge}
			<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
				{item.badge}
			</span>
		{/if}
	</div>
{/snippet}

<nav 
	class={cn(
		"fixed bottom-0 left-0 right-0 z-40",
		"bg-white border-t border-gray-200",
		"max-w-full",
		"md:hidden", // Hide on desktop
		className
	)}
	aria-label="Bottom navigation"
>
	<div class="flex h-14 items-stretch min-w-0 overflow-hidden">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			{#if item.primary}
				<!-- Primary Sell Button (Instagram style) -->
				<a
					href={item.href}
					class={cn(
						"relative flex flex-1 items-center justify-center px-2 min-w-0",
						"touch-manipulation"
					)}
					aria-label={item.label}
				>
					<div class={cn(
						"flex items-center justify-center w-12 h-12 rounded-full",
						"bg-black text-white", // Clean black filled button
						"shadow-md"
					)}>
						<Plus size={26} strokeWidth={2.5} />
					</div>
				</a>
			{:else}
				<!-- Regular Nav Items -->
				<a
					href={item.href}
					class={cn(
						"relative flex flex-1 flex-col items-center justify-center gap-0.5 px-2 min-w-0",
						"text-gray-500",
						"touch-manipulation",
						active && "text-gray-900",
						item.accent && !active && "text-blue-500"
					)}
					aria-label={item.label}
					aria-current={active ? 'page' : undefined}
				>
					{@render navIcon(item)}
					
					<span class={cn(
						"text-[10px] font-medium leading-tight truncate max-w-full",
						active && "font-semibold"
					)}>
						{item.label}
					</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>