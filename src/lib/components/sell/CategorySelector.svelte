<script lang="ts">
	import { CATEGORIES } from '$lib/data/categories';
	import type { CategorySelectorProps } from './types';
	import * as m from '$lib/paraglide/messages';

	let { selectedCategory, onCategorySelect }: CategorySelectorProps = $props();

	// Map category IDs to message keys
	const getCategoryName = (categoryId: string) => {
		// Map category IDs to translation keys
		const categoryMap: Record<string, string> = {
			'women-clothing': 'women_clothing',
			'men-clothing': 'men_clothing',
			'shoes': 'shoes',
			'bags': 'bags_accessories',
			'jewelry': 'jewelry',
			'watches': 'watches',
			'beauty': 'beauty',
			'home': 'home_lifestyle'
		};
		
		const messageKey = categoryMap[categoryId] || categoryId.replace('-', '_');
		const translationKey = `categories.${messageKey}` as keyof typeof m;
		return m[translationKey]?.() || categoryId;
	};
</script>

<div class="category-selector">
	<div class="selector-header">
		<h2 class="selector-title">{m['sell.what_selling']()}</h2>
		<p class="selector-subtitle">{m['sell.choose_category']()}</p>
	</div>

	<!-- Mobile-optimized 3-column grid -->
	<div class="category-grid">
		{#each CATEGORIES as category}
			<button
				type="button"
				class="category-button {selectedCategory === category.id ? 'selected' : ''}"
				onclick={() => onCategorySelect(category.id)}
				aria-pressed={selectedCategory === category.id}
				aria-label="Select {category.name}"
			>
				<span class="category-emoji" role="img" aria-label={category.name}>
					{category.emoji}
				</span>
				<span class="category-name">
					{getCategoryName(category.id)}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.category-selector {
		width: 100%;
	}

	.selector-header {
		text-align: center;
		margin-bottom: var(--space-5);
	}

	.selector-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.selector-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
		font-family: var(--font-family-sans);
		line-height: 1.4;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-3);
	}

	.category-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-1-5);
		min-height: 90px;
		padding: var(--space-3) var(--space-2);
		background: var(--color-surface-primary);
		border: 2px solid var(--color-border-primary);
		border-radius: var(--border-radius-lg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-user-select: none;
		user-select: none;
		touch-action: manipulation;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-xs);
	}

	.category-button:hover {
		border-color: var(--color-interactive-primary);
		background: var(--color-surface-secondary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.category-button:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
		border-color: var(--color-interactive-primary);
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	.category-button:active {
		transform: scale(0.98);
		box-shadow: var(--shadow-xs);
	}

	.category-button.selected {
		background: var(--color-surface-brand-subtle);
		border-color: var(--color-interactive-primary);
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
	}

	.category-button.selected:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	}

	.category-emoji {
		font-size: 28px;
		line-height: 1;
		display: block;
	}

	.category-name {
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: var(--color-text-primary);
		text-align: center;
		line-height: 1.2;
		font-family: var(--font-family-sans);
		letter-spacing: -0.01em;
	}

	.category-button.selected .category-name {
		color: var(--color-interactive-primary);
		font-weight: 600;
	}

	/* Ripple effect on click */
	.category-button::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(37, 99, 235, 0.2);
		transform: translate(-50%, -50%);
		transition: width 0.3s, height 0.3s;
	}

	.category-button:active::after {
		width: 100%;
		height: 100%;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.category-grid {
			gap: var(--space-2);
		}

		.category-button {
			min-height: 80px;
			padding: var(--space-2-5) var(--space-1-5);
		}

		.category-emoji {
			font-size: 24px;
		}

		.category-name {
			font-size: 11px;
		}
	}

	/* Desktop adjustments */
	@media (min-width: 768px) {
		.category-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: var(--space-4);
		}

		.category-button {
			min-height: 100px;
			padding: var(--space-4) var(--space-3);
		}

		.selector-header {
			margin-bottom: var(--space-6);
		}
	}
</style>
