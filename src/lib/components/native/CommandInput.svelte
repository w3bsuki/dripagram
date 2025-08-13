<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext, onMount } from 'svelte';
	import { Search } from 'lucide-svelte';
	import type { CommandInputProps, CommandContext } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		value = $bindable(''),
		placeholder = 'Type a command or search...',
		disabled = false,
		autoFocus = false,
		onValueChange,
		...props
	}: CommandInputProps = $props();

	// Get command context
	const commandContext = getContext<CommandContext>('command');

	// Sync with command context search
	$effect(() => {
		if (commandContext) {
			commandContext.search = value;
		}
	});

	// Handle value changes
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;
		
		value = newValue;
		onValueChange?.(newValue);
		
		if (commandContext) {
			commandContext.search = newValue;
		}
	}

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		// Let the parent command handle navigation keys
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp':
			case 'Home':
			case 'End':
			case 'Enter':
				// These will bubble up to the Command component
				break;
			case 'Escape':
				// Clear the input on escape
				event.preventDefault();
				value = '';
				if (commandContext) {
					commandContext.search = '';
				}
				onValueChange?.('');
				break;
		}
	}

	// Auto focus on mount if requested
	onMount(() => {
		if (autoFocus && ref) {
			ref.focus();
		}
	});
</script>

<div 
	class="flex h-9 items-center gap-2 border-b px-3" 
	data-slot="command-input-wrapper"
>
	<Search class="size-4 shrink-0 opacity-50" />
	<input
		bind:this={ref}
		bind:value
		type="text"
		role="combobox"
		aria-expanded="true"
		aria-autocomplete="list"
		aria-controls="command-list"
		{placeholder}
		{disabled}
		class={cn(
			'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		data-slot="command-input"
		oninput={handleInput}
		onkeydown={handleKeydown}
		{...props}
	/>
</div>