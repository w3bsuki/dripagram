<script lang="ts">
	import { CATEGORIES } from '$lib/data/categories';
	import type { CategorySelectorProps } from './types';

	let { selectedCategory, onCategorySelect }: CategorySelectorProps = $props();
</script>

<div class="mb-8">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">What are you selling?</h2>
		<p class="text-gray-600">Choose the category that best describes your item</p>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each CATEGORIES as category}
			<button
				type="button"
				class="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-600 {selectedCategory ===
				category.id
					? 'border-blue-600 bg-blue-50'
					: ''}"
				onclick={() => onCategorySelect(category.id)}
			>
				<span class="text-3xl">{category.emoji}</span>
				<span class="font-medium text-gray-900">{category.name}</span>
			</button>
		{/each}
	</div>
</div>
