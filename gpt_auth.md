# Auth UX/Code Audit and Refactor Plan

## Corrections (based on repository code)
- Superforms/Zod: Both Login and Signup already use sveltekit-superforms with zod; server actions use superValidate adapters. Forgot/Reset are mostly manual.
- Tailwind v4: v4 CSS-first via @theme is present in app.css; the issue is inconsistent token usage in auth pages, not missing v4.
- CSS size: Both auth pages have similar custom CSS blocks; the core problem is hardcoded colors and not leveraging semantic utilities.

Scope
- Pages reviewed: `src/routes/auth/login`, `signup`, `forgot-password`, `reset-password`, `verify`
- Server actions: `auth/login/+page.server.ts`, `auth/signup/+page.server.ts`

Answers (quick)
- Svelte 5: Yes. Evidence: runes ($state, $derived) across pages.
- Superforms/Zod: Login and Signup use sveltekit-superforms + zod. Forgot/Reset are mostly manual.
- Tailwind v4: Implemented with @theme in app.css; auth pages are not consistently using semantic tokens/utilities.

Key Findings
1) Visual/Styling inconsistencies
- Mixed styling approaches: raw Tailwind grayscale utilities (e.g., `bg-gray-50`, `text-gray-600`) in `login`, custom CSS with hardcoded colors in `signup` and other pages.
- Not using the semantic token utilities defined in styling plan (e.g., `bg-surface`, `text-content`, `ring-ring`).
- Inline magic numbers and ad‑hoc CSS in `signup` (e.g., paddings, box‑shadow rgba), causing drift from design tokens.

2) UX issues (mobile and accessibility)
- Form field spacing and icon alignment vary by page; icon overlays risk overlap at small widths.
- Touch targets sometimes < 44px min; small tap areas on toggles/links.
- Focus states not consistently visible; mix of default browser focus and low‑contrast rings.
- Labels/aria: some inputs rely on placeholders; inconsistent `aria-invalid`, `aria-describedby` for error text.
- Button hierarchy inconsistent (primary vs secondary styles vary between pages).

3) Validation and server parity
- Login: solid pattern with `superValidate` + `zod` and `use:enhance`.
- Signup: manual parsing/validation and custom toasts; no `zod` schema, no `superforms` error binding.
- Forgot/Reset: manual client validation; no shared schema; no form store error binding.

4) Token/theming drift
- Many occurrences of `#` colors and Tailwind grays in auth views; does not honor OKLCH tokens from the styling system plan.
- `shadcn` components used on login, but `signup` reimplements UI by hand.

Concrete Evidence (non‑exhaustive)
- Login: `src/routes/auth/login/+page.svelte` uses `superForm`, `Input`, `Label`, but with `bg-gray-50`, `text-gray-600`, `text-blue-600`.
- Login server: `+page.server.ts` uses `superValidate(zod(loginSchema))` – good pattern.
- Signup: `src/routes/auth/signup/+page.svelte` uses `superForm(zod(signupSchema))`; styling uses custom CSS and some hardcoded colors; not using shadcn inputs.
- Signup server: `+page.server.ts` uses `superValidate(zod(signupSchema))` – schema exists in `lib/schemas/auth.ts`.
- Forgot/Reset/Verify: mixed Tailwind grays and custom CSS; not tokenized; inconsistent focus and error rendering.

Refactor Goals
- Single, consistent form pattern using `sveltekit-superforms` + `zod` across ALL auth pages.
- Pure semantic styling: use token‑mapped Tailwind utilities (`bg-surface`, `text-content`, `border-border`, `ring-ring`, `bg-primary text-primary-foreground`).
- Shared auth layout and field components (with `shadcn-svelte`) for consistent spacing, focus, and errors.
- Mobile‑first, tap‑target safe, and accessible forms (WCAG 2.1 AA). 

Proposed Architecture
- Schemas: `src/lib/schemas/auth.ts` (signupSchema exists). Add `forgotSchema` and `resetSchema`; reuse `loginSchema`.
- UI: `AuthLayout.svelte` (logo, card, responsive container), `AuthField.svelte` (Label + Input + Helper/Error), reuse `shadcn` Button/Input/Label, and token utilities.
- Styles: consume semantic utilities; remove raw grays/hex/rgba; focus rings via `ring-ring focus-visible:ring-2`.
- Server: `superValidate` for each page’s action; return typed errors; no manual toasts for validation failures.

Implementation Plan (4 phases)
1) Visual cleanup (low risk)
- Replace grayscale utilities with semantic ones across auth pages.
- Ensure imports include `shadcn-bridge.css` and token files (per styling.md).
- Normalize spacing to token scale; set min hit target height (44px) on buttons/inputs.

2) Validation unification
- Confirm `signupSchema` is already used; add `forgotSchema`, `resetSchema` in `lib/schemas/auth.ts`.
- Migrate `forgot-password`, `reset-password` to `superforms` (`superValidate` on server, `superForm` on client).
- Bind `aria-invalid` and `aria-describedby` from superforms state.

3) Shared components
- Create `src/lib/components/auth/AuthLayout.svelte` and `AuthField.svelte` consuming `shadcn` inputs.
- Update all auth pages to use shared layout/field; keep variants minimal.

4) QA & polish
- Add early theme bootstrap to avoid flash; verify dark/light.
- Axe/Lighthouse pass; fix contrast by tuning tokens only (no component overrides).
- Keyboard: tab order, visible focus on every interactive, ESC closes dialogs where applicable.

File‑by‑File Tasks
- `src/routes/auth/login/+page.svelte`: swap grays to semantic utilities; keep `superforms`; ensure focus styles use `ring-ring`.
- `src/routes/auth/login/+page.server.ts`: no change beyond semantic error messages.
- `src/routes/auth/signup/+page.svelte`: keep `superforms`; replace custom colors with semantic utilities or shadcn inputs; reduce custom CSS.
- `src/routes/auth/signup/+page.server.ts`: already uses `superValidate(zod(signupSchema))`; keep and improve error messages.
- `src/routes/auth/forgot-password/+page.svelte`: switch to `superforms`; semantic tokens.
- `src/routes/auth/reset-password/+page.svelte`: switch to `superforms` with `resetSchema`; keep strength meter; semantic tokens.
- `src/routes/auth/verify/+page.svelte`: replace raw grays with semantic utilities; unify buttons with `shadcn` variants.
- `src/lib/schemas/auth.ts`: add missing forgot/reset schemas; export adapters at module scope for memoization.
- `src/lib/components/auth/*`: new shared components.

Accessibility Checklist (apply to all forms)
- Label every input; no placeholder‑only fields.
- `autocomplete`, `inputmode`, `aria-invalid`, `aria-describedby` wired to errors.
- Focus: `focus-visible:ring-2 ring-ring ring-offset-2` with sufficient contrast.
- Buttons/inputs hit area ≥ 44px; keyboard accessible controls for show/hide password.

Design Tokens Mapping
- Replace:
  - `bg-white`/`bg-gray-50` → `bg-surface`
  - `text-gray-900`/`text-gray-600/500` → `text-content`/`text-contentMuted`
  - `border-gray-200/300` → `border-border`
  - `text-blue-600`/`ring-blue-500` → `text-primary`/`ring-ring`
  - Hardcoded rgba shadows → `shadow-1/2/3` from theme

Acceptance Criteria
- Zero raw color literals in auth pages (`#`, `rgb(`, `hsl(`, `oklch(`) outside token files.
- All auth pages use `superforms` + `zod`; errors render inline with ARIA bindings.
- Shared components used; consistent vertical rhythm and spacing.
- Mobile: no overflow; icons never overlap text; tap targets ≥ 44px.
- Axe/lighthouse: no critical a11y issues; text contrast ≥ 4.5:1 (body) / 3:1 (large).

Quick Wins (day 1)
- Swap grays to semantic utilities in `login`, `forgot`, `verify`.
- Unify button styles using `shadcn` Button variants (`default`, `outline`).
- Add `autocomplete` attrs: email, current-password, new-password.
- Ensure inputs use `h-11`/`h-12` (tokenized) for hit area.

Risks & Mitigations
- Styling regression: limit to utility class substitution first, verify visually per page.
- Form logic changes: migrate one page at a time to `superforms` (start with `signup`).
- Token gaps: if a token is missing, add in theme instead of hardcoding.

Suggested Order of Work
1) Login styling parity (no logic changes)
2) Signup to `superforms` + shared components
3) Forgot/Reset to `superforms`
4) Verify page styling clean‑up

Notes
- Project already uses Svelte 5 runes and `shadcn` on parts of the app; this plan aligns with existing stack.
- Leverage the styling system plan (Tailwind v4 CSS‑first) to finish the migration and prevent future drift.
