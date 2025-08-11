<script lang="ts">
	import { browser } from '$app/environment';
	import { Moon, Sun, Monitor } from '@lucide/svelte';
	
	type ThemeOption = 'light' | 'dark' | 'system';
	
	interface Props {
		size?: number;
		showText?: boolean;
		class?: string;
	}
	
	let { 
		size = 24, 
		showText = false, 
		class: className = '' 
	}: Props = $props();
	
	// Theme state using Svelte 5 $state
	let theme = $state<ThemeOption>('system');
	let systemPrefersDark = $state<boolean>(false);
	
	// Computed actual theme (resolves 'system' to actual theme)
	let resolvedTheme = $derived(
		theme === 'system' 
			? (systemPrefersDark ? 'dark' : 'light')
			: theme
	);
	
	// Initialize theme and system preference detection
	$effect(() => {
		if (!browser) return;
		
		// Read stored theme preference
		const storedTheme = localStorage.getItem('theme') as ThemeOption;
		if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
			theme = storedTheme;
		}
		
		// Setup system preference detection
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		systemPrefersDark = mediaQuery.matches;
		
		const handleSystemChange = (e: MediaQueryListEvent) => {
			systemPrefersDark = e.matches;
		};
		
		mediaQuery.addEventListener('change', handleSystemChange);
		
		// Cleanup
		return () => {
			mediaQuery.removeEventListener('change', handleSystemChange);
		};
	});
	
	// Apply theme to DOM when resolved theme changes
	$effect(() => {
		if (!browser) return;
		
		document.documentElement.setAttribute('data-theme', resolvedTheme);
		
		// Also set color-scheme for browser UI adaptation
		document.documentElement.style.colorScheme = resolvedTheme;
	});
	
	// Save theme preference when it changes
	$effect(() => {
		if (!browser) return;
		localStorage.setItem('theme', theme);
	});
	
	function cycleTheme() {
		const themes: ThemeOption[] = ['light', 'dark', 'system'];
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		theme = themes[nextIndex];
	}
	
	function getThemeIcon(themeOption: ThemeOption) {
		switch (themeOption) {
			case 'light':
				return Sun;
			case 'dark':
				return Moon;
			case 'system':
				return Monitor;
		}
	}
	
	function getThemeLabel(themeOption: ThemeOption) {
		switch (themeOption) {
			case 'light':
				return 'Light theme';
			case 'dark':
				return 'Dark theme';
			case 'system':
				return 'System theme';
		}
	}
	
	const CurrentIcon = $derived(getThemeIcon(theme));
</script>

<button
	class="theme-toggle {className}"
	onclick={cycleTheme}
	aria-label={getThemeLabel(theme)}
	title={`Current: ${getThemeLabel(theme)} (${resolvedTheme})`}
>
	<CurrentIcon {size} strokeWidth={1.5} />
	{#if showText}
		<span class="theme-text">
			{theme.charAt(0).toUpperCase() + theme.slice(1)}
		</span>
	{/if}
</button>

<style>
	.theme-toggle {
		position: relative;
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: var(--space-2);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border-radius: var(--border-radius-full);
		width: var(--size-button-default);
		height: var(--size-button-default);
		transition: all var(--duration-fast) var(--ease-out);
		
		/* Use design token colors */
		background-color: transparent;
	}
	
	.theme-toggle:hover {
		background-color: var(--color-interactive-secondary);
		transform: scale(1.05);
	}
	
	.theme-toggle:active {
		transform: scale(0.95);
	}
	
	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}
	
	/* When text is shown, adjust button width */
	.theme-toggle:has(.theme-text) {
		width: auto;
		padding-inline: var(--space-3);
		border-radius: var(--border-radius-lg);
	}
	
	.theme-text {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		/* transition removed for performance */
	}
	
	.theme-toggle:hover .theme-text {
		color: var(--color-text-primary);
	}
	
	/* Icon transition effects removed for performance */
	
	.theme-toggle:hover :global(svg) {
		transform: rotate(15deg);
	}
	
	/* Dark theme adjustments */
	:global([data-theme='dark']) .theme-toggle {
		color: var(--color-text-primary);
	}
	
	:global([data-theme='dark']) .theme-toggle:hover {
		background-color: var(--color-interactive-secondary);
	}
	
	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.theme-toggle :global(svg),
		.theme-text {
			transition: none;
		}
		
		.theme-toggle:hover {
			transform: none;
		}
		
		.theme-toggle:hover :global(svg) {
			transform: none;
		}
	}
</style>