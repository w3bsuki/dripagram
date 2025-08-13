<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children?: import('svelte').Snippet;
		disabled?: boolean;
		'aria-controls'?: string;
		'aria-selected'?: boolean;
	}

	let {
		value,
		class: className = '',
		children,
		disabled = false,
		...props
	}: Props = $props();

	const tabsContext = getContext<{
		get value(): string;
		set value(newValue: string);
		orientation: 'horizontal' | 'vertical';
		activationMode: 'automatic' | 'manual';
		disabled: boolean;
	}>('tabs');

	if (!tabsContext) {
		throw new Error('TabsTrigger must be used within a Tabs component');
	}

	const isSelected = $derived(tabsContext.value === value);
	const isDisabled = $derived(disabled || tabsContext.disabled);

	function handleClick() {
		if (!isDisabled) {
			tabsContext.value = value;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (isDisabled) return;

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			tabsContext.value = value;
		}
	}
</script>

<button
	type="button"
	role="tab"
	aria-selected={isSelected}
	aria-controls="tabpanel-{value}"
	tabindex={isSelected ? 0 : -1}
	data-state={isSelected ? 'active' : 'inactive'}
	data-value={value}
	data-orientation={tabsContext.orientation}
	class={cn(
		"data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		tabsContext.orientation === 'vertical' && 'justify-start',
		className
	)}
	disabled={isDisabled}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	{...props}
>
	{@render children?.()}
</button>