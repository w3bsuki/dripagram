<script lang="ts">
	import type { ProductGridFiltersProps } from './types';

	let { showCategories, onCategorySelect, onFilterSelect }: ProductGridFiltersProps = $props();

	function handleCategorySelect(category: string) {
		onCategorySelect(category);
	}

	function handleFilterSelect(filter: string) {
		onFilterSelect(filter);
	}
</script>

<!-- Category Dropdown Menu -->
{#if showCategories}
	<div class="category-dropdown">
		<div class="dropdown-section">
			<h4 class="dropdown-label">Categories</h4>
			<div class="category-scroll">
				<button
					class="category-item"
					onclick={() => handleCategorySelect('women')}
				>
					<span class="cat-emoji">👗</span>
					<span>Women</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('men')}
				>
					<span class="cat-emoji">👔</span>
					<span>Men</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('shoes')}
				>
					<span class="cat-emoji">👟</span>
					<span>Shoes</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('bags')}
				>
					<span class="cat-emoji">👜</span>
					<span>Bags</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('accessories')}
				>
					<span class="cat-emoji">💍</span>
					<span>Accessories</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('kids')}
				>
					<span class="cat-emoji">👶</span>
					<span>Kids</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('vintage')}
				>
					<span class="cat-emoji">📿</span>
					<span>Vintage</span>
				</button>
				<button
					class="category-item"
					onclick={() => handleCategorySelect('luxury')}
				>
					<span class="cat-emoji">💎</span>
					<span>Luxury</span>
				</button>
			</div>
		</div>
		<div class="dropdown-section">
			<h4 class="dropdown-label">Quick Filters</h4>
			<div class="filter-scroll">
				<button
					class="filter-chip"
					onclick={() => handleFilterSelect('new')}
				>
					🏷️ New with tags
				</button>
				<button
					class="filter-chip"
					onclick={() => handleFilterSelect('under50')}
				>
					💰 Under 50лв
				</button>
				<button
					class="filter-chip"
					onclick={() => handleFilterSelect('trending')}
				>
					🔥 Trending
				</button>
				<button
					class="filter-chip"
					onclick={() => handleFilterSelect('sale')}
				>
					🎯 On Sale
				</button>
				<button
					class="filter-chip"
					onclick={() => handleFilterSelect('verified')}
				>
					✅ Verified Only
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Category Dropdown */
	.category-dropdown {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem 0;
		margin-bottom: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		animation: slideDown 0.2s ease;
		overflow: hidden;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-section {
		margin-bottom: 1rem;
	}

	.dropdown-section:last-child {
		margin-bottom: 0;
	}

	.dropdown-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 1rem 0.5rem;
	}

	.category-scroll {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.category-scroll::-webkit-scrollbar {
		display: none;
	}

	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: #f8f8f8;
		border: 1px solid transparent;
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
		min-width: 80px;
	}

	.category-item:hover {
		background: white;
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.category-item:active {
		transform: translateY(0);
	}

	.cat-emoji {
		font-size: 1.5rem;
	}

	.filter-scroll {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.filter-scroll::-webkit-scrollbar {
		display: none;
	}

	.filter-chip {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.filter-chip:hover {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		transform: translateY(-1px);
	}

	.filter-chip:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.category-item {
			min-width: 70px;
			padding: 0.5rem;
			font-size: 0.75rem;
		}

		.cat-emoji {
			font-size: 1.25rem;
		}
	}
</style>