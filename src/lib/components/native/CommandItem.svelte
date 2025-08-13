<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext, onMount, onDestroy } from 'svelte';
	import type { CommandItemProps, CommandContext, CommandItemData } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		value,
		keywords = [],
		disabled = false,
		onSelect,
		forceMount = false,
		...props
	}: CommandItemProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');

	// Item data for registration
	const itemData: CommandItemData = {
		value,
		keywords,
		disabled
	};

	// Check if item should be visible
	let isVisible = $derived.by(() => {
		if (forceMount) return true;
		if (!commandContext) return true;
		
		return commandContext.filtered.has(value);
	});

	// Check if item is selected
	let isSelected = $derived.by(() => {
		if (!commandContext) return false;
		return commandContext.selected === value;
	});

	// Handle item click
	function handleClick(event: MouseEvent) {
		if (disabled) return;
		
		event.preventDefault();
		
		// Call custom onSelect first
		onSelect?.(value);
		
		// Then call context onSelect
		if (commandContext) {
			commandContext.onSelect(value);
		}
	}

	// Handle item pointer enter for mouse navigation
	function handlePointerEnter() {
		if (disabled || !commandContext) return;
		
		// Update selection when hovering with mouse
		if (commandContext.selected !== value) {
			// Find the item in filtered items to ensure it's selectable
			if (commandContext.filtered.has(value)) {
				commandContext.setSelected(value);
			}
		}
	}

	// Register/unregister item with command context
	onMount(() => {
		if (commandContext) {
			commandContext.registerItem(value, itemData);
		}
	});

	onDestroy(() => {
		if (commandContext) {
			commandContext.unregisterItem(value);
		}
	});

	// Update item data when props change
	$effect(() => {
		if (commandContext) {
			const newItemData: CommandItemData = {
				value,
				keywords,
				disabled
			};
			commandContext.registerItem(value, newItemData);
		}
	});
</script>

{#if isVisible}
	<div
		bind:this={ref}
		role="option"
		aria-selected={isSelected}
		aria-disabled={disabled}
		data-value={value}
		data-disabled={disabled ? 'true' : 'false'}
		class={cn(
			"aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
			isSelected && 'bg-accent text-accent-foreground',
			className
		)}
		data-slot="command-item"
		onclick={handleClick}
		onpointerenter={handlePointerEnter}
		{...props}
	>
		{@render children?.()}
	</div>
{/if}