<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
		for?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		for: htmlFor,
		class: className,
		children,
		...restProps
	}: LabelProps = $props();

	const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
</script>

<label
	for={htmlFor}
	class={cn(baseClasses, className)}
	{...restProps}
>
	{@render children?.()}
</label>