<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		...restProps
	}: CardContentProps = $props();

	const baseClasses = 'px-6';
</script>

<div class={cn(baseClasses, className)} {...restProps}>
	{@render children?.()}
</div>