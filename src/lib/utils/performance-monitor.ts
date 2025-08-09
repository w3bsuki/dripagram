/**
 * Performance Monitoring and Core Web Vitals Tracking
 * 
 * Provides comprehensive client-side performance monitoring including:
 * - Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
 * - Custom performance metrics
 * - Resource timing analysis
 * - Page load performance
 */

export interface PerformanceMetric {
	name: string;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	timestamp: number;
	navigationId?: string;
	url?: string;
}

export interface CoreWebVitals {
	lcp?: PerformanceMetric; // Largest Contentful Paint
	fid?: PerformanceMetric; // First Input Delay  
	cls?: PerformanceMetric; // Cumulative Layout Shift
	fcp?: PerformanceMetric; // First Contentful Paint
	ttfb?: PerformanceMetric; // Time to First Byte
	inp?: PerformanceMetric; // Interaction to Next Paint
}

// Core Web Vitals thresholds (from Google)
const THRESHOLDS = {
	lcp: { good: 2500, poor: 4000 },
	fid: { good: 100, poor: 300 },
	cls: { good: 0.1, poor: 0.25 },
	fcp: { good: 1800, poor: 3000 },
	ttfb: { good: 800, poor: 1800 },
	inp: { good: 200, poor: 500 }
} as const;

type MetricName = keyof typeof THRESHOLDS;

/**
 * Rate performance metric based on Google's thresholds
 */
function rateMetric(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
	const threshold = THRESHOLDS[name];
	if (value <= threshold.good) return 'good';
	if (value <= threshold.poor) return 'needs-improvement';
	return 'poor';
}

/**
 * Generate unique navigation ID for this page load
 */
function getNavigationId(): string {
	return `nav_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
	private navigationId: string;
	private metrics: Map<string, PerformanceMetric> = new Map();
	private observers: Map<string, PerformanceObserver> = new Map();
	private onMetricCallback?: (metric: PerformanceMetric) => void;

	constructor() {
		this.navigationId = getNavigationId();
		this.setupObservers();
	}

	/**
	 * Set callback for when metrics are collected
	 */
	onMetric(callback: (metric: PerformanceMetric) => void) {
		this.onMetricCallback = callback;
	}

	/**
	 * Setup performance observers for Core Web Vitals
	 */
	private setupObservers() {
		if (typeof window === 'undefined') return;

		// Largest Contentful Paint (LCP)
		this.observeLCP();

		// First Input Delay (FID) - being deprecated, but still useful
		this.observeFID();

		// Cumulative Layout Shift (CLS)
		this.observeCLS();

		// First Contentful Paint (FCP)
		this.observeFCP();

		// Time to First Byte (TTFB)
		this.observeTTFB();

		// Interaction to Next Paint (INP) - new metric replacing FID
		this.observeINP();

		// Resource loading performance
		this.observeResources();

		// Navigation timing
		this.observeNavigation();
	}

	/**
	 * Observe Largest Contentful Paint
	 */
	private observeLCP() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
				
				if (lastEntry) {
					const value = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
					this.recordMetric('lcp', value);
				}
			});

			observer.observe({ type: 'largest-contentful-paint', buffered: true });
			this.observers.set('lcp', observer);
		} catch (error) {
			console.warn('LCP observer failed:', error);
		}
	}

	/**
	 * Observe First Input Delay
	 */
	private observeFID() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (entry.processingStart && entry.startTime) {
						const value = entry.processingStart - entry.startTime;
						this.recordMetric('fid', value);
					}
				});
			});

			observer.observe({ type: 'first-input', buffered: true });
			this.observers.set('fid', observer);
		} catch (error) {
			console.warn('FID observer failed:', error);
		}
	}

	/**
	 * Observe Cumulative Layout Shift
	 */
	private observeCLS() {
		if (!('PerformanceObserver' in window)) return;

		try {
			let clsValue = 0;
			let sessionValue = 0;
			let sessionEntries: any[] = [];

			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				
				entries.forEach((entry: any) => {
					if (!entry.hadRecentInput) {
						const firstSessionEntry = sessionEntries[0];
						const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

						if (sessionValue && 
							entry.startTime - lastSessionEntry.startTime < 1000 &&
							entry.startTime - firstSessionEntry.startTime < 5000) {
							sessionValue += entry.value;
							sessionEntries.push(entry);
						} else {
							sessionValue = entry.value;
							sessionEntries = [entry];
						}

						if (sessionValue > clsValue) {
							clsValue = sessionValue;
							this.recordMetric('cls', clsValue);
						}
					}
				});
			});

			observer.observe({ type: 'layout-shift', buffered: true });
			this.observers.set('cls', observer);
		} catch (error) {
			console.warn('CLS observer failed:', error);
		}
	}

	/**
	 * Observe First Contentful Paint
	 */
	private observeFCP() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
				
				if (fcpEntry) {
					this.recordMetric('fcp', fcpEntry.startTime);
				}
			});

			observer.observe({ type: 'paint', buffered: true });
			this.observers.set('fcp', observer);
		} catch (error) {
			console.warn('FCP observer failed:', error);
		}
	}

	/**
	 * Observe Time to First Byte
	 */
	private observeTTFB() {
		if (!('performance' in window) || !performance.getEntriesByType) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (entry.responseStart && entry.requestStart) {
						const value = entry.responseStart - entry.requestStart;
						this.recordMetric('ttfb', value);
					}
				});
			});

			observer.observe({ type: 'navigation', buffered: true });
			this.observers.set('ttfb', observer);
		} catch (error) {
			// Fallback to navigation timing API
			const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			if (navigation && navigation.responseStart && navigation.requestStart) {
				const value = navigation.responseStart - navigation.requestStart;
				this.recordMetric('ttfb', value);
			}
		}
	}

	/**
	 * Observe Interaction to Next Paint (INP)
	 */
	private observeINP() {
		if (!('PerformanceObserver' in window)) return;

		try {
			let longestInteraction = 0;

			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (entry.duration > longestInteraction) {
						longestInteraction = entry.duration;
						this.recordMetric('inp', longestInteraction);
					}
				});
			});

			observer.observe({ type: 'event', buffered: true });
			this.observers.set('inp', observer);
		} catch (error) {
			console.warn('INP observer failed:', error);
		}
	}

	/**
	 * Observe resource loading performance
	 */
	private observeResources() {
		if (!('PerformanceObserver' in window)) return;

		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					// Track slow resources (>2s)
					if (entry.duration > 2000) {
						this.recordCustomMetric('slow-resource', entry.duration, {
							name: entry.name,
							type: entry.initiatorType,
							size: entry.transferSize
						});
					}
				});
			});

			observer.observe({ type: 'resource', buffered: true });
			this.observers.set('resource', observer);
		} catch (error) {
			console.warn('Resource observer failed:', error);
		}
	}

	/**
	 * Observe navigation timing
	 */
	private observeNavigation() {
		if (typeof window === 'undefined' || !('performance' in window)) return;

		window.addEventListener('load', () => {
			setTimeout(() => {
				const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
				
				if (navigation) {
					// DOM Content Loaded
					const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
					this.recordCustomMetric('dom-content-loaded', domContentLoaded);

					// Page Load Time
					const pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
					this.recordCustomMetric('page-load-time', pageLoadTime);

					// DNS Lookup Time
					const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
					this.recordCustomMetric('dns-lookup', dnsTime);

					// Connection Time
					const connectionTime = navigation.connectEnd - navigation.connectStart;
					this.recordCustomMetric('connection-time', connectionTime);
				}
			}, 0);
		});
	}

	/**
	 * Record a Core Web Vitals metric
	 */
	private recordMetric(name: MetricName, value: number) {
		const metric: PerformanceMetric = {
			name,
			value,
			rating: rateMetric(name, value),
			timestamp: Date.now(),
			navigationId: this.navigationId,
			url: window.location.href
		};

		this.metrics.set(name, metric);

		// Call callback if set
		if (this.onMetricCallback) {
			this.onMetricCallback(metric);
		}

		// Send to analytics
		this.sendToAnalytics(metric);
	}

	/**
	 * Record a custom metric
	 */
	private recordCustomMetric(name: string, value: number, metadata?: any) {
		const metric: PerformanceMetric = {
			name,
			value,
			rating: 'good', // Custom metrics don't have standard ratings
			timestamp: Date.now(),
			navigationId: this.navigationId,
			url: window.location.href,
			...metadata
		};

		this.metrics.set(name, metric);

		if (this.onMetricCallback) {
			this.onMetricCallback(metric);
		}

		this.sendToAnalytics(metric);
	}

	/**
	 * Send metric to analytics
	 */
	private async sendToAnalytics(metric: PerformanceMetric) {
		try {
			// Send to internal analytics API
			await fetch('/api/analytics/performance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					metric,
					timestamp: Date.now(),
					userAgent: navigator.userAgent,
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					connection: (navigator as any).connection ? {
						effectiveType: (navigator as any).connection.effectiveType,
						downlink: (navigator as any).connection.downlink,
						rtt: (navigator as any).connection.rtt
					} : undefined
				})
			});
		} catch (error) {
			console.warn('Failed to send performance metric:', error);
		}
	}

	/**
	 * Get all collected metrics
	 */
	getMetrics(): CoreWebVitals {
		return {
			lcp: this.metrics.get('lcp'),
			fid: this.metrics.get('fid'),
			cls: this.metrics.get('cls'),
			fcp: this.metrics.get('fcp'),
			ttfb: this.metrics.get('ttfb'),
			inp: this.metrics.get('inp')
		};
	}

	/**
	 * Get performance score based on Core Web Vitals
	 */
	getPerformanceScore(): { score: number; rating: 'good' | 'needs-improvement' | 'poor' } {
		const metrics = this.getMetrics();
		const scores: number[] = [];

		Object.values(metrics).forEach(metric => {
			if (metric) {
				switch (metric.rating) {
					case 'good': scores.push(100); break;
					case 'needs-improvement': scores.push(50); break;
					case 'poor': scores.push(0); break;
				}
			}
		});

		const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

		let rating: 'good' | 'needs-improvement' | 'poor' = 'poor';
		if (averageScore >= 90) rating = 'good';
		else if (averageScore >= 50) rating = 'needs-improvement';

		return { score: Math.round(averageScore), rating };
	}

	/**
	 * Clean up observers
	 */
	disconnect() {
		this.observers.forEach(observer => observer.disconnect());
		this.observers.clear();
		this.metrics.clear();
	}
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(onMetric?: (metric: PerformanceMetric) => void): PerformanceMonitor {
	if (typeof window === 'undefined') {
		// Server-side - return mock
		return {
			onMetric: () => {},
			getMetrics: () => ({}),
			getPerformanceScore: () => ({ score: 0, rating: 'poor' }),
			disconnect: () => {}
		} as any;
	}

	if (performanceMonitor) {
		performanceMonitor.disconnect();
	}

	performanceMonitor = new PerformanceMonitor();

	if (onMetric) {
		performanceMonitor.onMetric(onMetric);
	}

	return performanceMonitor;
}

/**
 * Get current performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor | null {
	return performanceMonitor;
}

/**
 * Track custom performance event
 */
export function trackPerformanceEvent(name: string, duration: number, metadata?: any) {
	if (performanceMonitor) {
		(performanceMonitor as any).recordCustomMetric(name, duration, metadata);
	}
}