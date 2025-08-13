import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';

// Base props with ref support
export interface WithRef<T = HTMLElement> {
	ref?: T | null;
}

export interface WithClass {
	class?: string;
}

export interface WithChildren {
	children?: Snippet;
}

// Command item data structure
export interface CommandItemData {
	value: string;
	keywords?: string[];
	disabled?: boolean;
	group?: string;
	score?: number;
}

// Command context interface
export interface CommandContext {
	value: string;
	search: string;
	filtered: Map<string, CommandItemData>;
	selected: string;
	loop: boolean;
	onValueChange: (value: string) => void;
	onSelect: (value: string) => void;
	filter: (value: string, search: string, keywords?: string[]) => number;
	shouldFilter: boolean;
	groups: Set<string>;
	registerItem: (value: string, data: CommandItemData) => void;
	unregisterItem: (value: string) => void;
	registerGroup: (value: string) => void;
	unregisterGroup: (value: string) => void;
	navigateItems: (direction: 'up' | 'down' | 'first' | 'last') => void;
	setSelected: (value: string) => void;
}

// Root component props
export interface CommandRootProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	value?: string;
	onValueChange?: (value: string) => void;
	filter?: (value: string, search: string, keywords?: string[]) => number;
	shouldFilter?: boolean;
	loop?: boolean;
	label?: string;
}

// Input component props
export interface CommandInputProps extends WithRef<HTMLInputElement>, WithClass {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	onValueChange?: (value: string) => void;
}

// List component props
export interface CommandListProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	label?: string;
}

// Item component props
export interface CommandItemProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	value: string;
	keywords?: string[];
	disabled?: boolean;
	onSelect?: (value: string) => void;
	forceMount?: boolean;
}

// Group component props
export interface CommandGroupProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	value?: string;
	heading?: string;
	forceMount?: boolean;
}

// Empty component props
export interface CommandEmptyProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	forceMount?: boolean;
}

// Separator component props
export interface CommandSeparatorProps extends WithRef<HTMLDivElement>, WithClass {
	alwaysRender?: boolean;
}

// Shortcut component props
export interface CommandShortcutProps extends WithRef<HTMLSpanElement>, WithClass, WithChildren {
}

// Dialog component props
export interface CommandDialogProps extends WithRef<HTMLDivElement>, WithClass, WithChildren {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	value?: string;
	onValueChange?: (value: string) => void;
	filter?: (value: string, search: string, keywords?: string[]) => number;
	shouldFilter?: boolean;
	loop?: boolean;
	label?: string;
	container?: HTMLElement;
}

// Link item component props
export interface CommandLinkItemProps extends WithRef<HTMLAnchorElement>, WithClass, WithChildren {
	value: string;
	keywords?: string[];
	disabled?: boolean;
	onSelect?: (value: string) => void;
	href: string;
	target?: string;
	forceMount?: boolean;
}

// Default filter function type
export type FilterFunction = (value: string, search: string, keywords?: string[]) => number;

// Events
export interface CommandSelectEvent {
	value: string;
}

export interface CommandValueChangeEvent {
	value: string;
}