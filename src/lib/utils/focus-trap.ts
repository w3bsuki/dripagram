/**
 * Focus trap utility for modal dialogs and overlays
 * Manages focus within a container element
 */

interface FocusTrapOptions {
	initialFocus?: HTMLElement | null;
	fallbackFocus?: HTMLElement | null;
	escapeDeactivates?: boolean;
	clickOutsideDeactivates?: boolean;
	returnFocusOnDeactivate?: boolean;
	allowOutsideClick?: boolean | ((e: MouseEvent) => boolean);
	onDeactivate?: () => void;
}

export class FocusTrap {
	private container: HTMLElement;
	private options: FocusTrapOptions;
	private previouslyFocusedElement: HTMLElement | null = null;
	private active = false;

	constructor(container: HTMLElement, options: FocusTrapOptions = {}) {
		this.container = container;
		this.options = {
			escapeDeactivates: true,
			clickOutsideDeactivates: true,
			returnFocusOnDeactivate: true,
			allowOutsideClick: false,
			...options
		};
	}

	activate(): void {
		if (this.active) return;
		
		this.active = true;
		this.previouslyFocusedElement = document.activeElement as HTMLElement;
		
		// Set initial focus
		if (this.options.initialFocus) {
			this.options.initialFocus.focus();
		} else {
			const firstFocusable = this.getFirstFocusableElement();
			if (firstFocusable) {
				firstFocusable.focus();
			}
		}
		
		// Add event listeners
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('mousedown', this.handleClickOutside);
		document.addEventListener('touchstart', this.handleClickOutside);
	}

	deactivate(): void {
		if (!this.active) return;
		
		this.active = false;
		
		// Remove event listeners
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('mousedown', this.handleClickOutside);
		document.removeEventListener('touchstart', this.handleClickOutside);
		
		// Return focus to previously focused element
		if (this.options.returnFocusOnDeactivate && this.previouslyFocusedElement) {
			this.previouslyFocusedElement.focus();
		}
		
		// Call onDeactivate callback if provided
		if (this.options.onDeactivate) {
			this.options.onDeactivate();
		}
	}

	private handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === 'Tab') {
			this.handleTab(e);
		} else if (e.key === 'Escape' && this.options.escapeDeactivates) {
			this.deactivate();
		}
	};

	private handleTab = (e: KeyboardEvent): void => {
		const focusableElements = this.getFocusableElements();
		if (focusableElements.length === 0) return;
		
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];
		
		if (e.shiftKey) {
			// Shift + Tab
			if (document.activeElement === firstElement) {
				e.preventDefault();
				lastElement.focus();
			}
		} else {
			// Tab
			if (document.activeElement === lastElement) {
				e.preventDefault();
				firstElement.focus();
			}
		}
	};

	private handleClickOutside = (e: MouseEvent | TouchEvent): void => {
		if (!this.options.clickOutsideDeactivates) return;
		
		const target = e.target as HTMLElement;
		if (!this.container.contains(target)) {
			if (typeof this.options.allowOutsideClick === 'function') {
				if (!this.options.allowOutsideClick(e as MouseEvent)) {
					e.preventDefault();
					this.deactivate();
				}
			} else if (!this.options.allowOutsideClick) {
				e.preventDefault();
				this.deactivate();
			}
		}
	};

	private getFocusableElements(): HTMLElement[] {
		const selector = [
			'a[href]:not([disabled])',
			'button:not([disabled])',
			'textarea:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'[tabindex]:not([tabindex="-1"])'
		].join(',');
		
		const elements = Array.from(this.container.querySelectorAll<HTMLElement>(selector));
		return elements.filter(el => {
			const rect = el.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
		});
	}

	private getFirstFocusableElement(): HTMLElement | null {
		const elements = this.getFocusableElements();
		return elements[0] || null;
	}
}

/**
 * Create and activate a focus trap for a container
 */
export function createFocusTrap(container: HTMLElement, options?: FocusTrapOptions): FocusTrap {
	const trap = new FocusTrap(container, options);
	trap.activate();
	return trap;
}

/**
 * Svelte action for focus trap
 */
export function focusTrap(node: HTMLElement, options?: FocusTrapOptions) {
	const trap = new FocusTrap(node, options);
	trap.activate();
	
	return {
		destroy() {
			trap.deactivate();
		}
	};
}