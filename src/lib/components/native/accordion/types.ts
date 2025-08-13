import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * The type of accordion - single allows one item open at a time, multiple allows multiple
	 */
	type?: 'single' | 'multiple';
	/**
	 * The value(s) of the currently expanded item(s)
	 */
	value?: string | string[];
	/**
	 * Default value(s) for uncontrolled accordion
	 */
	defaultValue?: string | string[];
	/**
	 * Whether the accordion can be collapsed when all items are closed
	 */
	collapsible?: boolean;
	/**
	 * The content of the accordion
	 */
	children?: Snippet;
	/**
	 * Callback fired when the accordion value changes
	 */
	onValueChange?: (value: string | string[]) => void;
	/**
	 * CSS class name
	 */
	class?: string;
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Unique identifier for this accordion item
	 */
	value: string;
	/**
	 * Whether this item is disabled
	 */
	disabled?: boolean;
	/**
	 * The content of the accordion item
	 */
	children?: Snippet;
	/**
	 * CSS class name
	 */
	class?: string;
}

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
	/**
	 * The heading level for the trigger (affects semantic HTML)
	 */
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	/**
	 * The content of the trigger
	 */
	children?: Snippet;
	/**
	 * CSS class name
	 */
	class?: string;
	/**
	 * Whether to show the default chevron icon
	 */
	showIcon?: boolean;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * The content to display when expanded
	 */
	children?: Snippet;
	/**
	 * CSS class name
	 */
	class?: string;
	/**
	 * Whether to force mount the content (useful for animations)
	 */
	forceMount?: boolean;
}

export interface AccordionContextType {
	/**
	 * The type of accordion
	 */
	type: 'single' | 'multiple';
	/**
	 * The currently opened values
	 */
	value: string | string[];
	/**
	 * Whether the accordion is collapsible
	 */
	collapsible: boolean;
	/**
	 * Function to toggle an accordion item
	 */
	toggle: (itemValue: string) => void;
	/**
	 * Function to check if an item is open
	 */
	isOpen: (itemValue: string) => boolean;
}

export interface AccordionItemContextType {
	/**
	 * The value of this accordion item
	 */
	value: string;
	/**
	 * Whether this item is currently open
	 */
	isOpen: boolean;
	/**
	 * Whether this item is disabled
	 */
	disabled: boolean;
	/**
	 * Function to toggle this item
	 */
	toggle: () => void;
}