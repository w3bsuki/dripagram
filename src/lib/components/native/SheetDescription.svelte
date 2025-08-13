<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	
	interface SheetDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
		ref?: HTMLParagraphElement | null;
	}
	
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetDescriptionProps = $props();
</script>

<p
	bind:this={ref}
	class={cn('text-sm text-muted-foreground', className)}
	data-sheet-description
	{...restProps}
>
	{@render children?.()}
</p>