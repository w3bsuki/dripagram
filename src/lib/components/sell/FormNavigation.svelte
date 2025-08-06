<script lang="ts">
	import type { FormNavigationProps } from './types';

	let { currentStep, totalSteps, loading, onNext, onPrev, onPublish }: FormNavigationProps =
		$props();
</script>

<div class="mt-12 flex items-center border-t border-gray-200 pt-8">
	{#if currentStep > 1}
		<button
			type="button"
			onclick={onPrev}
			class="cursor-pointer rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50"
		>
			Back
		</button>
	{/if}

	<div class="flex-1"></div>

	{#if currentStep < totalSteps}
		<button
			type="button"
			onclick={onNext}
			class="cursor-pointer rounded-lg border-none bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
		>
			Continue
		</button>
	{:else}
		<button
			type="button"
			onclick={onPublish}
			disabled={loading}
			class="cursor-pointer rounded-lg border-none bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? 'Publishing...' : 'Publish Listing'}
		</button>
	{/if}
</div>
