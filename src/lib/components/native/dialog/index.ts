import DialogRoot from '../Dialog.svelte';
import DialogTrigger from '../DialogTrigger.svelte';
import DialogContent from '../DialogContent.svelte';
import DialogHeader from '../DialogHeader.svelte';
import DialogTitle from '../DialogTitle.svelte';
import DialogDescription from '../DialogDescription.svelte';
import DialogFooter from '../DialogFooter.svelte';
import DialogClose from '../DialogClose.svelte';
import DialogOverlay from '../DialogOverlay.svelte';
import DialogPortal from '../DialogPortal.svelte';

// Named exports for destructuring
export {
	DialogRoot as Root,
	DialogTrigger as Trigger,
	DialogContent as Content,
	DialogHeader as Header,
	DialogTitle as Title,
	DialogDescription as Description,
	DialogFooter as Footer,
	DialogClose as Close,
	DialogOverlay as Overlay,
	DialogPortal as Portal
};

// TypeScript interfaces
export interface DialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export interface DialogContentProps {
	class?: string;
	showCloseButton?: boolean;
}

export interface DialogTriggerProps {
	asChild?: boolean;
}

export interface DialogCloseProps {
	asChild?: boolean;
}

export interface DialogTitleProps {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	class?: string;
}

export interface DialogPortalProps {
	to?: string | HTMLElement;
}