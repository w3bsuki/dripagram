/**
 * Performance Monitoring for Driplo.bg
 * Tracks CSS budget, Core Web Vitals, and user interactions
 */

interface PerformanceMetrics {
	cssSize: number;
	criticalCssSize: number;
	fcp: number; // First Contentful Paint
	lcp: number; // Largest Contentful Paint
	fid: number; // First Input Delay
	cls: number; // Cumulative Layout Shift
	ttfb: number; // Time to First Byte
	inp: number; // Interaction to Next Paint
}

interface PerformanceBudget {
	maxCssSize: number; // 50KB gzipped
	maxCriticalCss: number; // 14KB inline
	maxFCP: number; // 1000ms
	maxLCP: number; // 2500ms
	maxFID: number; // 100ms
	maxCLS: number; // 0.1
	maxINP: number; // 200ms
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
	maxCssSize: 50 * 1024, // 50KB
	maxCriticalCss: 14 * 1024, // 14KB
	maxFCP: 1000,
	maxLCP: 2500,
	maxFID: 100,
	maxCLS: 0.1,
	maxINP: 200
};

class PerformanceMonitor {
	private metrics: Partial<PerformanceMetrics> = {};
	private observer: PerformanceObserver | null = null;

	constructor() {
		if (typeof window === 'undefined') return;
		this.initializeObservers();
		this.measureCSSSize();
	}

	/**
	 * Initialize performance observers for Core Web Vitals
	 */
	private initializeObservers(): void {
		// Observe paint timing
		if ('PerformanceObserver' in window) {
			try {
				// FCP and LCP
				const paintObserver = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						if (entry.entryType === 'paint') {
							if (entry.name === 'first-contentful-paint') {
								this.metrics.fcp = Math.round(entry.startTime);
							}
						} else if (entry.entryType === 'largest-contentful-paint') {
							this.metrics.lcp = Math.round(entry.startTime);
						}
					}
				});
				paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

				// Layout Shift
				const clsObserver = new PerformanceObserver((list) => {
					let cls = 0;
					for (const entry of list.getEntries()) {
						if (!(entry as any).hadRecentInput) {
							cls += (entry as any).value;
						}
					}
					this.metrics.cls = Math.round(cls * 1000) / 1000;
				});
				clsObserver.observe({ entryTypes: ['layout-shift'] });

				// First Input Delay
				const fidObserver = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						this.metrics.fid = Math.round((entry as any).processingStart - entry.startTime);
					}
				});
				fidObserver.observe({ entryTypes: ['first-input'] });

			} catch (e) {
				console.warn('Performance monitoring not fully supported');
			}
		}

		// Time to First Byte
		if (window.performance && window.performance.timing) {
			const timing = window.performance.timing;
			this.metrics.ttfb = timing.responseStart - timing.navigationStart;
		}
	}

	/**
	 * Measure CSS file sizes
	 */
	private async measureCSSSize(): Promise<void> {
		if (!window.performance || !window.performance.getEntriesByType) return;

		const resources = window.performance.getEntriesByType('resource');
		let totalCSSSize = 0;

		for (const resource of resources) {
			if (resource.name.includes('.css')) {
				totalCSSSize += (resource as any).transferSize || 0;
			}
		}

		this.metrics.cssSize = totalCSSSize;

		// Measure critical CSS (inline styles)
		const styleElements = document.querySelectorAll('style');
		let criticalSize = 0;
		styleElements.forEach(style => {
			criticalSize += new Blob([style.innerHTML]).size;
		});
		this.metrics.criticalCssSize = criticalSize;
	}

	/**
	 * Check if performance is within budget
	 */
	public checkBudget(): { passed: boolean; violations: string[] } {
		const violations: string[] = [];

		if (this.metrics.cssSize && this.metrics.cssSize > PERFORMANCE_BUDGET.maxCssSize) {
			violations.push(`CSS size (${Math.round(this.metrics.cssSize / 1024)}KB) exceeds budget (50KB)`);
		}

		if (this.metrics.criticalCssSize && this.metrics.criticalCssSize > PERFORMANCE_BUDGET.maxCriticalCss) {
			violations.push(`Critical CSS (${Math.round(this.metrics.criticalCssSize / 1024)}KB) exceeds budget (14KB)`);
		}

		if (this.metrics.fcp && this.metrics.fcp > PERFORMANCE_BUDGET.maxFCP) {
			violations.push(`FCP (${this.metrics.fcp}ms) exceeds budget (1000ms)`);
		}

		if (this.metrics.lcp && this.metrics.lcp > PERFORMANCE_BUDGET.maxLCP) {
			violations.push(`LCP (${this.metrics.lcp}ms) exceeds budget (2500ms)`);
		}

		if (this.metrics.fid && this.metrics.fid > PERFORMANCE_BUDGET.maxFID) {
			violations.push(`FID (${this.metrics.fid}ms) exceeds budget (100ms)`);
		}

		if (this.metrics.cls && this.metrics.cls > PERFORMANCE_BUDGET.maxCLS) {
			violations.push(`CLS (${this.metrics.cls}) exceeds budget (0.1)`);
		}

		return {
			passed: violations.length === 0,
			violations
		};
	}

	/**
	 * Get current metrics
	 */
	public getMetrics(): Partial<PerformanceMetrics> {
		return { ...this.metrics };
	}

	/**
	 * Log performance report to console
	 */
	public logReport(): void {
		const budget = this.checkBudget();
		const metrics = this.getMetrics();

		console.group('🚀 Driplo Performance Report');
		
		console.table({
			'CSS Size': `${Math.round((metrics.cssSize || 0) / 1024)}KB / 50KB`,
			'Critical CSS': `${Math.round((metrics.criticalCssSize || 0) / 1024)}KB / 14KB`,
			'FCP': `${metrics.fcp || 'N/A'}ms / 1000ms`,
			'LCP': `${metrics.lcp || 'N/A'}ms / 2500ms`,
			'FID': `${metrics.fid || 'N/A'}ms / 100ms`,
			'CLS': `${metrics.cls || 'N/A'} / 0.1`
		});

		if (budget.violations.length > 0) {
			console.warn('⚠️ Performance Budget Violations:');
			budget.violations.forEach(v => console.warn(`  - ${v}`));
		} else {
			console.log('✅ All performance budgets met!');
		}

		console.groupEnd();
	}

	/**
	 * Send metrics to analytics (if needed)
	 */
	public sendToAnalytics(): void {
		const metrics = this.getMetrics();
		const budget = this.checkBudget();

		// Send to your analytics service
		if (typeof window !== 'undefined' && (window as any).gtag) {
			(window as any).gtag('event', 'performance_metrics', {
				event_category: 'Performance',
				event_label: budget.passed ? 'Within Budget' : 'Over Budget',
				value: metrics.lcp,
				custom_map: metrics
			});
		}
	}
}

// Export singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor | null {
	if (typeof window === 'undefined') return null;
	
	if (!performanceMonitor) {
		performanceMonitor = new PerformanceMonitor();
	}
	
	return performanceMonitor;
}

// Auto-log report in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
	window.addEventListener('load', () => {
		setTimeout(() => {
			const monitor = getPerformanceMonitor();
			monitor?.logReport();
		}, 3000); // Wait for metrics to be collected
	});
}

// Export for use in components
export type { PerformanceMetrics, PerformanceBudget };