<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { CommandListProps, CommandContext } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		label = 'Suggestions',
		...props
	}: CommandListProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');
</script>

<div
	bind:this={ref}
	role="listbox"
	id="command-list"
	aria-label={label}
	class={cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
	data-slot="command-list"
	{...props}
>
	{@render children?.()}
</div>