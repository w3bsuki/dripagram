<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';

	let {
		currentStep,
		totalSteps,
		canGoBack = true,
		canGoNext = true,
		loading = false,
		isLastStep = false,
		onNext,
		onPrevious,
	}: {
		currentStep: number;
		totalSteps: number;
		canGoBack?: boolean;
		canGoNext?: boolean;
		loading?: boolean;
		isLastStep?: boolean;
		onNext: () => void;
		onPrevious: () => void;
	} = $props();
</script>

<div class="navigation">
	{#if currentStep > 0 && canGoBack}
		<button class="nav-btn secondary" onclick={onPrevious} disabled={loading}> Back </button>
	{/if}

	<button class="nav-btn primary" onclick={onNext} disabled={loading || !canGoNext}>
		{#if isLastStep}
			{loading ? 'Completing...' : 'Complete Setup'}
		{:else}
			Continue
			<ChevronRight size={20} />
		{/if}
	</button>
</div>

<style>
	.navigation {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.nav-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-btn.primary {
		background: var(--color-primary);
		color: white;
		margin-left: auto;
	}

	.nav-btn.primary:hover:not(:disabled) {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-lg);
	}

	.nav-btn.secondary {
		background: var(--color-gray-100);
		color: var(--color-text-primary);
	}

	.nav-btn.secondary:hover:not(:disabled) {
		background: var(--color-gray-200);
	}

	.nav-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
