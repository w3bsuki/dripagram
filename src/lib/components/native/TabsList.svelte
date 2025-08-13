<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		children,
		...props
	}: Props = $props();

	const tabsContext = getContext<{
		orientation: 'horizontal' | 'vertical';
	}>('tabs');

	const orientation = tabsContext?.orientation || 'horizontal';
</script>

<div
	role="tablist"
	aria-orientation={orientation}
	class={cn(
		'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
		orientation === 'vertical' && 'flex-col h-fit w-9',
		className
	)}
	data-orientation={orientation}
	{...props}
>
	{@render children?.()}
</div>