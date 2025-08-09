import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import * as Sentry from '@sentry/sveltekit';
import { SENTRY_DSN } from '$env/static/private';
import { randomUUID } from 'crypto';
import { checkRateLimit, generateRateLimitKey, RATE_LIMITS } from '$lib/utils/rate-limiter';

// Initialize Sentry on the server
if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: import.meta.env.SENTRY_ENVIRONMENT || 'development',
		tracesSampleRate: import.meta.env.MODE === 'production' ? 0.15 : 1.0,
	});
}

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 * Uses the modern cookie handling pattern recommended for 2024/2025.
	 */
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => event.cookies.get(key),
				set: (key, value, options) => {
					event.cookies.set(key, value, { 
						...options, 
						path: '/' 
					});
				},
				remove: (key, options) => {
					event.cookies.delete(key, { 
						...options, 
						path: '/' 
					});
				},
			},
		}
	);

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
};

const localeDetection: Handle = async ({ event, resolve }) => {
	// Detect locale from URL, cookie, or Accept-Language header
	let locale: 'bg' | 'en' = 'bg'; // Default to Bulgarian
	
	// Check cookie first
	const localeCookie = event.cookies.get('locale');
	if (localeCookie && ['bg', 'en'].includes(localeCookie)) {
		locale = localeCookie as 'bg' | 'en';
	} else {
		// Check Accept-Language header
		const acceptLanguage = event.request.headers.get('accept-language');
		if (acceptLanguage) {
			// Simple check for English preference
			if (acceptLanguage.toLowerCase().includes('en')) {
				locale = 'en';
			}
		}
	}
	
	// Set locale in locals and cookie
	event.locals.lang = locale;
	event.cookies.set('locale', locale, { 
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: 'lax'
	});
	
	return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Protect routes under /private, /dashboard, and /profile
	const protectedPaths = ['/private', '/dashboard', '/admin', '/profile'];
	const isProtectedRoute = protectedPaths.some((path) => event.url.pathname.startsWith(path));

	if (isProtectedRoute && !session) {
		const redirectTo = event.url.pathname + event.url.search;
		throw redirect(303, `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	// Redirect authenticated users away from auth pages (except verify)
	const authPaths = ['/auth/login', '/auth/signup'];
	const isAuthRoute = authPaths.some((path) => event.url.pathname === path);

	if (isAuthRoute && session) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		throw redirect(303, redirectTo);
	}

	return resolve(event);
};

const rateLimitingMiddleware: Handle = async ({ event, resolve }) => {
	// Skip rate limiting for static assets and health checks
	if (event.url.pathname.startsWith('/_app/') || 
		event.url.pathname === '/health' || 
		event.url.pathname === '/ready') {
		return resolve(event);
	}

	// Get client IP (considering proxies like Cloudflare)
	const clientIP = event.getClientAddress();
	const userId = event.locals.user?.id;
	
	// Determine rate limit based on endpoint
	let rateLimitConfig = RATE_LIMITS.api;
	let endpoint = 'api';

	if (event.url.pathname.startsWith('/auth/')) {
		rateLimitConfig = RATE_LIMITS.auth;
		endpoint = 'auth';
	} else if (event.url.pathname.startsWith('/api/search') || 
			   event.url.pathname.startsWith('/search')) {
		rateLimitConfig = RATE_LIMITS.search;
		endpoint = 'search';
	} else if (event.url.pathname.includes('/like') || 
			   event.url.pathname.includes('/favorite') ||
			   event.url.pathname.includes('/follow')) {
		rateLimitConfig = RATE_LIMITS.social;
		endpoint = 'social';
	} else if (event.url.pathname.startsWith('/api/analytics')) {
		rateLimitConfig = RATE_LIMITS.analytics;
		endpoint = 'analytics';
	} else if (event.url.pathname.includes('/upload')) {
		rateLimitConfig = RATE_LIMITS.upload;
		endpoint = 'upload';
	}

	// Generate rate limit key
	const rateLimitKey = generateRateLimitKey(clientIP, userId, endpoint);
	
	// Check rate limit
	const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfig, endpoint);
	
	if (!rateLimitResult.allowed && rateLimitResult.response) {
		// Log rate limit violation for monitoring
		console.warn(`Rate limit exceeded for ${clientIP} on ${endpoint} endpoint`, {
			ip: clientIP,
			userId,
			endpoint,
			path: event.url.pathname
		});

		// Track in Sentry for alerting
		if (SENTRY_DSN) {
			Sentry.addBreadcrumb({
				message: 'Rate limit exceeded',
				category: 'security',
				data: { ip: clientIP, userId, endpoint, path: event.url.pathname }
			});
		}

		return rateLimitResult.response;
	}

	return resolve(event);
};

const securityHeaders: Handle = async ({ event, resolve }) => {
	// Generate a unique request ID for tracing
	const requestId = randomUUID();
	event.locals.requestId = requestId;

	// Process the request
	const response = await resolve(event);

	// Add security headers to the response
	response.headers.set('X-Request-ID', requestId);
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
	
	// Add HSTS header for production
	if (import.meta.env.PROD) {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	// Content Security Policy (CSP)
	// Note: Adjust these based on your needs. This is a starting point.
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.supabase.net https://cdn.jsdelivr.net",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' data: https://fonts.gstatic.com",
		"img-src 'self' data: blob: https: http:",
		"connect-src 'self' https://*.supabase.co https://*.supabase.net wss://*.supabase.co wss://*.supabase.net https://api.sentry.io",
		"frame-ancestors 'self'",
		"base-uri 'self'",
		"form-action 'self'",
		"object-src 'none'",
	];

	// Join CSP directives
	response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

	return response;
};

// Create the handle sequence
const baseHandle = sequence(securityHeaders, rateLimitingMiddleware, supabase, localeDetection, authGuard);

// Wrap the sequence with Sentry's handle for error tracking
export const handle: Handle = SENTRY_DSN 
	? sequence(Sentry.sentryHandle(), baseHandle)
	: baseHandle;

// Export handleError for Sentry error tracking
export const handleError: HandleServerError = Sentry.handleErrorWithSentry();
