<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		class: className,
		src,
		alt = '',
		onload,
		onerror,
		...restProps
	}: {
		ref?: HTMLImageElement | null;
		class?: string;
		src?: string;
		alt?: string;
		onload?: (event: Event) => void;
		onerror?: (event: Event) => void;
		[key: string]: any;
	} = $props();
</script>

<img
	bind:this={ref}
	data-slot="avatar-image"
	class={cn('aspect-square size-full object-cover', className)}
	{src}
	{alt}
	{onload}
	{onerror}
	{...restProps}
/>