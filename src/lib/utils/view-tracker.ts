import { analyticsStore } from '$lib/stores/analytics.svelte';

// View tracking utility for product impressions
let viewQueue: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 2000; // 2 seconds
const MAX_BATCH_SIZE = 20;

/**
 * Track a product view
 * Views are batched and sent to the server periodically
 * Also tracks in analytics for comprehensive event tracking
 */
export function trackProductView(productId: string, productData?: {
	title?: string;
	price?: number;
	category?: string;
	seller_id?: string;
}) {
	// Add to queue if not already present
	if (!viewQueue.includes(productId)) {
		viewQueue.push(productId);
		
		// Track in comprehensive analytics if product data is available
		if (productData) {
			analyticsStore.trackProductView({
				id: productId,
				title: productData.title || 'Unknown Product',
				price: productData.price || 0,
				category: productData.category,
				seller_id: productData.seller_id
			});
		}
	}
	
	// Flush immediately if batch is full
	if (viewQueue.length >= MAX_BATCH_SIZE) {
		flushViews();
	} else {
		// Schedule flush if not already scheduled
		if (!flushTimer) {
			flushTimer = setTimeout(flushViews, FLUSH_DELAY);
		}
	}
}

/**
 * Track multiple product views at once
 */
export function trackProductViews(productIds: string[]) {
	productIds.forEach(id => {
		if (!viewQueue.includes(id)) {
			viewQueue.push(id);
		}
	});
	
	if (viewQueue.length >= MAX_BATCH_SIZE) {
		flushViews();
	} else if (!flushTimer) {
		flushTimer = setTimeout(flushViews, FLUSH_DELAY);
	}
}

/**
 * Flush queued views to the server
 */
async function flushViews() {
	// Clear timer
	if (flushTimer) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}
	
	// Nothing to flush
	if (viewQueue.length === 0) {
		return;
	}
	
	// Take current queue and reset
	const productIds = [...viewQueue];
	viewQueue = [];
	
	try {
		// Send to server (use relative URL to work on any port)
		const response = await fetch('/api/track-view', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ productIds }),
		});
		
		if (!response.ok && response.status !== 429) {
			// If not rate limited, try to re-queue for retry
			// But limit re-queuing to prevent infinite loops
			if (viewQueue.length < MAX_BATCH_SIZE * 2) {
				viewQueue.push(...productIds);
			}
		}
	} catch (error) {
		// Network error - try to re-queue if space available
		if (viewQueue.length < MAX_BATCH_SIZE * 2) {
			viewQueue.push(...productIds);
		}
	}
}

/**
 * Force flush any pending views (e.g., on page unload)
 */
export function forceFlushViews() {
	if (viewQueue.length > 0) {
		// Use sendBeacon for reliability on page unload
		if (navigator.sendBeacon) {
			const data = new Blob(
				[JSON.stringify({ productIds: viewQueue })],
				{ type: 'application/json' }
			);
			navigator.sendBeacon('/api/track-view', data);
			viewQueue = [];
		} else {
			// Fallback to regular flush
			flushViews();
		}
	}
}

// Set up intersection observer for automatic view tracking
let observer: IntersectionObserver | null = null;

/**
 * Set up automatic view tracking for product elements
 * Elements should have data-product-id attribute
 */
export function setupViewTracking() {
	if (typeof window === 'undefined' || observer) {
		return;
	}
	
	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const element = entry.target as HTMLElement;
					const productId = element.dataset.productId;
					
					if (productId && !element.dataset.tracked) {
						trackProductView(productId);
						element.dataset.tracked = 'true';
					}
				}
			});
		},
		{
			threshold: 0.5, // Track when 50% visible
			rootMargin: '0px'
		}
	);
	
	// Observe all product elements
	document.querySelectorAll('[data-product-id]').forEach(element => {
		observer?.observe(element);
	});
}

/**
 * Clean up view tracking
 */
export function cleanupViewTracking() {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	forceFlushViews();
}

// Auto flush on page unload
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', forceFlushViews);
	window.addEventListener('pagehide', forceFlushViews);
}