<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardTitleProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		...restProps
	}: CardTitleProps = $props();

	const baseClasses = 'text-lg font-semibold leading-none tracking-tight text-gray-900';
</script>

<div class={cn(baseClasses, className)} {...restProps}>
	{@render children?.()}
</div>