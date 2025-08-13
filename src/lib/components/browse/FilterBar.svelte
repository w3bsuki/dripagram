<script lang="ts">
	import { ChevronDown, Filter, X, Grid, List } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface FilterState {
		selectedCondition: string | null;
		selectedBrand: string | null;
		selectedSize: string | null;
		priceRange: { min: number; max: number };
		selectedCollection: string | null;
	}

	let {
		sortBy,
		filters,
		viewMode,
		activeFiltersCount,
		onSortChange,
		onFilterChange,
		onViewModeChange,
		onShowFilters,
		onClearFilters
	}: {
		sortBy: string;
		filters: FilterState;
		viewMode: 'grid' | 'list';
		activeFiltersCount: number;
		onSortChange: (sort: string) => void;
		onFilterChange: (filters: FilterState) => void;
		onViewModeChange: (mode: 'grid' | 'list') => void;
		onShowFilters: () => void;
		onClearFilters: () => void;
	} = $props();

	// Dropdown states
	let showSortDropdown = $state(false);
	let showSizeDropdown = $state(false);

	// Sort options
	const sortOptions = [
		{ id: 'newest', label: m['browse.newest']() },
		{ id: 'price-low', label: m['browse.price_low_high']() },
		{ id: 'price-high', label: m['browse.price_high_low']() },
		{ id: 'most-liked', label: m['browse.most_liked']() },
		{ id: 'trending', label: m['browse.trending']() }
	];

	// Size options
	const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
	const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43'];

	// Get current sort label
	const currentSortLabel = $derived(
		sortOptions.find(option => option.id === sortBy)?.label || m['browse.newest']()
	);

	function handleSortSelect(sortId: string) {
		onSortChange(sortId);
		showSortDropdown = false;
	}

	function handleSizeSelect(size: string) {
		const newFilters = { ...filters };
		newFilters.selectedSize = filters.selectedSize === size ? null : size;
		onFilterChange(newFilters);
		showSizeDropdown = false;
	}

	function clearActiveFilter(filterType: string) {
		const newFilters = { ...filters };
		
		switch (filterType) {
			case 'size':
				newFilters.selectedSize = null;
				break;
			case 'brand':
				newFilters.selectedBrand = null;
				break;
			case 'condition':
				newFilters.selectedCondition = null;
				break;
		}
		
		onFilterChange(newFilters);
	}

	// Element references for proper click detection
	let sortButtonEl = $state<HTMLButtonElement | null>(null);
	let sizeButtonEl = $state<HTMLButtonElement | null>(null);
	let sortDropdownEl = $state<HTMLDivElement | null>(null);
	let sizeDropdownEl = $state<HTMLDivElement | null>(null);

	// Close dropdowns when clicking outside
	function handleDocumentClick(event: Event) {
		const target = event.target as Element;
		
		// Check if click is inside sort dropdown area
		if (showSortDropdown) {
			const isInsideSortButton = sortButtonEl?.contains(target);
			const isInsideSortDropdown = sortDropdownEl?.contains(target);
			if (!isInsideSortButton && !isInsideSortDropdown) {
				showSortDropdown = false;
			}
		}
		
		// Check if click is inside size dropdown area
		if (showSizeDropdown) {
			const isInsideSizeButton = sizeButtonEl?.contains(target);
			const isInsideSizeDropdown = sizeDropdownEl?.contains(target);
			if (!isInsideSizeButton && !isInsideSizeDropdown) {
				showSizeDropdown = false;
			}
		}
	}

	// Handle escape key
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showSortDropdown = false;
			showSizeDropdown = false;
		}
	}

	// Set up document listeners with proper cleanup
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleDocumentClick);
			document.addEventListener('keydown', handleKeyDown);
			
			return () => {
				document.removeEventListener('click', handleDocumentClick);
				document.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<div class="filter-bar">
	<div class="filter-bar-content">
		<!-- Left side: Sort and quick filters -->
		<div class="filter-pills">
			<!-- Sort Dropdown -->
			<div class="dropdown-container">
				<button
					bind:this={sortButtonEl}
					class="filter-pill {sortBy !== 'newest' ? 'active' : ''}"
					onclick={() => {
						showSortDropdown = !showSortDropdown;
						showSizeDropdown = false;
					}}
					aria-haspopup="true"
					aria-expanded={showSortDropdown}
				>
					<span>{currentSortLabel}</span>
					<ChevronDown size={12} class="chevron {showSortDropdown ? 'rotated' : ''}" />
				</button>

				{#if showSortDropdown}
					<div 
						bind:this={sortDropdownEl}
						class="dropdown"
						role="menu"
						aria-label="Sort options"
					>
						{#each sortOptions as option}
							<button
								class="dropdown-item {sortBy === option.id ? 'active' : ''}"
								onclick={() => handleSortSelect(option.id)}
								role="menuitem"
							>
								{option.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Size Filter -->
			<div class="dropdown-container">
				<button
					bind:this={sizeButtonEl}
					class="filter-pill {filters.selectedSize ? 'active' : ''}"
					onclick={() => {
						showSizeDropdown = !showSizeDropdown;
						showSortDropdown = false;
					}}
					aria-haspopup="true"
					aria-expanded={showSizeDropdown}
				>
					<span>
						{filters.selectedSize ? `${m['product.size']()} ${filters.selectedSize}` : m['product.size']()}
					</span>
					<ChevronDown size={12} class="chevron {showSizeDropdown ? 'rotated' : ''}" />
				</button>

				{#if showSizeDropdown}
					<div 
						bind:this={sizeDropdownEl}
						class="dropdown size-dropdown"
						role="menu"
						aria-label="Size options"
					>
						<div class="size-section">
							<div class="size-label">Clothing</div>
							<div class="size-grid clothing">
								{#each clothingSizes as size}
									<button
										class="size-button {filters.selectedSize === size ? 'active' : ''}"
										onclick={() => handleSizeSelect(size)}
										role="menuitem"
									>
										{size}
									</button>
								{/each}
							</div>
						</div>
						<div class="size-section">
							<div class="size-label">Shoes</div>
							<div class="size-grid shoes">
								{#each shoeSizes as size}
									<button
										class="size-button {filters.selectedSize === size ? 'active' : ''}"
										onclick={() => handleSizeSelect(size)}
										role="menuitem"
									>
										{size}
									</button>
								{/each}
							</div>
						</div>
						{#if filters.selectedSize}
							<div class="dropdown-divider"></div>
							<button 
								class="dropdown-item clear" 
								onclick={() => clearActiveFilter('size')}
								role="menuitem"
							>
								Clear Size
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Active Filter Pills -->
			{#if filters.selectedBrand}
				<button
					class="filter-pill active removable"
					onclick={() => clearActiveFilter('brand')}
				>
					<span>{filters.selectedBrand}</span>
					<X size={12} />
				</button>
			{/if}

			{#if filters.selectedCondition}
				<button
					class="filter-pill active removable"
					onclick={() => clearActiveFilter('condition')}
				>
					<span>{filters.selectedCondition}</span>
					<X size={12} />
				</button>
			{/if}
		</div>

		<!-- Right side: Actions -->
		<div class="filter-actions">
			<!-- More Filters Button -->
			<button
				class="filter-pill more-filters {activeFiltersCount > 0 ? 'active' : ''}"
				onclick={onShowFilters}
			>
				<Filter size={12} />
				<span>Filters</span>
				{#if activeFiltersCount > 0}
					<span class="filter-badge">{activeFiltersCount}</span>
				{/if}
			</button>

			<!-- View Toggle -->
			<div class="view-toggle">
				<button
					class="toggle-btn {viewMode === 'grid' ? 'active' : ''}"
					onclick={() => onViewModeChange('grid')}
					aria-label="Grid view"
				>
					<Grid size={14} />
				</button>
				<button
					class="toggle-btn {viewMode === 'list' ? 'active' : ''}"
					onclick={() => onViewModeChange('list')}
					aria-label="List view"
				>
					<List size={14} />
				</button>
			</div>

			<!-- Clear All (only show if filters are active) -->
			{#if activeFiltersCount > 0}
				<button class="clear-all-btn" onclick={onClearFilters}>
					Clear All
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.filter-bar {
		position: sticky;
		top: calc(var(--header-height) + 1px);
		z-index: 110; /* Higher than search section (100) */
		background: white;
		border-bottom: 1px solid #f1f3f4;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.filter-bar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		gap: 12px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.filter-pills {
		display: flex;
		align-items: center;
		gap: 10px;
		overflow-x: auto;
		flex: 1;
		min-width: 0;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-right: 8px;
	}

	.filter-pills::-webkit-scrollbar {
		display: none;
	}

	.filter-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	/* Filter Pills */
	.filter-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1.5px solid #e5e7eb;
		border-radius: 22px;
		background: white;
		color: #6b7280;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 36px;
		flex-shrink: 0;
		position: relative;
	}

	.filter-pill:hover {
		background: #f9fafb;
		border-color: #d1d5db;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.filter-pill.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	.filter-pill.removable:hover {
		background: #ef4444;
		border-color: #ef4444;
	}

	.filter-pill.more-filters {
		position: relative;
	}

	/* Chevron animation */
	.chevron {
		transition: transform 0.15s ease;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	/* Dropdown */
	.dropdown-container {
		position: relative;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		background: white;
		border: 1.5px solid #e5e7eb;
		border-radius: 12px;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		z-index: 120; /* Higher than filter-bar (110) */
		min-width: 180px;
		animation: fadeInScale 0.2s ease-out;
		overflow: hidden;
		/* Prevent dropdown from being clipped */
		max-height: 80vh;
		overflow-y: auto;
	}

	.size-dropdown {
		min-width: 200px;
		padding: 12px;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 16px;
		background: transparent;
		border: none;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.dropdown-item:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.dropdown-item.active {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.dropdown-item.clear {
		color: #ef4444;
		justify-content: center;
		font-weight: 600;
	}

	.dropdown-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 8px 0;
	}

	/* Size dropdown specific styles */
	.size-section {
		margin-bottom: 12px;
	}

	.size-section:last-child {
		margin-bottom: 0;
	}

	.size-label {
		font-size: 11px;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 6px;
		text-transform: uppercase;
	}

	.size-grid {
		display: grid;
		gap: 4px;
	}

	.size-grid.clothing {
		grid-template-columns: repeat(3, 1fr);
	}

	.size-grid.shoes {
		grid-template-columns: repeat(4, 1fr);
	}

	.size-button {
		padding: 4px 8px;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		background: white;
		color: #374151;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		min-height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.size-button:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.size-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	/* Filter Badge */
	.filter-badge {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 16px;
		height: 16px;
		background: #ef4444;
		color: white;
		font-size: 10px;
		font-weight: 600;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
	}

	/* View Toggle */
	.view-toggle {
		display: flex;
		background: #f3f4f6;
		border-radius: 6px;
		padding: 2px;
		gap: 1px;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		border-radius: 4px;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		min-width: 32px;
		height: 28px;
	}

	.toggle-btn:hover:not(.active) {
		color: #374151;
		background: #e5e7eb;
	}

	.toggle-btn.active {
		background: white;
		color: #111827;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	/* Clear All Button */
	.clear-all-btn {
		padding: 6px 12px;
		background: transparent;
		border: 1px solid #e5e7eb;
		border-radius: 20px;
		color: #ef4444;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.clear-all-btn:hover {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.filter-bar-content {
			padding: 8px 12px;
			gap: 8px;
		}

		.filter-pills {
			gap: 6px;
		}

		.filter-actions {
			gap: 6px;
		}

		.filter-pill {
			padding: 5px 10px;
			font-size: 12px;
			min-height: 28px;
		}

		.dropdown {
			min-width: 140px;
		}

		.size-dropdown {
			min-width: 180px;
			right: 0;
			left: auto;
		}
		
		/* Smart positioning to prevent viewport overflow */
		.dropdown {
			/* Use transform to position relative to viewport */
			transform: translateX(0);
		}
		
		/* Size dropdown positioned from right on mobile */
		.size-dropdown {
			transform: translateX(-50%);
			left: 50%;
			right: auto;
		}

		.view-toggle {
			padding: 1px;
		}

		.toggle-btn {
			padding: 4px;
			min-width: 28px;
			height: 24px;
		}

		.clear-all-btn {
			font-size: 11px;
			padding: 5px 8px;
		}
	}

	/* Animation */
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
	
	/* Mobile touch optimizations */
	@media (hover: none) and (pointer: coarse) {
		.filter-pill {
			/* Larger touch targets on mobile */
			min-height: 40px;
			padding: 10px 16px;
		}
		
		.filter-pill:hover {
			/* Remove hover effects on touch devices */
			transform: none;
			box-shadow: none;
		}
		
		.filter-pill:active {
			/* Add tap feedback */
			transform: scale(0.98);
			background: #f3f4f6;
		}
		
		.dropdown-item:active,
		.size-button:active {
			background: #e5e7eb;
			transform: scale(0.98);
		}
	}

	/* Smooth focus states */
	.filter-pill:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-color: #3b82f6;
	}

	.dropdown-item:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
		background: #dbeafe;
	}

	/* Sticky positioning adjustment for mobile */
	@media (max-width: 768px) {
		.filter-bar {
			top: var(--header-height);
		}
	}
</style>