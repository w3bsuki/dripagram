<script lang="ts">
	import { cn } from '$lib/utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		disabled = false,
		onchange,
		...restProps
	}: {
		ref?: HTMLButtonElement | null;
		checked?: boolean;
		indeterminate?: boolean;
		class?: string;
		disabled?: boolean;
		onchange?: (event: Event) => void;
		[key: string]: any;
	} = $props();

	function handleClick(event: Event) {
		if (disabled) return;
		if (indeterminate) {
			indeterminate = false;
			checked = true;
		} else {
			checked = !checked;
		}
		onchange?.(event);
	}
</script>

<button
	bind:this={ref}
	data-slot="checkbox"
	data-state={indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked'}
	class={cn(
		'peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs outline-none transition-colors focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
		'border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50',
		checked || indeterminate 
			? 'bg-primary text-primary-foreground border-primary dark:bg-primary' 
			: 'bg-background',
		className
	)}
	role="checkbox"
	aria-checked={indeterminate ? 'mixed' : checked}
	{disabled}
	onclick={handleClick}
	{...restProps}
>
	<div data-slot="checkbox-indicator" class="text-current">
		{#if checked}
			<CheckIcon class="size-3.5" />
		{:else if indeterminate}
			<MinusIcon class="size-3.5" />
		{/if}
	</div>
</button>