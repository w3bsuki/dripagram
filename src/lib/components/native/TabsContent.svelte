<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children?: import('svelte').Snippet;
		forceMount?: boolean;
	}

	let {
		value,
		class: className = '',
		children,
		forceMount = false,
		...props
	}: Props = $props();

	const tabsContext = getContext<{
		get value(): string;
		orientation: 'horizontal' | 'vertical';
	}>('tabs');

	if (!tabsContext) {
		throw new Error('TabsContent must be used within a Tabs component');
	}

	const isSelected = $derived(tabsContext.value === value);
	const shouldRender = $derived(forceMount || isSelected);
</script>

{#if shouldRender}
	<div
		role="tabpanel"
		id="tabpanel-{value}"
		aria-labelledby="tab-{value}"
		data-state={isSelected ? 'active' : 'inactive'}
		data-orientation={tabsContext.orientation}
		data-value={value}
		tabindex={0}
		class={cn('flex-1 outline-none', className)}
		hidden={!isSelected}
		{...props}
	>
		{@render children?.()}
	</div>
{/if}