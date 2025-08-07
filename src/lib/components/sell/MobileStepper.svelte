<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
		labels?: string[];
	}

	let { currentStep, totalSteps, labels = [] }: Props = $props();
</script>

<div class="mb-6 w-full">
	<!-- Progress bar for mobile -->
	<div class="mb-2 md:hidden">
		<div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
			<div 
				class="h-full bg-blue-600 transition-all duration-300 ease-out"
				style="width: {(currentStep / totalSteps) * 100}%"
			></div>
		</div>
		<p class="text-xs text-center text-gray-600 mt-1">
			Step {currentStep} of {totalSteps}
			{#if labels[currentStep - 1]}
				• {labels[currentStep - 1]}
			{/if}
		</p>
	</div>

	<!-- Dots for tablet/desktop -->
	<div class="hidden md:flex items-center justify-center gap-2">
		{#each Array(totalSteps) as _, index}
			{@const stepNumber = index + 1}
			{@const isActive = currentStep === stepNumber}
			{@const isCompleted = currentStep > stepNumber}
			
			<button
				type="button"
				class="group relative"
				disabled={stepNumber > currentStep}
			>
				<div 
					class="h-2 w-2 rounded-full transition-all duration-300 {
						isActive ? 'w-8 bg-blue-600' : 
						isCompleted ? 'bg-blue-600' : 
						'bg-gray-300'
					}"
				></div>
				
				<!-- Tooltip on hover -->
				{#if labels[index]}
					<span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
						{labels[index]}
					</span>
				{/if}
			</button>

			<!-- Connector line -->
			{#if index < totalSteps - 1}
				<div 
					class="h-0.5 w-8 transition-colors duration-300 {
						currentStep > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
					}"
				></div>
			{/if}
		{/each}
	</div>
</div>