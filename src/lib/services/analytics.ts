/**
 * Unified Analytics Service - PostHog-first architecture
 * 
 * Consolidates 4 separate analytics implementations into a single, optimized service:
 * - PostHog integration with consent gating
 * - Server-side tracking for compliance
 * - Single event queue with batching
 * - Consistent event schema following PostHog conventions
 * - Proper memory management and cleanup
 */

import { browser } from '$app/environment';
import posthog from 'posthog-js';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BaseEventProperties {
	user_id?: string;
	session_id?: string;
	timestamp?: string;
	url?: string;
	user_agent?: string;
	platform?: string;
	language?: string;
}

export interface ProductProperties {
	$product_id: string;
	$product_name: string;
	$product_category?: string;
	$product_brand?: string;
	$product_price?: number;
	$currency?: string;
	$seller_id?: string;
	$product_variant?: string; // size, color, etc.
}

export interface SearchProperties {
	$search_term: string;
	$search_results_count?: number;
	$search_filters?: Record<string, string>;
	$search_sort?: string;
	$search_category?: string;
}

export interface SocialProperties {
	$content_type: 'product' | 'user' | 'story' | 'collection';
	$content_id: string;
	$action_type: 'like' | 'unlike' | 'save' | 'unsave' | 'follow' | 'unfollow' | 'share' | 'comment';
	$source?: string; // feed, profile, search, etc.
	$position?: number; // position in list
}

export interface UserProperties {
	$user_type?: 'buyer' | 'seller' | 'admin';
	$signup_method?: string;
	$login_method?: string;
	$onboarding_completed?: boolean;
	$profile_complete?: number; // percentage
}

// Event queue item for batching
interface QueuedEvent {
	event: string;
	properties: Record<string, any>;
	timestamp: number;
	retries?: number;
}

// ============================================================================
// Unified Analytics Service
// ============================================================================

class UnifiedAnalyticsService {
	// Core state
	private initialized = false;
	private consentGiven = false;
	private userId: string | null = null;
	private sessionId: string;
	
	// Event queue and batching
	private eventQueue: QueuedEvent[] = [];
	private viewQueue: Set<string> = new Set(); // Use Set to prevent duplicates
	private batchTimer: ReturnType<typeof setTimeout> | null = null;
	private viewTimer: ReturnType<typeof setTimeout> | null = null;
	
	// Configuration
	private readonly BATCH_SIZE = 10;
	private readonly BATCH_INTERVAL = 5000; // 5 seconds
	private readonly VIEW_BATCH_SIZE = 20;
	private readonly VIEW_BATCH_INTERVAL = 2000; // 2 seconds
	private readonly MAX_RETRIES = 3;
	private readonly MAX_QUEUE_SIZE = 100;

	constructor() {
		if (!browser) return;
		
		this.sessionId = this.generateSessionId();
		this.setupEventListeners();
		this.checkConsent();
	}

	// ========================================================================
	// Initialization and Consent
	// ========================================================================

	/**
	 * Initialize PostHog after consent is given
	 */
	private async initialize() {
		if (this.initialized || !this.consentGiven || !browser) return;
		
		try {
			// Wait for PostHog to be ready
			if (posthog && posthog.__loaded) {
				this.initialized = true;
				
				// Identify user if we have one
				if (this.userId) {
					posthog.identify(this.userId);
				}
				
				// Process any queued events
				this.flushEventQueue();
				
				console.log('📊 Analytics initialized with PostHog');
			}
		} catch (error) {
			console.warn('Analytics initialization failed:', error);
		}
	}

	/**
	 * Check if user has given analytics consent
	 */
	private async checkConsent() {
		if (!browser) return;
		
		try {
			const response = await fetch('/api/consent', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
			
			if (response.ok) {
				const { analytics_consent } = await response.json();
				this.consentGiven = analytics_consent === true;
				
				if (this.consentGiven) {
					this.initialize();
				}
			}
		} catch (error) {
			console.warn('Consent check failed:', error);
			// Default to no consent on error
			this.consentGiven = false;
		}
	}

	/**
	 * Update consent status
	 */
	setConsent(consent: boolean) {
		this.consentGiven = consent;
		
		if (consent) {
			this.initialize();
			this.track('consent_given', { consent_types: ['analytics'] });
		} else {
			this.track('consent_withdrawn', { consent_types: ['analytics'] });
			this.reset();
		}
	}

	// ========================================================================
	// User Management
	// ========================================================================

	/**
	 * Set user ID and identify in PostHog
	 */
	setUserId(userId: string | null) {
		this.userId = userId;
		
		if (this.initialized && userId && posthog.__loaded) {
			posthog.identify(userId, {
				$set: { user_id: userId }
			});
		}
	}

	/**
	 * Set user properties
	 */
	setUserProperties(properties: UserProperties) {
		if (this.initialized && posthog.__loaded) {
			posthog.setPersonProperties(properties);
		}
	}

	/**
	 * Reset user session
	 */
	reset() {
		if (this.initialized && posthog.__loaded) {
			posthog.reset();
		}
		
		this.userId = null;
		this.sessionId = this.generateSessionId();
		this.clearQueues();
	}

	// ========================================================================
	// Event Tracking
	// ========================================================================

	/**
	 * Track an event with PostHog-first architecture
	 */
	track(eventName: string, properties: Record<string, any> = {}) {
		if (!this.consentGiven) return;
		
		const enrichedProperties = this.enrichEvent(properties);
		const queuedEvent: QueuedEvent = {
			event: eventName,
			properties: enrichedProperties,
			timestamp: Date.now(),
			retries: 0
		};

		// Track with PostHog immediately if available
		if (this.initialized && posthog.__loaded) {
			posthog.capture(eventName, enrichedProperties);
		}

		// Queue for server-side tracking
		this.queueEvent(queuedEvent);
		this.scheduleBatchFlush();
	}

	/**
	 * Track product view with automatic batching
	 */
	trackProductView(product: ProductProperties & { list_name?: string; position?: number }) {
		// Track individual view event
		this.track('product_viewed', {
			$product_id: product.$product_id,
			$product_name: product.$product_name,
			$product_category: product.$product_category,
			$product_brand: product.$product_brand,
			$product_price: product.$product_price,
			$currency: product.$currency || 'EUR',
			$seller_id: product.$seller_id,
			$product_variant: product.$product_variant,
			$list_name: product.list_name,
			$list_position: product.position
		});

		// Add to view queue for batched impression tracking
		this.queueView(product.$product_id);
	}

	/**
	 * Track product list view (feed, search results, category)
	 */
	trackProductListView(listName: string, products: ProductProperties[]) {
		this.track('product_list_viewed', {
			$list_name: listName,
			$item_count: products.length,
			$products: products.map(p => ({
				product_id: p.$product_id,
				product_name: p.$product_name,
				price: p.$product_price
			}))
		});

		// Queue individual views for impression tracking
		products.forEach(product => this.queueView(product.$product_id));
	}

	/**
	 * Track search events
	 */
	trackSearch(properties: SearchProperties) {
		this.track('search_performed', {
			$search_term: properties.$search_term,
			$search_results_count: properties.$search_results_count,
			$search_filters: properties.$search_filters,
			$search_sort: properties.$search_sort,
			$search_category: properties.$search_category
		});
	}

	/**
	 * Track social actions
	 */
	trackSocialAction(properties: SocialProperties) {
		const eventMap = {
			like: 'product_liked',
			unlike: 'product_unliked',
			save: 'product_saved',
			unsave: 'product_unsaved',
			follow: 'user_followed',
			unfollow: 'user_unfollowed',
			share: 'content_shared',
			comment: 'content_commented'
		};

		const eventName = eventMap[properties.$action_type] || 'social_action';
		
		this.track(eventName, {
			$content_type: properties.$content_type,
			$content_id: properties.$content_id,
			$action_type: properties.$action_type,
			$source: properties.$source,
			$position: properties.$position
		});
	}

	/**
	 * Track page/screen view
	 */
	trackPageView(pageName: string, properties: Record<string, any> = {}) {
		this.track('page_viewed', {
			$current_url: browser ? window.location.href : undefined,
			$page_name: pageName,
			$referrer: browser ? document.referrer : undefined,
			...properties
		});
	}

	/**
	 * Track user registration
	 */
	trackUserRegistration(method: string, userType?: 'buyer' | 'seller') {
		this.track('user_registered', {
			$signup_method: method,
			$user_type: userType
		});
	}

	/**
	 * Track user login
	 */
	trackUserLogin(method: string) {
		this.track('user_signed_in', {
			$login_method: method
		});
	}

	/**
	 * Track user logout
	 */
	trackUserLogout() {
		this.track('user_signed_out');
		this.reset();
	}

	/**
	 * Track conversion events
	 */
	trackConversion(eventName: string, properties: Record<string, any> = {}) {
		this.track(eventName, {
			$conversion_value: properties.value,
			$conversion_id: properties.conversionId,
			$funnel_name: properties.funnelName,
			$funnel_step: properties.step,
			...properties
		});
	}

	/**
	 * Track errors for debugging
	 */
	trackError(errorType: string, errorMessage: string, context: Record<string, any> = {}) {
		this.track('error_occurred', {
			$error_type: errorType,
			$error_message: errorMessage,
			$error_context: context,
			$page_url: browser ? window.location.href : undefined
		});
	}

	// ========================================================================
	// View Tracking (Batched)
	// ========================================================================

	/**
	 * Add product view to batch queue
	 */
	private queueView(productId: string) {
		this.viewQueue.add(productId); // Set automatically handles duplicates
		this.scheduleViewFlush();
	}

	/**
	 * Schedule view batch flush
	 */
	private scheduleViewFlush() {
		if (this.viewTimer || this.viewQueue.size === 0) return;
		
		// Flush immediately if batch is full
		if (this.viewQueue.size >= this.VIEW_BATCH_SIZE) {
			this.flushViewQueue();
			return;
		}

		// Schedule flush
		this.viewTimer = setTimeout(() => {
			this.flushViewQueue();
		}, this.VIEW_BATCH_INTERVAL);
	}

	/**
	 * Flush view queue to server
	 */
	private async flushViewQueue() {
		if (this.viewTimer) {
			clearTimeout(this.viewTimer);
			this.viewTimer = null;
		}

		if (this.viewQueue.size === 0) return;

		const productIds = Array.from(this.viewQueue);
		this.viewQueue.clear();

		try {
			const response = await fetch('/api/track-view', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productIds,
					user_id: this.userId,
					session_id: this.sessionId,
					timestamp: new Date().toISOString()
				})
			});

			if (!response.ok && response.status !== 429) {
				// Re-queue on server error (but not rate limiting)
				productIds.forEach(id => this.viewQueue.add(id));
			}
		} catch (error) {
			console.warn('View tracking failed:', error);
			// Re-queue on network error
			productIds.forEach(id => this.viewQueue.add(id));
		}
	}

	// ========================================================================
	// Event Queue Management
	// ========================================================================

	/**
	 * Add event to queue
	 */
	private queueEvent(event: QueuedEvent) {
		// Prevent queue overflow
		if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
			this.eventQueue.shift(); // Remove oldest event
		}
		
		this.eventQueue.push(event);
	}

	/**
	 * Schedule batch flush
	 */
	private scheduleBatchFlush() {
		if (this.batchTimer) return;

		// Flush immediately if batch is full
		if (this.eventQueue.length >= this.BATCH_SIZE) {
			this.flushEventQueue();
			return;
		}

		// Schedule flush
		this.batchTimer = setTimeout(() => {
			this.flushEventQueue();
		}, this.BATCH_INTERVAL);
	}

	/**
	 * Flush event queue to server
	 */
	private async flushEventQueue() {
		if (this.batchTimer) {
			clearTimeout(this.batchTimer);
			this.batchTimer = null;
		}

		if (this.eventQueue.length === 0) return;

		const eventsToSend = [...this.eventQueue];
		this.eventQueue = [];

		try {
			const response = await fetch('/api/analytics/track', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					events: eventsToSend.map(e => ({
						event_name: e.event,
						properties: e.properties,
						timestamp: new Date(e.timestamp).toISOString()
					})),
					user_id: this.userId,
					session_id: this.sessionId,
					client_timestamp: new Date().toISOString()
				})
			});

			if (!response.ok) {
				// Re-queue failed events with retry logic
				eventsToSend.forEach(event => {
					if ((event.retries || 0) < this.MAX_RETRIES) {
						this.queueEvent({
							...event,
							retries: (event.retries || 0) + 1
						});
					}
				});
			}
		} catch (error) {
			console.warn('Analytics batch failed:', error);
			// Re-queue with retry logic
			eventsToSend.forEach(event => {
				if ((event.retries || 0) < this.MAX_RETRIES) {
					this.queueEvent({
						...event,
						retries: (event.retries || 0) + 1
					});
				}
			});
		}
	}

	// ========================================================================
	// Utility Methods
	// ========================================================================

	/**
	 * Enrich event with standard properties
	 */
	private enrichEvent(properties: Record<string, any>): Record<string, any> {
		return {
			...properties,
			$user_id: this.userId,
			$session_id: this.sessionId,
			$timestamp: new Date().toISOString(),
			$current_url: browser ? window.location.href : undefined,
			$referrer: browser ? document.referrer : undefined,
			$user_agent: browser ? navigator.userAgent : undefined,
			$platform: browser ? navigator.platform : undefined,
			$language: browser ? navigator.language : undefined,
			$viewport_height: browser ? window.innerHeight : undefined,
			$viewport_width: browser ? window.innerWidth : undefined
		};
	}

	/**
	 * Generate unique session ID
	 */
	private generateSessionId(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substr(2, 9);
		return `session_${timestamp}_${random}`;
	}

	/**
	 * Setup event listeners for cleanup
	 */
	private setupEventListeners() {
		if (!browser) return;

		// Flush events on page unload
		const flushOnUnload = () => {
			this.flushViewQueue();
			this.flushEventQueue();
		};

		window.addEventListener('beforeunload', flushOnUnload);
		window.addEventListener('pagehide', flushOnUnload);

		// Track page visibility changes
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				flushOnUnload();
			}
		});
	}

	/**
	 * Clear all queues
	 */
	private clearQueues() {
		this.eventQueue = [];
		this.viewQueue.clear();
		
		if (this.batchTimer) {
			clearTimeout(this.batchTimer);
			this.batchTimer = null;
		}
		
		if (this.viewTimer) {
			clearTimeout(this.viewTimer);
			this.viewTimer = null;
		}
	}

	/**
	 * Force flush all queues (for testing or critical moments)
	 */
	async flush() {
		await Promise.all([
			this.flushEventQueue(),
			this.flushViewQueue()
		]);
	}

	// ========================================================================
	// Debug Methods
	// ========================================================================

	/**
	 * Get analytics status for debugging
	 */
	getStatus() {
		return {
			initialized: this.initialized,
			consentGiven: this.consentGiven,
			userId: this.userId,
			sessionId: this.sessionId,
			eventQueueSize: this.eventQueue.length,
			viewQueueSize: this.viewQueue.size,
			posthogLoaded: browser && posthog && posthog.__loaded
		};
	}
}

// ============================================================================
// Exports
// ============================================================================

// Export singleton instance
export const analytics = new UnifiedAnalyticsService();

// Export types
export type {
	BaseEventProperties,
	ProductProperties,
	SearchProperties,
	SocialProperties,
	UserProperties
};

// Convenience functions for backward compatibility
export const trackEvent = (name: string, properties?: Record<string, any>) => 
	analytics.track(name, properties);

export const trackProductView = (product: ProductProperties) => 
	analytics.trackProductView(product);

export const identifyUser = (userId: string | null) => 
	analytics.setUserId(userId);

export const resetUser = () => 
	analytics.reset();

export const setConsent = (consent: boolean) => 
	analytics.setConsent(consent);