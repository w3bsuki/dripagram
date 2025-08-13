<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext, onMount, onDestroy } from 'svelte';
	import type { CommandGroupProps, CommandContext } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		value,
		heading,
		forceMount = false,
		...props
	}: CommandGroupProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');

	// Use heading as value if value not provided, or generate a unique ID
	const groupValue = value ?? heading ?? `command-group-${Math.random().toString(36).substr(2, 9)}`;

	// Check if group has any visible items
	let hasVisibleItems = $derived.by(() => {
		if (forceMount) return true;
		if (!commandContext) return true;

		// Check if any filtered items belong to this group
		for (const [itemValue, itemData] of commandContext.filtered) {
			if (itemData.group === groupValue) {
				return true;
			}
		}
		
		// If no items specify a group, or no items match this group, show by default
		// This maintains compatibility with existing usage where groups may not be explicitly linked
		return true;
	});

	// Register/unregister group with command context
	onMount(() => {
		if (commandContext) {
			commandContext.registerGroup(groupValue);
		}
	});

	onDestroy(() => {
		if (commandContext) {
			commandContext.unregisterGroup(groupValue);
		}
	});
</script>

{#if hasVisibleItems}
	<div
		bind:this={ref}
		role="group"
		aria-labelledby={heading ? `${groupValue}-heading` : undefined}
		data-value={groupValue}
		data-command-group=""
		class={cn('text-foreground overflow-hidden p-1', className)}
		data-slot="command-group"
		{...props}
	>
		{#if heading}
			<div
				id="{groupValue}-heading"
				role="presentation"
				class="text-muted-foreground px-2 py-1.5 text-xs font-medium"
				data-slot="command-group-heading"
			>
				{heading}
			</div>
		{/if}
		<div role="group" data-slot="command-group-items">
			{@render children?.()}
		</div>
	</div>
{/if}