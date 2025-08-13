<script lang="ts">
	import { setContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { AccordionProps, AccordionContextType } from './accordion/types.js';

	let {
		type = 'single',
		value = $bindable(),
		defaultValue,
		collapsible = false,
		onValueChange,
		children,
		class: className,
		...restProps
	}: AccordionProps = $props();

	// Initialize value if not provided
	let internalValue = $state(value ?? defaultValue ?? (type === 'single' ? '' : []));

	// Sync internal value with external value
	$effect(() => {
		if (value !== undefined) {
			internalValue = value;
		}
	});

	// Sync external value with internal value
	$effect(() => {
		if (value !== internalValue) {
			value = internalValue;
			onValueChange?.(internalValue);
		}
	});

	function toggle(itemValue: string) {
		if (type === 'single') {
			// For single mode, toggle between the item and empty string (or keep open if not collapsible)
			if (internalValue === itemValue) {
				internalValue = collapsible ? '' : itemValue;
			} else {
				internalValue = itemValue;
			}
		} else {
			// For multiple mode, add or remove from array
			const currentArray = Array.isArray(internalValue) ? internalValue : [];
			if (currentArray.includes(itemValue)) {
				internalValue = currentArray.filter(v => v !== itemValue);
			} else {
				internalValue = [...currentArray, itemValue];
			}
		}
	}

	function isOpen(itemValue: string): boolean {
		if (type === 'single') {
			return internalValue === itemValue;
		} else {
			const currentArray = Array.isArray(internalValue) ? internalValue : [];
			return currentArray.includes(itemValue);
		}
	}

	const context: AccordionContextType = {
		type,
		get value() { return internalValue; },
		collapsible,
		toggle,
		isOpen
	};

	setContext('accordion', context);
</script>

<div
	class={cn('w-full', className)}
	data-orientation="vertical"
	{...restProps}
>
	{@render children?.()}
</div>