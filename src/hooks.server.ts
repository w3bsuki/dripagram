import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import * as Sentry from '@sentry/sveltekit';
// Optional Sentry DSN - can be undefined if not configured
const SENTRY_DSN = process.env.SENTRY_DSN;
import { randomUUID } from 'crypto';
import { checkRateLimit, generateRateLimitKey, RATE_LIMITS } from '$lib/utils/rate-limiter';
import { setLocale } from '$lib/paraglide/runtime.js';

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


const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Check if user needs to complete onboarding (Bulgarian-first flow)
	if (session && user) {
		// Check if email is verified and onboarding is incomplete
		if (user.email_confirmed_at && !user.user_metadata?.onboarding_completed) {
			// Get user profile to check onboarding status
			const { data: profile } = await event.locals.supabase
				.from('profiles')
				.select('onboarding_completed')
				.eq('id', user.id)
				.single();

			// Redirect to onboarding if not completed
			if (profile && !profile.onboarding_completed) {
				// Allow access to onboarding routes, auth routes, and API routes
				const allowedPaths = ['/onboarding', '/auth/', '/api/', '/bg/onboarding', '/en/onboarding', '/bg/auth/', '/en/auth/'];
				const isAllowedPath = allowedPaths.some(path => 
					event.url.pathname.startsWith(path)
				);

				if (!isAllowedPath) {
					// Determine locale and redirect to onboarding
					const locale = event.url.pathname.match(/^\/(bg|en)\//) ? event.url.pathname.split('/')[1] : 'bg';
					throw redirect(303, `/${locale}/onboarding`);
				}
			}
		}
	}

	// Protect routes under /private, /dashboard, and /profile
	const protectedPaths = ['/private', '/dashboard', '/admin', '/profile'];
	const isProtectedRoute = protectedPaths.some((path) => event.url.pathname.startsWith(path));

	if (isProtectedRoute && !session) {
		const redirectTo = event.url.pathname + event.url.search;
		// Determine locale from URL or default to 'bg'
		const locale = event.url.pathname.match(/^\/(bg|en)\//) ? event.url.pathname.split('/')[1] : 'bg';
		throw redirect(303, `/${locale}/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	// Redirect authenticated users away from auth pages (except verify)
	const authPaths = ['/auth/login', '/auth/signup'];
	const isAuthRoute = authPaths.some((path) => event.url.pathname === path) || 
					  event.url.pathname.match(/\/(bg|en)\/auth\/(login|signup)$/);

	if (isAuthRoute && session) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/bg';
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
	
	// Skip rate limiting in development for localhost
	if (import.meta.env.DEV && (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP === 'localhost')) {
		return resolve(event);
	}
	
	// Skip rate limiting for specific users (development/testing bypass)
	const user = event.locals.user;
	if (user?.email === 'w3bsuki@gmail.com' || user?.user_metadata?.username === 'w3bsuki') {
		return resolve(event);
	}
	
	// Also check form data for w3bsuki email during auth flows
	if (event.url.pathname.startsWith('/auth/') && event.request.method === 'POST') {
		try {
			const formData = await event.request.clone().formData();
			const email = formData.get('email')?.toString();
			if (email === 'w3bsuki@gmail.com') {
				return resolve(event);
			}
		} catch (e) {
			// Ignore form parsing errors, continue with rate limiting
		}
	}
	
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

// Route redirect handler for deprecated non-localized routes
const redirectHandle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	
	// Redirect legacy non-localized routes to localized versions
	if (pathname === '/browse' || pathname.startsWith('/browse?')) {
		const searchParams = event.url.search;
		throw redirect(301, `/bg/browse${searchParams}`);
	}
	
	if (pathname === '/wishlist' || pathname.startsWith('/wishlist?')) {
		const searchParams = event.url.search;
		throw redirect(301, `/bg/wishlist${searchParams}`);
	}
	
	return resolve(event);
};

// Dynamic locale detection and setting
const localeHandle: Handle = async ({ event, resolve }) => {
	// Extract locale from URL path
	const pathname = event.url.pathname;
	let locale = 'bg'; // Default to Bulgarian
	
	// Check if path starts with a supported locale
	if (pathname.startsWith('/en')) {
		locale = 'en';
	} else if (pathname.startsWith('/bg')) {
		locale = 'bg';
	}
	
	// Set the locale for Paraglide
	setLocale(locale as 'bg' | 'en');
	
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale).replace('%paraglide.textDirection%', 'ltr')
	});
};

// Create the handle sequence  
const baseHandle = sequence(redirectHandle, localeHandle, securityHeaders, rateLimitingMiddleware, supabase, authGuard);

// Wrap the sequence with Sentry's handle for error tracking
export const handle: Handle = SENTRY_DSN 
	? sequence(Sentry.sentryHandle(), baseHandle)
	: baseHandle;

// Export handleError for Sentry error tracking
export const handleError: HandleServerError = Sentry.handleErrorWithSentry();
