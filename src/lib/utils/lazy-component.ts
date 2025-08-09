import { browser } from '$app/environment';

export interface LazyComponentOptions {
	fallback?: any;
	threshold?: number;
	rootMargin?: string;
}

/**
 * Lazy load a component using dynamic imports and intersection observer
 */
export async function lazyComponent(
	importFn: () => Promise<{ default: any }>,
	options: LazyComponentOptions = {}
) {
	const { fallback = null, threshold = 0, rootMargin = '50px' } = options;

	return new Promise((resolve) => {
		if (!browser) {
			// Server-side: load immediately
			importFn().then(module => resolve(module.default));
			return;
		}

		// Client-side: use intersection observer for viewport-based loading
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						importFn().then(module => {
							resolve(module.default);
							observer.disconnect();
						});
					}
				});
			},
			{ threshold, rootMargin }
		);

		// For now, resolve with fallback - actual implementation would need DOM element
		resolve(fallback);
	});
}

/**
 * Create a lazy loader for route-based code splitting
 */
export function createLazyRoute<T = any>(importFn: () => Promise<{ default: T }>) {
	let componentPromise: Promise<T> | null = null;

	return {
		load(): Promise<T> {
			if (!componentPromise) {
				componentPromise = importFn().then(module => module.default);
			}
			return componentPromise;
		},
		preload(): void {
			// Trigger loading without waiting for result
			this.load();
		}
	};
}

/**
 * Preload components that are likely to be needed soon
 */
export function preloadComponent(importFn: () => Promise<any>, delay = 2000) {
	if (!browser) return;
	
	setTimeout(() => {
		// Use requestIdleCallback if available
		if ('requestIdleCallback' in window) {
			requestIdleCallback(() => importFn());
		} else {
			// Fallback for browsers without requestIdleCallback
			setTimeout(() => importFn(), 0);
		}
	}, delay);
}

/**
 * Bundle analysis helper - track dynamic imports
 */
export function trackDynamicImport(componentName: string, size?: number) {
	if (browser && typeof window !== 'undefined') {
		// Track for analytics or debugging
		console.debug(`Lazy loaded: ${componentName}${size ? ` (${size}kb)` : ''}`);
	}
}