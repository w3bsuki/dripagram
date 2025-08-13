<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import { X } from '@lucide/svelte';
	import DialogOverlay from './DialogOverlay.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children: Snippet;
		showCloseButton?: boolean;
	}

	let { 
		class: className, 
		children, 
		showCloseButton = true,
		...restProps 
	}: Props = $props();

	const dialogContext = getContext<{
		open: boolean;
		closeDialog: () => void;
	}>('dialog');

	let dialogElement = $state<HTMLDivElement | null>(null);
	let previousFocus: HTMLElement | null = null;

	// Focus management
	function trapFocus(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !dialogElement) return;

		const focusableElements = dialogElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (e.shiftKey) {
			if (document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			}
		} else {
			if (document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
		}
	}

	function handleClose() {
		dialogContext?.closeDialog();
	}

	$effect(() => {
		if (dialogContext?.open && browser) {
			// Store the previously focused element
			previousFocus = document.activeElement as HTMLElement;
			
			// Focus the dialog
			setTimeout(() => {
				const firstFocusable = dialogElement?.querySelector(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				) as HTMLElement;
				firstFocusable?.focus();
			}, 0);

			// Add event listeners
			document.addEventListener('keydown', trapFocus);

			return () => {
				document.removeEventListener('keydown', trapFocus);
				// Restore focus
				previousFocus?.focus();
			};
		}
	});
</script>

{#if dialogContext?.open}
	<DialogOverlay />
	<div
		bind:this={dialogElement}
		class={cn(
			'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
			'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
			'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
			className
		)}
		data-state={dialogContext.open ? 'open' : 'closed'}
		data-slot="dialog-content"
		role="dialog"
		aria-modal="true"
		{...restProps}
	>
		{@render children()}
		
		{#if showCloseButton}
			<button
				type="button"
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				onclick={handleClose}
			>
				<X class="h-4 w-4" />
				<span class="sr-only">Close</span>
			</button>
		{/if}
	</div>
{/if}