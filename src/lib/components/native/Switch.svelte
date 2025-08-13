<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		disabled = false,
		onchange,
		...restProps
	}: {
		ref?: HTMLButtonElement | null;
		class?: string;
		checked?: boolean;
		disabled?: boolean;
		onchange?: (event: Event) => void;
		[key: string]: any;
	} = $props();

	function handleClick(event: Event) {
		if (disabled) return;
		checked = !checked;
		onchange?.(event);
	}
</script>

<button
	bind:this={ref}
	data-slot="switch"
	data-state={checked ? 'checked' : 'unchecked'}
	class={cn(
		'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent outline-none shadow-xs focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
		checked ? 'bg-primary' : 'bg-input dark:bg-input/80',
		className
	)}
	role="switch"
	aria-checked={checked}
	{disabled}
	onclick={handleClick}
	{...restProps}
>
	<div
		data-slot="switch-thumb"
		class={cn(
			'pointer-events-none block size-4 rounded-full ring-0 transition-transform bg-background dark:bg-foreground',
			checked 
				? 'translate-x-[calc(100%-2px)] dark:bg-primary-foreground' 
				: 'translate-x-0 dark:bg-foreground'
		)}
	></div>
</button>