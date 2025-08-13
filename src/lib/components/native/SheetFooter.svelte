<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	
	interface SheetFooterProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetFooterProps = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 p-4', className)}
	data-sheet-footer
	{...restProps}
>
	{@render children?.()}
</div>