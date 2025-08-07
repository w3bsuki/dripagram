<script lang="ts">
	import { CATEGORIES } from '$lib/data/categories';
	import type { CategorySelectorProps } from './types';

	let { selectedCategory, onCategorySelect }: CategorySelectorProps = $props();
</script>

<div class="w-full">
	<div class="mb-4 text-center">
		<h2 class="text-lg font-semibold text-gray-900">What are you selling?</h2>
		<p class="text-sm text-gray-600 mt-1">Choose a category</p>
	</div>

	<!-- Mobile-optimized 3-column grid -->
	<div class="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
		{#each CATEGORIES as category}
			<button
				type="button"
				class="flex flex-col items-center justify-center gap-1 rounded-lg border-2 bg-white p-3 transition-colors min-h-[80px] touch-manipulation {
					selectedCategory === category.id
						? 'border-blue-600 bg-blue-50'
						: 'border-gray-200 hover:border-gray-300'
				}"
				onclick={() => onCategorySelect(category.id)}
				style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
			>
				<span class="text-2xl" role="img" aria-label={category.name}>
					{category.emoji}
				</span>
				<span class="text-xs font-medium text-gray-900 text-center leading-tight">
					{category.name}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	/* Ensure touch events work properly */
	button {
		-webkit-user-select: none;
		user-select: none;
	}
</style>
