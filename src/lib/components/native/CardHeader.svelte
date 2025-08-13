<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		...restProps
	}: CardHeaderProps = $props();

	const baseClasses = 'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6';
</script>

<div class={cn(baseClasses, className)} {...restProps}>
	{@render children?.()}
</div>