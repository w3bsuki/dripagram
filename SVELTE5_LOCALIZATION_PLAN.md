# Svelte 5 + SvelteKit 2 Bulgarian-First Localization Plan

## 🎯 Overview

This plan outlines the implementation of Bulgarian-first localization with cookie persistence for Driplo.bg, leveraging Svelte 5 runes, SvelteKit 2 routing patterns, and best practices for i18n + authentication flow integration.

## 📋 Current State Analysis

✅ **Already Implemented:**
- Paraglide i18n configured (bg/en messages exist)
- Bulgarian as sourceLanguageTag in project.inlang/settings.json
- Cookie handling in +layout.ts
- Locale detection in hooks.server.ts
- Onboarding flow at `/onboarding`
- Supabase authentication and user preferences

❌ **Missing Implementation:**
- `/bg` as default path structure
- Region selection in onboarding
- Cookie-Supabase preference synchronization
- Post-email-verification → onboarding redirect flow
- Locale switching with persistent storage

## 🏗️ Technical Architecture

### 1. Route Structure Redesign

**Current:** `/` (implicit Bulgarian), `/onboarding`  
**Target:** `/bg` (default), `/en`, with region-aware paths

```
src/routes/
├── (localized)/         # Route group for localized content
│   ├── [lang=locale]/   # Language parameter with matcher
│   │   ├── +layout.svelte
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte
│   │   ├── onboarding/
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   └── region/
│   │   │       └── +page.svelte
│   │   ├── browse/
│   │   ├── sell/
│   │   └── profile/
│   └── +layout.svelte   # Root localized layout
├── +layout.svelte       # Global layout
├── +page.server.ts      # Root redirect logic
└── +page.svelte         # Root landing page
```

### 2. Locale Matcher Implementation

Create a robust locale matcher that validates Bulgarian regions:

```typescript
// src/params/locale.ts
import type { ParamMatcher } from '@sveltejs/kit';

const VALID_LOCALES = ['bg', 'en'] as const;
const BULGARIAN_REGIONS = [
  'sofia', 'plovdiv', 'varna', 'burgas', 'pleven', 
  'stara-zagora', 'sliven', 'dobrich', 'ruse'
] as const;

export const match: ParamMatcher = (param) => {
  return VALID_LOCALES.includes(param as any);
};
```

### 3. Svelte 5 State Management

**Core Localization Store (`src/lib/stores/locale.svelte.ts`):**

```typescript
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { createClient } from '$lib/supabase/client';
import * as m from '$lib/paraglide/messages';

interface LocaleState {
  current: 'bg' | 'en';
  region?: string;
  isLoading: boolean;
}

class LocaleManager {
  private state = $state<LocaleState>({
    current: 'bg',
    region: undefined,
    isLoading: false
  });

  get current() { return this.state.current; }
  get region() { return this.state.region; }
  get isLoading() { return this.state.isLoading; }

  async setLocale(locale: 'bg' | 'en', options?: { 
    region?: string; 
    persist?: boolean; 
    redirect?: boolean 
  }) {
    const { region, persist = true, redirect = true } = options || {};
    
    this.state.isLoading = true;
    this.state.current = locale;
    this.state.region = region;

    try {
      // Update cookie
      if (browser && persist) {
        document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        
        if (region) {
          document.cookie = `region=${region}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        }
      }

      // Update Supabase user preferences
      if (persist) {
        await this.syncWithSupabase(locale, region);
      }

      // Handle route redirect
      if (redirect && browser) {
        const currentPath = window.location.pathname;
        const newPath = this.buildLocalizedPath(currentPath, locale, region);
        if (newPath !== currentPath) {
          await goto(newPath, { replaceState: true });
        }
      }
    } finally {
      this.state.isLoading = false;
    }
  }

  private async syncWithSupabase(locale: string, region?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({
          locale_preference: locale,
          region_preference: region
        })
        .eq('id', user.id);
    }
  }

  private buildLocalizedPath(currentPath: string, locale: string, region?: string): string {
    // Remove existing locale from path
    const pathWithoutLocale = currentPath.replace(/^\/(bg|en)/, '');
    
    // Build new path
    let newPath = `/${locale}`;
    if (region && locale === 'bg') {
      newPath += `/${region}`;
    }
    newPath += pathWithoutLocale || '';
    
    return newPath === `/${locale}` ? `/${locale}` : newPath;
  }

  loadFromCookies(cookies: Record<string, string>) {
    const locale = cookies.locale as 'bg' | 'en' || 'bg';
    const region = cookies.region;
    
    this.state.current = locale;
    this.state.region = region;
  }

  loadFromUser(user: any) {
    if (user?.locale_preference) {
      this.state.current = user.locale_preference;
    }
    if (user?.region_preference) {
      this.state.region = user.region_preference;
    }
  }
}

export const localeManager = new LocaleManager();
```

### 4. Enhanced Hooks Implementation

**Updated `src/hooks.server.ts`:**

```typescript
const localeDetection: Handle = async ({ event, resolve }) => {
  let locale: 'bg' | 'en' = 'bg';
  let region: string | undefined;

  // 1. Check URL path first
  const urlMatch = event.url.pathname.match(/^\/([a-z]{2})/);
  if (urlMatch && ['bg', 'en'].includes(urlMatch[1])) {
    locale = urlMatch[1] as 'bg' | 'en';
  }

  // 2. Check cookies if no URL locale
  if (!urlMatch) {
    const localeCookie = event.cookies.get('locale');
    const regionCookie = event.cookies.get('region');
    
    if (localeCookie && ['bg', 'en'].includes(localeCookie)) {
      locale = localeCookie as 'bg' | 'en';
    }
    
    region = regionCookie;
  }

  // 3. Check user preferences from database
  const { user } = await event.locals.safeGetSession();
  if (user) {
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('locale_preference, region_preference')
      .eq('id', user.id)
      .single();
    
    if (profile?.locale_preference) {
      locale = profile.locale_preference;
    }
    if (profile?.region_preference) {
      region = profile.region_preference;
    }
  }

  // 4. Browser language detection fallback
  if (!urlMatch && !event.cookies.get('locale')) {
    const acceptLanguage = event.request.headers.get('accept-language');
    if (acceptLanguage && acceptLanguage.toLowerCase().includes('en')) {
      locale = 'en';
    }
  }

  // Set in locals and cookies
  event.locals.lang = locale;
  event.locals.region = region;

  // Update cookies
  event.cookies.set('locale', locale, { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 365, 
    sameSite: 'lax' 
  });

  if (region) {
    event.cookies.set('region', region, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365, 
      sameSite: 'lax' 
    });
  }

  return resolve(event);
};

// Enhanced auth guard with onboarding redirect
const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Check if user needs onboarding after email verification
  if (session && user) {
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('onboarding_completed, email_verified')
      .eq('id', user.id)
      .single();

    // Force onboarding for verified users who haven't completed it
    if (profile?.email_verified && !profile?.onboarding_completed) {
      const isOnboardingRoute = event.url.pathname.includes('/onboarding');
      const isApiRoute = event.url.pathname.startsWith('/api');
      
      if (!isOnboardingRoute && !isApiRoute) {
        const locale = event.locals.lang || 'bg';
        throw redirect(303, `/${locale}/onboarding`);
      }
    }
  }

  // Standard protected route logic continues...
  return resolve(event);
};
```

### 5. Root Redirect Implementation

**`src/routes/+page.server.ts`:**

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
  // Get preferred locale from various sources
  let targetLocale = locals.lang || 'bg';
  let targetRegion = locals.region;

  // Check if user has specific region preference
  if (locals.user) {
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('locale_preference, region_preference')
      .eq('id', locals.user.id)
      .single();
    
    if (profile?.locale_preference) {
      targetLocale = profile.locale_preference;
    }
    if (profile?.region_preference) {
      targetRegion = profile.region_preference;
    }
  }

  // Build redirect path
  let redirectPath = `/${targetLocale}`;
  
  // Add region for Bulgarian users
  if (targetLocale === 'bg' && targetRegion) {
    redirectPath += `/${targetRegion}`;
  }

  // Preserve query parameters
  if (url.search) {
    redirectPath += url.search;
  }

  throw redirect(302, redirectPath);
};
```

### 6. Enhanced Onboarding with Region Selection

**Updated `src/routes/(localized)/[lang=locale]/onboarding/+page.svelte`:**

```svelte
<script lang="ts">
  import { localeManager } from '$lib/stores/locale.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  
  // Region selection state
  let selectedRegion = $state('sofia');
  let showRegionStep = $state(false);
  
  const bulgarianRegions = [
    { value: 'sofia', label: 'София', emoji: '🏛️' },
    { value: 'plovdiv', label: 'Пловдив', emoji: '🏺' },
    { value: 'varna', label: 'Варна', emoji: '🌊' },
    { value: 'burgas', label: 'Бургас', emoji: '⛱️' },
    { value: 'pleven', label: 'Плевен', emoji: '🌾' },
    { value: 'stara-zagora', label: 'Стара Загора', emoji: '🏭' }
  ];

  // Add region selection step
  let steps = $state([
    {
      id: 'language-region',
      title: 'Choose Your Language & Region',
      description: 'Select your preferred language and location',
      icon: Globe,
      completed: false,
    },
    // ... other existing steps
  ]);

  function handleLanguageChange(locale: 'bg' | 'en') {
    showRegionStep = locale === 'bg';
    if (locale === 'en') {
      selectedRegion = '';
    }
  }

  async function completeOnboarding() {
    loading = true;

    try {
      // Update profile with locale and region preferences
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          // ... existing profile updates
          locale_preference: localeManager.current,
          region_preference: selectedRegion || null,
          onboarding_completed: true,
        })
        .eq('id', auth.user!.id);

      if (profileError) throw profileError;

      // Set locale with region
      await localeManager.setLocale(localeManager.current, {
        region: selectedRegion,
        persist: true,
        redirect: false
      });

      toast.success('Welcome to Driplo! Your profile is all set up.');
      
      // Redirect to localized home
      const redirectPath = localeManager.current === 'bg' && selectedRegion 
        ? `/bg/${selectedRegion}` 
        : `/${localeManager.current}`;
      
      await goto(redirectPath);
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      loading = false;
    }
  }
</script>

<!-- Language & Region Selection Step -->
{#if currentStep === 0}
  <div class="step-card">
    <h2>Choose Your Language & Region</h2>
    <p>Select your preferred language and location for the best experience</p>

    <!-- Language Selection -->
    <div class="language-selection">
      <h3>Language / Език</h3>
      <div class="language-options">
        <label class="language-option">
          <input 
            type="radio" 
            bind:group={localeManager.current} 
            value="bg"
            onchange={() => handleLanguageChange('bg')}
          />
          <div class="option-content">
            <div class="option-flag">🇧🇬</div>
            <div class="option-text">
              <h4>Български</h4>
              <p>Българската версия</p>
            </div>
          </div>
        </label>

        <label class="language-option">
          <input 
            type="radio" 
            bind:group={localeManager.current} 
            value="en"
            onchange={() => handleLanguageChange('en')}
          />
          <div class="option-content">
            <div class="option-flag">🇬🇧</div>
            <div class="option-text">
              <h4>English</h4>
              <p>English version</p>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Region Selection for Bulgarian -->
    {#if showRegionStep}
      <div class="region-selection" transition:slide>
        <h3>Изберете вашия регион</h3>
        <div class="region-grid">
          {#each bulgarianRegions as region}
            <label class="region-option">
              <input 
                type="radio" 
                bind:group={selectedRegion} 
                value={region.value}
              />
              <div class="region-content">
                <span class="region-emoji">{region.emoji}</span>
                <span class="region-name">{region.label}</span>
              </div>
            </label>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
```

### 7. Layout Integration

**`src/routes/(localized)/[lang=locale]/+layout.svelte`:**

```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import { localeManager } from '$lib/stores/locale.svelte';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  // Initialize locale manager from server data
  localeManager.loadFromCookies(data.cookies);
  if (data.user) {
    localeManager.loadFromUser(data.user);
  }

  // Set locale context for child components
  setContext('locale', localeManager);
</script>

<div class="app" data-locale={localeManager.current}>
  {@render children()}
</div>
```

### 8. Locale Switching Component

**`src/lib/components/navigation/LocaleSwitcher.svelte`:**

```svelte
<script lang="ts">
  import { localeManager } from '$lib/stores/locale.svelte';
  import { Globe, ChevronDown } from '@lucide/svelte';
  
  let isOpen = $state(false);

  async function switchLocale(locale: 'bg' | 'en', region?: string) {
    isOpen = false;
    await localeManager.setLocale(locale, { 
      region,
      persist: true,
      redirect: true 
    });
  }
</script>

<div class="locale-switcher" class:loading={localeManager.isLoading}>
  <button 
    class="switcher-trigger"
    onclick={() => isOpen = !isOpen}
    disabled={localeManager.isLoading}
  >
    <Globe size={16} />
    <span>{localeManager.current === 'bg' ? 'БГ' : 'EN'}</span>
    <ChevronDown size={14} />
  </button>

  {#if isOpen}
    <div class="switcher-dropdown">
      <button onclick={() => switchLocale('bg')}>
        🇧🇬 Български
      </button>
      <button onclick={() => switchLocale('en')}>
        🇬🇧 English
      </button>
    </div>
  {/if}
</div>

<style>
  .locale-switcher {
    position: relative;
  }

  .switcher-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .switcher-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-width: 120px;
    z-index: 1000;
  }

  .switcher-dropdown button {
    width: 100%;
    padding: 0.5rem 0.75rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .switcher-dropdown button:hover {
    background: var(--color-gray-50);
  }
</style>
```

## 🔄 Implementation Flow

### Phase 1: Route Structure Setup (2-3 hours)
1. Create locale matcher in `src/params/locale.ts`
2. Restructure routes under `(localized)/[lang=locale]/`
3. Update root `+page.server.ts` with redirect logic
4. Test basic routing with `/bg` and `/en` paths

### Phase 2: State Management (3-4 hours)
1. Implement `LocaleManager` class with Svelte 5 runes
2. Create locale store in `src/lib/stores/locale.svelte.ts`
3. Update hooks.server.ts with enhanced locale detection
4. Test cookie and Supabase synchronization

### Phase 3: Onboarding Enhancement (2-3 hours)
1. Add region selection step to onboarding
2. Update onboarding completion logic
3. Integrate with locale manager
4. Test post-verification redirect flow

### Phase 4: UI Components (2-3 hours)
1. Create LocaleSwitcher component
2. Update navigation components
3. Add locale context to layouts
4. Test switching between languages/regions

### Phase 5: Testing & Polish (2-3 hours)
1. Test all redirect scenarios
2. Verify cookie persistence
3. Test Supabase synchronization
4. Polish UI transitions and loading states

## 🧪 Key Testing Scenarios

1. **First-time visitor** → lands on `/bg` (default)
2. **English browser** → lands on `/en` 
3. **Returning user** → respects cookie preferences
4. **Authenticated user** → syncs with Supabase preferences
5. **Post-verification** → forced through onboarding → region selection
6. **Language switching** → updates URL, cookies, and database
7. **Deep links** → `/bg/sofia/browse` works correctly

## 🛡️ Error Handling & Fallbacks

1. **Invalid locale in URL** → redirect to default `/bg`
2. **Missing region** → use default Sofia for Bulgarian
3. **Supabase sync failure** → still update cookies/URL
4. **Invalid region** → fallback to default region
5. **Network issues** → graceful degradation with loading states

## 📈 Performance Considerations

1. **Lazy load region data** → only fetch when Bulgarian is selected
2. **Cache locale preferences** → avoid repeated DB queries
3. **Minimize redirects** → smart path building
4. **Preload critical routes** → `/bg` and `/en` home pages
5. **Bundle splitting** → separate locale-specific message bundles

This plan provides a comprehensive, production-ready implementation of Bulgarian-first localization using modern Svelte 5 patterns and SvelteKit 2 best practices.