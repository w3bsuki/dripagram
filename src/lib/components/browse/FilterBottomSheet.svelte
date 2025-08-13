<script lang="ts">
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import * as m from '$lib/paraglide/messages';

	interface FilterState {
		selectedCondition: string | null;
		selectedBrand: string | null;
		selectedSize: string | null;
		priceRange: { min: number; max: number };
		selectedCollection: string | null;
	}

	interface Category {
		id: string;
		name: string;
		emoji: string;
	}

	let {
		isOpen,
		filters,
		selectedCategory,
		selectedSubcategory,
		categories,
		onClose,
		onApplyFilters,
		onClearFilters
	}: {
		isOpen: boolean;
		filters: FilterState;
		selectedCategory: string | null;
		selectedSubcategory: string | null;
		categories: Category[];
		onClose: () => void;
		onApplyFilters: (filters: FilterState, category: string | null, subcategory: string | null) => void;
		onClearFilters: () => void;
	} = $props();

	// Local state for filters (to allow apply/cancel)
	let localFilters = $state({ ...filters });
	let localCategory = $state(selectedCategory);
	let localSubcategory = $state(selectedSubcategory);

	// Reset local state when opening
	$effect(() => {
		if (isOpen) {
			localFilters = { ...filters };
			localCategory = selectedCategory;
			localSubcategory = selectedSubcategory;
		}
	});

	// Filter options
	const conditions = [
		{ id: 'new-tags', name: 'New with tags', emoji: '🏷️' },
		{ id: 'like-new', name: 'Like new', emoji: '✨' },
		{ id: 'good', name: 'Good', emoji: '👍' },
		{ id: 'fair', name: 'Fair', emoji: '🤝' },
		{ id: 'vintage', name: 'Vintage', emoji: '📿' }
	];

	const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
	const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43'];
	const popularBrands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Pull & Bear'];

	function handleCategorySelect(categoryId: string | null) {
		localCategory = localCategory === categoryId ? null : categoryId;
		localSubcategory = null; // Clear subcategory when changing category
	}

	function handleConditionSelect(conditionId: string) {
		localFilters.selectedCondition = localFilters.selectedCondition === conditionId ? null : conditionId;
	}

	function handleSizeSelect(size: string) {
		localFilters.selectedSize = localFilters.selectedSize === size ? null : size;
	}

	function handleBrandSelect(brand: string) {
		localFilters.selectedBrand = localFilters.selectedBrand === brand ? null : brand;
	}

	function handleApply() {
		onApplyFilters(localFilters, localCategory, localSubcategory);
		onClose();
	}

	function handleClear() {
		localFilters = {
			selectedCondition: null,
			selectedBrand: null,
			selectedSize: null,
			priceRange: { min: 0, max: 500 },
			selectedCollection: null
		};
		localCategory = null;
		localSubcategory = null;
		
		onClearFilters();
		onClose();
	}

	// Count active filters
	const activeFiltersCount = $derived(() => {
		let count = 0;
		if (localCategory) count++;
		if (localSubcategory) count++;
		if (localFilters.selectedCondition) count++;
		if (localFilters.selectedBrand) count++;
		if (localFilters.selectedSize) count++;
		if (localFilters.priceRange.min !== 0) count++;
		if (localFilters.priceRange.max !== 500) count++;
		return count;
	});
</script>

<BottomSheet {isOpen} {onClose} title="Filter Results" height="half">
	<div class="filter-content">
		<!-- Categories -->
		<div class="filter-section">
			<h3 class="section-title">Categories</h3>
			<div class="options-grid">
				{#each categories as category}
					<button
						class="option-button {localCategory === category.id ? 'active' : ''}"
						onclick={() => handleCategorySelect(category.id)}
					>
						<span class="option-emoji">{category.emoji}</span>
						<span class="option-text">{category.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Condition -->
		<div class="filter-section">
			<h3 class="section-title">Condition</h3>
			<div class="options-grid">
				{#each conditions as condition}
					<button
						class="option-button {localFilters.selectedCondition === condition.id ? 'active' : ''}"
						onclick={() => handleConditionSelect(condition.id)}
					>
						<span class="option-emoji">{condition.emoji}</span>
						<span class="option-text">{condition.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Size -->
		<div class="filter-section">
			<h3 class="section-title">Size</h3>
			<div class="size-section">
				<h4 class="size-category">Clothing</h4>
				<div class="size-grid">
					{#each clothingSizes as size}
						<button
							class="size-button {localFilters.selectedSize === size ? 'active' : ''}"
							onclick={() => handleSizeSelect(size)}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>
			<div class="size-section">
				<h4 class="size-category">Shoes</h4>
				<div class="size-grid">
					{#each shoeSizes as size}
						<button
							class="size-button {localFilters.selectedSize === size ? 'active' : ''}"
							onclick={() => handleSizeSelect(size)}
						>
							{size}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Price Range -->
		<div class="filter-section">
			<h3 class="section-title">Price Range</h3>
			<div class="price-inputs">
				<div class="price-input-group">
					<label for="price-min">Min</label>
					<input
						id="price-min"
						type="number"
						bind:value={localFilters.priceRange.min}
						placeholder="0"
						class="price-input"
						min="0"
					/>
					<span class="currency">лв</span>
				</div>
				<div class="price-separator">-</div>
				<div class="price-input-group">
					<label for="price-max">Max</label>
					<input
						id="price-max"
						type="number"
						bind:value={localFilters.priceRange.max}
						placeholder="500"
						class="price-input"
						min="0"
					/>
					<span class="currency">лв</span>
				</div>
			</div>
		</div>

		<!-- Brand -->
		<div class="filter-section">
			<h3 class="section-title">Brand</h3>
			<div class="brand-input-container">
				<input
					type="text"
					bind:value={localFilters.selectedBrand}
					placeholder="Search brands..."
					class="brand-input"
				/>
			</div>
			<div class="brand-suggestions">
				{#each popularBrands as brand}
					<button
						class="brand-pill {localFilters.selectedBrand === brand ? 'active' : ''}"
						onclick={() => handleBrandSelect(brand)}
					>
						{brand}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Footer Actions -->
	<div class="filter-footer">
		<button class="clear-button" onclick={handleClear} disabled={activeFiltersCount() === 0}>
			Clear All
		</button>
		<button class="apply-button" onclick={handleApply}>
			Apply {activeFiltersCount() > 0 ? `(${activeFiltersCount()})` : ''}
		</button>
	</div>
</BottomSheet>

<style>
	.filter-content {
		padding: 20px;
		padding-bottom: 80px; /* Space for footer */
	}

	.filter-section {
		margin-bottom: 32px;
	}

	.filter-section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #111827;
		margin-bottom: 16px;
		margin-top: 0;
	}

	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 12px;
	}

	.option-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 8px;
		border: 1.5px solid #e5e7eb;
		border-radius: 12px;
		background: white;
		color: #374151;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		min-height: 60px;
		justify-content: center;
	}

	.option-button:hover {
		border-color: #d1d5db;
		background: #f9fafb;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.option-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
		box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
	}

	.option-emoji {
		font-size: 20px;
		line-height: 1;
	}

	.option-text {
		text-align: center;
		line-height: 1.2;
	}

	/* Size Section */
	.size-section {
		margin-bottom: 20px;
	}

	.size-section:last-child {
		margin-bottom: 0;
	}

	.size-category {
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 8px;
		margin-top: 0;
		text-transform: uppercase;
	}

	.size-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: 8px;
	}

	.size-button {
		padding: 8px 4px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		min-height: 36px;
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

	/* Price Range */
	.price-inputs {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.price-input-group {
		flex: 1;
		position: relative;
	}

	.price-input-group label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		margin-bottom: 4px;
	}

	.price-input {
		width: 100%;
		padding: 8px 32px 8px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 14px;
		color: #374151;
		background: white;
		transition: border-color 0.15s ease;
	}

	.price-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.currency {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		color: #6b7280;
		pointer-events: none;
		margin-top: 8px;
	}

	.price-separator {
		font-weight: 500;
		color: #6b7280;
		margin-top: 20px;
	}

	/* Brand Section */
	.brand-input-container {
		margin-bottom: 12px;
	}

	.brand-input {
		width: 100%;
		padding: 10px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		color: #374151;
		background: white;
		transition: border-color 0.15s ease;
	}

	.brand-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.brand-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.brand-pill {
		padding: 6px 12px;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.brand-pill:hover {
		background: #e5e7eb;
		border-color: #d1d5db;
	}

	.brand-pill.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	/* Footer */
	.filter-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 16px 20px;
		background: white;
		border-top: 1px solid #f1f3f4;
		display: flex;
		gap: 12px;
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
	}

	.clear-button {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		color: #6b7280;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-button:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #d1d5db;
		color: #374151;
	}

	.clear-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.apply-button {
		flex: 2;
		padding: 12px 16px;
		border: none;
		border-radius: 8px;
		background: #3b82f6;
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.apply-button:hover {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.apply-button:active {
		transform: translateY(0);
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.filter-content {
			padding: 16px;
			padding-bottom: 80px;
		}

		.filter-footer {
			padding: 12px 16px;
		}

		.options-grid {
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
			gap: 8px;
		}

		.option-button {
			padding: 10px 6px;
			min-height: 50px;
			font-size: 12px;
		}

		.option-emoji {
			font-size: 18px;
		}

		.section-title {
			font-size: 15px;
			margin-bottom: 12px;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.option-button,
		.size-button,
		.brand-pill,
		.apply-button {
			transition: none;
		}
	}
</style>