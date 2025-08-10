<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		currentStep: number;
		totalSteps: number;
		labels?: string[];
	}

	let { currentStep, totalSteps, labels = [] }: Props = $props();
</script>

<div class="stepper-container">
	<!-- Progress bar for mobile -->
	<div class="mobile-progress">
		<div class="progress-track">
			<div 
				class="progress-fill"
				style="width: {(currentStep / totalSteps) * 100}%"
			></div>
		</div>
		<p class="progress-text">
			{m['sell.step_counter']({ current: currentStep, total: totalSteps })}
			{#if labels[currentStep - 1]}
				• {labels[currentStep - 1]}
			{/if}
		</p>
	</div>

	<!-- Dots for tablet/desktop -->
	<div class="desktop-dots">
		{#each Array(totalSteps) as _, index}
			{@const stepNumber = index + 1}
			{@const isActive = currentStep === stepNumber}
			{@const isCompleted = currentStep > stepNumber}
			
			<button
				type="button"
				class="dot-button"
				disabled={stepNumber > currentStep}
			>
				<div class="dot {isActive ? 'active' : ''} {isCompleted ? 'completed' : ''}"></div>
				
				<!-- Tooltip on hover -->
				{#if labels[index]}
					<span class="dot-tooltip">
						{labels[index]}
					</span>
				{/if}
			</button>

			<!-- Connector line -->
			{#if index < totalSteps - 1}
				<div class="connector-line {currentStep > stepNumber ? 'completed' : ''}"></div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.stepper-container {
		margin-bottom: var(--space-6);
		width: 100%;
	}

	/* Mobile Progress Bar */
	.mobile-progress {
		margin-bottom: var(--space-2);
		display: block;
	}

	.progress-track {
		height: 4px;
		width: 100%;
		background: var(--color-surface-tertiary);
		border-radius: var(--border-radius-full);
		overflow: hidden;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-interactive-primary) 0%, var(--color-interactive-primary-hover) 100%);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-slow) var(--ease-out);
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
	}

	.progress-text {
		font-size: var(--font-size-xs);
		text-align: center;
		color: var(--color-text-secondary);
		margin-top: var(--space-1);
		font-family: var(--font-family-sans);
		font-weight: 500;
		letter-spacing: 0.01em;
		line-height: 1.4;
	}

	/* Desktop Dots */
	.desktop-dots {
		display: none;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
	}

	.dot-button {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--border-radius-md);
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.dot-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.dot-button:not(:disabled):hover {
		background: var(--color-surface-secondary);
		transform: scale(1.1);
	}

	.dot-button:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}

	.dot {
		height: 8px;
		width: 8px;
		border-radius: var(--border-radius-full);
		background: var(--color-border-primary);
		transition: all var(--duration-slow) var(--ease-out);
		border: 2px solid transparent;
	}

	.dot.active {
		width: 32px;
		background: var(--color-interactive-primary);
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}

	.dot.completed {
		background: var(--color-interactive-primary);
		border-color: var(--color-surface-primary);
		box-shadow: 0 1px 4px rgba(37, 99, 235, 0.2);
	}

	.dot-tooltip {
		position: absolute;
		bottom: -24px;
		left: 50%;
		transform: translateX(-50%);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		white-space: nowrap;
		opacity: 0;
		transition: opacity var(--duration-fast) var(--ease-out);
		font-family: var(--font-family-sans);
		font-weight: 500;
		pointer-events: none;
		background: var(--color-surface-primary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--border-radius-sm);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border-primary);
	}

	.dot-button:hover .dot-tooltip {
		opacity: 1;
	}

	.connector-line {
		height: 2px;
		width: 32px;
		background: var(--color-border-primary);
		transition: background var(--duration-slow) var(--ease-out);
		border-radius: var(--border-radius-full);
	}

	.connector-line.completed {
		background: var(--color-interactive-primary);
		box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
	}

	/* Responsive Design */
	@media (max-width: 767px) {
		.mobile-progress {
			display: block;
		}
		
		.desktop-dots {
			display: none;
		}
	}

	@media (min-width: 768px) {
		.mobile-progress {
			display: none;
		}
		
		.desktop-dots {
			display: flex;
		}

		.stepper-container {
			margin-bottom: var(--space-8);
		}
	}

	/* Enhanced accessibility */
	@media (prefers-reduced-motion: reduce) {
		.progress-fill,
		.dot,
		.connector-line,
		.dot-tooltip {
			transition-duration: 0.01ms;
		}
		
		.dot-button:hover {
			transform: none;
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.progress-track {
			border: 1px solid var(--color-border-dark);
		}
		
		.dot {
			border-width: 3px;
		}
		
		.dot-tooltip {
			border: 2px solid var(--color-border-dark);
		}
	}
</style>