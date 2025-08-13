<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { AccordionContentProps, AccordionItemContextType } from './accordion/types.js';

	let {
		forceMount = false,
		children,
		class: className,
		...restProps
	}: AccordionContentProps = $props();

	const itemContext = getContext<AccordionItemContextType>('accordion-item');

	if (!itemContext) {
		throw new Error('AccordionContent must be used within an AccordionItem component');
	}

	let contentElement = $state<HTMLDivElement>();
	let shouldRender = $derived(itemContext.isOpen || forceMount);

	// Handle smooth height animation
	$effect(() => {
		if (!contentElement) return;

		if (itemContext.isOpen) {
			// Expanding
			const height = contentElement.scrollHeight;
			contentElement.style.height = '0px';
			// Force reflow
			contentElement.offsetHeight;
			contentElement.style.height = `${height}px`;
			
			// Clean up after transition
			const handleTransitionEnd = () => {
				if (itemContext.isOpen && contentElement) {
					contentElement.style.height = 'auto';
				}
				contentElement?.removeEventListener('transitionend', handleTransitionEnd);
			};
			contentElement.addEventListener('transitionend', handleTransitionEnd);
		} else {
			// Collapsing
			const height = contentElement.scrollHeight;
			contentElement.style.height = `${height}px`;
			// Force reflow
			contentElement.offsetHeight;
			contentElement.style.height = '0px';
		}
	});
</script>

{#if shouldRender}
	<div
		bind:this={contentElement}
		id="accordion-content-{itemContext.value}"
		role="region"
		aria-labelledby="accordion-trigger-{itemContext.value}"
		data-state={itemContext.isOpen ? 'open' : 'closed'}
		class={cn(
			'overflow-hidden text-sm transition-all duration-300 ease-in-out',
			!itemContext.isOpen && 'pointer-events-none',
			className
		)}
		style:height={itemContext.isOpen ? 'auto' : '0px'}
		{...restProps}
	>
		<div class={cn('pt-0 pb-4', className)}>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	/* Custom accordion animations */
	[data-state='open'] {
		animation: accordion-down 300ms ease-out;
	}

	[data-state='closed'] {
		animation: accordion-up 300ms ease-out;
	}

	@keyframes accordion-down {
		from {
			height: 0;
		}
		to {
			height: var(--radix-accordion-content-height);
		}
	}

	@keyframes accordion-up {
		from {
			height: var(--radix-accordion-content-height);
		}
		to {
			height: 0;
		}
	}
</style>