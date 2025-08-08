# Bulgarian-first i18n plan (SvelteKit 2 + Svelte 5 + Paraglide)

Date: 2025-08-08
Owner: GitHub Copilot

Summary
- Make Bulgarian (bg) the base language across UI, routing, and SEO.
- Use inlang Paraglide for type-safe, framework-native i18n with SvelteKit 2 & Svelte 5 runes.
- Keep non-prefixed URLs for Bulgarian (e.g., /browse), and prefix other locales (e.g., /en/browse).

Why Paraglide (inlang)
- Type-safe message functions, no runtime JSON lookups.
- Great SvelteKit integration (routing strategies, codegen, dev tools).
- Works with SSR/edge and supports URL-based locale, cookies, and Accept-Language.

Current signals in repo
- Found project.inlang/ and messages/en.json, plus src/lib/paraglide/. This suggests Paraglide is (partially) set up. We’ll standardize on bg as base.

Target locale setup
- Base (default) locale: bg (Bulgarian)
- Secondary (optional at launch): en (English)
- Storage pattern: messages/{languageTag}.json (flat or nested keys), generated code in .inlang/paraglide/

Implementation checklist
1) Dependencies
- @inlang/paraglide-js (codegen)
- @inlang/paraglide-sveltekit (SvelteKit/Vite plugin)
- Optionally: @inlang/plugin-json (JSON message source), @inlang/paraglide-vite (if using the generic vite plugin)

2) project.inlang/settings.json
- languageTags: ["bg", "en"]
- sourceLanguageTag: "bg"
- messageSource: messages/{languageTag}.json
- codegen target: .inlang/paraglide/
- Ensure plugin configs align with JSON source (plugin-json) if used

3) Message catalogs
- Create messages/bg.json by copying messages/en.json keys and translating values to Bulgarian.
- Keep keys stable and semantic (e.g., nav.home, browse.filters.apply, product.size).
- Use sentence case and include punctuation in messages when appropriate.
- Plurals: leverage Paraglide’s ICU plural support (Bulgarian uses categories: one, other). Example key: cart.items_count.

4) Vite/Svelte config
- Add Paraglide SvelteKit plugin to vite plugins via svelte.config.(js|ts).
- Configure alias for $paraglide to ./.inlang/paraglide in tsconfig.json paths and vite resolve.alias.
- Ensure the plugin watches project.inlang for hot message updates.

5) Import & use in components
- Import generated, type-safe message functions: import * as m from "$paraglide/messages".
- Use as functions, optionally with params: {m.nav_home()} or {m.items_count({ count })}.
- Avoid concatenation; use placeholders/params in messages.

6) Language detection & routing
- Strategy: Non-prefixed bg; prefixed for others.
  - Routes: / (bg), /browse (bg), /en, /en/browse (en)
- Detection order on first visit:
  1. URL prefix (/:lang)
  2. Cookie (lang)
  3. Accept-Language header (if supported locale)
  4. Fallback to bg
- Persist chosen locale in a cookie; expose in locals.lang
- Provide a locale switcher (sheet/dropdown) that hard-navigates to prefixed path for non-base locales

7) SEO & metadata
- <html lang="bg"> by default; set per request in +layout.server.ts
- Canonical URLs point to non-prefixed bg routes.
- Add <link rel="alternate" hreflang="bg" href="/path" /> and hreflang for en when available.
- Localize title/description/og tags using server-side messages in load or handle

8) Formatting & localization utilities
- Currency: BGN (лев) via Intl.NumberFormat("bg-BG", { style: "currency", currency: "BGN" })
- Numbers: Intl.NumberFormat("bg-BG") for thousands/decimal
- Dates: Intl.DateTimeFormat("bg-BG", { dateStyle: "medium", timeStyle: "short" })
- Relative time: Intl.RelativeTimeFormat("bg-BG") for timestamps
- Ensure text direction is LTR (Bulgarian) but keep code RTL-ready

9) Fonts & typography for Cyrillic
- Use a font with full Cyrillic coverage (e.g., Inter, Roboto Flex). Enable Bulgarian localized forms (locl) when available.
- Set lang="bg" on <html> and key containers to help shaping and hyphenation.

10) Forms & validation
- Localize zod/superforms error messages via a translation layer.
- Keep short, action-oriented errors. Prefer inline + summary for a11y.

11) Content & slugs
- If slugs are generated from Bulgarian names, decide between:
  - Preserve Cyrillic in path (requires encoding; SEO is fine) or
  - Transliterate to Latin for shareability (configure a cyrillic-to-latin slugifier)
- Product URLs should be stable (use id + optional slug segment)

12) Testing
- Add Playwright flows covering locale detection, switching, SSR rendering of messages, and meta tags.
- Add snapshot tests for messages API to catch missing/unused keys.
- Run Lighthouse in bg-BG; verify LCP/CLS unaffected by i18n.

How to wire SvelteKit (high-level)
- hooks.server.ts: detect/resolve locale; set event.locals.lang; set cookie
- +layout.server.ts: expose lang and server-side message access for SEO/meta
- +layout.svelte: set <html lang={data.lang}> via svelte:head; hydrate client; provide locale switcher
- Routes: adopt optional [lang] group for prefixed locales while letting bg be root (via paraglide-sveltekit routing helper)

Example message usage
- import * as m from "$paraglide/messages"
- <button aria-label={m.nav_open_menu()}>{m.nav_menu()}</button>
- {m.cart_items_count({ count })} // handles Bulgarian plurals (one/other)

Migration plan to Bulgarian-first
- Step 1: Set bg as sourceLanguageTag in project.inlang; add bg to languageTags; add messages/bg.json
- Step 2: Translate existing keys; add any missing keys from UI
- Step 3: Wire detection in hooks; set default to bg; ensure html lang
- Step 4: Replace hardcoded strings incrementally with message calls
- Step 5: Add locale switcher; enable /en prefix (optional at soft launch)
- Step 6: QA + SEO verification; update sitemaps/robots with hreflang

Acceptance criteria
- Default language renders in Bulgarian for all pages (SSR & CSR)
- Non-prefixed routes are Bulgarian; English works under /en/* if enabled
- Title/description/og tags localized server-side
- No hardcoded user-facing strings remain in components
- Currency, number, date formats follow Bulgarian conventions

File map (expected)
- project.inlang/settings.json (bg base, en secondary)
- messages/bg.json (primary), messages/en.json (secondary)
- .inlang/paraglide/* (generated by Paraglide)
- src/lib/paraglide/* (any local helpers; keep alias $paraglide to generated messages)
- src/hooks.server.ts (detection), src/routes/+layout.server.ts (lang/meta), src/routes/+layout.svelte (lang attr)

Notes
- If Paraglide is already wired, confirm $paraglide alias and codegen path. Regenerate after changes to project.inlang or messages/*.
- Keep Bulgarian copy short and scannable. Favor consistent terminology (e.g., Размер, Състояние, Любими, Търсене).
