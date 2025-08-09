/**
 * Real-Time Performance Monitoring System
 * Phase 5B: Enterprise-Grade Scalability and Monitoring
 */

export interface PerformanceMetrics {
	// Core Web Vitals
	lcp: number; // Largest Contentful Paint
	fid: number; // First Input Delay  
	cls: number; // Cumulative Layout Shift
	fcp: number; // First Contentful Paint
	ttfb: number; // Time to First Byte
	inp: number; // Interaction to Next Paint (new Core Web Vital)
	
	// Custom Business Metrics
	searchResponseTime: number;
	imageLoadTime: number;
	apiResponseTime: number;
	databaseQueryTime: number;
	
	// User Experience Metrics
	bounceRate: number;
	sessionDuration: number;
	pageViews: number;
	conversionRate: number;
	
	// Technical Metrics
	memoryUsage: number;
	cpuUsage: number;
	networkLatency: number;
	cacheHitRate: number;
	
	timestamp: number;
	url: string;
	userAgent: string;
	userId?: string;
	sessionId: string;
}

export interface AlertRule {
	id: string;
	name: string;
	metric: keyof PerformanceMetrics;
	threshold: number;
	comparison: 'gt' | 'lt' | 'eq';
	severity: 'low' | 'medium' | 'high' | 'critical';
	enabled: boolean;
	cooldown: number; // Minutes between alerts
	lastTriggered?: number;
}

export interface PerformanceAlert {
	id: string;
	rule: AlertRule;
	value: number;
	timestamp: number;
	metadata: {
		url: string;
		userAgent: string;
		userId?: string;
		additionalContext?: Record<string, any>;
	};
	resolved?: boolean;
	resolvedAt?: number;
}

export interface PerformanceReport {
	timeRange: {
		start: number;
		end: number;
	};
	overview: {
		totalPageViews: number;
		averageLoadTime: number;
		bounceRate: number;
		conversionRate: number;
		errorRate: number;
	};
	coreWebVitals: {
		lcp: { p50: number; p75: number; p95: number; p99: number };
		fid: { p50: number; p75: number; p95: number; p99: number };
		cls: { p50: number; p75: number; p95: number; p99: number };
		grades: {
			good: number;
			needsImprovement: number;
			poor: number;
		};
	};
	topSlowPages: Array<{
		url: string;
		averageLoadTime: number;
		visits: number;
		bounceRate: number;
	}>;
	userExperience: {
		searchPerformance: number;
		imageLoadPerformance: number;
		apiPerformance: number;
		mobileFriendliness: number;
	};
	recommendations: string[];
}

/**
 * Advanced Performance Monitoring and Alerting System
 */
export class PerformanceMonitor {
	private metrics: PerformanceMetrics[] = [];
	private alertRules: AlertRule[] = [];
	private activeAlerts: PerformanceAlert[] = [];
	
	// Performance thresholds based on industry standards
	private readonly THRESHOLDS = {
		lcp: { good: 2500, poor: 4000 }, // ms
		fid: { good: 100, poor: 300 }, // ms
		cls: { good: 0.1, poor: 0.25 }, // score
		fcp: { good: 1800, poor: 3000 }, // ms
		ttfb: { good: 600, poor: 1500 }, // ms
		searchResponseTime: { good: 500, poor: 2000 }, // ms
		apiResponseTime: { good: 200, poor: 1000 }, // ms
	};
	
	private observers: {
		navigation?: PerformanceObserver;
		paint?: PerformanceObserver;
		layout?: PerformanceObserver;
		measure?: PerformanceObserver;
	} = {};
	
	/**
	 * Initialize performance monitoring
	 */
	async initialize(): Promise<void> {
		try {
			// Set up default alert rules
			this.setupDefaultAlertRules();
			
			// Initialize Web APIs monitoring
			await this.initializeWebAPIs();
			
			// Start real-time monitoring
			this.startRealtimeMonitoring();
			
			// Set up periodic reporting
			this.startPeriodicReporting();
			
			console.log('Performance Monitor initialized');
		} catch (error) {
			console.error('Performance Monitor initialization failed:', error);
		}
	}
	
	/**
	 * Track Core Web Vitals and custom metrics
	 */
	async trackMetrics(customMetrics?: Partial<PerformanceMetrics>): Promise<void> {
		const metrics: PerformanceMetrics = {
			// Core Web Vitals
			lcp: await this.measureLCP(),
			fid: await this.measureFID(),
			cls: await this.measureCLS(),
			fcp: await this.measureFCP(),
			ttfb: await this.measureTTFB(),
			inp: await this.measureINP(),
			
			// Custom metrics
			searchResponseTime: customMetrics?.searchResponseTime || 0,
			imageLoadTime: await this.measureImageLoadTime(),
			apiResponseTime: customMetrics?.apiResponseTime || 0,
			databaseQueryTime: customMetrics?.databaseQueryTime || 0,
			
			// UX metrics
			bounceRate: await this.calculateBounceRate(),
			sessionDuration: this.getSessionDuration(),
			pageViews: this.getPageViews(),
			conversionRate: await this.calculateConversionRate(),
			
			// Technical metrics
			memoryUsage: await this.getMemoryUsage(),
			cpuUsage: await this.getCPUUsage(),
			networkLatency: await this.measureNetworkLatency(),
			cacheHitRate: await this.getCacheHitRate(),
			
			// Context
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
			sessionId: this.getSessionId(),
			...customMetrics
		};
		
		// Store metrics
		this.metrics.push(metrics);
		
		// Check for alerts
		this.checkAlertRules(metrics);
		
		// Send to analytics
		await this.sendMetricsToAnalytics(metrics);
		
		// Cleanup old metrics (keep last 1000)
		if (this.metrics.length > 1000) {
			this.metrics = this.metrics.slice(-1000);
		}
	}
	
	/**
	 * Measure Largest Contentful Paint (LCP)
	 */
	private async measureLCP(): Promise<number> {
		return new Promise((resolve) => {
			let lcpValue = 0;
			
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				if (entries.length > 0) {
					const lastEntry = entries[entries.length - 1];
					lcpValue = lastEntry.startTime;
				}
			});
			
			observer.observe({ type: 'largest-contentful-paint', buffered: true });
			
			// Fallback timeout
			setTimeout(() => {
				observer.disconnect();
				resolve(lcpValue);
			}, 5000);
		});
	}
	
	/**
	 * Measure First Input Delay (FID)
	 */
	private async measureFID(): Promise<number> {
		return new Promise((resolve) => {
			let fidValue = 0;
			
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (entry.processingStart && entry.startTime) {
						fidValue = entry.processingStart - entry.startTime;
					}
				});
			});
			
			observer.observe({ type: 'first-input', buffered: true });
			
			// Resolve after 10 seconds or on page hide
			const timeout = setTimeout(() => {
				observer.disconnect();
				resolve(fidValue);
			}, 10000);
			
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'hidden') {
					clearTimeout(timeout);
					observer.disconnect();
					resolve(fidValue);
				}
			}, { once: true });
		});
	}
	
	/**
	 * Measure Cumulative Layout Shift (CLS)
	 */
	private async measureCLS(): Promise<number> {
		return new Promise((resolve) => {
			let clsValue = 0;
			
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (!entry.hadRecentInput) {
						clsValue += entry.value;
					}
				});
			});
			
			observer.observe({ type: 'layout-shift', buffered: true });
			
			// Stop measuring when page becomes hidden
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'hidden') {
					observer.disconnect();
					resolve(clsValue);
				}
			}, { once: true });
			
			// Fallback timeout
			setTimeout(() => {
				observer.disconnect();
				resolve(clsValue);
			}, 30000);
		});
	}
	
	/**
	 * Measure First Contentful Paint (FCP)
	 */
	private async measureFCP(): Promise<number> {
		const paintEntries = performance.getEntriesByType('paint');
		const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
		return fcpEntry ? fcpEntry.startTime : 0;
	}
	
	/**
	 * Measure Time to First Byte (TTFB)
	 */
	private async measureTTFB(): Promise<number> {
		const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		return navigation ? navigation.responseStart - navigation.fetchStart : 0;
	}
	
	/**
	 * Measure Interaction to Next Paint (INP)
	 */
	private async measureINP(): Promise<number> {
		// Simplified INP measurement
		return new Promise((resolve) => {
			let maxDelay = 0;
			
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry: any) => {
					if (entry.processingEnd && entry.startTime) {
						const delay = entry.processingEnd - entry.startTime;
						maxDelay = Math.max(maxDelay, delay);
					}
				});
			});
			
			observer.observe({ type: 'event', buffered: true });
			
			setTimeout(() => {
				observer.disconnect();
				resolve(maxDelay);
			}, 10000);
		});
	}
	
	/**
	 * Measure image load times
	 */
	private async measureImageLoadTime(): Promise<number> {
		const imageEntries = performance.getEntriesByType('resource')
			.filter(entry => entry.name.match(/\\.(png|jpg|jpeg|gif|webp|svg)$/i));
		
		if (imageEntries.length === 0) return 0;
		
		const totalTime = imageEntries.reduce((sum, entry) => sum + entry.duration, 0);
		return totalTime / imageEntries.length;
	}
	
	/**
	 * Calculate bounce rate
	 */
	private async calculateBounceRate(): Promise<number> {
		// Simplified calculation - in production would use analytics data
		const sessionData = sessionStorage.getItem('performance_session');
		if (!sessionData) return 0;
		
		const session = JSON.parse(sessionData);
		return session.bounceRate || 0;
	}
	
	/**
	 * Get session duration
	 */
	private getSessionDuration(): number {
		const sessionStart = sessionStorage.getItem('session_start');
		if (!sessionStart) return 0;
		
		return Date.now() - parseInt(sessionStart);
	}
	
	/**
	 * Get page views in session
	 */
	private getPageViews(): number {
		const pageViews = sessionStorage.getItem('page_views');
		return pageViews ? parseInt(pageViews) : 1;
	}
	
	/**
	 * Calculate conversion rate
	 */
	private async calculateConversionRate(): Promise<number> {
		// Simplified - in production would track actual conversions
		return 0.05; // 5% baseline conversion rate
	}
	
	/**
	 * Get memory usage
	 */
	private async getMemoryUsage(): Promise<number> {
		if ('memory' in performance) {
			const memory = (performance as any).memory;
			return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
		}
		return 0;
	}
	
	/**
	 * Get CPU usage (approximate)
	 */
	private async getCPUUsage(): Promise<number> {
		// Approximate CPU usage based on timing
		const start = performance.now();
		for (let i = 0; i < 10000; i++) {
			Math.random();
		}
		const duration = performance.now() - start;
		
		// Normalize to 0-100 scale (higher = more CPU load)
		return Math.min(100, duration * 10);
	}
	
	/**
	 * Measure network latency
	 */
	private async measureNetworkLatency(): Promise<number> {
		const start = performance.now();
		try {
			await fetch('/api/health', { method: 'HEAD' });
			return performance.now() - start;
		} catch {
			return 0;
		}
	}
	
	/**
	 * Get cache hit rate
	 */
	private async getCacheHitRate(): Promise<number> {
		// Analyze resource entries for cache hits
		const resourceEntries = performance.getEntriesByType('resource');
		const cacheHits = resourceEntries.filter((entry: any) => 
			entry.transferSize === 0 && entry.decodedBodySize > 0
		);
		
		return resourceEntries.length > 0 ? cacheHits.length / resourceEntries.length : 0;
	}
	
	/**
	 * Set up default alert rules
	 */
	private setupDefaultAlertRules(): void {
		this.alertRules = [
			{
				id: 'lcp-critical',
				name: 'LCP Critical',
				metric: 'lcp',
				threshold: 4000,
				comparison: 'gt',
				severity: 'critical',
				enabled: true,
				cooldown: 5
			},
			{
				id: 'fid-high',
				name: 'FID High',
				metric: 'fid',
				threshold: 300,
				comparison: 'gt',
				severity: 'high',
				enabled: true,
				cooldown: 5
			},
			{
				id: 'cls-medium',
				name: 'CLS Medium',
				metric: 'cls',
				threshold: 0.25,
				comparison: 'gt',
				severity: 'medium',
				enabled: true,
				cooldown: 10
			},
			{
				id: 'search-slow',
				name: 'Search Response Slow',
				metric: 'searchResponseTime',
				threshold: 2000,
				comparison: 'gt',
				severity: 'high',
				enabled: true,
				cooldown: 3
			},
			{
				id: 'api-slow',
				name: 'API Response Slow',
				metric: 'apiResponseTime',
				threshold: 1000,
				comparison: 'gt',
				severity: 'medium',
				enabled: true,
				cooldown: 5
			}
		];
	}
	
	/**
	 * Check alert rules against metrics
	 */
	private checkAlertRules(metrics: PerformanceMetrics): void {
		this.alertRules.forEach(rule => {
			if (!rule.enabled) return;
			
			// Check cooldown
			if (rule.lastTriggered && Date.now() - rule.lastTriggered < rule.cooldown * 60 * 1000) {
				return;
			}
			
			const value = metrics[rule.metric] as number;
			let triggered = false;
			
			switch (rule.comparison) {
				case 'gt':
					triggered = value > rule.threshold;
					break;
				case 'lt':
					triggered = value < rule.threshold;
					break;
				case 'eq':
					triggered = value === rule.threshold;
					break;
			}
			
			if (triggered) {
				this.triggerAlert(rule, value, metrics);
			}
		});
	}
	
	/**
	 * Trigger performance alert
	 */
	private triggerAlert(rule: AlertRule, value: number, metrics: PerformanceMetrics): void {
		const alert: PerformanceAlert = {
			id: `${rule.id}-${Date.now()}`,
			rule,
			value,
			timestamp: Date.now(),
			metadata: {
				url: metrics.url,
				userAgent: metrics.userAgent,
				userId: metrics.userId,
				additionalContext: {
					sessionId: metrics.sessionId,
					coreWebVitals: {
						lcp: metrics.lcp,
						fid: metrics.fid,
						cls: metrics.cls
					}
				}
			}
		};
		
		this.activeAlerts.push(alert);
		rule.lastTriggered = Date.now();
		
		// Send alert notification
		this.sendAlertNotification(alert);
		
		console.warn(`Performance Alert: ${rule.name}`, alert);
	}
	
	/**
	 * Send metrics to analytics service
	 */
	private async sendMetricsToAnalytics(metrics: PerformanceMetrics): Promise<void> {
		try {
			// Send to backend analytics
			await fetch('/api/analytics/performance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(metrics)
			});
		} catch (error) {
			console.error('Failed to send performance metrics:', error);
		}
	}
	
	/**
	 * Send alert notification
	 */
	private async sendAlertNotification(alert: PerformanceAlert): Promise<void> {
		try {
			await fetch('/api/alerts/performance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(alert)
			});
		} catch (error) {
			console.error('Failed to send alert notification:', error);
		}
	}
	
	/**
	 * Initialize Web APIs monitoring
	 */
	private async initializeWebAPIs(): Promise<void> {
		if (typeof window === 'undefined') return;
		
		// Navigation timing
		if ('PerformanceObserver' in window) {
			this.setupPerformanceObservers();
		}
		
		// Resource timing
		this.monitorResourceTiming();
		
		// User timing
		this.setupUserTiming();
	}
	
	/**
	 * Set up performance observers
	 */
	private setupPerformanceObservers(): void {
		// Navigation observer
		try {
			this.observers.navigation = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					this.processNavigationEntry(entry as PerformanceNavigationTiming);
				});
			});
			
			this.observers.navigation.observe({ type: 'navigation', buffered: true });
		} catch (error) {
			console.warn('Navigation observer not supported:', error);
		}
		
		// Paint observer
		try {
			this.observers.paint = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					this.processPaintEntry(entry);
				});
			});
			
			this.observers.paint.observe({ type: 'paint', buffered: true });
		} catch (error) {
			console.warn('Paint observer not supported:', error);
		}
	}
	
	/**
	 * Process navigation timing entry
	 */
	private processNavigationEntry(entry: PerformanceNavigationTiming): void {
		const metrics = {
			ttfb: entry.responseStart - entry.fetchStart,
			domLoad: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
			windowLoad: entry.loadEventEnd - entry.loadEventStart,
			dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
			tcpConnection: entry.connectEnd - entry.connectStart
		};
		
		console.log('Navigation timing:', metrics);
	}
	
	/**
	 * Process paint timing entry
	 */
	private processPaintEntry(entry: PerformanceEntry): void {
		console.log(`${entry.name}: ${entry.startTime}ms`);
	}
	
	/**
	 * Monitor resource timing
	 */
	private monitorResourceTiming(): void {
		// Monitor all resource loads
		window.addEventListener('load', () => {
			const resources = performance.getEntriesByType('resource');
			const slowResources = resources.filter(resource => resource.duration > 1000);
			
			if (slowResources.length > 0) {
				console.warn('Slow resources detected:', slowResources);
			}
		});
	}
	
	/**
	 * Set up custom user timing
	 */
	private setupUserTiming(): void {
		// Add custom marks and measures for key operations
		performance.mark('app-init-start');
		
		window.addEventListener('load', () => {
			performance.mark('app-init-end');
			performance.measure('app-init', 'app-init-start', 'app-init-end');
			
			const measure = performance.getEntriesByName('app-init')[0];
			console.log(`App initialization: ${measure.duration}ms`);
		});
	}
	
	/**
	 * Start real-time monitoring
	 */
	private startRealtimeMonitoring(): void {
		// Track metrics every 30 seconds
		setInterval(() => {
			this.trackMetrics();
		}, 30000);
		
		// Track on page visibility change
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				this.trackMetrics();
			}
		});
		
		// Track on page unload
		window.addEventListener('beforeunload', () => {
			this.trackMetrics();
		});
	}
	
	/**
	 * Start periodic reporting
	 */
	private startPeriodicReporting(): void {
		// Generate report every 5 minutes
		setInterval(() => {
			this.generatePerformanceReport();
		}, 5 * 60 * 1000);
	}
	
	/**
	 * Generate performance report
	 */
	async generatePerformanceReport(): Promise<PerformanceReport> {
		const now = Date.now();
		const oneHourAgo = now - (60 * 60 * 1000);
		
		const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
		
		if (recentMetrics.length === 0) {
			return this.getEmptyReport();
		}
		
		const report: PerformanceReport = {
			timeRange: {
				start: oneHourAgo,
				end: now
			},
			overview: {
				totalPageViews: recentMetrics.length,
				averageLoadTime: this.calculateAverage(recentMetrics, 'lcp'),
				bounceRate: this.calculateAverage(recentMetrics, 'bounceRate'),
				conversionRate: this.calculateAverage(recentMetrics, 'conversionRate'),
				errorRate: 0 // Would track actual errors in production
			},
			coreWebVitals: {
				lcp: this.calculatePercentiles(recentMetrics, 'lcp'),
				fid: this.calculatePercentiles(recentMetrics, 'fid'),
				cls: this.calculatePercentiles(recentMetrics, 'cls'),
				grades: this.calculateCoreWebVitalsGrades(recentMetrics)
			},
			topSlowPages: this.getTopSlowPages(recentMetrics),
			userExperience: {
				searchPerformance: this.calculateAverage(recentMetrics, 'searchResponseTime'),
				imageLoadPerformance: this.calculateAverage(recentMetrics, 'imageLoadTime'),
				apiPerformance: this.calculateAverage(recentMetrics, 'apiResponseTime'),
				mobileFriendliness: 85 // Would calculate based on mobile metrics
			},
			recommendations: this.generateRecommendations(recentMetrics)
		};
		
		console.log('Performance Report:', report);
		return report;
	}
	
	/**
	 * Helper methods for report generation
	 */
	private calculateAverage(metrics: PerformanceMetrics[], field: keyof PerformanceMetrics): number {
		const values = metrics.map(m => m[field] as number).filter(v => typeof v === 'number' && !isNaN(v));
		return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
	}
	
	private calculatePercentiles(metrics: PerformanceMetrics[], field: keyof PerformanceMetrics) {
		const values = metrics.map(m => m[field] as number).filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
		
		if (values.length === 0) {
			return { p50: 0, p75: 0, p95: 0, p99: 0 };
		}
		
		return {
			p50: values[Math.floor(values.length * 0.5)] || 0,
			p75: values[Math.floor(values.length * 0.75)] || 0,
			p95: values[Math.floor(values.length * 0.95)] || 0,
			p99: values[Math.floor(values.length * 0.99)] || 0
		};
	}
	
	private calculateCoreWebVitalsGrades(metrics: PerformanceMetrics[]) {
		let good = 0, needsImprovement = 0, poor = 0;
		
		metrics.forEach(metric => {
			// LCP scoring
			if (metric.lcp <= this.THRESHOLDS.lcp.good) {
				good++;
			} else if (metric.lcp <= this.THRESHOLDS.lcp.poor) {
				needsImprovement++;
			} else {
				poor++;
			}
		});
		
		const total = metrics.length;
		return {
			good: total > 0 ? good / total : 0,
			needsImprovement: total > 0 ? needsImprovement / total : 0,
			poor: total > 0 ? poor / total : 0
		};
	}
	
	private getTopSlowPages(metrics: PerformanceMetrics[]) {
		const pageMetrics = new Map<string, { totalTime: number; visits: number; bounceRate: number }>();
		
		metrics.forEach(metric => {
			const url = metric.url;
			const existing = pageMetrics.get(url) || { totalTime: 0, visits: 0, bounceRate: 0 };
			
			pageMetrics.set(url, {
				totalTime: existing.totalTime + metric.lcp,
				visits: existing.visits + 1,
				bounceRate: (existing.bounceRate * existing.visits + metric.bounceRate) / (existing.visits + 1)
			});
		});
		
		return Array.from(pageMetrics.entries())
			.map(([url, data]) => ({
				url,
				averageLoadTime: data.totalTime / data.visits,
				visits: data.visits,
				bounceRate: data.bounceRate
			}))
			.sort((a, b) => b.averageLoadTime - a.averageLoadTime)
			.slice(0, 5);
	}
	
	private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
		const recommendations: string[] = [];
		const avgLCP = this.calculateAverage(metrics, 'lcp');
		const avgFID = this.calculateAverage(metrics, 'fid');
		const avgCLS = this.calculateAverage(metrics, 'cls');
		const avgImageTime = this.calculateAverage(metrics, 'imageLoadTime');
		const cacheHitRate = this.calculateAverage(metrics, 'cacheHitRate');
		
		if (avgLCP > this.THRESHOLDS.lcp.good) {
			recommendations.push('Optimize Largest Contentful Paint by improving server response times and optimizing critical resources');
		}
		
		if (avgFID > this.THRESHOLDS.fid.good) {
			recommendations.push('Reduce First Input Delay by minimizing main thread work and breaking up long tasks');
		}
		
		if (avgCLS > this.THRESHOLDS.cls.good) {
			recommendations.push('Improve Cumulative Layout Shift by setting size attributes on images and avoiding dynamic content insertion');
		}
		
		if (avgImageTime > 1000) {
			recommendations.push('Optimize image loading with modern formats (WebP/AVIF), proper sizing, and lazy loading');
		}
		
		if (cacheHitRate < 0.7) {
			recommendations.push('Improve cache hit rate by optimizing cache headers and implementing service worker caching');
		}
		
		return recommendations;
	}
	
	private getEmptyReport(): PerformanceReport {
		return {
			timeRange: { start: 0, end: 0 },
			overview: { totalPageViews: 0, averageLoadTime: 0, bounceRate: 0, conversionRate: 0, errorRate: 0 },
			coreWebVitals: {
				lcp: { p50: 0, p75: 0, p95: 0, p99: 0 },
				fid: { p50: 0, p75: 0, p95: 0, p99: 0 },
				cls: { p50: 0, p75: 0, p95: 0, p99: 0 },
				grades: { good: 0, needsImprovement: 0, poor: 0 }
			},
			topSlowPages: [],
			userExperience: { searchPerformance: 0, imageLoadPerformance: 0, apiPerformance: 0, mobileFriendliness: 0 },
			recommendations: []
		};
	}
	
	private getSessionId(): string {
		let sessionId = sessionStorage.getItem('performance_session_id');
		if (!sessionId) {
			sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			sessionStorage.setItem('performance_session_id', sessionId);
		}
		return sessionId;
	}
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();