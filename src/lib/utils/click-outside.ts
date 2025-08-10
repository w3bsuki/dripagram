/**
 * Click outside action for Svelte 5
 * Detects clicks outside of an element and calls a handler
 */
export function clickOutside(node: HTMLElement, handler: () => void) {
	function handleClick(event: MouseEvent) {
		if (!node.contains(event.target as Node)) {
			handler();
		}
	}

	// Add event listener
	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			// Clean up event listener
			document.removeEventListener('click', handleClick, true);
		}
	};
}

/**
 * Enhanced click outside action with options
 */
interface ClickOutsideOptions {
	enabled?: boolean;
	capture?: boolean;
	ignoreElements?: string[]; // CSS selectors to ignore
}

export function clickOutsideEnhanced(
	node: HTMLElement, 
	options: ClickOutsideOptions & { handler: () => void }
) {
	const { 
		handler, 
		enabled = true, 
		capture = true, 
		ignoreElements = [] 
	} = options;

	function handleClick(event: MouseEvent) {
		if (!enabled) return;
		
		const target = event.target as Element;
		
		// Check if click is inside the node
		if (node.contains(target)) return;
		
		// Check if click is on an ignored element
		for (const selector of ignoreElements) {
			if (target.closest(selector)) return;
		}
		
		// Call handler
		handler();
	}

	// Add event listener
	document.addEventListener('click', handleClick, capture);

	return {
		update(newOptions: ClickOutsideOptions & { handler: () => void }) {
			// Update options
			Object.assign(options, newOptions);
		},
		destroy() {
			// Clean up event listener
			document.removeEventListener('click', handleClick, capture);
		}
	};
}

/**
 * Type for use in Svelte components
 */
export type ClickOutsideAction = typeof clickOutside;
export type ClickOutsideEnhancedAction = typeof clickOutsideEnhanced;