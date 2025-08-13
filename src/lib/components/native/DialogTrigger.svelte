<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		asChild?: boolean;
	}

	let { children, asChild = false, onclick, ...restProps }: Props = $props();

	const dialogContext = getContext<{
		open: boolean;
		closeDialog: () => void;
	}>('dialog');

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (dialogContext) {
			dialogContext.open = true;
		}
		onclick?.(e);
	}
</script>

{#if asChild}
	{@render children()}
{:else}
	<button
		type="button"
		data-slot="dialog-trigger"
		onclick={handleClick}
		{...restProps}
	>
		{@render children()}
	</button>
{/if}