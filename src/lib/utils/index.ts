import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

/**
 * Type helper for components that accept element ref
 */
export type WithElementRef<T extends HTMLAttributes<any>> = T & {
	ref?: HTMLElement | null;
};

/**
 * Type helper for components without children
 */
export type WithoutChild<T> = T & { children?: never };

/**
 * Type helper for components without children or child
 */
export type WithoutChildrenOrChild<T> = T & { children?: never; child?: never };

/**
 * Type helper for components without children
 */
export type WithoutChildren<T> = T & { children?: never };

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format currency to USD
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount);
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date | string): string {
	const now = new Date();
	const targetDate = typeof date === 'string' ? new Date(date) : date;
	const diffInMs = now.getTime() - targetDate.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) return 'Today';
	if (diffInDays === 1) return 'Yesterday';
	if (diffInDays < 7) return `${diffInDays} days ago`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
	if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
	
	return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.trim();
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
	return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return text.slice(0, length) + '...';
}