<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardDescriptionProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		...restProps
	}: CardDescriptionProps = $props();

	const baseClasses = 'text-sm text-gray-600';
</script>

<div class={cn(baseClasses, className)} {...restProps}>
	{@render children?.()}
</div>