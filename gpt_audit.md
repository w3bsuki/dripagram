# GPT Audit – Driplo.bg (SvelteKit + Tailwind + Supabase)

Date: 2025-08-08
Scope: k:\driplo-fresh

## Executive Summary
The project is in good shape structurally (Svelte 5 + SvelteKit 2, Tailwind v4, Supabase SSR). However, there are signs of bloat, duplicate types, placeholder configs, and inconsistencies between stated goals and code (e.g., continued Bits UI usage). This audit provides a prioritized, low-risk plan to reach production readiness.

Top priorities:
- Unify Supabase types (single source of truth, generated).
- Remove unused deps/config (optimizeDeps bloat, Tailwind v4 plugin mismatches).
- Decide on UI strategy (shadcn/bits vs native Svelte 5) and execute consistently.
- Finalize env + auth wiring, add CI, and set up error tracking.

---

## Stack Snapshot (detected)
- Svelte ^5, SvelteKit ^2.22, Vite ^7
- Tailwind v4 + @tailwindcss/vite
- TypeScript strict, svelte-check
- Supabase SSR client (hooks, +layout), migrations present
- i18n: inlang/paraglide
- UI: shadcn-svelte present; Bits UI primitives still imported in several components

---

## Critical Findings

1) Duplicate/Conflicting Supabase Types
- Files:
  - src/lib/types/database.types.ts
  - src/lib/supabase/types.ts
  - src/lib/supabase/database.types.ts
- Risk: divergent schemas, type drift, bugs at compile/runtime.
- Action:
  - Use Supabase CLI to generate a single types file (e.g. src/lib/types/database.types.ts) from your database.
  - Remove the other two files and update imports project-wide.

2) UI Library Inconsistency (Bits UI still present)
- Goal states “Native Svelte 5 + shadcn-svelte hybrid,” and docs say many components were converted; code still imports Bits UI (Tooltip, Sheet, Tabs, Select, etc.).
- Options:
  - A) Keep shadcn-svelte (uses Bits under the hood). Accept Bits UI as an implementation detail and stop custom-wrapping primitives.
  - B) Fully migrate remaining Bits-based components to native Svelte 5 runes. Remove Bits UI entirely.
- Recommendation: Choose A or B and apply consistently. If B, create a short migration checklist per component family (Tooltip, Sheet, Tabs, Select, Popover, Separator, Progress).

3) Vite optimizeDeps includes unused packages
- vite.config.ts includes: '@stripe/stripe-js', '@tanstack/svelte-query' but these packages are not in package.json.
- Risk: Slower dev server, confusing config.
- Action: Remove unused entries from optimizeDeps.include, or add the packages if they’re actually needed.

4) Tailwind v4 plugin mismatch
- tailwindcss: "4" with plugins: @tailwindcss/typography, @tailwindcss/container-queries.
- In Tailwind v4, container queries are built-in; the container-queries plugin is unnecessary. Typography plugin versions for v4 may require verification.
- Action: Remove @tailwindcss/container-queries; verify typography plugin compatibility with v4 or adopt the official v4 approach.

5) Sentry placeholder config
- src/lib/config/sentry.ts is a placeholder, referencing process.env and not actually initializing the SDK. PUBLIC_SENTRY_DSN uses a client-exposed env pattern in SvelteKit ($env/static/public) rather than process.env at runtime.
- Action: Either wire @sentry/sveltekit properly (hooks, client/server init) with $env imports, or remove the file until ready. Don’t leave dead code.

6) Missing/Weak Tooling Config
- ESLint referenced in scripts but no .eslintrc present. Prettier config exists.
- Action: Add a minimal ESLint config for Svelte + TS and enable CI checks.

7) README and Guidance Docs
- README.md is the default sv template; CLAUDE.md contains unprofessional language.
- Action: Replace README with concise product/tech overview + dev scripts; sanitize/rename CLAUDE.md guidance into a professional contributor guide.

8) Windows reserved filename present
- Root contains a file named "nul" (ignored in .gitignore, but still tracked locally). This can cause issues on Windows/CI.
- Action: Remove the file from the repository.

9) Env Management
- .env is present; .env.example is not.
- Action: Create .env.example containing PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, and any analytics/Sentry keys.

---

## Quick Wins (1–2 hours)
- Clean Vite optimizeDeps (remove unused entries).
- Remove @tailwindcss/container-queries plugin from tailwind.config.js.
- Add .eslintrc and fix obvious lint errors; run pnpm run lint:fix.
- Add .env.example; ensure $env/static/public is used where appropriate.
- Delete the root "nul" file from the repo.

---

## Production Readiness Checklist

Core quality gates
- [ ] pnpm run check → 0 errors
- [ ] pnpm run build → success
- [ ] pnpm run lint → 0 errors
- [ ] Lighthouse: ≥ 95 perf/SEO/Best Practices/Accessibility (home/product pages)

Operational readiness
- [ ] Single source of truth for Supabase types generated via CLI
- [ ] Auth flow covered (login/logout/refresh) with protected routes working
- [ ] Error tracking integrated (Sentry or alternative) with PII filters
- [ ] Logging strategy (server + client) and error boundaries
- [ ] .env.example committed; secrets stored securely
- [ ] CI: PR checks (install, check, lint, build)

Security & privacy
- [ ] Review RLS policies (supabase/migrations) cover all tables
- [ ] PII handling (filter logs, Sentry beforeSend implemented)
- [ ] CSP headers and secure cookies in production

UX/Accessibility
- [ ] Keyboard navigation across core UI (menus, dialogs, carousels)
- [ ] Color contrast & focus states meet WCAG AA
- [ ] Forms have labels, ARIA where needed

---

## Refactor Plan (Phased)

Phase 0 – Hygiene (today)
- Remove optimizeDeps bloat; verify Tailwind plugins for v4.
- Add ESLint config and CI workflow.
- Create .env.example; replace README; sanitize contributor guide.
- Delete root "nul" file.

Phase 1 – Types & Data
- Generate Supabase types via CLI to src/lib/types/database.types.ts.
- Remove src/lib/supabase/types.ts and src/lib/supabase/database.types.ts.
- Update all imports to single types file.

Phase 2 – UI Strategy
- Decide A) keep shadcn-svelte (accept Bits) or B) fully native Svelte 5.
- If B: migrate remaining Bits-based components:
  - Tooltip, Sheet, Tabs, Select, Popover, Separator, Progress
  - Replace Bits imports with native runes-based components; ensure accessibility.
- If A: remove custom wrappers around Bits primitives and stick to shadcn usage patterns for consistency.

Phase 3 – Observability & Quality
- Install and configure @sentry/sveltekit (hooks + client) with $env.
- Add basic Vitest unit tests for stores and utils; add Playwright smoke tests for auth and product detail pages.
- Add GitHub Actions: on push/PR run install → check → lint → build → (optionally) test.

Phase 4 – Performance & Hardening
- Audit bundle (vite --profile). Ensure lucide tree-shaking and icon imports are as-needed.
- Verify image optimization strategy (responsive sizes, modern formats).
- Add HTTP headers and CSP; tune caching for static assets.

---

## File-by-File Notes (selected)
- vite.config.ts: optimizeDeps.include contains packages not installed (@stripe/stripe-js, @tanstack/svelte-query). Remove or install.
- tailwind.config.js: Remove @tailwindcss/container-queries for v4. Verify typography plugin compatibility.
- src/lib/config/sentry.ts: Placeholder; either wire with @sentry/sveltekit and $env/static/public, or remove until ready.
- src/lib/stores/*.svelte.ts: Good Svelte 5 runes usage.
- src/routes/+layout.ts and hooks.server.ts: Solid Supabase SSR pattern.
- src/lib/components/ui/**: Multiple Bits UI imports; reconcile with chosen UI strategy.
- README.md: Replace sv template with project docs.
- CLAUDE.md: Replace with a professional CONTRIBUTING.md / DEV_GUIDE.md.

---

## Commands (Windows PowerShell)
- Type check: pnpm run check
- Build: pnpm run build
- Lint fix: pnpm run lint:fix
- Format: pnpm run format

When ready for Supabase type generation (example):
- pnpm dlx supabase@latest gen types typescript --project-id <your-id> --schema public > src/lib/types/database.types.ts

---

## Open Questions
- Confirm UI direction (keep shadcn/bits vs fully native Svelte 5).
- Confirm analytics/error tracking vendor(s) and environments.
- Confirm Supabase project ID and migration source of truth.

---

## Next Actions (Proposed This Week)
- Day 1: Hygiene (optimizeDeps, Tailwind plugins, ESLint, .env.example, remove "nul", README/guide refresh)
- Day 2–3: Supabase types unification + code import updates
- Day 4–5: Execute chosen UI strategy (migrate remaining Bits UI or standardize shadcn usage)
- Day 5: Sentry wiring + CI setup

This audit will be maintained as changes land. Tick items as they’re completed.
