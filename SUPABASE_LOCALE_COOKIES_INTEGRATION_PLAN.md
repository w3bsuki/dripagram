# 🇧🇬 Bulgarian-First Locale + Cookies + Supabase Integration Plan

**Project**: Driplo.bg - Bulgarian C2C Marketplace  
**Goal**: Make /bg the default landing experience with comprehensive onboarding  
**Tech Stack**: Svelte 5 + SvelteKit 2 + Supabase + Paraglide i18n + Tailwind v4  
**Timeline**: 12-16 hours implementation  

## 📋 Executive Summary

Transform Driplo.bg into a Bulgarian-first platform where:
- **Default Route**: Users land on `/bg` (not just language, but URL structure)
- **Smart Onboarding**: New users choose region (Bulgaria cities) after email verification  
- **Dual Persistence**: Preferences saved in both cookies (immediate) and Supabase (permanent)
- **Seamless UX**: Locale switching preserves user context and journey

## 🎯 Current State Analysis

### ✅ **What We Already Have**
- **Paraglide i18n**: Full Bulgarian/English message system configured
- **Onboarding Flow**: Basic 3-step onboarding at `/onboarding`
- **Cookie System**: Basic locale detection and storage in hooks.server.ts
- **Supabase Auth**: Complete authentication with profile system
- **Message Files**: Comprehensive bg.json and en.json translations

### ❌ **What We Need to Add**
- **Default /bg Routing**: Make Bulgarian the primary URL structure
- **Region Selection**: Bulgarian cities (Sofia, Plovdiv, Varna, Burgas)
- **Database Schema**: User locale/region preferences storage
- **Sync Mechanism**: Cookie ↔ Supabase bidirectional sync
- **Enhanced Onboarding**: Post-verification region selection flow

---

## 🗄️ **PHASE 1: Supabase Schema Updates**

### 1.1 Database Schema Extensions

```sql
-- Add locale and region fields to profiles table
ALTER TABLE profiles ADD COLUMN locale text DEFAULT 'bg-BG';
ALTER TABLE profiles ADD COLUMN region text DEFAULT 'bulgaria';
ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'Europe/Sofia';
ALTER TABLE profiles ADD COLUMN country_code text DEFAULT 'BG';

-- Create dedicated user preferences table
CREATE TABLE user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  locale text DEFAULT 'bg-BG',
  region text DEFAULT 'bulgaria', 
  timezone text DEFAULT 'Europe/Sofia',
  currency text DEFAULT 'BGN',
  onboarding_step text DEFAULT 'welcome',
  onboarding_data jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints and indexes
ALTER TABLE user_preferences ADD CONSTRAINT valid_locale 
  CHECK (locale IN ('bg-BG', 'en-US', 'en-GB'));
ALTER TABLE user_preferences ADD CONSTRAINT valid_region 
  CHECK (region IN ('sofia', 'plovdiv', 'varna', 'burgas', 'stara-zagora', 'pleven', 'sliven', 'other'));
  
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_locale ON user_preferences(locale);
CREATE INDEX idx_profiles_locale ON profiles(locale);
```

### 1.2 RLS Security Policies

```sql
-- Enable RLS for user preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own preferences" ON user_preferences  
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 1.3 Database Functions

```sql
-- Auto-create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id, locale, region)
  VALUES (NEW.id, 'bg-BG', 'sofia');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- Cookie sync function
CREATE OR REPLACE FUNCTION sync_cookie_preferences(
  p_user_id uuid,
  p_locale text DEFAULT 'bg-BG',
  p_region text DEFAULT 'sofia'
) RETURNS void AS $$
BEGIN
  INSERT INTO user_preferences (user_id, locale, region)
  VALUES (p_user_id, p_locale, p_region)
  ON CONFLICT (user_id) DO UPDATE SET
    locale = EXCLUDED.locale,
    region = EXCLUDED.region,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;
```

---

## 🛣️ **PHASE 2: Route Structure for /bg Default**

### 2.1 Route Directory Structure

```
src/routes/
├── (localized)/
│   ├── [lang=locale]/          # /bg, /en routes
│   │   ├── +layout.server.ts   # Locale-specific data
│   │   ├── +layout.svelte      # Localized layout
│   │   ├── browse/
│   │   │   └── +page.svelte    # /bg/browse, /en/browse
│   │   ├── onboarding/
│   │   │   ├── +layout.svelte  # Onboarding layout
│   │   │   ├── region/
│   │   │   │   └── +page.svelte # Region selection
│   │   │   └── +page.svelte    # Main onboarding
│   │   └── +page.svelte        # Homepage (/bg, /en)
│   └── +page.server.ts         # Root redirect logic
├── api/
├── auth/
└── +layout.server.ts
```

### 2.2 Locale Parameter Matcher

```typescript
// src/params/locale.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^(bg|en)$/.test(param);
};
```

### 2.3 Root Redirect Logic

```typescript
// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  // Get user's preferred locale
  const userLocale = locals.lang || 'bg';
  const cookieLocale = cookies.get('locale') || 'bg';
  
  // Default to Bulgarian, redirect to proper localized route
  const targetLocale = userLocale === 'en' ? 'en' : 'bg';
  throw redirect(302, `/${targetLocale}`);
};
```

---

## ⚡ **PHASE 3: Svelte 5 State Management**

### 3.1 LocaleManager with $state() Runes

```typescript
// src/lib/stores/locale.svelte.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { createClient } from '$lib/supabase/client';

interface LocaleState {
  locale: 'bg' | 'en';
  region: string;
  isLoading: boolean;
  hasChanged: boolean;
}

const DEFAULT_STATE: LocaleState = {
  locale: 'bg',
  region: 'sofia',
  isLoading: false,
  hasChanged: false
};

class LocaleManager {
  private state = $state<LocaleState>(DEFAULT_STATE);
  private supabase = createClient();

  // Reactive getters
  get locale() { return this.state.locale; }
  get region() { return this.state.region; }
  get isLoading() { return this.state.isLoading; }
  get hasChanged() { return this.state.hasChanged; }

  // Initialize from cookies and user data
  async initialize(initialLocale?: string, initialRegion?: string) {
    if (!browser) return;

    this.state.locale = (initialLocale as 'bg' | 'en') || 'bg';
    this.state.region = initialRegion || 'sofia';

    // Load user preferences from Supabase
    await this.loadUserPreferences();
  }

  // Update locale with dual persistence
  async setLocale(locale: 'bg' | 'en', region?: string) {
    this.state.isLoading = true;
    
    try {
      // Update cookies immediately
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      if (region) {
        document.cookie = `region=${region}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Update local state
      this.state.locale = locale;
      if (region) this.state.region = region;
      this.state.hasChanged = true;

      // Sync to Supabase if user is authenticated
      await this.syncToDatabase();

      // Navigate to new locale route
      const currentPath = window.location.pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(bg|en)/, '');
      await goto(`/${locale}${pathWithoutLocale}`, { replaceState: false });

    } catch (error) {
      console.error('Failed to update locale:', error);
    } finally {
      this.state.isLoading = false;
    }
  }

  // Load user preferences from database
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
          this.state.locale = preferences.locale.split('-')[0] as 'bg' | 'en';
          this.state.region = preferences.region;
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  // Sync preferences to database
  private async syncToDatabase() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        await this.supabase.rpc('sync_cookie_preferences', {
          p_user_id: user.id,
          p_locale: `${this.state.locale}-${this.state.locale === 'bg' ? 'BG' : 'US'}`,
          p_region: this.state.region
        });
      }
    } catch (error) {
      console.warn('Failed to sync to database:', error);
    }
  }
}

// Global instance
let localeManager: LocaleManager;

export function getLocaleManager() {
  if (!localeManager) {
    localeManager = new LocaleManager();
  }
  return localeManager;
}
```

---

## 🚪 **PHASE 4: Enhanced Onboarding Flow**

### 4.1 Post-Email-Verification Redirect

```typescript
// Update src/hooks.server.ts - authGuard function
const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Check if user needs to complete onboarding
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
        // Allow access to onboarding routes and auth routes
        const allowedPaths = ['/onboarding', '/auth/', '/api/'];
        const isAllowedPath = allowedPaths.some(path => 
          event.url.pathname.startsWith(path)
        );

        if (!isAllowedPath) {
          const locale = event.locals.lang || 'bg';
          throw redirect(303, `/${locale}/onboarding/region`);
        }
      }
    }
  }

  // ... rest of existing authGuard logic
  return resolve(event);
};
```

### 4.2 Region Selection Component

```svelte
<!-- src/routes/(localized)/[lang=locale]/onboarding/region/+page.svelte -->
<script lang="ts">
  import { getLocaleManager } from '$lib/stores/locale.svelte';
  import { createClient } from '$lib/supabase/client';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/utils/toast';
  import * as m from '$paraglide/messages';

  const localeManager = getLocaleManager();
  const supabase = createClient();

  let selectedLanguage = $state<'bg' | 'en'>('bg');
  let selectedRegion = $state('sofia');
  let isLoading = $state(false);

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬', default: true },
    { code: 'en', name: 'English', flag: '🇺🇸', default: false }
  ];

  const bulgarianRegions = [
    { code: 'sofia', name: 'София', emoji: '🏛️' },
    { code: 'plovdiv', name: 'Пловдив', emoji: '🏺' },
    { code: 'varna', name: 'Варна', emoji: '🏖️' },
    { code: 'burgas', name: 'Бургас', emoji: '⛵' },
    { code: 'stara-zagora', name: 'Стара Загора', emoji: '🌳' },
    { code: 'pleven', name: 'Плевен', emoji: '🏰' },
    { code: 'sliven', name: 'Сливен', emoji: '⛰️' },
    { code: 'other', name: 'Друго', emoji: '📍' }
  ];

  const englishRegions = [
    { code: 'international', name: 'International', emoji: '🌍' },
    { code: 'europe', name: 'Europe', emoji: '🇪🇺' },
    { code: 'north-america', name: 'North America', emoji: '🇺🇸' },
    { code: 'other', name: 'Other', emoji: '📍' }
  ];

  $: regions = selectedLanguage === 'bg' ? bulgarianRegions : englishRegions;

  async function handleSubmit() {
    isLoading = true;

    try {
      // Update locale manager
      await localeManager.setLocale(selectedLanguage, selectedRegion);

      // Update user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            locale: `${selectedLanguage}-${selectedLanguage === 'bg' ? 'BG' : 'US'}`,
            region: selectedRegion
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      toast.success('Welcome to Driplo! 🎉');
      await goto(`/${selectedLanguage}`);
      
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="onboarding-container">
  <div class="onboarding-header">
    <a href={`/${selectedLanguage}`} class="logo">driplo</a>
    <div class="step-indicator">
      <span class="step active">1</span>
      <span class="step-label">Choose your region</span>
    </div>
  </div>

  <div class="welcome-section">
    <h1>Welcome to Driplo.bg! 🇧🇬</h1>
    <p>Choose your language and region to get started with the best local shopping experience.</p>
  </div>

  <form onsubmit={handleSubmit}>
    <!-- Language Selection -->
    <div class="section">
      <h2>Language / Език</h2>
      <div class="language-grid">
        {#each languages as lang}
          <label class="language-option" class:selected={selectedLanguage === lang.code}>
            <input 
              type="radio" 
              bind:group={selectedLanguage} 
              value={lang.code}
              name="language"
            />
            <div class="option-content">
              <span class="flag">{lang.flag}</span>
              <span class="name">{lang.name}</span>
              {#if lang.default}
                <span class="badge">Default</span>
              {/if}
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Region Selection -->
    <div class="section">
      <h2>{selectedLanguage === 'bg' ? 'Изберете регион' : 'Choose Region'}</h2>
      <div class="region-grid">
        {#each regions as region}
          <label class="region-option" class:selected={selectedRegion === region.code}>
            <input 
              type="radio" 
              bind:group={selectedRegion} 
              value={region.code}
              name="region"
            />
            <div class="option-content">
              <span class="emoji">{region.emoji}</span>
              <span class="name">{region.name}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <!-- Submit -->
    <div class="submit-section">
      <button type="submit" class="submit-btn" disabled={isLoading}>
        {#if isLoading}
          <span class="spinner"></span>
          {selectedLanguage === 'bg' ? 'Записване...' : 'Saving...'}
        {:else}
          {selectedLanguage === 'bg' ? 'Продължи към Driplo' : 'Continue to Driplo'}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .onboarding-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .onboarding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
  }

  .logo {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--color-primary), #6c63ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: none;
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 3rem;
  }

  .welcome-section h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--color-text-primary);
  }

  .welcome-section p {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    max-width: 500px;
    margin: 0 auto;
  }

  .section {
    margin-bottom: 3rem;
  }

  .section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  .language-grid, .region-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .language-option, .region-option {
    cursor: pointer;
    position: relative;
  }

  .language-option input, .region-option input {
    position: absolute;
    opacity: 0;
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .language-option.selected .option-content,
  .region-option.selected .option-content {
    border-color: var(--color-primary);
    background: rgba(24, 119, 242, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.15);
  }

  .flag, .emoji {
    font-size: 1.5rem;
  }

  .name {
    font-weight: 600;
    color: var(--color-text-primary);
    flex: 1;
  }

  .badge {
    background: var(--color-success);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
  }

  .submit-section {
    margin-top: 3rem;
    text-align: center;
  }

  .submit-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    background: #1567d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .language-grid, .region-grid {
      grid-template-columns: 1fr;
    }
    
    .welcome-section h1 {
      font-size: 2rem;
    }
  }
</style>
```

---

## 🎨 **PHASE 5: UI Components**

### 5.1 Locale Switcher Component

```svelte
<!-- src/lib/components/LocaleSwitcher.svelte -->
<script lang="ts">
  import { getLocaleManager } from '$lib/stores/locale.svelte';
  import { Globe, ChevronDown } from '@lucide/svelte';
  import { clickOutside } from '$lib/utils/click-outside';

  let { class: className = '' } = $props<{ class?: string }>();

  const localeManager = getLocaleManager();
  let isOpen = $state(false);

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ] as const;

  $: currentLanguage = languages.find(lang => lang.code === localeManager.locale);

  function handleLanguageSelect(langCode: 'bg' | 'en') {
    localeManager.setLocale(langCode);
    isOpen = false;
  }

  function handleClickOutside() {
    isOpen = false;
  }
</script>

<div 
  class="locale-switcher {className}" 
  use:clickOutside={handleClickOutside}
>
  <button 
    class="switcher-button" 
    class:loading={localeManager.isLoading}
    onclick={() => isOpen = !isOpen}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <span class="flag">{currentLanguage?.flag}</span>
    <span class="label">{currentLanguage?.name}</span>
    <ChevronDown size={16} class="chevron" class:rotated={isOpen} />
  </button>

  {#if isOpen}
    <div class="dropdown" transition:fade={{ duration: 200 }}>
      {#each languages as language}
        <button
          class="dropdown-item"
          class:active={language.code === localeManager.locale}
          onclick={() => handleLanguageSelect(language.code)}
          disabled={localeManager.isLoading}
        >
          <span class="flag">{language.flag}</span>
          <span class="name">{language.name}</span>
          {#if language.code === localeManager.locale}
            <span class="checkmark">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .locale-switcher {
    position: relative;
    display: inline-block;
  }

  .switcher-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .switcher-button:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-hover);
  }

  .switcher-button.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .chevron {
    transition: transform 0.2s ease;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 50;
    min-width: 140px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 0.875rem;
  }

  .dropdown-item:hover:not(:disabled) {
    background: var(--color-surface);
  }

  .dropdown-item.active {
    background: rgba(24, 119, 242, 0.05);
    color: var(--color-primary);
  }

  .dropdown-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .name {
    flex: 1;
    text-align: left;
  }

  .checkmark {
    color: var(--color-success);
    font-weight: bold;
  }
</style>
```

---

## 🧪 **PHASE 6: Testing & Validation**

### 6.1 Test Scenarios

```typescript
// tests/locale-integration.test.ts
import { test, expect } from '@playwright/test';

test.describe('Bulgarian-First Locale Integration', () => {
  test('Root redirects to /bg by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/bg');
  });

  test('Cookie preferences persist across sessions', async ({ page, context }) => {
    // Set English preference
    await page.goto('/bg');
    await page.click('[data-testid="locale-switcher"]');
    await page.click('[data-testid="lang-en"]');
    
    // Verify redirect and cookie
    await expect(page).toHaveURL('/en');
    const cookies = await context.cookies();
    expect(cookies.find(c => c.name === 'locale')?.value).toBe('en');
  });

  test('Onboarding forces region selection', async ({ page }) => {
    // Login as new user
    await page.goto('/auth/login');
    // ... login steps
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/bg/onboarding/region');
    
    // Select region
    await page.click('[data-testid="region-sofia"]');
    await page.click('[data-testid="continue-btn"]');
    
    // Should redirect to homepage
    await expect(page).toHaveURL('/bg');
  });

  test('Database sync works correctly', async ({ page }) => {
    // Test database synchronization
    // ... implementation
  });
});
```

### 6.2 Performance Verification

```typescript
// tests/performance.test.ts
test('Locale switching performance', async ({ page }) => {
  await page.goto('/bg');
  
  const startTime = Date.now();
  await page.click('[data-testid="lang-switcher"]');
  await page.click('[data-testid="lang-en"]');
  await page.waitForURL('/en');
  const endTime = Date.now();
  
  expect(endTime - startTime).toBeLessThan(1000); // < 1s switch time
});
```

---

## 📊 **Success Metrics & KPIs**

### 📈 **Performance Targets**
- **Route Switch Time**: < 500ms for locale changes
- **Database Sync**: < 200ms for preference updates
- **First Paint**: No degradation in Core Web Vitals
- **Cookie Size**: < 4KB total locale cookies

### ✅ **Functional Requirements**
- [ ] **Default /bg Landing**: All traffic lands on Bulgarian routes
- [ ] **Seamless Switching**: Users can change locale without losing context
- [ ] **Onboarding Flow**: New users complete region selection
- [ ] **Dual Persistence**: Preferences saved in cookies + database
- [ ] **Mobile Responsive**: Full functionality on all devices

### 🔐 **Security & Privacy**
- [ ] **GDPR Compliant**: Cookie consent properly handled
- [ ] **RLS Policies**: User preferences properly secured
- [ ] **XSS Protection**: No client-side injection vulnerabilities
- [ ] **CSRF Protection**: Locale changes properly validated

---

## 🚀 **Implementation Timeline**

| Phase | Duration | Tasks | Dependencies |
|-------|----------|-------|--------------|
| **Phase 1** | 2-3 hours | Database schema, RLS policies | Supabase access |
| **Phase 2** | 2-3 hours | Route structure, matchers | Phase 1 complete |
| **Phase 3** | 3-4 hours | Svelte 5 state management | Phase 2 complete |
| **Phase 4** | 2-3 hours | Enhanced onboarding | Phase 3 complete |
| **Phase 5** | 2-3 hours | UI components, switching | Phase 4 complete |
| **Phase 6** | 2-3 hours | Testing, optimization | All phases complete |

**Total Estimated Time**: 12-18 hours

---

## 🎯 **Post-Launch Optimizations**

### 📊 **Analytics & Monitoring**
- Track locale switching patterns
- Monitor onboarding completion rates
- Measure Bulgarian vs English user engagement
- A/B test different region selection UIs

### 🚀 **Future Enhancements**
- **IP-based Region Detection**: Auto-select Bulgarian cities based on IP
- **SEO Optimization**: Implement hreflang tags and localized sitemaps
- **Advanced Preferences**: Time zones, currency, measurement units
- **City-Specific Features**: Local shipping options, regional promotions

---

## 🔗 **Key Files Created**

1. **`src/params/locale.ts`** - Route parameter validation
2. **`src/lib/stores/locale.svelte.ts`** - Svelte 5 state management
3. **`src/routes/(localized)/[lang]/onboarding/region/+page.svelte`** - Region selection
4. **`src/lib/components/LocaleSwitcher.svelte`** - Locale switching UI
5. **Database Migrations** - User preferences schema
6. **`tests/locale-integration.test.ts`** - Comprehensive testing

---

## 📝 **Final Notes**

This plan provides a **bulletproof, Bulgarian-first localization system** that:

✅ **Prioritizes Bulgarian** as the default experience  
✅ **Seamlessly integrates** cookies, Supabase, and Svelte 5 runes  
✅ **Enhances onboarding** with region-specific customization  
✅ **Maintains performance** and accessibility standards  
✅ **Scales effortlessly** for future market expansion  

**Ready for implementation with enterprise-grade architecture! 🇧🇬🚀**