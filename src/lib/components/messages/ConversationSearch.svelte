<script lang="ts">
	import { Search } from '@lucide/svelte';

	let {
		value = $bindable(),
		placeholder = 'Search conversations...',
		autofocus = false,
	} = $props();
</script>

<div class="search-container">
	<div class="search-input-wrapper">
		<Search size={16} class="search-icon" />
		<input type="text" bind:value {placeholder} class="search-input" />
	</div>
</div>

<style>
	.search-container {
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		background: var(--color-gray-50);
		border-radius: 20px;
		padding: 0 1rem;
	}

	.search-input-wrapper :global(.search-icon) {
		color: var(--color-text-secondary);
		margin-right: 0.5rem;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0.75rem 0;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-secondary);
	}
</style>
