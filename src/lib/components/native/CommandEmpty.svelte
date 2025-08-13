<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { CommandEmptyProps, CommandContext } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		forceMount = false,
		...props
	}: CommandEmptyProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');

	// Show when no items are filtered/visible
	let shouldShow = $derived.by(() => {
		if (forceMount) return true;
		if (!commandContext) return false;
		
		// Show when there are no filtered items
		return commandContext.filtered.size === 0;
	});
</script>

{#if shouldShow}
	<div
		bind:this={ref}
		role="status"
		aria-live="polite"
		class={cn('py-6 text-center text-sm', className)}
		data-slot="command-empty"
		{...props}
	>
		{#if children}
			{@render children()}
		{:else}
			No results found.
		{/if}
	</div>
{/if}