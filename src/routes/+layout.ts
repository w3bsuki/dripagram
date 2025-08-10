import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database.types';
import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { setLocale } from '$lib/paraglide/runtime';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	// Force Bulgarian locale
	setLocale('bg');
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth');

	/**
	 * Create a Supabase client using the recommended SSR pattern.
	 * This handles both browser and server-side execution correctly.
	 */
	const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch,
		},
		cookies: {
			getAll() {
				if (!isBrowser()) {
					return data.cookies;
				}
				return document.cookie
					.split('; ')
					.map(cookie => {
						const [name, value] = cookie.split('=');
						return { name, value };
					})
					.filter(({ name, value }) => name && value);
			},
			setAll(cookiesToSet) {
				if (!isBrowser()) return;
				cookiesToSet.forEach(({ name, value, options }) => {
					let cookieString = `${name}=${value}`;
					if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
					if (options?.path) cookieString += `; path=${options.path}`;
					if (options?.domain) cookieString += `; domain=${options.domain}`;
					if (options?.secure) cookieString += `; secure`;
					if (options?.httpOnly) cookieString += `; httponly`;
					if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
					document.cookie = cookieString;
				});
			}
		},
	});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// PostHog initialization is handled in hooks.client.ts and ConsentBanner
	// to avoid conflicts and ensure proper consent gating

	return {
		session,
		supabase,
		user: data.user,
		lang: data.lang,
	};
};
