<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		class?: string;
		children: Snippet;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
	}

	let { class: className, children, level = 2, ...restProps }: Props = $props();
</script>

{#if level === 1}
	<h1
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h1>
{:else if level === 2}
	<h2
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h2>
{:else if level === 3}
	<h3
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h3>
{:else if level === 4}
	<h4
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h4>
{:else if level === 5}
	<h5
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h5>
{:else}
	<h6
		class={cn('text-lg font-semibold leading-none tracking-tight', className)}
		data-slot="dialog-title"
		{...restProps}
	>
		{@render children()}
	</h6>
{/if}