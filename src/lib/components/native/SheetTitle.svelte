<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	
	interface SheetTitleProps extends HTMLAttributes<HTMLHeadingElement> {
		class?: string;
		children?: Snippet;
		ref?: HTMLHeadingElement | null;
	}
	
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetTitleProps = $props();
</script>

<h2
	bind:this={ref}
	class={cn('text-lg font-semibold text-foreground', className)}
	data-sheet-title
	{...restProps}
>
	{@render children?.()}
</h2>