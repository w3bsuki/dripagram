<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	
	let {
		selectedCategory = null,
		selectedSubcategory = null,
		categories = [],
		subcategories = [],
		onCategoryChange,
		onSubcategoryChange
	}: {
		selectedCategory: string | null;
		selectedSubcategory: string | null;
		categories: Array<{id: string, name: string, emoji?: string}>;
		subcategories: Array<{id: string, name: string, emoji?: string}>;
		onCategoryChange: (categoryId: string | null) => void;
		onSubcategoryChange: (subcategoryId: string | null) => void;
	} = $props();

	// Fallback categories if none provided
	const fallbackCategories = [
		{ id: 'women', name: 'Women', emoji: '👩' },
		{ id: 'men', name: 'Men', emoji: '👨' },
		{ id: 'kids', name: 'Kids', emoji: '👶' },
		{ id: 'accessories', name: 'Accessories', emoji: '👜' }
	];
	
	// Fallback subcategories for each category
	const fallbackSubcategories: Record<string, Array<{id: string, name: string, emoji: string}>> = {
		men: [
			{ id: 'men-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'men-tops', name: 'T-Shirts', emoji: '👕' },
			{ id: 'men-jeans', name: 'Jeans', emoji: '👖' },
			{ id: 'men-jackets', name: 'Jackets', emoji: '🧥' },
			{ id: 'men-shorts', name: 'Shorts', emoji: '🩳' },
			{ id: 'men-accessories', name: 'Accessories', emoji: '⌚' }
		],
		women: [
			{ id: 'women-shoes', name: 'Shoes', emoji: '👠' },
			{ id: 'women-dresses', name: 'Dresses', emoji: '👗' },
			{ id: 'women-tops', name: 'Tops', emoji: '👚' },
			{ id: 'women-jeans', name: 'Jeans', emoji: '👖' },
			{ id: 'women-bags', name: 'Bags', emoji: '👜' },
			{ id: 'women-jewelry', name: 'Jewelry', emoji: '💍' },
			{ id: 'women-jackets', name: 'Jackets', emoji: '🧥' }
		],
		kids: [
			{ id: 'kids-clothes', name: 'Clothes', emoji: '👕' },
			{ id: 'kids-shoes', name: 'Shoes', emoji: '👟' },
			{ id: 'kids-toys', name: 'Toys', emoji: '🧸' },
			{ id: 'kids-accessories', name: 'Accessories', emoji: '🎒' }
		],
		accessories: [
			{ id: 'bags', name: 'Bags', emoji: '👜' },
			{ id: 'jewelry', name: 'Jewelry', emoji: '💍' },
			{ id: 'watches', name: 'Watches', emoji: '⌚' },
			{ id: 'hats', name: 'Hats', emoji: '👒' }
		]
	};
	
	// Use provided categories or fallback
	const activeCategories = categories.length > 0 ? categories : fallbackCategories;
	
	// Add "All" option to the beginning of categories
	const allCategories = [{ id: null, name: 'All', emoji: '🛍️' }, ...activeCategories];
	
	// Get subcategories for the selected category (use fallback if API data is empty)
	let activeSubcategories = $derived(selectedCategory 
		? (subcategories.length > 0 ? subcategories : (fallbackSubcategories[selectedCategory] || []))
		: []);
	
	// Debug logging
	console.log('CategoryPills - selectedCategory:', selectedCategory);
	console.log('CategoryPills - activeSubcategories:', activeSubcategories);

	function handleCategoryClick(categoryId: string | null) {
		if (categoryId === null) {
			// All category selected
			onCategoryChange(null);
			onSubcategoryChange(null);
		} else if (selectedCategory === categoryId) {
			// Clicking same category again - reset
			onCategoryChange(null);
			onSubcategoryChange(null);
		} else {
			onCategoryChange(categoryId);
			onSubcategoryChange(null);
		}
	}

	function handleBack() {
		onCategoryChange(null);
		onSubcategoryChange(null);
	}

	function handleSubcategoryClick(subcategoryId: string) {
		if (selectedSubcategory === subcategoryId) {
			onSubcategoryChange(null);
		} else {
			onSubcategoryChange(subcategoryId);
		}
	}
</script>

<div class="category-pills">
	<div class="pills-scroll">
		{#if !selectedCategory}
			<!-- Show main categories -->
			{#each allCategories as category}
				<button
					class="pill"
					class:active={category.id === null ? !selectedCategory : selectedCategory === category.id}
					class:all-pill={category.id === null}
					onclick={() => handleCategoryClick(category.id)}
				>
					{#if category.emoji}
						<span class="pill-emoji">{category.emoji}</span>
					{/if}
					<span>{category.name}</span>
				</button>
			{/each}
		{:else}
			<!-- Show subcategories with back button -->
			<button class="pill back-pill" onclick={handleBack}>
				<ChevronLeft size={16} />
				<span>Back</span>
			</button>
			
			{#each activeSubcategories as subcategory}
				<button
					class="pill subcategory-pill"
					class:active={selectedSubcategory === subcategory.id}
					onclick={() => handleSubcategoryClick(subcategory.id)}
				>
					<span class="pill-emoji">{subcategory.emoji}</span>
					<span>{subcategory.name}</span>
				</button>
			{/each}
		{/if}
	</div>
</div>

<style>
	.category-pills {
		padding: 12px 0;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.pills-scroll {
		display: flex;
		gap: 8px;
		padding: 0 16px;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.pills-scroll::-webkit-scrollbar {
		display: none;
	}

	.pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 16px;
		border: 1.5px solid #e5e7eb;
		border-radius: 24px;
		background: white;
		color: #374151;
		font-size: 15px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		flex-shrink: 0;
		transition: all 0.15s ease;
	}

	.pill:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.pill.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	.pill.all-pill.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	.back-pill {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.back-pill:hover {
		background: #e5e7eb;
	}

	.subcategory-pill {
		background: #fef3c7;
		border-color: #fbbf24;
		color: #92400e;
	}

	.subcategory-pill:hover {
		background: #fed7aa;
		border-color: #f59e0b;
	}

	.subcategory-pill.active {
		background: #f59e0b;
		color: white;
		border-color: #f59e0b;
	}

	.pill-emoji {
		font-size: 16px;
		line-height: 1;
	}

	@media (max-width: 768px) {
		.category-pills {
			padding: 8px 0;
		}

		.pill {
			padding: 6px 12px;
			font-size: 13px;
		}

		.pill-emoji {
			font-size: 14px;
		}
	}
</style>