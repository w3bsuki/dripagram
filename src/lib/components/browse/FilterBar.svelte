<script lang="ts">
	import { ChevronDown, Grid, List } from '@lucide/svelte';

	let {
		sortBy = 'newest',
		viewMode = 'grid',
		selectedSize = null,
		onSortChange,
		onViewModeChange,
		onSizeChange,
		onShowFilters
	}: {
		sortBy?: string;
		viewMode?: 'grid' | 'list';
		selectedSize?: string | null;
		onSortChange: (sort: string) => void;
		onViewModeChange: (mode: 'grid' | 'list') => void;
		onSizeChange: (size: string | null) => void;
		onShowFilters: () => void;
	} = $props();

	let showSort = $state(false);
	let showSize = $state(false);

	const sortOptions = [
		{ value: 'newest', label: 'Newest' },
		{ value: 'price-low', label: 'Price: Low to High' },
		{ value: 'price-high', label: 'Price: High to Low' },
		{ value: 'popular', label: 'Most Popular' }
	];

	const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
</script>

<div class="filter-bar">
	<div class="filters">
		<!-- Sort dropdown -->
		<div class="dropdown-wrapper">
			<button
				class="dropdown-button"
				onclick={() => showSort = !showSort}
			>
				Sort by
				<ChevronDown size={14} />
			</button>
			
			{#if showSort}
				<div class="dropdown-menu">
					{#each sortOptions as option}
						<button
							class="dropdown-item"
							class:active={sortBy === option.value}
							onclick={() => {
								onSortChange(option.value);
								showSort = false;
							}}
						>
							{option.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Size dropdown -->
		<div class="dropdown-wrapper">
			<button
				class="dropdown-button"
				onclick={() => showSize = !showSize}
			>
				Size
				<ChevronDown size={14} />
			</button>
			
			{#if showSize}
				<div class="dropdown-menu">
					{#each sizeOptions as size}
						<button
							class="dropdown-item"
							class:active={selectedSize === size}
							onclick={() => {
								onSizeChange(selectedSize === size ? null : size);
								showSize = false;
							}}
						>
							{size}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- More filters -->
		<button class="dropdown-button" onclick={onShowFilters}>
			More filters
		</button>
	</div>

	<!-- View mode toggle -->
	<div class="view-toggle">
		<button
			class:active={viewMode === 'grid'}
			onclick={() => onViewModeChange('grid')}
			aria-label="Grid view"
		>
			<Grid size={18} />
		</button>
		<button
			class:active={viewMode === 'list'}
			onclick={() => onViewModeChange('list')}
			aria-label="List view"
		>
			<List size={18} />
		</button>
	</div>
</div>

<!-- Click outside to close -->
{#if showSort || showSize}
	<button
		class="backdrop"
		onclick={() => {
			showSort = false;
			showSize = false;
		}}
		aria-hidden="true"
	/>
{/if}

<style>
	.filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 20px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.filters {
		display: flex;
		gap: 8px;
	}

	.dropdown-wrapper {
		position: relative;
	}

	.dropdown-button {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px 12px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		color: #374151;
		cursor: pointer;
	}

	.dropdown-button:hover {
		background: #f9fafb;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 160px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 50;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		padding: 8px 12px;
		text-align: left;
		font-size: 14px;
		color: #374151;
		background: none;
		border: none;
		cursor: pointer;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item.active {
		background: #3b82f6;
		color: white;
	}

	.view-toggle {
		display: flex;
		gap: 4px;
		padding: 2px;
		background: #f3f4f6;
		border-radius: 6px;
	}

	.view-toggle button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 28px;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: #6b7280;
		cursor: pointer;
	}

	.view-toggle button.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		border: none;
		z-index: 40;
		cursor: default;
	}

	@media (max-width: 768px) {
		.filter-bar {
			padding: 8px 16px;
		}

		.view-toggle {
			display: none;
		}
	}
</style>