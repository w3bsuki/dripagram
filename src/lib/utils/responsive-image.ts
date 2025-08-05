/**
 * Responsive image utilities for optimized loading and display
 */

interface ResponsiveImageOptions {
	src: string;
	alt: string;
	sizes?: string;
	loading?: 'lazy' | 'eager';
	fetchPriority?: 'high' | 'low' | 'auto';
	decoding?: 'sync' | 'async' | 'auto';
	class?: string;
	style?: string;
}

interface ImageSource {
	srcset: string;
	type?: string;
	media?: string;
	sizes?: string;
}

interface SrcSetEntry {
	url: string;
	width: number;
	descriptor?: string;
}

/**
 * Generate srcset string from multiple image sources
 */
export function generateSrcSet(entries: SrcSetEntry[]): string {
	return entries
		.map(entry => {
			const descriptor = entry.descriptor || `${entry.width}w`;
			return `${entry.url} ${descriptor}`;
		})
		.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: { maxWidth?: number; size: string }[]): string {
	return breakpoints
		.map(bp => {
			if (bp.maxWidth) {
				return `(max-width: ${bp.maxWidth}px) ${bp.size}`;
			}
			return bp.size;
		})
		.join(', ');
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): string {
	const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
	const divisor = gcd(width, height);
	return `${width / divisor}/${height / divisor}`;
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
	// This is a simplified check - in production, you'd want more comprehensive detection
	if (typeof window === 'undefined') return 'jpeg';
	
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 1;
	
	// Check AVIF support
	if (canvas.toDataURL('image/avif').indexOf('image/avif') === 5) {
		return 'avif';
	}
	
	// Check WebP support
	if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
		return 'webp';
	}
	
	return 'jpeg';
}

/**
 * Generate placeholder for lazy loading
 */
export function generatePlaceholder(
	width: number,
	height: number,
	color: string = '#f3f4f6'
): string {
	const svg = `
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<rect width="100%" height="100%" fill="${color}"/>
		</svg>
	`;
	return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

/**
 * Generate blur placeholder (LQIP - Low Quality Image Placeholder)
 */
export function generateBlurPlaceholder(
	base64Thumbnail: string,
	blurAmount: number = 20
): string {
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
			<filter id="blur">
				<feGaussianBlur stdDeviation="${blurAmount}"/>
			</filter>
			<image 
				filter="url(#blur)" 
				x="0" 
				y="0" 
				width="100%" 
				height="100%" 
				href="${base64Thumbnail}"
			/>
		</svg>
	`;
	return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
	return Promise.all(urls.map(preloadImage));
}

/**
 * Check if image is in viewport
 */
export function isImageInViewport(element: HTMLElement, rootMargin: string = '50px'): boolean {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		return true; // Assume in viewport if we can't check
	}
	
	const rect = element.getBoundingClientRect();
	const windowHeight = window.innerHeight || document.documentElement.clientHeight;
	const windowWidth = window.innerWidth || document.documentElement.clientWidth;
	
	const margin = parseInt(rootMargin) || 0;
	
	return (
		rect.bottom >= -margin &&
		rect.right >= -margin &&
		rect.top <= windowHeight + margin &&
		rect.left <= windowWidth + margin
	);
}

/**
 * Create intersection observer for lazy loading
 */
export function createLazyImageObserver(
	onIntersect: (entry: IntersectionObserverEntry) => void,
	options?: IntersectionObserverInit
): IntersectionObserver | null {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		return null;
	}
	
	return new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				onIntersect(entry);
			}
		});
	}, {
		rootMargin: '50px',
		threshold: 0.01,
		...options
	});
}

/**
 * Get device pixel ratio for retina displays
 */
export function getDevicePixelRatio(): number {
	if (typeof window === 'undefined') return 1;
	return window.devicePixelRatio || 1;
}

/**
 * Calculate optimal image width based on container
 */
export function calculateOptimalImageWidth(
	containerWidth: number,
	pixelRatio: number = getDevicePixelRatio()
): number {
	return Math.ceil(containerWidth * pixelRatio);
}

/**
 * Generate picture element sources for art direction
 */
export function generatePictureSources(
	baseSrc: string,
	variants: { media: string; src: string }[]
): ImageSource[] {
	return variants.map(variant => ({
		srcset: variant.src,
		media: variant.media
	}));
}

/**
 * Detect WebP support
 */
export async function supportsWebP(): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	
	const webpData = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
	
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img.width === 1);
		img.onerror = () => resolve(false);
		img.src = webpData;
	});
}

/**
 * Detect AVIF support
 */
export async function supportsAVIF(): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	
	const avifData = 'data:image/avif;base64,AAAAFGZ0eXBhdmlmAAAAAG1pZjEAAACgbWV0YQAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAC8AAAAGwAAACgpaW5mAAAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAVWlwcnAAAAAoaXBjbwAAABRpc3BlAAAAAAAAAAQAAAAEAAAADGF2MUOBAAAAAAAAFWlwbWEAAAAAAAAAAQABAgECAAAAI21kYXQSAAoIP8R8hAQ0BUAyDWeeUy0JG+QAACANEkA=';
	
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img.width === 1);
		img.onerror = () => resolve(false);
		img.src = avifData;
	});
}