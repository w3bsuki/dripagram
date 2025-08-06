import type { User as SupabaseUser } from '@supabase/supabase-js';

// Extended user type that includes profile data
export interface ExtendedUser extends SupabaseUser {
	avatar_url?: string;
	username?: string;
	full_name?: string;
}
