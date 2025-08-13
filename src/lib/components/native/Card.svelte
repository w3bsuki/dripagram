<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		...restProps
	}: CardProps = $props();

	const baseClasses = 'bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm';
</script>

<div
	class={cn(baseClasses, className)}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		div {
			--tw-bg-opacity: 1;
			background-color: rgb(31 41 55 / var(--tw-bg-opacity));
			--tw-text-opacity: 1;
			color: rgb(243 244 246 / var(--tw-text-opacity));
			--tw-border-opacity: 1;
			border-color: rgb(75 85 99 / var(--tw-border-opacity));
		}
	}
</style>