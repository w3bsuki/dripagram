<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		loadingStatus = $bindable('loading'),
		class: className,
		children,
		...restProps
	}: {
		ref?: HTMLDivElement | null;
		loadingStatus?: 'idle' | 'loading' | 'loaded' | 'error';
		class?: string;
		children?: any;
		[key: string]: any;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="avatar"
	class={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
	{...restProps}
>
	{@render children?.()}
</div>