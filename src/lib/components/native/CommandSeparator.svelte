<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { CommandSeparatorProps, CommandContext } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		alwaysRender = false,
		...props
	}: CommandSeparatorProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');

	// Show separator when there are filtered items or when alwaysRender is true
	let shouldShow = $derived.by(() => {
		if (alwaysRender) return true;
		if (!commandContext) return true;
		
		// Show when there are filtered items
		return commandContext.filtered.size > 0;
	});
</script>

{#if shouldShow}
	<div
		bind:this={ref}
		role="separator"
		aria-orientation="horizontal"
		class={cn('bg-border -mx-1 h-px', className)}
		data-slot="command-separator"
		{...props}
	></div>
{/if}