<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	let {
		orientation = 'horizontal',
		class: className,
		...restProps
	}: SeparatorProps = $props();

	const baseClasses = 'bg-gray-200 shrink-0';
	const orientationClasses = {
		horizontal: 'h-px w-full',
		vertical: 'h-full w-px'
	};
</script>

<div
	class={cn(baseClasses, orientationClasses[orientation], className)}
	role="separator"
	aria-orientation={orientation}
	{...restProps}
></div>