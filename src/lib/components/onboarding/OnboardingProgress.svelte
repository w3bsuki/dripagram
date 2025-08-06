<script lang="ts">
	import { CheckCircle } from '@lucide/svelte';
	import type { OnboardingStep } from './types.js';

	let {
		steps,
		currentStep,
	}: {
		steps: OnboardingStep[];
		currentStep: number;
	} = $props();
</script>

<div class="progress-container">
	<div class="progress-bar">
		<div class="progress-fill" style="width: {((currentStep + 1) / steps.length) * 100}%"></div>
	</div>
	<div class="progress-steps">
		{#each steps as step, index}
			<div
				class="progress-step"
				class:active={index === currentStep}
				class:completed={step.completed}
			>
				<div class="step-icon">
					{#if step.completed}
						<CheckCircle size={20} />
					{:else}
						{@const Icon = step.icon}
						<Icon size={20} />
					{/if}
				</div>
				<span class="step-label">{step.title}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.progress-container {
		margin-bottom: 3rem;
	}

	.progress-bar {
		height: 8px;
		background: var(--color-gray-200);
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.progress-steps {
		display: flex;
		justify-content: space-between;
	}

	.progress-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	.progress-step.active,
	.progress-step.completed {
		opacity: 1;
	}

	.step-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--color-gray-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
		transition: all 0.3s;
	}

	.progress-step.active .step-icon {
		background: var(--color-primary);
		color: white;
	}

	.progress-step.completed .step-icon {
		background: var(--color-success);
		color: white;
	}

	.step-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-align: center;
		max-width: 100px;
	}

	@media (max-width: 640px) {
		.progress-step .step-label {
			font-size: 0.625rem;
		}
	}
</style>
