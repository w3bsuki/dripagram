<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	
	interface SheetHeaderProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetHeaderProps = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex flex-col gap-1.5 p-4', className)}
	data-sheet-header
	{...restProps}
>
	{@render children?.()}
</div>