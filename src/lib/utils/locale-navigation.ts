import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { LocaleCode } from '$lib/stores/locale.svelte';

/**
 * Navigate to a route with the specified locale
 */
export async function navigateToLocale(
	locale: LocaleCode,
	path: string = '',
	options: { replaceState?: boolean; noScroll?: boolean } = {}
) {
	if (!browser) return;

	// Clean up the path
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	const pathWithoutLocale = cleanPath.replace(/^\/(bg|en)/, '');
	const newPath = `/${locale}${pathWithoutLocale}`;

	// Only navigate if the path actually changes
	if (window.location.pathname !== newPath) {
		await goto(newPath, {
			replaceState: options.replaceState ?? false,
			noScroll: options.noScroll ?? false
		});
	}
}

/**
 * Get the current path without locale prefix
 */
export function getPathWithoutLocale(path?: string): string {
	const currentPath = path || (browser ? window.location.pathname : '');
	return currentPath.replace(/^\/(bg|en)/, '');
}

/**
 * Get the current locale from the URL path
 */
export function getLocaleFromPath(path?: string): LocaleCode {
	const currentPath = path || (browser ? window.location.pathname : '');
	const match = currentPath.match(/^\/(bg|en)/);
	return (match?.[1] as LocaleCode) || 'bg';
}

/**
 * Build a localized URL for a given path
 */
export function buildLocalizedUrl(locale: LocaleCode, path: string, baseUrl?: string): string {
	const base = baseUrl || (browser ? window.location.origin : '');
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	const pathWithoutLocale = cleanPath.replace(/^\/(bg|en)/, '');
	return `${base}/${locale}${pathWithoutLocale}`;
}

/**
 * Check if a path is a localized route
 */
export function isLocalizedRoute(path: string): boolean {
	return /^\/(bg|en)/.test(path);
}

/**
 * Redirect to the default locale if no locale is specified
 */
export function redirectToDefaultLocale(
	path: string,
	defaultLocale: LocaleCode = 'bg'
) {
	if (!isLocalizedRoute(path) && path !== '/') {
		return `/${defaultLocale}${path}`;
	}
	return null;
}

/**
 * Generate alternate URLs for SEO (hreflang)
 */
export function generateAlternateUrls(
	currentPath: string,
	baseUrl?: string
): Array<{ locale: LocaleCode; url: string; lang: string; country?: string }> {
	const base = baseUrl || (browser ? window.location.origin : '');
	const pathWithoutLocale = getPathWithoutLocale(currentPath);

	return [
		{
			locale: 'bg',
			url: buildLocalizedUrl('bg', pathWithoutLocale, base),
			lang: 'bg',
			country: 'BG'
		},
		{
			locale: 'en',
			url: buildLocalizedUrl('en', pathWithoutLocale, base),
			lang: 'en',
			country: 'US'
		}
	];
}

/**
 * Cookie utilities for locale persistence
 */
export const localeCookies = {
	/**
	 * Set locale cookie
	 */
	setLocale(locale: LocaleCode, maxAge: number = 60 * 60 * 24 * 365): void {
		if (!browser) return;

		const cookieString = [
			`locale=${locale}`,
			'path=/',
			`max-age=${maxAge}`,
			'SameSite=Lax'
		].join('; ');

		document.cookie = cookieString;
	},

	/**
	 * Set region cookie
	 */
	setRegion(region: string, maxAge: number = 60 * 60 * 24 * 365): void {
		if (!browser) return;

		const cookieString = [
			`region=${region}`,
			'path=/',
			`max-age=${maxAge}`,
			'SameSite=Lax'
		].join('; ');

		document.cookie = cookieString;
	},

	/**
	 * Get locale from cookies
	 */
	getLocale(): LocaleCode | null {
		if (!browser) return null;

		const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
		const value = match?.[1];
		return (value === 'bg' || value === 'en') ? value : null;
	},

	/**
	 * Get region from cookies
	 */
	getRegion(): string | null {
		if (!browser) return null;

		const match = document.cookie.match(/(?:^|;\s*)region=([^;]*)/);
		return match?.[1] || null;
	},

	/**
	 * Clear locale cookies
	 */
	clear(): void {
		if (!browser) return;

		document.cookie = 'locale=; path=/; max-age=0';
		document.cookie = 'region=; path=/; max-age=0';
	}
};

/**
 * Browser language detection utilities
 */
export const browserLanguage = {
	/**
	 * Get preferred language from browser
	 */
	getPreferred(): LocaleCode {
		if (!browser || !navigator.language) return 'bg';

		const lang = navigator.language.toLowerCase();
		
		// Check for Bulgarian
		if (lang.startsWith('bg')) return 'bg';
		
		// Check for English
		if (lang.startsWith('en')) return 'en';

		// Check navigator.languages for fallback
		if (navigator.languages) {
			for (const language of navigator.languages) {
				const langCode = language.toLowerCase();
				if (langCode.startsWith('bg')) return 'bg';
				if (langCode.startsWith('en')) return 'en';
			}
		}

		// Default to Bulgarian
		return 'bg';
	},

	/**
	 * Check if browser supports Bulgarian
	 */
	supportsBulgarian(): boolean {
		if (!browser || !navigator.language) return false;

		const lang = navigator.language.toLowerCase();
		return lang.startsWith('bg') || 
			   (navigator.languages?.some(l => l.toLowerCase().startsWith('bg')) ?? false);
	}
};

/**
 * Validation utilities
 */
export const localeValidation = {
	/**
	 * Check if locale is valid
	 */
	isValidLocale(locale: string): locale is LocaleCode {
		return locale === 'bg' || locale === 'en';
	},

	/**
	 * Sanitize locale input
	 */
	sanitizeLocale(locale: unknown): LocaleCode {
		if (typeof locale === 'string' && this.isValidLocale(locale)) {
			return locale;
		}
		return 'bg'; // Default to Bulgarian
	},

	/**
	 * Check if region is valid for locale
	 */
	isValidRegion(region: string, locale: LocaleCode): boolean {
		const bulgarianRegions = ['sofia', 'plovdiv', 'varna', 'burgas', 'stara-zagora', 'pleven', 'sliven', 'other'];
		const englishRegions = ['international', 'europe', 'north-america', 'other'];
		
		const validRegions = locale === 'bg' ? bulgarianRegions : englishRegions;
		return validRegions.includes(region);
	},

	/**
	 * Get default region for locale
	 */
	getDefaultRegion(locale: LocaleCode): string {
		return locale === 'bg' ? 'sofia' : 'international';
	}
};

/**
 * URL utilities for locale handling
 */
export const localeUrls = {
	/**
	 * Convert internal path to public URL
	 */
	toPublicUrl(path: string, locale?: LocaleCode): string {
		const currentLocale = locale || getLocaleFromPath();
		return buildLocalizedUrl(currentLocale, path);
	},

	/**
	 * Get current URL with different locale
	 */
	switchLocale(newLocale: LocaleCode, currentPath?: string): string {
		const path = getPathWithoutLocale(currentPath);
		return buildLocalizedUrl(newLocale, path);
	},

	/**
	 * Check if URL needs locale redirect
	 */
	needsRedirect(path: string): { redirect: true; to: string } | { redirect: false } {
		// If path doesn't have locale and isn't root, redirect to default locale
		if (!isLocalizedRoute(path) && path !== '/') {
			return { redirect: true, to: `/bg${path}` };
		}
		
		// If root path, redirect to default locale
		if (path === '/') {
			return { redirect: true, to: '/bg' };
		}

		return { redirect: false };
	}
};