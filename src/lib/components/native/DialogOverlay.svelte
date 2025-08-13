<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className, onclick, ...restProps }: Props = $props();

	const dialogContext = getContext<{
		open: boolean;
		closeDialog: () => void;
	}>('dialog');

	// Close dialog when overlay is clicked
	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (e.target === e.currentTarget) {
			dialogContext?.closeDialog();
		}
		onclick?.(e);
	}
</script>

{#if dialogContext?.open}
	<div
		class={cn(
			'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className
		)}
		data-state={dialogContext.open ? 'open' : 'closed'}
		data-slot="dialog-overlay"
		onclick={handleClick}
		{...restProps}
	></div>
{/if}