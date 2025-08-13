<script lang="ts">
	import { type WithElementRef, type WithoutChild } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChild<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	class={`bg-accent animate-pulse rounded-md ${className || ''}`}
	{...restProps}
></div>
