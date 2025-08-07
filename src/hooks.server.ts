import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/supabase/types';

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

export const handle: Handle = sequence(supabase, authGuard);
