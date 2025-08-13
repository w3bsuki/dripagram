<script lang="ts">
	let {
		selectedCategory = null,
		onCategoryChange
	}: {
		selectedCategory: string | null;
		onCategoryChange: (categoryId: string | null) => void;
	} = $props();

	const categories = [
		{ id: 'men', name: 'Men', emoji: '👨' },
		{ id: 'women', name: 'Women', emoji: '👩' },
		{ id: 'kids', name: 'Kids', emoji: '👶' },
		{ id: 'shoes', name: 'Shoes', emoji: '👟' },
		{ id: 'bags', name: 'Bags', emoji: '👜' },
		{ id: 'accessories', name: 'Accessories', emoji: '💍' }
	];
</script>

<div class="category-pills">
	<div class="pills-scroll">
		{#each categories as category}
			<button
				class="pill"
				class:active={selectedCategory === category.id}
				onclick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
			>
				<span>{category.emoji}</span>
				<span>{category.name}</span>
			</button>
		{/each}
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
	}

	.pills-scroll::-webkit-scrollbar {
		display: none;
	}

	.pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid #e5e7eb;
		border-radius: 20px;
		background: white;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		flex-shrink: 0;
	}

	.pill:hover {
		background: #f9fafb;
	}

	.pill.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	@media (max-width: 768px) {
		.category-pills {
			padding: 8px 0;
		}

		.pill {
			padding: 6px 12px;
			font-size: 13px;
		}
	}
</style>