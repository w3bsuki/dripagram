// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from './lib/types/database.types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			lang: 'bg' | 'en';
			requestId: string;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			lang: 'bg' | 'en';
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
