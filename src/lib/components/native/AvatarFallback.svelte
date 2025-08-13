<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: {
		ref?: HTMLDivElement | null;
		class?: string;
		children?: any;
		[key: string]: any;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="avatar-fallback"
	class={cn('bg-muted flex size-full items-center justify-center rounded-full text-sm font-medium', className)}
	{...restProps}
>
	{@render children?.()}
</div>