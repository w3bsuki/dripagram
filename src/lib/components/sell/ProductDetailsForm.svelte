<script lang="ts">
	import { CONDITIONS, SIZES, BRANDS } from '$lib/data/categories';
	import type { ProductDetailsFormProps } from './types';
	import * as m from '$lib/paraglide/messages';

	let {
		title,
		description,
		price,
		brand,
		size,
		condition,
		color,
		material,
		selectedCategory,
		showCustomBrand,
		customBrand,
		onFieldChange,
		onCustomBrandToggle,
	}: ProductDetailsFormProps = $props();

	function getSizesForCategory() {
		if (selectedCategory.includes('shoes')) return SIZES.shoes;
		if (selectedCategory.includes('clothing')) return SIZES.clothing;
		return SIZES.accessories;
	}

	// Get translated condition name
	function getConditionName(conditionId: string) {
		return m[`conditions.${conditionId}`]?.() || conditionId;
	}
</script>

<div class="details-form">
	<div class="form-header">
		<h2 class="form-title">{m['sell.item_details']()}</h2>
		<p class="form-subtitle">{m['sell.tell_buyers']()}</p>
	</div>

	<div class="form-grid">
		<!-- Title -->
		<div class="field-group full-width">
			<label for="title" class="field-label">{m['sell.title_label']()} *</label>
			<input
				id="title"
				type="text"
				value={title}
				oninput={(e) => onFieldChange('title', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.title_placeholder_details']()}
				maxlength="100"
				class="form-input"
				required
			/>
			<span class="char-counter">{title?.length || 0}/100</span>
		</div>

		<!-- Description -->
		<div class="field-group full-width">
			<label for="description" class="field-label">{m['sell.description_label']()}</label>
			<textarea
				id="description"
				value={description}
				oninput={(e) => onFieldChange('description', (e.target as HTMLTextAreaElement).value)}
				placeholder={m['sell.description_placeholder_details']()}
				maxlength="500"
				rows="4"
				class="form-textarea"
			></textarea>
			<span class="char-counter">{description?.length || 0}/500</span>
		</div>

		<!-- Price -->
		<div class="field-group">
			<label for="price" class="field-label">{m['sell.price_bgn']()}</label>
			<input
				id="price"
				type="number"
				value={price}
				oninput={(e) =>
					onFieldChange('price', parseFloat((e.target as HTMLInputElement).value) || 0)}
				placeholder="0"
				min="0"
				step="0.01"
				class="form-input"
				required
			/>
		</div>

		<!-- Condition -->
		<div class="field-group">
			<label for="condition" class="field-label">{m['sell.condition_label']()} *</label>
			<select
				id="condition"
				value={condition}
				onchange={(e) => onFieldChange('condition', (e.target as HTMLSelectElement).value)}
				class="form-select"
			>
				{#each CONDITIONS as conditionOption}
					<option value={conditionOption.id}>
						{conditionOption.emoji}
						{getConditionName(conditionOption.id)}
					</option>
				{/each}
			</select>
		</div>

		<!-- Brand -->
		<div class="field-group">
			<label for="brand" class="field-label">{m['sell.brand_label']()}</label>
			{#if !showCustomBrand}
				<select
					id="brand"
					value={brand}
					onchange={(e) => onFieldChange('brand', (e.target as HTMLSelectElement).value)}
					class="form-select"
				>
					<option value="">{m['sell.select_brand']()}</option>
					{#each BRANDS as brandOption}
						<option value={brandOption}>{brandOption}</option>
					{/each}
				</select>
				{#if brand === 'Other'}
					<button
						type="button"
						onclick={() => onCustomBrandToggle(true)}
						class="toggle-button"
					>
						{m['sell.enter_custom_brand']()}
					</button>
				{/if}
			{:else}
				<input
					type="text"
					value={customBrand}
					oninput={(e) => onFieldChange('customBrand', (e.target as HTMLInputElement).value)}
					placeholder={m['sell.enter_brand_name']()}
					class="form-input"
				/>
				<button
					type="button"
					onclick={() => onCustomBrandToggle(false)}
					class="toggle-button"
				>
					{m['sell.choose_from_list']()}
				</button>
			{/if}
		</div>

		<!-- Size -->
		<div class="field-group">
			<label for="size" class="field-label">{m['sell.size_label']()}</label>
			<select
				id="size"
				value={size}
				onchange={(e) => onFieldChange('size', (e.target as HTMLSelectElement).value)}
				class="form-select"
			>
				<option value="">{m['sell.select_size']()}</option>
				{#each getSizesForCategory() as sizeOption}
					<option value={sizeOption}>{sizeOption}</option>
				{/each}
			</select>
		</div>

		<!-- Color -->
		<div class="field-group">
			<label for="color" class="field-label">{m['sell.color_label']()}</label>
			<input
				id="color"
				type="text"
				value={color}
				oninput={(e) => onFieldChange('color', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.color_placeholder']()}
				class="form-input"
			/>
		</div>

		<!-- Material -->
		<div class="field-group">
			<label for="material" class="field-label">{m['sell.material_label']()}</label>
			<input
				id="material"
				type="text"
				value={material}
				oninput={(e) => onFieldChange('material', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.material_placeholder']()}
				class="form-input"
			/>
		</div>
	</div>
</div>

<style>
	.details-form {
		margin-bottom: var(--space-8);
	}

	.form-header {
		margin-bottom: var(--space-8);
		text-align: center;
	}

	.form-title {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.form-subtitle {
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-base);
		line-height: 1.4;
		margin: 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-6);
	}

	.field-group {
		display: flex;
		flex-direction: column;
	}

	.field-group.full-width {
		grid-column: 1 / -1;
	}

	.field-label {
		margin-bottom: var(--space-2);
		display: block;
		font-weight: 500;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		line-height: 1.4;
	}

	/* Form Controls */
	.form-input,
	.form-textarea,
	.form-select {
		width: 100%;
		border-radius: var(--border-radius-lg);
		border: 2px solid var(--color-border-primary);
		padding: var(--space-3);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		line-height: 1.5;
		color: var(--color-text-primary);
		background: var(--color-surface-primary);
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		-webkit-tap-highlight-color: transparent;
		box-shadow: var(--shadow-xs);
	}

	.form-input:hover,
	.form-textarea:hover,
	.form-select:hover {
		border-color: var(--color-interactive-primary);
		box-shadow: var(--shadow-sm);
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), var(--shadow-sm);
		background: var(--color-surface-primary);
	}

	.form-input:invalid,
	.form-textarea:invalid,
	.form-select:invalid {
		border-color: var(--color-surface-error);
	}

	.form-input:invalid:focus,
	.form-textarea:invalid:focus,
	.form-select:invalid:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), var(--shadow-sm);
	}

	/* Textarea specific styles */
	.form-textarea {
		resize: vertical;
		min-height: 100px;
		font-family: var(--font-family-sans);
	}

	/* Select specific styles */
	.form-select {
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
		background-position: right var(--space-3) center;
		background-repeat: no-repeat;
		background-size: 16px 16px;
		padding-right: var(--space-10);
	}

	.form-select option {
		background: var(--color-surface-primary);
		color: var(--color-text-primary);
		padding: var(--space-2);
	}

	/* Character Counter */
	.char-counter {
		margin-top: var(--space-1);
		display: block;
		text-align: right;
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		font-family: var(--font-family-sans);
		font-weight: 400;
	}

	/* Toggle Button */
	.toggle-button {
		margin-top: var(--space-2);
		background: none;
		border: none;
		color: var(--color-interactive-primary);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		font-weight: 500;
		text-decoration: underline;
		cursor: pointer;
		padding: var(--space-1) 0;
		border-radius: var(--border-radius-sm);
		transition: all var(--duration-fast) var(--ease-out);
		-webkit-tap-highlight-color: transparent;
		align-self: flex-start;
	}

	.toggle-button:hover {
		color: var(--color-interactive-primary-hover);
		background: var(--color-surface-brand-subtle);
		padding: var(--space-1) var(--space-2);
		text-decoration: none;
	}

	.toggle-button:focus-visible {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.toggle-button:active {
		transform: scale(0.98);
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.form-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.form-title {
			font-size: var(--font-size-3xl);
		}

		.form-subtitle {
			font-size: var(--font-size-lg);
		}
	}

	/* Enhanced mobile touch targets */
	@media (max-width: 767px) {
		.form-input,
		.form-textarea,
		.form-select {
			padding: var(--space-4) var(--space-3);
			font-size: 16px; /* Prevents zoom on iOS */
		}
		
		.toggle-button {
			padding: var(--space-2) var(--space-1);
			margin-top: var(--space-3);
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.form-input,
		.form-textarea,
		.form-select {
			border-width: 3px;
		}
		
		.form-input:focus,
		.form-textarea:focus,
		.form-select:focus {
			box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.form-input,
		.form-textarea,
		.form-select,
		.toggle-button {
			transition-duration: 0.01ms;
		}
		
		.toggle-button:active {
			transform: none;
		}
	}
</style>
