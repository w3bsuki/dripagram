<script lang="ts">
	import type { ShippingOptionsProps } from './types';
	import * as m from '$lib/paraglide/messages';

	let {
		location,
		shippingAvailable,
		shippingPrice,
		tags,
		onLocationChange,
		onShippingToggle,
		onShippingPriceChange,
		onTagAdd,
		onTagRemove,
	}: ShippingOptionsProps = $props();

	let tagInput = $state('');

	function handleTagKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const value = tagInput.trim();
			if (value) {
				onTagAdd(value);
				tagInput = '';
			}
		}
	}
</script>

<div class="shipping-options">
	<div class="options-header">
		<h2 class="options-title">{m['sell.shipping_location']()}</h2>
		<p class="options-subtitle">{m['sell.let_buyers_know']()}</p>
	</div>

	<div class="options-grid">
		<!-- Location -->
		<div class="field-group full-width">
			<label for="location" class="field-label">{m['sell.location_label']()}</label>
			<input
				id="location"
				type="text"
				value={location}
				oninput={(e) => onLocationChange((e.target as HTMLInputElement).value)}
				placeholder={m['sell.location_placeholder']()}
				class="form-input"
			/>
		</div>

		<!-- Shipping Available -->
		<div class="field-group full-width">
			<label class="checkbox-label">
				<input
					type="checkbox"
					checked={shippingAvailable}
					onchange={(e) => onShippingToggle((e.target as HTMLInputElement).checked)}
					class="checkbox-input"
				/>
				<span class="checkbox-text">{m['sell.offer_shipping']()}</span>
			</label>
		</div>

		<!-- Shipping Price -->
		{#if shippingAvailable}
			<div class="field-group">
				<label for="shipping_price" class="field-label">{m['sell.shipping_cost_bgn']()}</label>
				<input
					id="shipping_price"
					type="number"
					value={shippingPrice}
					oninput={(e) =>
						onShippingPriceChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
					placeholder="5"
					min="0"
					step="0.01"
					class="form-input"
				/>
			</div>
		{/if}

		<!-- Tags -->
		<div class="field-group full-width">
			<label for="tags" class="field-label">{m['sell.tags_optional']()}</label>
			<div class="tags-container">
				<input
					id="tags"
					type="text"
					bind:value={tagInput}
					placeholder={m['sell.add_tags_enter']()}
					class="form-input"
					onkeydown={handleTagKeydown}
				/>
				{#if tags && tags.length > 0}
					<div class="tags-list">
						{#each tags as tag}
							<span class="tag-item">
								{tag}
								<button
									type="button"
									onclick={() => onTagRemove(tag)}
									class="tag-remove"
								>
									×
								</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.shipping-options {
		margin-bottom: var(--space-8);
	}

	.options-header {
		margin-bottom: var(--space-8);
		text-align: center;
	}

	.options-title {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.options-subtitle {
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-base);
		line-height: 1.4;
		margin: 0;
	}

	.options-grid {
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

	/* Form Input */
	.form-input {
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

	.form-input:hover {
		border-color: var(--color-interactive-primary);
		box-shadow: var(--shadow-sm);
	}

	.form-input:focus {
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), var(--shadow-sm);
		background: var(--color-surface-primary);
	}

	/* Checkbox */
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--border-radius-lg);
		transition: all var(--duration-fast) var(--ease-out);
		-webkit-tap-highlight-color: transparent;
	}

	.checkbox-label:hover {
		background: var(--color-surface-secondary);
	}

	.checkbox-input {
		height: 20px;
		width: 20px;
		border-radius: var(--border-radius-sm);
		border: 2px solid var(--color-border-primary);
		background: var(--color-surface-primary);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		appearance: none;
		position: relative;
		flex-shrink: 0;
		box-shadow: var(--shadow-xs);
	}

	.checkbox-input:hover {
		border-color: var(--color-interactive-primary);
		box-shadow: var(--shadow-sm);
	}

	.checkbox-input:focus {
		outline: 3px solid rgba(37, 99, 235, 0.2);
		outline-offset: 2px;
	}

	.checkbox-input:checked {
		background: var(--color-interactive-primary);
		border-color: var(--color-interactive-primary);
		box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
	}

	.checkbox-input:checked::after {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 12px;
		font-weight: 600;
		line-height: 1;
	}

	.checkbox-text {
		font-weight: 500;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-base);
		line-height: 1.4;
	}

	/* Tags */
	.tags-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tag-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		border-radius: var(--border-radius-full);
		background: var(--color-interactive-primary);
		padding: var(--space-1) var(--space-3);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: white;
		font-family: var(--font-family-sans);
		box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.tag-item:hover {
		background: var(--color-interactive-primary-hover);
		box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
		transform: translateY(-1px);
	}

	.tag-remove {
		background: none;
		border: none;
		color: white;
		font-size: 18px;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		transition: all var(--duration-fast) var(--ease-out);
		-webkit-tap-highlight-color: transparent;
	}

	.tag-remove:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.tag-remove:focus-visible {
		outline: 2px solid white;
		outline-offset: 2px;
	}

	.tag-remove:active {
		transform: scale(0.9);
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.options-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.options-title {
			font-size: var(--font-size-3xl);
		}

		.options-subtitle {
			font-size: var(--font-size-lg);
		}
	}

	/* Enhanced mobile touch targets */
	@media (max-width: 767px) {
		.form-input {
			padding: var(--space-4) var(--space-3);
			font-size: 16px; /* Prevents zoom on iOS */
		}
		
		.checkbox-input {
			height: 24px;
			width: 24px;
		}
		
		.checkbox-label {
			padding: var(--space-3);
		}
		
		.tag-item {
			padding: var(--space-2) var(--space-3);
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.form-input,
		.checkbox-input {
			border-width: 3px;
		}
		
		.form-input:focus {
			box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
		}
		
		.tag-item {
			border: 2px solid white;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.form-input,
		.checkbox-input,
		.checkbox-label,
		.tag-item,
		.tag-remove {
			transition-duration: 0.01ms;
		}
		
		.tag-item:hover,
		.tag-remove:hover,
		.tag-remove:active {
			transform: none;
		}
	}
</style>
