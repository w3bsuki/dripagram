import { browser } from '$app/environment';

interface PerformanceMetric {
	name: string;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	timestamp: number;
}

interface CoreWebVitals {
	fcp?: PerformanceMetric; // First Contentful Paint
	lcp?: PerformanceMetric; // Largest Contentful Paint
	fid?: PerformanceMetric; // First Input Delay
	cls?: PerformanceMetric; // Cumulative Layout Shift
	ttfb?: PerformanceMetric; // Time to First Byte
}

type MetricCallback = (metric: PerformanceMetric) => void;

class PerformanceMonitor {
	private metrics: CoreWebVitals = {};
	private callbacks: MetricCallback[] = [];
	private observer?: PerformanceObserver;

	constructor() {
		if (!browser) return;
		this.init();
	}

	private init() {
		// Web Vitals thresholds
		const thresholds = {
			fcp: { good: 1800, poor: 3000 },
			lcp: { good: 2500, poor: 4000 },
			fid: { good: 100, poor: 300 },
			cls: { good: 0.1, poor: 0.25 },
			ttfb: { good: 800, poor: 1800 }
		};

		const getRating = (name: keyof typeof thresholds, value: number): 'good' | 'needs-improvement' | 'poor' => {
			const threshold = thresholds[name];
			if (value <= threshold.good) return 'good';
			if (value <= threshold.poor) return 'needs-improvement';
			return 'poor';
		};

		const reportMetric = (name: keyof CoreWebVitals, value: number) => {
			const metric: PerformanceMetric = {
				name,
				value,
				rating: getRating(name, value),
				timestamp: Date.now()
			};

			this.metrics[name] = metric;
			this.callbacks.forEach(callback => callback(metric));
		};

		// First Contentful Paint
		this.observePerformance('paint', (entries) => {
			const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
			if (fcpEntry) {
				reportMetric('fcp', fcpEntry.startTime);
			}
		});

		// Largest Contentful Paint
		this.observePerformance('largest-contentful-paint', (entries) => {
			const lcpEntry = entries[entries.length - 1];
			if (lcpEntry) {
				reportMetric('lcp', lcpEntry.startTime);
			}
		});

		// First Input Delay
		this.observePerformance('first-input', (entries) => {
			const fidEntry = entries[0];
			if (fidEntry && 'processingStart' in fidEntry) {
				reportMetric('fid', (fidEntry as any).processingStart - fidEntry.startTime);
			}
		});

		// Cumulative Layout Shift
		let clsValue = 0;
		this.observePerformance('layout-shift', (entries) => {
			for (const entry of entries) {
				// Only count layout shifts without recent user input
				if (!(entry as any).hadRecentInput) {
					clsValue += (entry as any).value;
				}
			}
			reportMetric('cls', clsValue);
		});

		// Time to First Byte
		if ('navigation' in performance) {
			const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			if (navigationEntry) {
				reportMetric('ttfb', navigationEntry.responseStart);
			}
		}
	}

	private observePerformance(type: string, callback: (entries: PerformanceEntry[]) => void) {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				callback(list.getEntries());
			});
			observer.observe({ type, buffered: true });
		} catch (e) {
			// Some browsers don't support all entry types
			console.debug(`Performance observer not supported for: ${type}`);
		}
	}

	onMetric(callback: MetricCallback) {
		this.callbacks.push(callback);
	}

	getMetrics(): CoreWebVitals {
		return { ...this.metrics };
	}

	// Resource loading performance
	measureResourceTiming() {
		if (!browser || !('performance' in window)) return {};

		const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
		
		const byType = resources.reduce((acc, resource) => {
			const type = this.getResourceType(resource.name);
			if (!acc[type]) acc[type] = [];
			acc[type].push({
				name: resource.name,
				duration: resource.duration,
				size: resource.transferSize,
				cached: resource.transferSize === 0
			});
			return acc;
		}, {} as Record<string, any[]>);

		return {
			total: resources.length,
			byType,
			totalSize: resources.reduce((sum, r) => sum + r.transferSize, 0),
			totalDuration: resources.reduce((sum, r) => sum + r.duration, 0)
		};
	}

	private getResourceType(url: string): string {
		if (url.includes('.js')) return 'javascript';
		if (url.includes('.css')) return 'stylesheet';
		if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) return 'image';
		if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
		return 'other';
	}

	// Memory usage (if available)
	getMemoryInfo() {
		if (!browser || !('memory' in performance)) return null;
		
		const memory = (performance as any).memory;
		return {
			used: Math.round(memory.usedJSHeapSize / 1048576), // MB
			total: Math.round(memory.totalJSHeapSize / 1048576), // MB
			limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
		};
	}

	// Network connection info
	getConnectionInfo() {
		if (!browser || !('connection' in navigator)) return null;

		const connection = (navigator as any).connection;
		return {
			effectiveType: connection.effectiveType,
			downlink: connection.downlink,
			rtt: connection.rtt,
			saveData: connection.saveData
		};
	}
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Analytics integration
export function trackPerformanceMetrics() {
	if (!browser) return;

	performanceMonitor.onMetric((metric) => {
		// Track with PostHog if available
		if (typeof window !== 'undefined' && 'posthog' in window) {
			(window as any).posthog?.capture('performance_metric', {
				metric_name: metric.name,
				metric_value: metric.value,
				metric_rating: metric.rating,
				timestamp: metric.timestamp
			});
		}

		// Log poor metrics for debugging
		if (metric.rating === 'poor') {
			console.warn(`Poor ${metric.name.toUpperCase()}: ${metric.value}ms`);
		}
	});
}

// Image loading performance
export function trackImagePerformance(src: string, startTime: number) {
	if (!browser) return;

	const loadTime = performance.now() - startTime;
	
	// Track with analytics
	if (typeof window !== 'undefined' && 'posthog' in window) {
		(window as any).posthog?.capture('image_load_time', {
			src: src.split('/').pop(), // Just filename for privacy
			load_time: loadTime,
			rating: loadTime < 200 ? 'good' : loadTime < 500 ? 'needs-improvement' : 'poor'
		});
	}
}

// Bundle loading performance
export function trackBundlePerformance() {
	if (!browser) return;

	// Track when chunks load
	const originalImport = (window as any).__vitePreload;
	if (originalImport) {
		(window as any).__vitePreload = async (...args: any[]) => {
			const startTime = performance.now();
			try {
				const result = await originalImport(...args);
				const loadTime = performance.now() - startTime;
				
				if (typeof window !== 'undefined' && 'posthog' in window) {
					(window as any).posthog?.capture('chunk_load_time', {
						chunk: args[0],
						load_time: loadTime
					});
				}
				
				return result;
			} catch (error) {
				if (typeof window !== 'undefined' && 'posthog' in window) {
					(window as any).posthog?.capture('chunk_load_error', {
						chunk: args[0],
						error: error instanceof Error ? error.message : 'Unknown error'
					});
				}
				throw error;
			}
		};
	}
}