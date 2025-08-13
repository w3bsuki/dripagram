<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Category {
		id: string;
		name: string;
		emoji: string;
	}

	interface Subcategory {
		id: string;
		name: string;
		emoji: string;
	}

	let {
		selectedCategory,
		selectedSubcategory,
		onCategoryChange,
		onSubcategoryChange
	}: {
		selectedCategory: string | null;
		selectedSubcategory: string | null;
		onCategoryChange: (categoryId: string | null) => void;
		onSubcategoryChange: (subcategoryId: string | null) => void;
	} = $props();

	// Primary categories
	const categories: Category[] = [
		{ id: 'men', name: m['browse.men'](), emoji: '👨' },
		{ id: 'women', name: m['browse.women'](), emoji: '👩' },
		{ id: 'kids', name: m['browse.kids'](), emoji: '👶' },
		{ id: 'pets', name: m['browse.pets'](), emoji: '🐾' }
	];

	// Subcategories mapping
	const subcategories: Record<string, Subcategory[]> = {
		men: [
			{ id: 'mens-shoes', name: m['browse.mens_shoes'](), emoji: '👟' },
			{ id: 'mens-tshirts', name: m['browse.mens_tshirts'](), emoji: '👕' },
			{ id: 'mens-jackets', name: m['browse.mens_jackets'](), emoji: '🧥' },
			{ id: 'mens-jeans', name: m['browse.mens_jeans'](), emoji: '👖' },
			{ id: 'mens-bags', name: m['browse.mens_bags'](), emoji: '🎒' },
			{ id: 'mens-accessories', name: m['browse.mens_accessories'](), emoji: '🕶️' },
			{ id: 'mens-suits', name: m['browse.mens_suits'](), emoji: '🤵' },
			{ id: 'mens-shirts', name: m['browse.mens_shirts'](), emoji: '👔' }
		],
		women: [
			{ id: 'womens-shoes', name: m['browse.womens_shoes'](), emoji: '👠' },
			{ id: 'womens-dresses', name: m['browse.womens_dresses'](), emoji: '👗' },
			{ id: 'womens-tops', name: m['browse.womens_tops'](), emoji: '👚' },
			{ id: 'womens-jeans', name: m['browse.womens_jeans'](), emoji: '👖' },
			{ id: 'womens-bags', name: m['browse.womens_bags'](), emoji: '👜' },
			{ id: 'womens-accessories', name: m['browse.womens_accessories'](), emoji: '💍' },
			{ id: 'womens-jackets', name: m['browse.womens_jackets'](), emoji: '🧥' },
			{ id: 'womens-skirts', name: m['browse.womens_skirts'](), emoji: '👗' }
		],
		kids: [
			{ id: 'kids-shoes', name: m['browse.kids_shoes'](), emoji: '👟' },
			{ id: 'kids-clothes', name: m['browse.kids_clothes'](), emoji: '👕' },
			{ id: 'kids-toys', name: m['browse.kids_toys'](), emoji: '🧸' },
			{ id: 'kids-accessories', name: m['browse.kids_accessories'](), emoji: '🎒' },
			{ id: 'baby-clothes', name: m['browse.baby_clothes'](), emoji: '👶' },
			{ id: 'toddler-clothes', name: m['browse.toddler_clothes'](), emoji: '🧒' }
		],
		pets: [
			{ id: 'pet-clothes', name: 'Clothes', emoji: '🦺' },
			{ id: 'pet-accessories', name: 'Accessories', emoji: '🦴' },
			{ id: 'pet-toys', name: 'Toys', emoji: '🎾' },
			{ id: 'pet-beds', name: 'Beds', emoji: '🛏️' },
			{ id: 'pet-food', name: 'Food & Treats', emoji: '🥘' }
		]
	};

	// Current subcategories based on selected category
	const currentSubcategories = $derived(
		selectedCategory ? subcategories[selectedCategory] || [] : []
	);

	function handleCategoryClick(categoryId: string) {
		if (selectedCategory === categoryId) {
			// If clicking the same category, clear selection
			onCategoryChange(null);
			onSubcategoryChange(null);
		} else {
			// Select new category and clear subcategory
			onCategoryChange(categoryId);
			onSubcategoryChange(null);
		}
	}

	function handleSubcategoryClick(subcategoryId: string) {
		if (selectedSubcategory === subcategoryId) {
			// If clicking the same subcategory, clear selection
			onSubcategoryChange(null);
		} else {
			// Select new subcategory
			onSubcategoryChange(subcategoryId);
		}
	}
</script>

<div class="category-pills">
	<!-- Primary Categories -->
	<div class="pills-container">
		<div class="pills-scroll" role="tablist">
			{#each categories as category}
				<button
					class="pill {selectedCategory === category.id ? 'active' : ''}"
					onclick={() => handleCategoryClick(category.id)}
					role="tab"
					aria-selected={selectedCategory === category.id}
					aria-controls="subcategories"
				>
					<span class="pill-emoji">{category.emoji}</span>
					<span class="pill-text">{category.name}</span>
					{#if selectedCategory === category.id && currentSubcategories.length > 0}
						<ChevronDown size={14} class="pill-chevron active" />
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Subcategories (morphing section) -->
	{#if selectedCategory && currentSubcategories.length > 0}
		<div 
			class="subcategories-container" 
			id="subcategories"
			role="tabpanel"
			aria-labelledby="category-{selectedCategory}"
		>
			<div class="pills-scroll">
				{#each currentSubcategories as subcategory}
					<button
						class="pill subcategory {selectedSubcategory === subcategory.id ? 'active' : ''}"
						onclick={() => handleSubcategoryClick(subcategory.id)}
						role="tab"
						aria-selected={selectedSubcategory === subcategory.id}
					>
						<span class="pill-emoji">{subcategory.emoji}</span>
						<span class="pill-text">{subcategory.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.category-pills {
		background: white;
		border-bottom: 1px solid #f1f3f4;
		position: relative;
	}

	.pills-container {
		padding: 16px 20px;
		overflow: hidden;
	}

	.pills-scroll {
		display: flex;
		gap: 10px;
		overflow-x: auto;
		overflow-y: visible;
		padding-bottom: 2px;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		scroll-behavior: smooth;
		align-items: center;
		/* Enhanced momentum scrolling */
		scroll-snap-type: x proximity;
		scroll-padding-left: 20px;
		scroll-padding-right: 20px;
	}

	.pills-scroll::-webkit-scrollbar {
		display: none;
	}

	/* Fade edges effect */
	.pills-container::after,
	.pills-container::before {
		content: '';
		position: absolute;
		top: 16px;
		bottom: 18px;
		width: 20px;
		z-index: 2;
		pointer-events: none;
	}

	.pills-container::before {
		left: 0;
		background: linear-gradient(to right, white, transparent);
	}

	.pills-container::after {
		right: 0;
		background: linear-gradient(to left, white, transparent);
	}

	.pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: 1.5px solid #e5e7eb;
		border-radius: 24px;
		background: white;
		color: #4a5568;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.2s ease-out;
		min-height: 40px;
		flex-shrink: 0;
		/* Enhanced scroll snapping */
		scroll-snap-align: start;
		scroll-margin-left: 10px;
		/* Touch optimization */
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		/* Hardware acceleration */
		will-change: transform;
		transform: translateZ(0);
	}

	.pill:hover {
		border-color: #cbd5e0;
		background: #f9fafb;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.pill.active {
		background: #111827;
		color: white;
		border-color: #111827;
		box-shadow: 0 2px 12px rgba(17, 24, 39, 0.2);
	}

	.pill.subcategory {
		padding: 6px 12px;
		font-size: 13px;
		min-height: 32px;
		border-color: #e5e7eb;
		background: #f8fafc;
	}

	.pill.subcategory:hover {
		background: #e2e8f0;
		border-color: #cbd5e0;
	}

	.pill.subcategory.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	.pill-emoji {
		font-size: 16px;
		line-height: 1;
	}

	.pill.subcategory .pill-emoji {
		font-size: 14px;
	}

	.pill-text {
		font-weight: 500;
	}

	.pill-chevron {
		transition: transform 0.2s ease-out;
		opacity: 0.8;
	}

	.pill-chevron.active {
		transform: rotate(180deg);
		opacity: 1;
	}

	/* Subcategories section */
	.subcategories-container {
		padding: 12px 20px 16px 20px;
		border-top: 1px solid #f1f3f4;
		background: #fafbfc;
		animation: slideDown 0.2s ease-out;
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.pills-container {
			padding: 12px 16px;
		}

		.subcategories-container {
			padding: 8px 16px 12px 16px;
		}

		.pill {
			padding: 6px 12px;
			font-size: 13px;
			gap: 4px;
			min-height: 36px;
		}

		.pill.subcategory {
			padding: 4px 10px;
			font-size: 12px;
			min-height: 28px;
		}

		.pill-emoji {
			font-size: 14px;
		}

		.pill.subcategory .pill-emoji {
			font-size: 12px;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.pill {
			/* Larger touch targets */
			min-height: 44px;
			padding: 8px 16px;
		}

		.pill.subcategory {
			min-height: 36px;
			padding: 6px 12px;
		}

		/* Remove hover effects on touch devices */
		.pill:hover {
			transform: translateZ(0);
			box-shadow: none;
			background: white;
			border-color: #e5e7eb;
		}

		.pill.subcategory:hover {
			background: #f8fafc;
			border-color: #e5e7eb;
		}

		/* Enhanced touch feedback */
		.pill:active {
			transform: scale(0.98) translateZ(0);
			background: #f1f5f9;
			border-color: #cbd5e0;
			transition: all 0.1s ease-out;
		}

		.pill.active:active {
			transform: scale(0.98) translateZ(0);
			background: #0f172a;
		}

		.pill.subcategory:active {
			transform: scale(0.98) translateZ(0);
			background: #e2e8f0;
		}

		.pill.subcategory.active:active {
			transform: scale(0.98) translateZ(0);
			background: #2563eb;
		}

		/* Smooth release animation */
		.pill:not(:active) {
			transition: all 0.2s ease-out;
		}
	}

	/* Animations */
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
			max-height: 0;
		}
		to {
			opacity: 1;
			transform: translateY(0);
			max-height: 100px;
		}
	}

	/* Focus styles for accessibility */
	.pill:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Ensure proper spacing when no fade needed on desktop */
	@media (min-width: 768px) {
		.pills-container::before,
		.pills-container::after {
			display: none;
		}
	}
</style>