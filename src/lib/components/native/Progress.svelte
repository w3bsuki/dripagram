<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		...restProps
	}: {
		ref?: HTMLDivElement | null;
		class?: string;
		max?: number;
		value?: number;
		[key: string]: any;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="progress"
	class={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class="bg-primary h-full w-full flex-1 transition-transform duration-200 ease-in-out"
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
	></div>
</div>