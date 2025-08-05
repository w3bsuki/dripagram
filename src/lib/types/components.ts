import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes, HTMLAttributes } from 'svelte/elements';

/**
 * Props for the Chip component
 */
export interface ChipProps {
	variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
	size?: 'sm' | 'md' | 'lg';
	dismissible?: boolean;
	interactive?: boolean;
	selected?: boolean;
	class?: string;
	children: Snippet;
	onclick?: (event: MouseEvent) => void;
	ondismiss?: () => void;
}

/**
 * Props for the Spinner component
 */
export interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	color?: 'primary' | 'white' | 'current';
	class?: string;
	text?: string;
	fullScreen?: boolean;
	overlay?: boolean;
}

/**
 * Props for Badge component
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'secondary' | 'destructive' | 'outline';
	class?: string;
	children?: Snippet;
}

/**
 * Props for Button component
 */
export interface ButtonProps extends HTMLButtonAttributes {
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	class?: string;
	disabled?: boolean;
	loading?: boolean;
	children?: Snippet;
}

/**
 * Props for Input component
 */
export interface InputProps extends HTMLAttributes<HTMLInputElement> {
	type?: string;
	placeholder?: string;
	value?: string | number;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
}

/**
 * Props for Modal/Dialog components
 */
export interface ModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: Snippet;
}

/**
 * Props for Avatar component
 */
export interface AvatarProps {
	src?: string;
	alt?: string;
	fallback?: string;
	class?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Props for Select component
 */
export interface SelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	class?: string;
	children?: Snippet;
}

/**
 * Props for Card component
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	class?: string;
	children?: Snippet;
}

/**
 * Props for Alert component
 */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'destructive';
	class?: string;
	children?: Snippet;
}

/**
 * Props for Skeleton component
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	class?: string;
	width?: string | number;
	height?: string | number;
}

/**
 * Props for Tabs component
 */
export interface TabsProps {
	value?: string;
	onValueChange?: (value: string) => void;
	class?: string;
	children?: Snippet;
}

/**
 * Props for Tooltip component
 */
export interface TooltipProps {
	content?: string;
	side?: 'top' | 'right' | 'bottom' | 'left';
	align?: 'start' | 'center' | 'end';
	children?: Snippet;
}

/**
 * Props for Switch component
 */
export interface SwitchProps {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	class?: string;
}

/**
 * Props for RadioGroup component
 */
export interface RadioGroupProps {
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	class?: string;
	children?: Snippet;
}

/**
 * Props for Textarea component
 */
export interface TextareaProps extends HTMLAttributes<HTMLTextAreaElement> {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	rows?: number;
	class?: string;
}

/**
 * Props for Label component
 */
export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
	for?: string;
	class?: string;
	children?: Snippet;
}

/**
 * Props for Popover component
 */
export interface PopoverProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: Snippet;
}

/**
 * Props for DropdownMenu component
 */
export interface DropdownMenuProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: Snippet;
}

/**
 * Props for Sheet component
 */
export interface SheetProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	side?: 'top' | 'right' | 'bottom' | 'left';
	children?: Snippet;
}

/**
 * Props for Breadcrumb component
 */
export interface BreadcrumbProps {
	items?: Array<{
		label: string;
		href?: string;
	}>;
	class?: string;
}

/**
 * Props for Pagination component
 */
export interface PaginationProps {
	total?: number;
	page?: number;
	perPage?: number;
	onPageChange?: (page: number) => void;
	class?: string;
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T = any> {
	data?: T[];
	columns?: Array<{
		key: string;
		label: string;
		sortable?: boolean;
	}>;
	class?: string;
}

/**
 * Common product type
 */
export interface Product {
	id: string;
	title: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	images: string[];
	rating?: number;
	reviews?: number;
	seller?: string;
	location?: string;
	category?: string;
	condition?: string;
	size?: string;
	brand?: string;
	isNew?: boolean;
	isFavorite?: boolean;
}