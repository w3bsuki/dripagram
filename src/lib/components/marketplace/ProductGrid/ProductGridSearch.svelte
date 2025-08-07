<script lang="ts">
	import { Search } from '@lucide/svelte';
	import type { ProductGridSearchProps } from './types';

	let { searchQuery, showCategories, onSearchChange, onCategoriesToggle }: ProductGridSearchProps = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onSearchChange(target.value);
	}

	function handleCategoriesClick() {
		onCategoriesToggle();
	}
</script>

<!-- Enhanced Controls with Categories and Search -->
<div class="search-controls">
	<div class="controls-container">
		<!-- Category Button -->
		<button
			class="category-btn"
			onclick={handleCategoriesClick}
			aria-label="Browse categories"
		>
			<span class="category-icon">🛍️</span>
			<span>Categories</span>
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" class:rotate={showCategories}>
				<path
					d="M4 6L8 10L12 6"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="divider"></div>

		<!-- Search Input -->
		<div class="search-section">
			<Search size={16} class="search-icon" />
			<input
				type="search"
				value={searchQuery}
				oninput={handleInput}
				placeholder="Search products..."
				class="search-input"
			/>
		</div>
	</div>
</div>

<style>
	.search-controls {
		margin-bottom: 1rem;
	}

	.controls-container {
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.category-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.25rem;
		background: none;
		border: none;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.category-btn:hover {
		background: var(--color-gray-50);
	}

	.category-btn:active {
		background: var(--color-gray-100);
	}

	.category-btn svg {
		transition: transform 0.2s;
		opacity: 0.6;
	}

	.category-btn svg.rotate {
		transform: rotate(180deg);
	}

	.category-icon {
		font-size: 1.125rem;
	}

	.divider {
		width: 1px;
		height: 24px;
		background: var(--color-border);
	}

	.search-section {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-section :global(.search-icon) {
		position: absolute;
		left: 16px;
		color: #8e8e8e;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		background: none;
		border: none;
		padding: 0.875rem 16px 0.875rem 44px;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		outline: none;
	}

	.search-input::placeholder {
		color: #8e8e8e;
	}

	/* Mobile responsiveness for new controls */
	@media (max-width: 640px) {
		.controls-container {
			font-size: 0.875rem;
		}

		.category-btn {
			padding: 0.75rem 1rem;
			font-size: 0.8rem;
		}

		.category-btn span:not(.category-icon) {
			display: none;
		}

		.search-input {
			font-size: 0.8rem;
			padding: 0.75rem 12px 0.75rem 36px;
		}

		.search-section :global(.search-icon) {
			left: 12px;
		}
	}
</style>