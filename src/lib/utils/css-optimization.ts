import { browser } from '$app/environment';

/**
 * Critical CSS utilities for performance optimization
 */

// Store for tracking loaded CSS
const loadedCSS = new Set<string>();

/**
 * Preload CSS files for better performance
 */
export function preloadCSS(href: string) {
	if (!browser || loadedCSS.has(href)) return;

	const link = document.createElement('link');
	link.rel = 'preload';
	link.as = 'style';
	link.href = href;
	link.onload = () => {
		link.onload = null;
		link.rel = 'stylesheet';
	};
	document.head.appendChild(link);
	loadedCSS.add(href);
}

/**
 * Load CSS asynchronously to avoid render blocking
 */
export function loadCSSAsync(href: string): Promise<void> {
	if (!browser || loadedCSS.has(href)) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.media = 'print'; // Load as non-render-blocking
		link.onload = () => {
			link.media = 'all'; // Switch to render-blocking
			loadedCSS.add(href);
			resolve();
		};
		link.onerror = reject;
		document.head.appendChild(link);
		
		// Fallback timeout
		setTimeout(() => {
			link.media = 'all';
			resolve();
		}, 3000);
	});
}

/**
 * Remove unused CSS classes (basic implementation)
 */
export function removeUnusedCSS() {
	if (!browser) return;

	// This is a simplified version - in production you'd use PurgeCSS or similar
	const stylesheets = Array.from(document.styleSheets);
	const usedClasses = new Set<string>();

	// Collect all used classes
	document.querySelectorAll('*').forEach(element => {
		element.classList.forEach(className => {
			usedClasses.add(className);
		});
	});

	// In a real implementation, you would:
	// 1. Parse CSS rules
	// 2. Check if selectors are used
	// 3. Remove unused rules
	// This is just a placeholder for the concept
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function extractCriticalCSS(): string {
	if (!browser) return '';

	const criticalElements = document.querySelectorAll('[data-critical]');
	const criticalCSS: string[] = [];

	// This is a simplified approach - real critical CSS extraction is complex
	criticalElements.forEach(element => {
		const styles = window.getComputedStyle(element);
		const selector = element.tagName.toLowerCase() + 
			(element.className ? `.${element.className.split(' ').join('.')}` : '');
		
		// Extract important styles for above-the-fold content
		const importantStyles = [
			'display', 'position', 'width', 'height', 'margin', 'padding',
			'background', 'font-family', 'font-size', 'color'
		];

		const rules = importantStyles
			.map(prop => `${prop}: ${styles.getPropertyValue(prop)}`)
			.filter(rule => !rule.includes('auto') && !rule.includes('initial'))
			.join('; ');

		if (rules) {
			criticalCSS.push(`${selector} { ${rules} }`);
		}
	});

	return criticalCSS.join('\n');
}

/**
 * Inline critical CSS in document head
 */
export function inlineCriticalCSS(css: string) {
	if (!browser || !css) return;

	const style = document.createElement('style');
	style.textContent = css;
	style.setAttribute('data-critical', 'true');
	document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Font loading optimization
 */
export function optimizeFontLoading() {
	if (!browser) return;

	// Preload critical fonts
	const criticalFonts = [
		'/fonts/inter-variable.woff2',
		'/fonts/inter-italic-variable.woff2'
	];

	criticalFonts.forEach(font => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'font';
		link.type = 'font/woff2';
		link.crossOrigin = 'anonymous';
		link.href = font;
		document.head.appendChild(link);
	});

	// Use font-display: swap for non-critical fonts
	if ('fonts' in document) {
		document.fonts.addEventListener('loading', (event) => {
			// Track font loading performance
			if (typeof window !== 'undefined' && 'posthog' in window) {
				(window as any).posthog?.capture('font_loading', {
					font_family: (event as any).fontface?.family,
					status: 'loading'
				});
			}
		});

		document.fonts.addEventListener('loadingdone', () => {
			// All fonts loaded
			if (typeof window !== 'undefined' && 'posthog' in window) {
				(window as any).posthog?.capture('fonts_loaded', {
					load_time: performance.now(),
					count: document.fonts.size
				});
			}
		});
	}
}

/**
 * Optimize CSS animations and transitions for performance
 */
export function optimizeAnimations() {
	if (!browser) return;

	// Respect user's motion preferences
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	if (prefersReducedMotion) {
		const style = document.createElement('style');
		style.textContent = `
			*, *::before, *::after {
				animation-duration: 0.01ms !important;
				animation-iteration-count: 1 !important;
				transition-duration: 0.01ms !important;
				scroll-behavior: auto !important;
			}
		`;
		document.head.appendChild(style);
	}

	// Use CSS containment for animated elements
	const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
	animatedElements.forEach(element => {
		(element as HTMLElement).style.contain = 'layout style';
	});
}

/**
 * Initialize all CSS optimizations
 */
export function initializeCSSOptimizations() {
	if (!browser) return;

	// Run optimizations when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			optimizeFontLoading();
			optimizeAnimations();
		});
	} else {
		optimizeFontLoading();
		optimizeAnimations();
	}
}