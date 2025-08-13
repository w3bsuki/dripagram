<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { AccordionItemProps, AccordionContextType, AccordionItemContextType } from './accordion/types.js';

	let {
		value,
		disabled = false,
		children,
		class: className,
		...restProps
	}: AccordionItemProps = $props();

	const accordionContext = getContext<AccordionContextType>('accordion');

	if (!accordionContext) {
		throw new Error('AccordionItem must be used within an Accordion component');
	}

	const isOpen = $derived(accordionContext.isOpen(value));

	function toggle() {
		if (!disabled) {
			accordionContext.toggle(value);
		}
	}

	const itemContext: AccordionItemContextType = {
		value,
		get isOpen() { return isOpen; },
		disabled,
		toggle
	};

	setContext('accordion-item', itemContext);
</script>

<div
	class={cn('border-b last:border-b-0', className)}
	data-state={isOpen ? 'open' : 'closed'}
	data-disabled={disabled}
	{...restProps}
>
	{@render children?.()}
</div>