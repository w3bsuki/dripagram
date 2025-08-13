<script lang="ts">
	import { cn } from '$lib/utils';
	import type { CommandShortcutProps } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		...props
	}: CommandShortcutProps = $props();
</script>

<span
	bind:this={ref}
	class={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
	data-slot="command-shortcut"
	{...props}
>
	{@render children?.()}
</span>