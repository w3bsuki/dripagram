<script lang="ts">
	import { toast } from '$lib/utils/toast';
	import { fly } from 'svelte/transition';
	import { Check, X, AlertCircle, Info } from '@lucide/svelte';

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return Check;
			case 'error':
				return X;
			case 'warning':
				return AlertCircle;
			default:
				return Info;
		}
	}

	function getStyles(type: string) {
		switch (type) {
			case 'success':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'warning':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-blue-100 text-blue-800 border-blue-200';
		}
	}
</script>

<div class="toast-container">
	{#each $toast as item (item.id)}
		{@const IconComponent = getIcon(item.type)}
		<div class="toast {getStyles(item.type)}" transition:fly={{ y: 50, duration: 200 }}>
			<IconComponent size={20} />
			<span>{item.message}</span>
			<button class="close-btn" onclick={() => toast.remove(item.id)} aria-label="Close">
				<X size={16} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: var(--z-max);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid;
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		pointer-events: auto;
		max-width: 400px;
		animation: slideIn 0.2s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.close-btn {
		margin-left: auto;
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
	}

	.close-btn:hover {
		opacity: 1;
	}

	@media (max-width: 768px) {
		.toast-container {
			bottom: 5rem; /* Space for bottom navigation */
			left: 1rem;
			right: 1rem;
		}

		.toast {
			max-width: none;
		}
	}
</style>
