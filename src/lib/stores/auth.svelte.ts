import { getContext, setContext } from 'svelte'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Auth state using Svelte 5 runes
 * This works in conjunction with the SSR setup in hooks.server.ts and layouts
 */
class AuthState {
	user = $state<User | null>(null)
	session = $state<Session | null>(null)
	loading = $state(true)

	constructor(initialUser: User | null, initialSession: Session | null) {
		this.user = initialUser
		this.session = initialSession
		this.loading = false
	}

	setAuth(session: Session | null, user: User | null) {
		this.session = session
		this.user = user
		this.loading = false
	}

	signOut() {
		this.session = null
		this.user = null
	}

	get isAuthenticated() {
		return !!this.session && !!this.user
	}

	get isLoading() {
		return this.loading
	}
}

const AUTH_CONTEXT_KEY = Symbol('auth')

export function setAuthContext(user: User | null, session: Session | null) {
	return setContext(AUTH_CONTEXT_KEY, new AuthState(user, session))
}

export function getAuthContext(): AuthState {
	return getContext(AUTH_CONTEXT_KEY)
}