<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children,
	}: {
		title: string;
		description: string;
		children: Snippet;
	} = $props();
</script>

<div class="step-card">
	<h2>{title}</h2>
	<p>{description}</p>

	{@render children()}
</div>

<style>
	.step-card {
		background: var(--color-background);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: var(--shadow-sm);
	}

	.step-card h2 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.step-card > p {
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	@media (max-width: 640px) {
		.step-card {
			padding: 1.5rem;
		}
	}
</style>
