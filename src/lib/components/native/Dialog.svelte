<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children: Snippet;
	}

	let { open = $bindable(false), onOpenChange, children }: Props = $props();

	// Dialog context for child components
	const dialogContext = {
		get open() { return open; },
		set open(value: boolean) { 
			open = value;
			onOpenChange?.(value);
		},
		closeDialog() {
			open = false;
			onOpenChange?.(false);
		}
	};

	setContext('dialog', dialogContext);

	// Handle ESC key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			dialogContext.closeDialog();
		}
	}

	// Add/remove event listeners when dialog opens/closes
	$effect(() => {
		if (open) {
			document.addEventListener('keydown', handleKeydown);
			// Prevent body scroll when dialog is open
			document.body.style.overflow = 'hidden';
		} else {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
		};
	});
</script>

{@render children()}