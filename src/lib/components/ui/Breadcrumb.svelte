<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	
	export interface BreadcrumbItem {
		label: string;
		href?: string;
	}
	
	interface Props {
		items: BreadcrumbItem[];
		class?: string;
	}
	
	let { items, class: className = '' }: Props = $props();
</script>

<nav class="breadcrumb {className}" aria-label="Breadcrumb">
	<ol class="breadcrumb-list">
		{#each items as item, index}
			<li class="breadcrumb-item">
				{#if item.href && index < items.length - 1}
					<a href={item.href} class="breadcrumb-link">
						{item.label}
					</a>
				{:else}
					<span class="breadcrumb-current" aria-current="page">
						{item.label}
					</span>
				{/if}
				
				{#if index < items.length - 1}
					<ChevronRight size={16} class="breadcrumb-separator" />
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border-bottom: var(--border-width-1) solid var(--color-border-light);
	}
	
	.breadcrumb-list {
		display: flex;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
		gap: var(--space-1);
	}
	
	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--font-size-sm);
	}
	
	.breadcrumb-link {
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.15s ease;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}
	
	.breadcrumb-link:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-secondary);
	}
	
	.breadcrumb-current {
		color: var(--color-text-primary);
		font-weight: 500;
		padding: var(--space-1) var(--space-2);
		white-space: nowrap;
		max-width: var(--size-48);
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.breadcrumb-separator {
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}
	
	/* Mobile adjustments */
	@media (max-width: 640px) {
		.breadcrumb {
			padding: var(--space-2) var(--space-4);
		}
		
		.breadcrumb-current {
			max-width: var(--size-36);
		}
		
		.breadcrumb-link,
		.breadcrumb-current {
			font-size: var(--font-size-xs);
		}
	}
</style>