<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		href?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'default',
		href,
		class: className,
		children,
		...restProps
	}: BadgeProps = $props();

	// Define variant styles
	const variantStyles = {
		default: 'bg-blue-500 text-white border-transparent hover:bg-blue-600',
		secondary: 'bg-gray-100 text-gray-900 border-transparent hover:bg-gray-200',
		destructive: 'bg-red-500 text-white border-transparent hover:bg-red-600',
		outline: 'text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
	};

	const baseClasses = 'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	{href}
	class={cn(baseClasses, variantStyles[variant], className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>

<style>
	/* Additional custom styles can go here if needed */
</style>