import * as Sentry from '@sentry/sveltekit';
import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { trackPerformanceMetrics, trackBundlePerformance } from '$lib/utils/performance';

// Initialize Sentry for error tracking and performance monitoring
if (browser && import.meta.env.SENTRY_DSN) {
	Sentry.init({
		dsn: import.meta.env.SENTRY_DSN,
		environment: import.meta.env.SENTRY_ENVIRONMENT || 'development',
		
		// Performance Monitoring
		tracesSampleRate: import.meta.env.MODE === 'production' ? 0.15 : 1.0,
		
		// Session Replay
		replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0,
		replaysOnErrorSampleRate: 1.0,
		
		// Integration Configuration
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration({
				maskAllText: false,
				blockAllMedia: false,
			}),
		],
		
		// Additional options
		beforeSend(event, hint) {
			// Filter out sensitive data or unwanted errors
			if (event.exception && import.meta.env.MODE === 'development') {
				console.error('Sentry Error:', hint.originalException);
			}
			return event;
		},
		
		// Filter noisy errors
		ignoreErrors: [
			'ResizeObserver loop limit exceeded',
			'Non-Error promise rejection captured',
			'Network request failed',
		],
	});
}

// Initialize PostHog for analytics (will be gated behind consent)
export function initializeAnalytics(consent: { analytics: boolean }) {
	if (browser && consent.analytics && import.meta.env.PUBLIC_POSTHOG_KEY) {
		if (!posthog.__loaded) {
			posthog.init(import.meta.env.PUBLIC_POSTHOG_KEY, {
				api_host: import.meta.env.PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
				loaded: (posthog) => {
					if (import.meta.env.MODE === 'development') {
						posthog.debug();
					}
				},
				// Use your specified configuration
				person_profiles: 'identified_only', // Only create profiles for authenticated users
				autocapture: false, // We'll manually track important events
				capture_pageview: true,
				capture_pageleave: true,
				persistence: 'localStorage',
			});
		}
	}
}

// Initialize performance monitoring
if (browser && import.meta.env.MODE === 'production') {
	trackPerformanceMetrics();
	trackBundlePerformance();
}

// Export for use in other components
export { posthog };