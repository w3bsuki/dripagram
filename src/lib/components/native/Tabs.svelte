<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';

	interface Props {
		value?: string;
		onValueChange?: (value: string) => void;
		class?: string;
		children?: import('svelte').Snippet;
		defaultValue?: string;
		orientation?: 'horizontal' | 'vertical';
		activationMode?: 'automatic' | 'manual';
		disabled?: boolean;
	}

	let {
		value = $bindable(''),
		onValueChange,
		class: className = '',
		children,
		defaultValue = '',
		orientation = 'horizontal',
		activationMode = 'automatic',
		disabled = false,
		...props
	}: Props = $props();

	// Initialize value if not provided
	if (!value && defaultValue) {
		value = defaultValue;
	}

	// Tab context for child components
	const tabsContext = {
		get value() { return value; },
		set value(newValue: string) {
			if (disabled) return;
			value = newValue;
			onValueChange?.(newValue);
		},
		orientation,
		activationMode,
		disabled
	};

	setContext('tabs', tabsContext);
</script>

<div
	role="tablist"
	aria-orientation={orientation}
	class={cn('flex flex-col gap-2', className)}
	data-orientation={orientation}
	{...props}
>
	{@render children?.()}
</div>