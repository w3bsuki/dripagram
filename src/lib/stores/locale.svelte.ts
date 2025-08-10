import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { getContext, setContext } from 'svelte';
import { createClient } from '$lib/supabase/client';

/**
 * Locale state interface with Bulgarian defaults
 */
interface LocaleState {
	locale: 'bg' | 'en';
	region: string;
	isLoading: boolean;
	hasChanged: boolean;
	error: string | null;
}

/**
 * Region definitions for Bulgarian and English markets
 */
const BULGARIAN_REGIONS = [
	{ code: 'sofia', name: 'София', emoji: '🏛️' },
	{ code: 'plovdiv', name: 'Пловдив', emoji: '🏺' },
	{ code: 'varna', name: 'Варна', emoji: '🏖️' },
	{ code: 'burgas', name: 'Бургас', emoji: '⛵' },
	{ code: 'stara-zagora', name: 'Стара Загора', emoji: '🌳' },
	{ code: 'pleven', name: 'Плевен', emoji: '🏰' },
	{ code: 'sliven', name: 'Сливен', emoji: '⛰️' },
	{ code: 'other', name: 'Друго', emoji: '📍' }
] as const;

const ENGLISH_REGIONS = [
	{ code: 'international', name: 'International', emoji: '🌍' },
	{ code: 'europe', name: 'Europe', emoji: '🇪🇺' },
	{ code: 'north-america', name: 'North America', emoji: '🇺🇸' },
	{ code: 'other', name: 'Other', emoji: '📍' }
] as const;

/**
 * Default state - Bulgarian-first approach
 */
const DEFAULT_STATE: LocaleState = {
	locale: 'bg',
	region: 'sofia',
	isLoading: false,
	hasChanged: false,
	error: null
};

/**
 * LocaleManager class using Svelte 5 $state() runes
 * Manages locale preferences with dual persistence (cookies + Supabase)
 */
class LocaleManager {
	public state = $state<LocaleState>({ ...DEFAULT_STATE });
	private supabase = createClient();

	/**
	 * Reactive getters for state properties
	 */
	get locale() { return this.state.locale; }
	get region() { return this.state.region; }
	get isLoading() { return this.state.isLoading; }
	get hasChanged() { return this.state.hasChanged; }
	get error() { return this.state.error; }

	/**
	 * Get available regions based on current locale
	 */
	get availableRegions() {
		return this.state.locale === 'bg' ? BULGARIAN_REGIONS : ENGLISH_REGIONS;
	}

	/**
	 * Get current region details
	 */
	get currentRegion() {
		return this.availableRegions.find(r => r.code === this.state.region);
	}

	/**
	 * Get locale display name
	 */
	get localeDisplayName() {
		return this.state.locale === 'bg' ? 'Български' : 'English';
	}

	/**
	 * Get locale flag
	 */
	get localeFlag() {
		return this.state.locale === 'bg' ? '🇧🇬' : '🇺🇸';
	}

	/**
	 * Initialize locale manager with server-provided or cookie data
	 */
	async initialize(initialLocale?: string, initialRegion?: string) {
		if (!browser) return;

		try {
			// Set initial state from server data or defaults
			this.state.locale = (initialLocale as 'bg' | 'en') || 'bg';
			this.state.region = initialRegion || 'sofia';
			this.state.error = null;

			// Load user preferences from Supabase if authenticated
			await this.loadUserPreferences();

			// Validate region against available regions for current locale
			this.validateAndFixRegion();

		} catch (error) {
			console.warn('Failed to initialize locale manager:', error);
			this.state.error = 'Failed to load preferences';
		}
	}

	/**
	 * Update locale with navigation and dual persistence
	 */
	async setLocale(locale: 'bg' | 'en', region?: string) {
		if (this.state.isLoading) return;

		this.state.isLoading = true;
		this.state.error = null;

		try {
			// Determine region: use provided, or switch to appropriate default
			const targetRegion = region || (locale === 'bg' ? 'sofia' : 'international');

			// Update cookies immediately for instant feedback
			this.setCookie('locale', locale);
			this.setCookie('region', targetRegion);

			// Update local state
			const previousLocale = this.state.locale;
			this.state.locale = locale;
			this.state.region = targetRegion;
			this.state.hasChanged = previousLocale !== locale;

			// Sync to database if user is authenticated
			await this.syncToDatabase();

			// Navigate to new locale route
			await this.navigateToLocale(locale);

		} catch (error) {
			console.error('Failed to update locale:', error);
			this.state.error = 'Failed to switch language';
			// Rollback on error
			await this.loadFromCookies();
		} finally {
			this.state.isLoading = false;
		}
	}

	/**
	 * Update region only (without changing locale)
	 */
	async setRegion(region: string) {
		if (this.state.isLoading) return;

		// Validate region exists for current locale
		const isValidRegion = this.availableRegions.some(r => r.code === region);
		if (!isValidRegion) {
			console.warn(`Invalid region "${region}" for locale "${this.state.locale}"`);
			return;
		}

		this.state.isLoading = true;
		this.state.error = null;

		try {
			// Update cookie and state
			this.setCookie('region', region);
			this.state.region = region;

			// Sync to database
			await this.syncToDatabase();

		} catch (error) {
			console.error('Failed to update region:', error);
			this.state.error = 'Failed to update region';
		} finally {
			this.state.isLoading = false;
		}
	}

	/**
	 * Reset to Bulgarian defaults
	 */
	async resetToDefaults() {
		await this.setLocale('bg', 'sofia');
	}

	/**
	 * Clear error state
	 */
	clearError() {
		this.state.error = null;
	}

	/**
	 * Private: Load user preferences from database
	 */
	private async loadUserPreferences() {
		try {
			const { data: { user } } = await this.supabase.auth.getUser();

			if (user) {
				const { data: preferences } = await this.supabase
					.from('user_preferences')
					.select('locale, region')
					.eq('user_id', user.id)
					.single();

				if (preferences) {
					// Parse locale (e.g., "bg-BG" -> "bg")
					const dbLocale = preferences.locale?.split('-')[0] as 'bg' | 'en';
					if (dbLocale && ['bg', 'en'].includes(dbLocale)) {
						this.state.locale = dbLocale;
					}

					// Use database region if valid
					if (preferences.region) {
						this.state.region = preferences.region;
					}
				}
			}
		} catch (error) {
			// Silent fail - not critical, user can manually set preferences
			console.debug('Could not load user preferences:', error);
		}
	}

	/**
	 * Private: Sync preferences to database
	 */
	private async syncToDatabase() {
		try {
			const { data: { user } } = await this.supabase.auth.getUser();

			if (user) {
				// Use the sync function from the integration plan
				await this.supabase.rpc('sync_cookie_preferences', {
					p_user_id: user.id,
					p_locale: `${this.state.locale}-${this.state.locale === 'bg' ? 'BG' : 'US'}`,
					p_region: this.state.region
				});
			}
		} catch (error) {
			// Log but don't throw - cookie persistence is sufficient fallback
			console.debug('Could not sync to database:', error);
		}
	}

	/**
	 * Private: Set cookie with proper options
	 */
	private setCookie(name: string, value: string) {
		if (!browser) return;

		const options = [
			`${name}=${value}`,
			'path=/',
			'max-age=31536000', // 1 year
			'SameSite=Lax'
		].join('; ');

		document.cookie = options;
	}

	/**
	 * Private: Load preferences from cookies
	 */
	private loadFromCookies() {
		if (!browser) return;

		const cookies = document.cookie
			.split(';')
			.reduce((acc, cookie) => {
				const [key, value] = cookie.trim().split('=');
				acc[key] = value;
				return acc;
			}, {} as Record<string, string>);

		if (cookies.locale && ['bg', 'en'].includes(cookies.locale)) {
			this.state.locale = cookies.locale as 'bg' | 'en';
		}

		if (cookies.region) {
			this.state.region = cookies.region;
		}
	}

	/**
	 * Private: Navigate to locale-specific route
	 */
	private async navigateToLocale(locale: 'bg' | 'en') {
		if (!browser) return;

		const currentPath = window.location.pathname;
		const pathWithoutLocale = currentPath.replace(/^\/(bg|en)/, '');
		const newPath = `/${locale}${pathWithoutLocale}`;

		// Only navigate if path actually changes
		if (currentPath !== newPath) {
			await goto(newPath, { replaceState: false });
		}
	}

	/**
	 * Private: Validate region against current locale and fix if needed
	 */
	private validateAndFixRegion() {
		const isValidRegion = this.availableRegions.some(r => r.code === this.state.region);

		if (!isValidRegion) {
			// Auto-fix to appropriate default
			this.state.region = this.state.locale === 'bg' ? 'sofia' : 'international';
			this.setCookie('region', this.state.region);
		}
	}
}

/**
 * Context key for locale manager
 */
const LOCALE_CONTEXT_KEY = Symbol('locale');

/**
 * Set locale context (call in root layout)
 */
export function setLocaleContext(initialLocale?: string, initialRegion?: string): LocaleManager {
	const localeManager = new LocaleManager();
	
	// Set initial state immediately if provided
	if (initialLocale) {
		localeManager.state.locale = (initialLocale as 'bg' | 'en') || 'bg';
	}
	if (initialRegion) {
		localeManager.state.region = initialRegion;
	}
	
	return setContext(LOCALE_CONTEXT_KEY, localeManager);
}

/**
 * Get locale context (use in components)
 */
export function getLocaleContext(): LocaleManager {
	const localeManager = getContext<LocaleManager>(LOCALE_CONTEXT_KEY);
	
	if (!localeManager) {
		throw new Error('LocaleManager not found in context. Make sure to call setLocaleContext in a parent component.');
	}
	
	return localeManager;
}

/**
 * Export region constants for use in components
 */
export { BULGARIAN_REGIONS, ENGLISH_REGIONS };

/**
 * Export types for external use
 */
export type { LocaleState };
export type LocaleCode = 'bg' | 'en';
export type RegionCode = typeof BULGARIAN_REGIONS[number]['code'] | typeof ENGLISH_REGIONS[number]['code'];