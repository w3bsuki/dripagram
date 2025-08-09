<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	
	interface Category {
		id: string;
		name: string;
		emoji: string;
	}
	
	interface Props {
		categories: Category[];
		selectedCategory: string | null;
		selectedDemographic: string | null;
		showCategoryMenu: boolean;
		onCategorySelect: (categoryId: string | null) => void;
		onDemographicSelect: (demographic: string | null) => void;
		onMenuToggle: () => void;
	}
	
	let {
		categories,
		selectedCategory = $bindable(),
		selectedDemographic = $bindable(),
		showCategoryMenu = $bindable(),
		onCategorySelect,
		onDemographicSelect,
		onMenuToggle
	}: Props = $props();
	
	const demographics = [
		{ id: 'women', name: 'Women', emoji: '👩' },
		{ id: 'men', name: 'Men', emoji: '👨' },
		{ id: 'kids', name: 'Kids', emoji: '👶' }
	];
	
	function handleCategoryClick(categoryId: string | null) {
		selectedCategory = categoryId;
		onCategorySelect(categoryId);
		showCategoryMenu = false;
	}
	
	function handleDemographicClick(demographicId: string | null) {
		selectedDemographic = demographicId;
		onDemographicSelect(demographicId);
	}
	
	function getCategoryName(id: string | null) {
		if (!id) return 'All Categories';
		return categories.find(c => c.id === id)?.name || id;
	}
</script>

<div class="category-section">
	<!-- Demographics Pills -->
	<div class="demographics">
		<button 
			class="demographic-pill {selectedDemographic === null ? 'active' : ''}"
			onclick={() => handleDemographicClick(null)}
		>
			All
		</button>
		{#each demographics as demo}
			<button 
				class="demographic-pill {selectedDemographic === demo.id ? 'active' : ''}"
				onclick={() => handleDemographicClick(demo.id)}
			>
				<span class="emoji">{demo.emoji}</span>
				{demo.name}
			</button>
		{/each}
	</div>
	
	<!-- Category Dropdown -->
	<div class="category-dropdown-container">
		<button class="category-dropdown-trigger" onclick={onMenuToggle}>
			<span>{getCategoryName(selectedCategory)}</span>
			<ChevronDown size={16} class="chevron {showCategoryMenu ? 'rotated' : ''}" />
		</button>
		
		{#if showCategoryMenu}
			<div class="category-dropdown">
				<button 
					class="category-item {selectedCategory === null ? 'active' : ''}"
					onclick={() => handleCategoryClick(null)}
				>
					All Categories
				</button>
				{#each categories as category}
					<button 
						class="category-item {selectedCategory === category.id ? 'active' : ''}"
						onclick={() => handleCategoryClick(category.id)}
					>
						<span class="emoji">{category.emoji}</span>
						{category.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.category-section {
		margin-bottom: 1.5rem;
	}
	
	.demographics {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}
	
	.demographic-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border-primary);
		background: white;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
		flex-shrink: 0;
	}
	
	.demographic-pill:hover {
		border-color: var(--color-border-primary);
		color: var(--color-text-secondary);
	}
	
	.demographic-pill.active {
		background: var(--color-interactive-primary);
		border-color: var(--color-interactive-primary);
		color: white;
	}
	
	.emoji {
		font-size: 1rem;
	}
	
	.category-dropdown-container {
		position: relative;
	}
	
	.category-dropdown-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border-primary);
		background: white;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.category-dropdown-trigger:hover {
		border-color: var(--color-border-primary);
	}
	
	.chevron {
		transition: transform 0.15s;
		color: var(--color-text-secondary);
	}
	
	.chevron.rotated {
		transform: rotate(180deg);
	}
	
	.category-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		margin-top: 0.25rem;
		box-shadow: var(--shadow-md);
		z-index: var(--z-high);
		max-height: 300px;
		overflow-y: auto;
	}
	
	.category-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		text-align: left;
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.15s;
	}
	
	.category-item:hover {
		background: var(--color-surface-tertiary);
	}
	
	.category-item.active {
		background: var(--color-surface-brand-subtle);
		color: var(--color-text-brand);
		font-weight: 600;
	}
	
	.category-item .emoji {
		font-size: 1.125rem;
	}
</style>