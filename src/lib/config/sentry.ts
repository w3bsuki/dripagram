/**
 * Sentry configuration for production error tracking
 * Install @sentry/sveltekit when ready: pnpm add @sentry/sveltekit
 */

import { dev } from '$app/environment';

interface SentryConfig {
	dsn: string | undefined;
	environment: string;
	enabled: boolean;
	tracesSampleRate: number;
	debug: boolean;
	integrations: any[];
	beforeSend?: (event: any, hint: any) => any;
}

/**
 * Sentry configuration
 * Add PUBLIC_SENTRY_DSN to your .env file when ready
 */
export const sentryConfig: SentryConfig = {
	// Will be populated from env when PUBLIC_SENTRY_DSN is set
	dsn: undefined, // Set via PUBLIC_SENTRY_DSN in .env
	
	// Environment
	environment: dev ? 'development' : 'production',
	
	// Only enable in production when DSN is set
	enabled: false, // Will be enabled when Sentry is installed and configured
	
	// Performance monitoring sample rate (0.0 to 1.0)
	tracesSampleRate: dev ? 1.0 : 0.1,
	
	// Debug mode
	debug: dev,
	
	// Integrations (to be added when Sentry is installed)
	integrations: [],
	
	// Filter sensitive data before sending
	beforeSend: (event, hint) => {
		// Don't send events in development
		if (dev) {
			return null;
		}
		
		// Filter out sensitive data
		if (event.request?.cookies) {
			delete event.request.cookies;
		}
		
		if (event.request?.headers) {
			// Keep only non-sensitive headers
			const allowedHeaders = ['user-agent', 'referer', 'accept-language'];
			const filteredHeaders: Record<string, string> = {};
			
			for (const [key, value] of Object.entries(event.request.headers)) {
				if (allowedHeaders.includes(key.toLowerCase())) {
					filteredHeaders[key] = value as string;
				}
			}
			
			event.request.headers = filteredHeaders;
		}
		
		// Filter out sensitive data from extra context
		if (event.extra) {
			const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey'];
			for (const key of Object.keys(event.extra)) {
				if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
					event.extra[key] = '[REDACTED]';
				}
			}
		}
		
		return event;
	},
};

/**
 * Initialize Sentry in hooks.client.ts and hooks.server.ts
 * Example implementation when ready:
 * 
 * import * as Sentry from '@sentry/sveltekit';
 * import { PUBLIC_SENTRY_DSN } from '$env/static/public';
 * 
 * Sentry.init({
 *   dsn: PUBLIC_SENTRY_DSN,
 *   ...sentryConfig
 * });
 */
export async function initSentry() {
	// This will be implemented when @sentry/sveltekit is installed
	console.log('Sentry initialization placeholder - install @sentry/sveltekit when ready');
}