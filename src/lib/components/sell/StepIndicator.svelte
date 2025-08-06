<script lang="ts">
	import type { StepIndicatorProps } from './types';

	let { currentStep, totalSteps }: StepIndicatorProps = $props();
</script>

<div class="mb-12 flex items-center justify-center gap-4">
	{#each Array(totalSteps) as _, index}
		{@const stepNumber = index + 1}
		{@const isActive = currentStep >= stepNumber}

		<!-- Step Circle -->
		<div class="flex items-center gap-4">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all {isActive
					? 'bg-blue-600 text-white'
					: 'bg-gray-200 text-gray-600'}"
			>
				{stepNumber}
			</div>

			<!-- Step Line -->
			{#if index < totalSteps - 1}
				<div
					class="h-0.5 w-10 transition-all {currentStep > stepNumber
						? 'bg-blue-600'
						: 'bg-gray-200'}"
				></div>
			{/if}
		</div>
	{/each}
</div>
