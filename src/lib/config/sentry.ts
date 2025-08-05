/**
 * Sentry configuration for error tracking
 * This is a placeholder configuration - update with actual Sentry DSN when ready
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
 */
export const sentryConfig: SentryConfig = {
	// Set your Sentry DSN here when ready
	dsn: process.env.PUBLIC_SENTRY_DSN || undefined,
	
	// Environment
	environment: dev ? 'development' : 'production',
	
	// Only enable in production
	enabled: !dev && !!process.env.PUBLIC_SENTRY_DSN,
	
	// Performance monitoring sample rate (0.0 to 1.0)
	tracesSampleRate: dev ? 1.0 : 0.1,
	
	// Debug mode
	debug: dev,
	
	// Integrations (to be added when Sentry is installed)
	integrations: [],
	
	// Filter sensitive data before sending
	beforeSend: (event, hint) => {
		// Don't send events in development unless explicitly enabled
		if (dev && !process.env.FORCE_SENTRY_DEV) {
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
				if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
					event.extra[key] = '[REDACTED]';
				}
			}
		}
		
		return event;
	}
};

/**
 * Initialize Sentry (call this in app initialization)
 * Note: Sentry SDK needs to be installed first:
 * pnpm add @sentry/sveltekit
 */
export async function initSentry() {
	if (!sentryConfig.enabled) {
		console.log('Sentry is disabled');
		return;
	}
	
	try {
		// Dynamic import to avoid errors if Sentry is not installed
		// const Sentry = await import('@sentry/sveltekit').catch(() => null);
		const Sentry = null; // Disabled for now
		
		if (!Sentry) {
			console.warn('Sentry SDK not installed. Run: pnpm add @sentry/sveltekit');
			return;
		}
		
		// This code will never run since Sentry is null, but keeping for future use
		// Sentry.init({
		//	dsn: sentryConfig.dsn,
		//	environment: sentryConfig.environment,
		//	tracesSampleRate: sentryConfig.tracesSampleRate,
		//	debug: sentryConfig.debug,
		//	integrations: sentryConfig.integrations,
		//	beforeSend: sentryConfig.beforeSend
		// });
		
		console.log('Sentry initialized successfully');
	} catch (error) {
		console.error('Failed to initialize Sentry:', error);
	}
}

/**
 * Capture exception manually
 */
export function captureException(error: unknown, context?: Record<string, any>) {
	if (!sentryConfig.enabled) {
		return;
	}
	
	// This will be implemented when Sentry is installed
	console.error('Sentry exception capture:', error, context);
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
	if (!sentryConfig.enabled) {
		return;
	}
	
	// This will be implemented when Sentry is installed
	console.log(`Sentry message capture [${level}]:`, message);
}

/**
 * Add breadcrumb for better error context
 */
export function addBreadcrumb(breadcrumb: {
	message: string;
	category?: string;
	level?: 'debug' | 'info' | 'warning' | 'error';
	data?: Record<string, any>;
}) {
	if (!sentryConfig.enabled) {
		return;
	}
	
	// This will be implemented when Sentry is installed
	if (dev) {
		console.log('Sentry breadcrumb:', breadcrumb);
	}
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
	id?: string;
	email?: string;
	username?: string;
} | null) {
	if (!sentryConfig.enabled) {
		return;
	}
	
	// This will be implemented when Sentry is installed
	if (dev) {
		console.log('Sentry user context:', user);
	}
}

/**
 * Set additional context
 */
export function setContext(key: string, context: Record<string, any>) {
	if (!sentryConfig.enabled) {
		return;
	}
	
	// This will be implemented when Sentry is installed
	if (dev) {
		console.log(`Sentry context [${key}]:`, context);
	}
}

/**
 * Performance monitoring transaction
 */
export function startTransaction(name: string, op: string = 'navigation') {
	if (!sentryConfig.enabled) {
		return null;
	}
	
	// This will be implemented when Sentry is installed
	if (dev) {
		console.log(`Sentry transaction started: ${name} (${op})`);
	}
	
	return {
		finish: () => {
			if (dev) {
				console.log(`Sentry transaction finished: ${name}`);
			}
		}
	};
}