/**
 * Analytics Service - Comprehensive event tracking for social commerce
 * 
 * Implements GA4-style event tracking with:
 * - Standard e-commerce events
 * - Social engagement events
 * - Content discovery events
 * - User journey tracking
 * - Conversion funnel analysis
 */

// Event parameter types
interface BaseEventParams {
	user_id?: string;
	session_id?: string;
	timestamp?: number;
	user_agent?: string;
	page_url?: string;
	page_title?: string;
}

interface ProductEventParams extends BaseEventParams {
	item_id: string;
	item_name: string;
	item_category?: string;
	item_brand?: string;
	price?: number;
	currency?: string;
	seller_id?: string;
	item_variant?: string; // size, color, etc.
}

interface SearchEventParams extends BaseEventParams {
	search_term: string;
	search_results_count?: number;
	search_filters?: Record<string, string>;
	search_sort?: string;
}

interface SocialEventParams extends BaseEventParams {
	content_type: 'listing' | 'user' | 'story' | 'collection';
	content_id: string;
	action_type: 'like' | 'unlike' | 'save' | 'unsave' | 'follow' | 'unfollow' | 'share' | 'comment';
}

interface ConversionEventParams extends BaseEventParams {
	funnel_step: string;
	funnel_name: string;
	conversion_id?: string;
	conversion_value?: number;
}

// Analytics event definitions following GA4 enhanced ecommerce
type AnalyticsEvent = 
	// Discovery & Browsing
	| { name: 'view_item_list'; params: { item_list_name: string; items: ProductEventParams[] } & BaseEventParams }
	| { name: 'select_item'; params: ProductEventParams & { item_list_name?: string; index?: number } }
	| { name: 'view_item'; params: ProductEventParams }
	| { name: 'search'; params: SearchEventParams }
	
	// Social Engagement
	| { name: 'like_item'; params: SocialEventParams }
	| { name: 'save_item'; params: SocialEventParams }
	| { name: 'share_item'; params: SocialEventParams }
	| { name: 'follow_user'; params: SocialEventParams }
	| { name: 'view_profile'; params: { profile_id: string; profile_type: 'seller' | 'buyer' } & BaseEventParams }
	
	// Commerce Actions
	| { name: 'add_to_wishlist'; params: ProductEventParams }
	| { name: 'remove_from_wishlist'; params: ProductEventParams }
	| { name: 'contact_seller'; params: ProductEventParams & { message_type: 'inquiry' | 'offer' | 'question' } }
	| { name: 'make_offer'; params: ProductEventParams & { offer_amount: number } }
	
	// Seller Actions
	| { name: 'start_listing'; params: { listing_category?: string } & BaseEventParams }
	| { name: 'complete_listing'; params: ProductEventParams }
	| { name: 'edit_listing'; params: ProductEventParams }
	| { name: 'promote_listing'; params: ProductEventParams & { promotion_type: string } }
	
	// User Journey
	| { name: 'sign_up'; params: { method: string; user_type?: 'buyer' | 'seller' } & BaseEventParams }
	| { name: 'login'; params: { method: string } & BaseEventParams }
	| { name: 'complete_onboarding'; params: { onboarding_type: string; steps_completed: number } & BaseEventParams }
	
	// Conversion Funnels
	| { name: 'begin_checkout'; params: ConversionEventParams }
	| { name: 'add_payment_info'; params: ConversionEventParams }
	| { name: 'purchase'; params: ConversionEventParams & { transaction_id: string; items: ProductEventParams[] } }
	
	// Content Consumption
	| { name: 'view_story'; params: { story_id: string; story_type: 'user' | 'brand' | 'collection' } & BaseEventParams }
	| { name: 'view_collection'; params: { collection_id: string; collection_name: string; item_count: number } & BaseEventParams }
	
	// App Usage
	| { name: 'app_open'; params: BaseEventParams }
	| { name: 'screen_view'; params: { screen_name: string; screen_class?: string } & BaseEventParams }
	| { name: 'session_start'; params: BaseEventParams }
	| { name: 'session_end'; params: { session_duration: number } & BaseEventParams };

class AnalyticsService {
	private queue: AnalyticsEvent[] = [];
	private userId: string | null = null;
	private sessionId: string;
	private batchSize = 10;
	private flushInterval = 5000; // 5 seconds
	private flushTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.setupPageTracking();
		this.setupUnloadListener();
	}

	/**
	 * Set the current user ID for event attribution
	 */
	setUserId(userId: string | null) {
		this.userId = userId;
	}

	/**
	 * Track an analytics event
	 */
	track<T extends AnalyticsEvent>(event: T) {
		// Enrich event with standard parameters
		const enrichedEvent = {
			...event,
			params: {
				...event.params,
				user_id: this.userId,
				session_id: this.sessionId,
				timestamp: Date.now(),
				page_url: typeof window !== 'undefined' ? window.location.href : undefined,
				page_title: typeof window !== 'undefined' ? document.title : undefined,
				user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
			}
		};

		this.queue.push(enrichedEvent);
		this.scheduleFlush();
	}

	/**
	 * Track product view with automatic batching
	 */
	trackProductView(product: ProductEventParams) {
		this.track({
			name: 'view_item',
			params: product
		});
	}

	/**
	 * Track product list view (feed, search results, category)
	 */
	trackProductListView(listName: string, products: ProductEventParams[]) {
		this.track({
			name: 'view_item_list',
			params: {
				item_list_name: listName,
				items: products
			}
		});
	}

	/**
	 * Track search with filters and results
	 */
	trackSearch(searchTerm: string, resultsCount: number, filters?: Record<string, string>, sort?: string) {
		this.track({
			name: 'search',
			params: {
				search_term: searchTerm,
				search_results_count: resultsCount,
				search_filters: filters,
				search_sort: sort
			}
		});
	}

	/**
	 * Track social engagement
	 */
	trackSocialAction(
		action: 'like' | 'unlike' | 'save' | 'unsave' | 'follow' | 'unfollow' | 'share' | 'comment',
		contentType: 'listing' | 'user' | 'story' | 'collection',
		contentId: string
	) {
		const eventMap = {
			like: 'like_item',
			unlike: 'like_item',
			save: 'save_item', 
			unsave: 'save_item',
			follow: 'follow_user',
			unfollow: 'follow_user',
			share: 'share_item',
			comment: 'share_item' // Group with share for engagement
		} as const;

		this.track({
			name: eventMap[action] as any,
			params: {
				content_type: contentType,
				content_id: contentId,
				action_type: action
			}
		});
	}

	/**
	 * Track conversion funnel step
	 */
	trackConversionStep(funnelName: string, step: string, conversionId?: string, value?: number) {
		this.track({
			name: 'begin_checkout', // Generic funnel tracking
			params: {
				funnel_name: funnelName,
				funnel_step: step,
				conversion_id: conversionId,
				conversion_value: value
			}
		});
	}

	/**
	 * Track page/screen view
	 */
	trackPageView(screenName: string, screenClass?: string) {
		this.track({
			name: 'screen_view',
			params: {
				screen_name: screenName,
				screen_class: screenClass
			}
		});
	}

	/**
	 * Track user registration
	 */
	trackSignUp(method: string, userType?: 'buyer' | 'seller') {
		this.track({
			name: 'sign_up',
			params: {
				method,
				user_type: userType
			}
		});
	}

	/**
	 * Track user login
	 */
	trackLogin(method: string) {
		this.track({
			name: 'login',
			params: {
				method
			}
		});
	}

	/**
	 * Flush events to server immediately
	 */
	async flush() {
		if (this.queue.length === 0) return;

		const eventsToSend = [...this.queue];
		this.queue = [];

		try {
			const response = await fetch('/api/analytics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					events: eventsToSend,
					client_timestamp: Date.now()
				}),
			});

			if (!response.ok) {
				// Re-queue events if server error
				this.queue.unshift(...eventsToSend);
			}
		} catch (error) {
			// Re-queue events on network error
			this.queue.unshift(...eventsToSend);
			console.warn('Analytics: Failed to send events', error);
		}
	}

	/**
	 * Schedule automatic flush
	 */
	private scheduleFlush() {
		// Flush immediately if batch size reached
		if (this.queue.length >= this.batchSize) {
			this.flush();
			return;
		}

		// Schedule flush if not already scheduled
		if (!this.flushTimer) {
			this.flushTimer = setTimeout(() => {
				this.flushTimer = null;
				this.flush();
			}, this.flushInterval);
		}
	}

	/**
	 * Generate unique session ID
	 */
	private generateSessionId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Setup automatic page view tracking
	 */
	private setupPageTracking() {
		if (typeof window === 'undefined') return;

		// Track initial page view
		this.trackPageView(window.location.pathname);

		// Track page changes (for SPA)
		let currentPath = window.location.pathname;
		const observer = new MutationObserver(() => {
			if (window.location.pathname !== currentPath) {
				currentPath = window.location.pathname;
				this.trackPageView(currentPath);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	/**
	 * Setup page unload listener to flush remaining events
	 */
	private setupUnloadListener() {
		if (typeof window === 'undefined') return;

		const flushOnUnload = () => {
			if (this.queue.length > 0 && navigator.sendBeacon) {
				// Use sendBeacon for reliability
				const data = JSON.stringify({
					events: this.queue,
					client_timestamp: Date.now()
				});
				navigator.sendBeacon('/api/analytics', data);
			}
		};

		window.addEventListener('beforeunload', flushOnUnload);
		window.addEventListener('pagehide', flushOnUnload);
	}
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export types for use in components
export type { AnalyticsEvent, ProductEventParams, SearchEventParams, SocialEventParams };