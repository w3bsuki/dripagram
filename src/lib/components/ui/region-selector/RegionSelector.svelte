<script lang="ts">
	import { getLocaleContext, type RegionCode } from '$lib/stores/locale.svelte';

	// Props
	let {
		value = $bindable<string>(),
		class: className = '',
		disabled = false,
		required = false,
		label = '',
		description = '',
		showEmojis = true,
		layout = 'grid'
	} = $props<{
		value?: string;
		class?: string;
		disabled?: boolean;
		required?: boolean;
		label?: string;
		description?: string;
		showEmojis?: boolean;
		layout?: 'grid' | 'list';
	}>();

	// Get locale context
	const localeManager = getLocaleContext();

	// Get available regions based on current locale
	const regions = $derived(localeManager.availableRegions);

	// Handle selection
	function handleRegionSelect(regionCode: string) {
		if (disabled) return;
		value = regionCode;
	}

	// Check if region is selected
	function isSelected(regionCode: string): boolean {
		return value === regionCode;
	}
</script>

<div class="region-selector {className}" class:disabled>
	{#if label}
		<div class="header">
			<label class="label" for="region-selector">
				{label}
				{#if required}
					<span class="required" aria-label="Required">*</span>
				{/if}
			</label>
			{#if description}
				<p class="description">{description}</p>
			{/if}
		</div>
	{/if}

	<div 
		class="region-grid" 
		class:list-layout={layout === 'list'}
		role="radiogroup" 
		aria-labelledby={label ? 'region-selector' : undefined}
		aria-required={required}
	>
		{#each regions as region (region.code)}
			<button
				class="region-option"
				class:selected={isSelected(region.code)}
				onclick={() => handleRegionSelect(region.code)}
				{disabled}
				type="button"
				role="radio"
				aria-checked={isSelected(region.code)}
				aria-label={`Select ${region.name}`}
			>
				<div class="option-content">
					{#if showEmojis}
						<span class="emoji" aria-hidden="true">{region.emoji}</span>
					{/if}
					<span class="name">{region.name}</span>
					{#if isSelected(region.code)}
						<span class="checkmark" aria-hidden="true">✓</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	{#if localeManager.error}
		<div class="error-message" role="alert">
			{localeManager.error}
		</div>
	{/if}
</div>

<style>
	.region-selector {
		width: 100%;
	}

	.region-selector.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.header {
		margin-bottom: 1rem;
	}

	.label {
		display: block;
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.required {
		color: var(--color-danger);
		margin-left: 0.25rem;
	}

	.description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.region-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.region-grid.list-layout {
		grid-template-columns: 1fr;
	}

	.region-option {
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		width: 100%;
		text-align: left;
		transition: transform 0.2s ease;
	}

	.region-option:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.region-option:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--border-radius-lg);
	}

	.region-option:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.option-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--border-radius-lg);
		transition: all 0.2s ease;
		min-height: 70px;
	}

	.region-option.selected .option-content {
		border-color: var(--color-primary);
		background: rgba(24, 119, 242, 0.05);
		box-shadow: 0 4px 12px rgba(24, 119, 242, 0.15);
	}

	.region-option:hover:not(:disabled) .option-content {
		border-color: var(--color-primary);
		background: var(--color-surface-hover);
		box-shadow: var(--shadow-sm);
	}

	.emoji {
		font-size: 1.75rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.name {
		font-weight: 600;
		font-size: var(--text-base);
		color: var(--color-text-primary);
		flex: 1;
	}

	.region-option.selected .name {
		color: var(--color-primary);
	}

	.checkmark {
		color: var(--color-primary);
		font-weight: bold;
		font-size: 1.125rem;
		flex-shrink: 0;
	}

	.error-message {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-danger);
		border-radius: var(--border-radius-md);
		color: var(--color-danger);
		font-size: var(--text-sm);
		font-weight: 500;
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.region-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.option-content {
			padding: 1rem;
			gap: 0.75rem;
			min-height: 60px;
		}

		.emoji {
			font-size: 1.5rem;
		}

		.name {
			font-size: var(--text-sm);
		}
	}

	@media (max-width: 480px) {
		.region-grid {
			gap: 0.5rem;
		}

		.option-content {
			padding: 0.875rem;
		}
	}

	/* Animation for region loading */
	.region-option {
		animation: slideIn 0.3s ease-out;
		animation-fill-mode: both;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Stagger animation for region options */
	.region-option:nth-child(1) { animation-delay: 0ms; }
	.region-option:nth-child(2) { animation-delay: 50ms; }
	.region-option:nth-child(3) { animation-delay: 100ms; }
	.region-option:nth-child(4) { animation-delay: 150ms; }
	.region-option:nth-child(5) { animation-delay: 200ms; }
	.region-option:nth-child(6) { animation-delay: 250ms; }
	.region-option:nth-child(7) { animation-delay: 300ms; }
	.region-option:nth-child(8) { animation-delay: 350ms; }

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.option-content {
			border-width: 3px;
		}

		.region-option.selected .option-content {
			border-color: var(--color-text-primary);
			background: var(--color-background);
		}
	}

	/* Reduce motion for users who prefer it */
	@media (prefers-reduced-motion: reduce) {
		.region-option,
		.option-content {
			animation: none;
			transition: none;
		}

		.region-option:hover:not(:disabled) {
			transform: none;
		}
	}
</style>