<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { X } from '@lucide/svelte';
	import SheetOverlay from './SheetOverlay.svelte';
	import { onMount, getContext } from 'svelte';
	
	type Side = 'top' | 'right' | 'bottom' | 'left';
	
	// Context type
	interface SheetContext {
		get open(): boolean;
		set open(value: boolean);
		closeSheet(): void;
	}
	
	interface SheetContentProps extends HTMLAttributes<HTMLDivElement> {
		side?: Side;
		class?: string;
		children?: Snippet;
		showCloseButton?: boolean;
		ref?: HTMLDivElement | null;
	}
	
	let {
		ref = $bindable(null),
		side = 'right',
		class: className,
		children,
		showCloseButton = true,
		...restProps
	}: SheetContentProps = $props();
	
	// Get sheet context
	let sheetContext = getContext<SheetContext>('sheet');
	
	// Sheet variant styles based on side
	const sheetVariants = {
		top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
		bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
		left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
		right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
	};
	
	function handleClose() {
		if (sheetContext?.closeSheet) {
			sheetContext.closeSheet();
		}
	}
	
	// Simple focus management - focus the content when sheet opens
	$effect(() => {
		if (ref && sheetContext?.open) {
			// Focus the content element
			ref.focus();
		}
	});
</script>

{#if sheetContext?.open}
	<!-- Render overlay -->
	<SheetOverlay />
	
	<!-- Sheet content -->
	<div
		bind:this={ref}
		class={cn(
			'bg-background fixed z-50 flex flex-col gap-4 shadow-lg',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:duration-300 data-[state=open]:duration-500',
			sheetVariants[side],
			className
		)}
		data-state="open"
		data-sheet-content
		data-side={side}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		{...restProps}
	>
		{@render children?.()}
		
		{#if showCloseButton}
			<button
				onclick={handleClose}
				class="ring-offset-background focus-visible:ring-ring absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none"
				type="button"
				aria-label="Close"
			>
				<X class="h-4 w-4" />
				<span class="sr-only">Close</span>
			</button>
		{/if}
	</div>
{/if}