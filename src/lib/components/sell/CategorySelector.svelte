<script lang="ts">
	import { CATEGORIES } from '$lib/data/categories';
	import type { CategorySelectorProps } from './types';

	let { selectedCategory, onCategorySelect }: CategorySelectorProps = $props();
</script>

<div class="mb-6">
	<div class="mb-6 text-center">
		<h2 class="mb-2 text-xl md:text-2xl font-semibold text-gray-900">What are you selling?</h2>
		<p class="text-sm md:text-base text-gray-600">Choose the category that best describes your item</p>
	</div>

	<div class="grid grid-cols-2 gap-3 md:gap-4">
		{#each CATEGORIES as category}
			<button
				type="button"
				class="flex cursor-pointer flex-col items-center gap-2 md:gap-3 rounded-xl border-2 border-gray-200 bg-white p-3 md:p-6 transition-all hover:border-blue-600 active:scale-95 {selectedCategory ===
				category.id
					? 'border-blue-600 bg-blue-50'
					: ''}"
				onclick={() => onCategorySelect(category.id)}
			>
				<span class="text-2xl md:text-3xl">{category.emoji}</span>
				<span class="text-xs md:text-base font-medium text-gray-900 text-center">{category.name}</span>
			</button>
		{/each}
	</div>
</div>
