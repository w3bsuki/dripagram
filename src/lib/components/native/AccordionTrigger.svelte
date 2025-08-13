<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { AccordionTriggerProps, AccordionItemContextType } from './accordion/types.js';

	let {
		level = 3,
		showIcon = true,
		children,
		class: className,
		...restProps
	}: AccordionTriggerProps = $props();

	const itemContext = getContext<AccordionItemContextType>('accordion-item');

	if (!itemContext) {
		throw new Error('AccordionTrigger must be used within an AccordionItem component');
	}

	function handleClick() {
		itemContext.toggle();
	}

	function handleKeydown(event: KeyboardEvent) {
		// Handle keyboard navigation
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			itemContext.toggle();
		}
	}

	// Create the header element dynamically based on level
	const HeaderTag = `h${level}` as keyof HTMLElementTagNameMap;
</script>

<svelte:element this={HeaderTag} class="flex">
	<button
		type="button"
		class={cn(
			'focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none transition-all hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
			'[&[data-state=open]>svg]:rotate-180',
			className
		)}
		data-state={itemContext.isOpen ? 'open' : 'closed'}
		disabled={itemContext.disabled}
		aria-expanded={itemContext.isOpen}
		aria-controls="accordion-content-{itemContext.value}"
		onclick={handleClick}
		onkeydown={handleKeydown}
		{...restProps}
	>
		{@render children?.()}
		{#if showIcon}
			<svg
				width="15"
				height="15"
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200"
				aria-hidden="true"
			>
				<path
					d="m4.93179 5.43179c.20811-.20811.54565-.20811.75376 0l2.06066 2.06066c.4929.4929 1.2936.4929 1.7865 0l2.0607-2.06066c.2081-.20811.5456-.20811.7537 0 .2081.20811.2081.54565 0 .75376l-2.7829 2.78289c-.6834.6834-1.7929.6834-2.4763 0l-2.78289-2.78289c-.20811-.20811-.20811-.54565 0-.75376z"
					fill="currentColor"
				/>
			</svg>
		{/if}
	</button>
</svelte:element>