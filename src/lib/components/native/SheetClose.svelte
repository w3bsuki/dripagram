<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';
	
	// Context type
	interface SheetContext {
		get open(): boolean;
		set open(value: boolean);
		closeSheet(): void;
	}
	
	interface SheetCloseProps extends HTMLButtonAttributes {
		children?: Snippet;
		asChild?: boolean;
		ref?: HTMLButtonElement | null;
	}
	
	let {
		ref = $bindable(null),
		children,
		onclick,
		asChild = false,
		...restProps
	}: SheetCloseProps = $props();
	
	// Get sheet context
	let sheetContext = getContext<SheetContext>('sheet');
	
	function handleClick(event: MouseEvent) {
		if (sheetContext?.closeSheet) {
			sheetContext.closeSheet();
		}
		if (onclick) {
			onclick(event as any);
		}
	}
</script>

{#if asChild}
	<!-- If asChild is true, render children directly but bind the click handler -->
	{@render children?.()}
{:else}
	<button
		bind:this={ref}
		onclick={handleClick}
		data-sheet-close
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}