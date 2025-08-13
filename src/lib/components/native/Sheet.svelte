<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	
	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children: Snippet;
	}
	
	let { open = $bindable(false), onOpenChange, children }: Props = $props();
	
	// Context type
	interface SheetContext {
		get open(): boolean;
		set open(value: boolean);
		closeSheet(): void;
	}
	
	// Sheet context for child components
	const sheetContext: SheetContext = {
		get open() { return open; },
		set open(value: boolean) { 
			open = value;
			onOpenChange?.(value);
		},
		closeSheet() {
			open = false;
			onOpenChange?.(false);
		}
	};
	
	setContext('sheet', sheetContext);
	
	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			sheetContext.closeSheet();
		}
	}
	
	// Add/remove event listeners when sheet opens/closes
	$effect(() => {
		if (open) {
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('keydown', handleKeydown);
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{@render children()}