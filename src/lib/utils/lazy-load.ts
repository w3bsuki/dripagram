/**
 * Lazy loading utilities for optimized image loading
 */

export interface LazyLoadingOptions {
	rootMargin?: string;
	threshold?: number;
}

/**
 * Check if browser supports native lazy loading
 */
export function supportsNativeLazyLoading(): boolean {
	return 'loading' in HTMLImageElement.prototype;
}

/**
 * Generate a simple placeholder image data URL
 */
export function generatePlaceholder(width: number, height: number): string {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	
	const ctx = canvas.getContext('2d');
	if (!ctx) return '';
	
	// Create gradient placeholder
	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0, '#f3f4f6');
	gradient.addColorStop(1, '#e5e7eb');
	
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);
	
	return canvas.toDataURL('image/png');
}

/**
 * Create srcset string for responsive images
 */
export function createSrcSet(baseSrc: string, sizes: number[]): string {
	if (!baseSrc) return '';
	
	return sizes
		.map(size => {
			// Assume images are optimized and available at different sizes
			const optimizedSrc = baseSrc.includes('?') 
				? `${baseSrc}&w=${size}` 
				: `${baseSrc}?w=${size}`;
			return `${optimizedSrc} ${size}w`;
		})
		.join(', ');
}

/**
 * Get appropriate sizes attribute for responsive images
 */
export function getSizesAttribute(): string {
	return '(min-width: 1024px) 1024px, (min-width: 768px) 768px, (min-width: 640px) 640px, 100vw';
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = src;
	});
}