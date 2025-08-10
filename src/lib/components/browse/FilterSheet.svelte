<script lang="ts">
	import { X, SlidersHorizontal } from '@lucide/svelte';
	import { tick } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	
	interface FilterState {
		selectedCondition: string | null;
		selectedBrand: string | null;
		selectedSize: string | null;
		priceRange: { min: number; max: number };
		selectedCollection: string | null;
	}
	
	interface Props {
		showFilters: boolean;
		filters: FilterState;
		onClose: () => void;
		onFiltersChange: (filters: FilterState) => void;
		onApplyFilters: () => void;
		onClearFilters: () => void;
	}
	
	let {
		showFilters = $bindable(),
		filters = $bindable(),
		onClose,
		onFiltersChange,
		onApplyFilters,
		onClearFilters
	}: Props = $props();
	
	let modalElement: HTMLDivElement;
	let previouslyFocusedElement: HTMLElement | null = null;
	
	const conditions = ['New with tags', 'New without tags', 'Like new', 'Very good', 'Good', 'Fair'];
	const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'Bershka', 'Pull & Bear', 'Massimo Dutti'];
	const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
	const collections = ['Summer Sale', 'Vintage Collection', 'Designer Finds', 'Back to School'];
	
	function updateFilters(updates: Partial<FilterState>) {
		filters = { ...filters, ...updates };
		onFiltersChange(filters);
	}
	
	function handleApply() {
		onApplyFilters();
		onClose();
	}
	
	function handleClear() {
		onClearFilters();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
		
		// Focus trapping
		if (event.key === 'Tab') {
			const focusableElements = modalElement?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (!focusableElements?.length) return;
			
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
			
			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	}

	async function setupFocus() {
		if (showFilters && modalElement) {
			// Store the previously focused element
			previouslyFocusedElement = document.activeElement as HTMLElement;
			
			// Wait for next tick to ensure modal is rendered
			await tick();
			
			// Focus the close button first
			const closeButton = modalElement.querySelector('.close-filters') as HTMLElement;
			if (closeButton) {
				closeButton.focus();
			}
		} else if (!showFilters && previouslyFocusedElement) {
			// Return focus to the previously focused element
			previouslyFocusedElement.focus();
			previouslyFocusedElement = null;
		}
	}

	$effect(() => {
		setupFocus();
		
		if (showFilters) {
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('keydown', handleKeydown);
		}

		// Cleanup
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if showFilters}
	<div class="filter-overlay" role="dialog" aria-modal="true" aria-labelledby="filter-title" bind:this={modalElement}>
		<button class="filter-backdrop" onclick={onClose} aria-label="Close filters"></button>
		<div class="filter-sheet" onclick={(e) => e.stopPropagation()} onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		}} role="document">
			<div class="filter-header">
				<h2 id="filter-title">{m['browse.filter']()}</h2>
				<button class="close-filters" onclick={onClose} aria-label="Close filters">
					<X size={20} />
				</button>
			</div>
			
			<div class="filter-content">
				<!-- Collections -->
				<div class="filter-group">
					<h3>{m['search.categories']()}</h3>
					<div class="row-wrap">
						{#each collections as collection}
							<button 
								class="filter-button {filters.selectedCollection === collection ? 'active' : ''}"
								aria-pressed={filters.selectedCollection === collection}
								onclick={() => updateFilters({ selectedCollection: filters.selectedCollection === collection ? null : collection })}
							>
								{collection}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Condition -->
				<div class="filter-group">
					<h3>{m['product.condition']()}</h3>
					<div class="row-wrap">
						{#each conditions as condition}
							<button 
								class="filter-button {filters.selectedCondition === condition ? 'active' : ''}"
								aria-pressed={filters.selectedCondition === condition}
								onclick={() => updateFilters({ selectedCondition: filters.selectedCondition === condition ? null : condition })}
							>
								{condition}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Brand -->
				<div class="filter-group">
					<h3>{m['product.brand']()}</h3>
					<div class="row-wrap">
						{#each brands as brand}
							<button 
								class="filter-button {filters.selectedBrand === brand ? 'active' : ''}"
								aria-pressed={filters.selectedBrand === brand}
								onclick={() => updateFilters({ selectedBrand: filters.selectedBrand === brand ? null : brand })}
							>
								{brand}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Size -->
				<div class="filter-group">
					<h3>{m['product.size']()}</h3>
					<div class="row-wrap small-gap">
						{#each sizes as size}
							<button 
								class="filter-button size-button {filters.selectedSize === size ? 'active' : ''}"
								aria-pressed={filters.selectedSize === size}
								onclick={() => updateFilters({ selectedSize: filters.selectedSize === size ? null : size })}
							>
								{size}
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Price Range -->
				<div class="filter-group">
					<h3>{m['product.price']()}</h3>
					<div class="price-inputs">
						<label class="visually-hidden" for="price-min">Minimum price</label>
						<input 
							id="price-min"
							type="number" 
							placeholder={m['common.min']?.() || 'Min'}
							class="price-input"
							value={filters.priceRange.min}
							aria-label="Minimum price"
							oninput={(e) => updateFilters({ 
								priceRange: { 
									...filters.priceRange, 
									min: parseInt(e.currentTarget.value) || 0 
								}
							})}
						/>
						<span class="price-separator" aria-hidden="true">–</span>
						<label class="visually-hidden" for="price-max">Maximum price</label>
						<input 
							id="price-max"
							type="number" 
							placeholder={m['common.max']?.() || 'Max'}
							class="price-input"
							value={filters.priceRange.max}
							aria-label="Maximum price"
							oninput={(e) => updateFilters({ 
								priceRange: { 
									...filters.priceRange, 
									max: parseInt(e.currentTarget.value) || 500 
								}
							})}
						/>
					</div>
				</div>
			</div>
			
			<div class="filter-actions">
				<button class="clear-button" onclick={handleClear}>
					{m['browse.clear_all']()}
				</button>
				<button class="apply-button" onclick={handleApply}>
					{m['search.apply_filters']()}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.filter-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-higher);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.filter-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		cursor: pointer;
		z-index: 0;
	}
	
	.filter-sheet {
		background: white;
		border-radius: 16px 16px 0 0;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-lg);
		animation: slideUp 0.3s ease;
		z-index: 1;
		position: relative;
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--color-border-primary);
		position: relative;
	}
	
	.filter-header::after {
		content: '';
		position: absolute;
		top: 0.5rem;
		left: 50%;
		transform: translateX(-50%);
		width: 2.25rem;
		height: 0.25rem;
		background: var(--color-border-primary);
		border-radius: 9999px;
	}
	
	.filter-header h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}
	
	.close-filters {
		width: 2rem;
		height: 2rem;
		background: var(--color-surface-tertiary);
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--color-text-secondary);
	}
	
	.close-filters:hover {
		background: var(--color-border-primary);
		color: var(--color-text-primary);
	}
	
	.filter-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.5rem;
	}
	
	.filter-group {
		margin-bottom: 1.5rem;
	}
	
	.filter-group h3 {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.row-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.row-wrap.small-gap {
		gap: 0.375rem;
	}
	
	.filter-button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border-primary);
		background: white;
		border-radius: 9999px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	
	.filter-button:hover {
		border-color: var(--color-border-primary);
	}
	
	.filter-button.active {
		background: var(--color-interactive-primary);
		border-color: var(--color-interactive-primary);
		color: white;
	}
	
	.size-button {
		min-width: 2.5rem;
		padding: 0.5rem 0.75rem;
	}
	
	.price-inputs {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.price-input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		background: white;
	}
	
	.price-input:focus {
		outline: none;
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.price-separator {
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	
	.filter-actions {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	
	.clear-button {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border: 1px solid var(--color-border-primary);
		background: white;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.clear-button:hover {
		background: var(--color-surface-secondary);
		border-color: var(--color-border-primary);
	}
	
	.apply-button {
		flex: 2;
		padding: 0.875rem 1.5rem;
		border: none;
		background: var(--color-interactive-primary);
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.apply-button:hover {
		background: var(--color-interactive-primary-hover);
	}

	/* Accessibility */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>