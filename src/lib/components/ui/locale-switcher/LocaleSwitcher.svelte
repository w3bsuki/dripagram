<script lang="ts">
	import { Globe, ChevronDown } from '@lucide/svelte';
	import { clickOutside } from '$lib/utils/click-outside';
	import { getLocaleContext } from '$lib/stores/locale.svelte';

	// Props
	let { 
		class: className = '',
		compact = false,
		showFlag = true,
		showLabel = true 
	} = $props<{ 
		class?: string;
		compact?: boolean;
		showFlag?: boolean;
		showLabel?: boolean;
	}>();

	// Get locale context
	const localeManager = getLocaleContext();

	// Component state
	let isOpen = $state(false);

	// Language options
	const languages = [
		{ code: 'bg' as const, name: 'Български', flag: '🇧🇬' },
		{ code: 'en' as const, name: 'English', flag: '🇺🇸' }
	];

	// Reactive computed values
	const currentLanguage = $derived(
		languages.find(lang => lang.code === localeManager.locale)
	);

	// Event handlers
	function toggleDropdown() {
		if (localeManager.isLoading) return;
		isOpen = !isOpen;
	}

	function handleLanguageSelect(langCode: 'bg' | 'en') {
		localeManager.setLocale(langCode);
		isOpen = false;
	}

	function handleClickOutside() {
		isOpen = false;
	}
</script>

<div 
	class="locale-switcher {className}" 
	class:compact
	use:clickOutside={handleClickOutside}
>
	<button 
		class="switcher-button" 
		class:loading={localeManager.isLoading}
		class:open={isOpen}
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		aria-label="Switch language"
		disabled={localeManager.isLoading}
		type="button"
	>
		{#if showFlag}
			<span class="flag" aria-hidden="true">
				{currentLanguage?.flag || '🌐'}
			</span>
		{:else}
			<Globe size={16} class="icon" />
		{/if}
		
		{#if showLabel && !compact}
			<span class="label">{currentLanguage?.name || 'Language'}</span>
		{/if}
		
		<ChevronDown 
			size={14} 
			class="chevron {isOpen ? 'rotated' : ''}" 
			aria-hidden="true"
		/>
	</button>

	{#if isOpen}
		<div class="dropdown" role="listbox" aria-label="Language options">
			{#each languages as language}
				<button
					class="dropdown-item"
					class:active={language.code === localeManager.locale}
					onclick={() => handleLanguageSelect(language.code)}
					disabled={localeManager.isLoading}
					type="button"
					role="option"
					aria-selected={language.code === localeManager.locale}
				>
					<span class="flag" aria-hidden="true">{language.flag}</span>
					<span class="name">{language.name}</span>
					{#if language.code === localeManager.locale}
						<span class="checkmark" aria-hidden="true">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if localeManager.error}
		<div class="error-tooltip" role="alert">
			{localeManager.error}
		</div>
	{/if}
</div>

<style>
	.locale-switcher {
		position: relative;
		display: inline-block;
	}

	.switcher-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		min-width: fit-content;
	}

	.locale-switcher.compact .switcher-button {
		padding: 0.375rem;
		gap: 0.25rem;
	}

	.switcher-button:hover:not(:disabled) {
		border-color: var(--color-primary);
		background: var(--color-surface-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.switcher-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.switcher-button.loading {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.switcher-button.open {
		border-color: var(--color-primary);
		background: var(--color-surface-hover);
	}

	.flag {
		font-size: 1rem;
		line-height: 1;
	}

	.icon {
		color: var(--color-text-secondary);
	}

	.label {
		font-weight: 500;
		white-space: nowrap;
	}

	.chevron {
		transition: transform 0.2s ease;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-lg);
		z-index: var(--z-dropdown);
		min-width: 140px;
		overflow: hidden;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s ease;
		font-size: var(--text-sm);
		text-align: left;
		color: var(--color-text-primary);
	}

	.dropdown-item:hover:not(:disabled) {
		background: var(--color-surface);
	}

	.dropdown-item.active {
		background: rgba(24, 119, 242, 0.05);
		color: var(--color-primary);
	}

	.dropdown-item:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}

	.dropdown-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.dropdown-item .name {
		flex: 1;
		font-weight: 500;
	}

	.checkmark {
		color: var(--color-success);
		font-weight: bold;
		font-size: 0.875rem;
	}

	.error-tooltip {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-danger);
		color: white;
		font-size: var(--text-xs);
		border-radius: var(--border-radius-sm);
		box-shadow: var(--shadow-md);
		z-index: var(--z-tooltip);
		white-space: nowrap;
		animation: fadeIn 0.2s ease-out;
	}

	.error-tooltip::before {
		content: '';
		position: absolute;
		top: -4px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-bottom: 4px solid var(--color-danger);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.dropdown {
			left: 0;
			right: 0;
			min-width: auto;
		}
		
		.locale-switcher:not(.compact) .switcher-button {
			padding: 0.625rem 0.875rem;
		}
		
		.dropdown-item {
			padding: 0.875rem 1rem;
		}
	}

	/* Dark mode support (if implemented) */
	@media (prefers-color-scheme: dark) {
		.dropdown {
			box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		}
	}

	/* Loading state animation */
	.switcher-button.loading .chevron {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>