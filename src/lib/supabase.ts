import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/supabase/types';

if (!PUBLIC_SUPABASE_URL) {
	throw new Error('Missing PUBLIC_SUPABASE_URL environment variable');
}

if (!PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Client-side Supabase client
export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	},
	global: {
		headers: {
			'x-client-info': 'driplo-fresh@1.0.0'
		}
	}
});

// Server-side client (for server actions)
export const createServerClient = (fetch?: typeof globalThis.fetch) => {
	return createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		},
		global: {
			fetch,
			headers: {
				'x-client-info': 'driplo-fresh-server@1.0.0'
			}
		}
	});
};

// Types for easier usage
export type SupabaseClient = typeof supabase;
export type { Database } from '$lib/supabase/types';