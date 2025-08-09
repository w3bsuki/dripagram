# Claude Code Execution Plan — Svelte 5 + SvelteKit 2 Cleanup

Purpose
- A phased checklist with ready-to-copy prompts for Claude Code to execute safely.
- Focus: Svelte 5 compliance, Supabase best practices, security, performance, and repo hygiene.

Conventions for Claude Code
- Always create a feature branch per phase: `feat/phase-<n>-<slug>`.
- Make atomic commits with clear messages and a final PR per phase.
- Never expose secrets; never touch files under `.env*`.
- Output: list of changed files + inline diffs or patch where supported.

---

## Phase 0 — Safety & Baseline

Prompt
- Branch and baseline checks

```text
You are Claude Code. Create branch `feat/phase-0-baseline`.
Run:
- pnpm install --frozen-lockfile
- pnpm run check
- pnpm run lint
- pnpm run build
Collect and summarize: TypeScript errors, svelte-check errors, ESLint errors, build warnings. Do not change code in this phase. Output a short report.
```

Acceptance
- Baseline report attached to PR description.

---

## Phase 1 — Centralize Supabase Clients

Prompt
- Replace ad-hoc createClient calls with shared clients.

```text
Create branch `feat/phase-1-supabase-clients`.
Goal: Use single shared clients only.
Use:
- Browser: import { supabase } from '$lib/supabase/client';
- Server: use event.locals.supabase (from hooks) or import from '$lib/supabase/server' where appropriate.

Refactor these files:
- src/routes/onboarding/+page.svelte
- src/routes/auth/reset-password/+page.svelte
- src/routes/auth/forgot-password/+page.svelte
- src/lib/services/feedService.ts
- src/lib/services/listingService.ts
- src/lib/services/categoryService.ts
- src/lib/services/imageService.ts
- src/lib/components/social/FeedCard.svelte
- src/lib/components/social/Feed.svelte
- src/lib/components/social/BrandShowcase.svelte
- src/lib/components/marketplace/ProductDetail.svelte

Constraints:
- Do not instantiate Supabase in Svelte components.
- In server routes/actions, use event.locals.supabase.
- In client-only contexts, import from $lib/supabase/client.

Output: list of files changed + concise diff hunks.
Run `pnpm run check` and ensure no new errors.
```

Acceptance
- No ad-hoc `createClient|createBrowserClient|createServerClient` in app code.

---

## Phase 2 — Query Safety (No String-built Filters)

Prompt
- Fix SQL injection risks.

```text
Create branch `feat/phase-2-query-safety`.
Search in `src/routes/api/**` and services for string-built filters like:
- query.or(`field.in.(${ids.join(',')})`)
- template literals in filter values

Replace with parameterized builders, e.g.:
- .in('field', ids)
- .eq('name', safeValue)

Focus endpoints: feed, search, favorites, messages.
Write minimal tests or logs to prove equivalent behavior.
Output: changed files + examples of replaced lines.
Run `pnpm run check`.
```

Acceptance
- 0 occurrences of dynamic string filters in queries.

---

## Phase 3 — Input Validation (zod)

Prompt
- Validate inputs on write endpoints/actions.

```text
Create branch `feat/phase-3-input-validation`.
Add zod schemas under `src/lib/schemas/` for the top write paths (likes, favorites, messages, analytics, products).
Update corresponding `+server.ts` or actions to `schema.safeParse(await request.json())` (or form data), and return normalized errors.
Use constants from Phase 4 for HTTP status and messages if available.
Run `pnpm run check`.
```

Acceptance
- All modified endpoints reject invalid payloads with uniform errors.

---

## Phase 4 — API Constants

Prompt
- Replace hardcoded statuses/messages.

```text
Create branch `feat/phase-4-api-constants`.
Create `src/lib/config/api-constants.ts` exporting HTTP_STATUS and ERROR_MESSAGES.
Replace hardcoded `{ status: 400|401|500 }` and repeated error strings across API routes and actions.
Run `pnpm run lint:fix` and `pnpm run check`.
```

Acceptance
- Centralized constants used in touched files.

---

## Phase 5 — Migrations Hygiene

Prompt
- Normalize migrations without risking prod.

```text
Create branch `feat/phase-5-migrations-hygiene`.
Run Supabase CLI locally:
- supabase db lint
- supabase db status
Document drift if any.
Action:
- Keep `supabase/migrations` as canonical.
- Move duplicate/experimental SQL into `supabase/legacy/` (no reordering applied migrations).
Add a short MIGRATIONS_GUIDE.md under `supabase/` explaining conventions.
```

Acceptance
- Canonical folder defined; legacy files isolated; guide added.

---

## Phase 6 — Deduplicate UI Logic

Prompt
- Extract shared logic and components.

```text
Create branch `feat/phase-6-ui-dedup`.
Tasks:
- Create `src/lib/utils/likeLogic.ts` and refactor 3 components using like toggling to import it.
- Create `src/lib/components/search/SearchWidget.svelte` and refactor duplicated search UIs to it.
- Create unified `Avatar.svelte` with initials logic and use across the app.
Provide before/after usage examples. Run `pnpm run check`.
```

Acceptance
- Like, Avatar, Search consolidated; duplicate code removed.

---

## Phase 7 — Svelte 5 Compliance Audit

Prompt
- Enforce runes and modern syntax.

```text
Create branch `feat/phase-7-svelte5-audit`.
Verify across `src/**`:
- No `export let`; use `$props()`.
- State via `$state`, derived via `$derived`, effects via `$effect`.
- Event handlers use `onclick` (not `on:click`).
- No `createEventDispatcher` (use callback props).
Produce a violations report and fix within scope.
Run `pnpm run check`.
```

Acceptance
- 0 violations in touched files; report attached.

---

## Phase 8 — Accessibility Pass

Prompt
- Fix top a11y issues.

```text
Create branch `feat/phase-8-a11y`.
Fix:
- Keyboard support for clickable non-button elements.
- ARIA labels for icon-only buttons.
- Focus management in dialogs/menus.
- Contrast issues in primary/secondary variants.
Add lightweight tests or Storybook/axe notes if available.
```

Acceptance
- Key interactions pass keyboard and basic axe checks.

---

## Phase 9 — Performance (Images & Splitting)

Prompt
- Optimize media and bundling.

```text
Create branch `feat/phase-9-performance`.
Ensure images have width/height, `loading="lazy"`, responsive srcset, WebP/AVIF.
Split heavy routes/components; avoid bundling server-only modules in client.
Keep load functions lean; stream/defer heavy data where possible.
Run lighthouse-ci or provide bundle analysis notes.
```

Acceptance
- Image best practices applied; reduced bundle or improved metrics documented.

---

## Phase 10 — CI/CD Gates

Prompt
- Enforce quality checks.

```text
Create branch `feat/phase-10-ci-gates`.
Add/update GitHub Actions:
- Install with frozen lockfile, then `lint`, `typecheck`, `svelte-check`, minimal tests, and `build`.
- Preview deployments for PRs (if infra available), manual approval for prod.
Document rollback strategy in docs/RUNBOOK.md.
```

Acceptance
- Pipeline green; required checks configured.

---

## Phase 11 — i18n & SEO

Prompt
- Improve content quality.

```text
Create branch `feat/phase-11-i18n-seo`.
Verify inlang key coverage and fallbacks; add ICU/pluralization for counts.
Add/verify canonical URLs, per-route meta/OG/Twitter tags.
Ensure staging has `noindex`; generate sitemap.xml if missing.
```

Acceptance
- i18n coverage improved; SEO tags present on key routes.

---

## Definition of Done (Global)

- 0 unsafe query concatenations remain in API.
- Single Supabase client per environment; no ad-hoc instantiation.
- All modified write endpoints validated with zod.
- `pnpm run check` passes; no new TypeScript/svelte-check errors.
- Security headers active; Sentry integrated.
- Duplicated UI logic extracted; tokens replacing top hardcoded styles.
- CI required checks green; docs updated where relevant.
