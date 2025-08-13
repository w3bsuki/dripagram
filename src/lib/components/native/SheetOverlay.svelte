<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	
	// Context type
	interface SheetContext {
		get open(): boolean;
		set open(value: boolean);
		closeSheet(): void;
	}
	
	interface SheetOverlayProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		ref?: HTMLDivElement | null;
	}
	
	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	}: SheetOverlayProps = $props();
	
	// Get sheet context
	let sheetContext = getContext<SheetContext>('sheet');
	
	function handleClick(event: MouseEvent) {
		// Close sheet when overlay is clicked
		if (sheetContext?.closeSheet) {
			sheetContext.closeSheet();
		}
		if (onclick) {
			onclick(event as any);
		}
	}
</script>

{#if sheetContext?.open}
	<div
		bind:this={ref}
		class={cn(
			'fixed inset-0 z-50 bg-black/50',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			'data-[state=closed]:duration-300 data-[state=open]:duration-500',
			className
		)}
		onclick={handleClick}
		data-state="open"
		data-sheet-overlay
		{...restProps}
	></div>
{/if}