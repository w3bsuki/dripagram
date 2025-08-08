/**
 * Analytics Store - Reactive analytics state management
 * 
 * Provides reactive state for analytics and convenience methods
 * for tracking common user actions in Svelte components
 */

import { analytics } from '$lib/services/analyticsService';
import { getAuthContext } from './auth.svelte';
import type { ProductEventParams, SearchEventParams } from '$lib/services/analyticsService';

class AnalyticsStore {
	private authContext: ReturnType<typeof getAuthContext> | null = null;
	
	// Track active sessions and events
	public sessionActive = $state(true);
	public eventsQueued = $state(0);
	public lastEventTime = $state<Date | null>(null);

	constructor() {
		// Initialize with auth context if available
		try {
			this.authContext = getAuthContext();
			if (this.authContext?.user) {
				analytics.setUserId(this.authContext.user.id);
			}
		} catch {
			// Auth context not available (SSR or not authenticated)
		}

		// Track session activity
		this.setupSessionTracking();
	}

	/**
	 * Update user ID when authentication state changes
	 */
	setUser(userId: string | null) {
		analytics.setUserId(userId);
	}

	/**
	 * Track product view with product data transformation
	 */
	trackProductView(product: {
		id: string;
		title: string;
		price: number;
		seller_id?: string;
		category?: string;
		brand?: string;
		size?: string;
		currency?: string;
	}) {
		const productParams: ProductEventParams = {
			item_id: product.id,
			item_name: product.title,
			item_category: product.category,
			item_brand: product.brand,
			price: product.price,
			currency: product.currency || 'EUR',
			seller_id: product.seller_id,
			item_variant: product.size
		};

		analytics.trackProductView(productParams);
		this.updateEventState();
	}

	/**
	 * Track product list view (feed, search, category)
	 */
	trackProductListView(
		listName: string, 
		products: Array<{
			id: string;
			title: string;
			price: number;
			seller_id?: string;
			category?: string;
			brand?: string;
		}>
	) {
		const productParams = products.map(product => ({
			item_id: product.id,
			item_name: product.title,
			item_category: product.category,
			item_brand: product.brand,
			price: product.price,
			currency: 'EUR',
			seller_id: product.seller_id
		}));

		analytics.trackProductListView(listName, productParams);
		this.updateEventState();
	}

	/**
	 * Track search with enhanced parameters
	 */
	trackSearch(params: {
		searchTerm: string;
		resultsCount: number;
		filters?: Record<string, string>;
		sort?: string;
		category?: string;
		priceRange?: { min: number; max: number };
	}) {
		const searchFilters = {
			...params.filters,
			category: params.category,
			price_min: params.priceRange?.min?.toString(),
			price_max: params.priceRange?.max?.toString()
		};

		// Clean undefined values
		Object.keys(searchFilters).forEach(key => {
			if (searchFilters[key] === undefined) {
				delete searchFilters[key];
			}
		});

		analytics.trackSearch(
			params.searchTerm,
			params.resultsCount,
			searchFilters,
			params.sort
		);
		this.updateEventState();
	}

	/**
	 * Track social actions with enhanced context
	 */
	trackSocialAction(
		action: 'like' | 'unlike' | 'save' | 'unsave' | 'follow' | 'unfollow' | 'share' | 'comment',
		contentType: 'listing' | 'user' | 'story' | 'collection',
		contentId: string,
		context?: {
			source?: string; // feed, profile, search, etc.
			position?: number; // position in list
		}
	) {
		analytics.trackSocialAction(action, contentType, contentId);
		
		// Track additional context if provided
		if (context?.source) {
			analytics.track({
				name: 'select_item',
				params: {
					item_id: contentId,
					item_name: `${contentType}_${contentId}`,
					item_list_name: context.source,
					index: context.position
				}
			});
		}

		this.updateEventState();
	}

	/**
	 * Track user interactions with UI elements
	 */
	trackUIInteraction(
		elementType: 'button' | 'link' | 'menu' | 'filter' | 'sort' | 'tab',
		elementName: string,
		context?: {
			page?: string;
			section?: string;
			value?: string;
		}
	) {
		analytics.track({
			name: 'select_item',
			params: {
				item_id: elementName,
				item_name: `${elementType}_${elementName}`,
				item_category: 'ui_interaction',
				item_list_name: context?.page || 'unknown',
				content_type: elementType
			}
		});

		this.updateEventState();
	}

	/**
	 * Track conversion funnel steps
	 */
	trackConversionStep(
		funnel: 'listing_creation' | 'user_onboarding' | 'purchase' | 'follow' | 'contact_seller',
		step: string,
		context?: {
			value?: number;
			conversionId?: string;
			metadata?: Record<string, any>;
		}
	) {
		analytics.trackConversionStep(
			funnel,
			step,
			context?.conversionId,
			context?.value
		);

		this.updateEventState();
	}

	/**
	 * Track feature usage
	 */
	trackFeatureUsage(
		feature: 'search' | 'filter' | 'share' | 'message' | 'story_view' | 'profile_view' | 'feed_scroll',
		context?: Record<string, any>
	) {
		analytics.track({
			name: 'select_item',
			params: {
				item_id: feature,
				item_name: `feature_${feature}`,
				item_category: 'feature_usage',
				...context
			}
		});

		this.updateEventState();
	}

	/**
	 * Track error events for debugging
	 */
	trackError(
		errorType: 'network' | 'validation' | 'auth' | 'upload' | 'payment',
		errorMessage: string,
		context?: {
			page?: string;
			action?: string;
			userId?: string;
		}
	) {
		analytics.track({
			name: 'exception' as any,
			params: {
				description: `${errorType}: ${errorMessage}`,
				fatal: false,
				page_location: context?.page,
				custom_user_action: context?.action,
				user_id: context?.userId
			}
		});

		this.updateEventState();
	}

	/**
	 * Track performance metrics
	 */
	trackPerformance(
		metric: 'page_load' | 'image_load' | 'search_response' | 'api_response',
		duration: number,
		context?: {
			page?: string;
			endpoint?: string;
			success?: boolean;
		}
	) {
		analytics.track({
			name: 'timing_complete' as any,
			params: {
				name: metric,
				value: duration,
				page_location: context?.page,
				endpoint: context?.endpoint,
				success: context?.success
			}
		});

		this.updateEventState();
	}

	/**
	 * Manually flush events (for testing or critical moments)
	 */
	async flush() {
		await analytics.flush();
		this.eventsQueued = 0;
		this.updateEventState();
	}

	/**
	 * Update reactive state after tracking events
	 */
	private updateEventState() {
		this.lastEventTime = new Date();
		this.eventsQueued += 1;
	}

	/**
	 * Setup session activity tracking
	 */
	private setupSessionTracking() {
		if (typeof window === 'undefined') return;

		// Track session start
		analytics.track({
			name: 'session_start',
			params: {}
		});

		// Track when user becomes active/inactive
		let isActive = true;
		let sessionStartTime = Date.now();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden' && isActive) {
				// User left - track session end
				const sessionDuration = Date.now() - sessionStartTime;
				analytics.track({
					name: 'session_end',
					params: {
						session_duration: sessionDuration
					}
				});
				
				this.sessionActive = false;
				isActive = false;
			} else if (document.visibilityState === 'visible' && !isActive) {
				// User returned - start new session
				analytics.track({
					name: 'session_start',
					params: {}
				});
				
				this.sessionActive = true;
				isActive = true;
				sessionStartTime = Date.now();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Track page unload
		window.addEventListener('beforeunload', () => {
			if (isActive) {
				const sessionDuration = Date.now() - sessionStartTime;
				analytics.track({
					name: 'session_end',
					params: {
						session_duration: sessionDuration
					}
				});
			}
		});
	}
}

// Export singleton instance
export const analyticsStore = new AnalyticsStore();

// Export types for components
export type { ProductEventParams, SearchEventParams };