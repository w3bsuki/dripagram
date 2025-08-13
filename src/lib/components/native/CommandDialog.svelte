<script lang="ts">
	import { cn } from '$lib/utils';
	import Command from './Command.svelte';
	import DialogRoot from './Dialog.svelte';
	import DialogContent from './DialogContent.svelte';
	import DialogTitle from './DialogTitle.svelte';
	import DialogDescription from './DialogDescription.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { CommandDialogProps } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		open = $bindable(false),
		onOpenChange,
		value = $bindable(''),
		onValueChange,
		filter,
		shouldFilter = true,
		loop = false,
		label = 'Command Palette',
		container,
		...props
	}: CommandDialogProps = $props();

	const dispatch = createEventDispatcher<{
		'open-change': { open: boolean };
		'value-change': { value: string };
	}>();

	// Handle open state changes
	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
		dispatch('open-change', { open: newOpen });
	}

	// Handle value changes
	function handleValueChange(newValue: string) {
		value = newValue;
		onValueChange?.(newValue);
		dispatch('value-change', { value: newValue });
	}

	// Handle escape key to close dialog
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleOpenChange(false);
		}
	}
</script>

<DialogRoot bind:open onOpenChange={handleOpenChange} {container}>
	<DialogContent 
		class={cn('overflow-hidden p-0', className)}
		onkeydown={handleKeydown}
		aria-label={label}
	>
		<div class="sr-only">
			<DialogTitle>{label}</DialogTitle>
			<DialogDescription>Search for commands and actions</DialogDescription>
		</div>
		
		<Command
			bind:ref
			bind:value
			onValueChange={handleValueChange}
			{filter}
			{shouldFilter}
			{loop}
			{label}
			class="[&_[data-slot=command-input-wrapper]]:h-12 [&_[data-command-group]]:px-2 [&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 [&_[data-slot=command-input-wrapper]_svg]:h-5 [&_[data-slot=command-input-wrapper]_svg]:w-5 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-3 [&_[data-slot=command-item]_svg]:h-5 [&_[data-slot=command-item]_svg]:w-5"
			{...props}
		>
			{@render children?.()}
		</Command>
	</DialogContent>
</DialogRoot>