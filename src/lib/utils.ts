import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Type utilities for shadcn components
export type WithElementRef<T extends Record<string, any>, K = keyof T> = T & {
	ref?: HTMLElement | null;
};

export type WithoutChild<T extends Record<string, any>> = Omit<T, "child" | "children">;

export type WithoutChildrenOrChild<T extends Record<string, any>> = Omit<T, "children" | "child">;