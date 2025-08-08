# Production Readiness Plan — UI/UX Enhancements and Feed Logic

Date: 2025-08-08
Owner: GitHub Copilot

Scope: non-drastic improvements to tighten UX, implement real feed logic (For You, Following, Trending), refine Browse and Sell, remove “cart” concept, and ensure production-grade reliability.

---

## 1) Goals
- Keep Instagram-like layout; improve clarity, polish, and performance.
- Make For You, Following, Trending tabs functional with real Supabase data.
- Refine Browse layout, category discovery, and quick filters.
- Tighten Sell form UX and validation.
- Replace Cart in bottom nav with a more meaningful destination (Messages or Activity).
- Ship production-safe behaviors: RLS, rate limits, analytics, skeletons, error/empty states.

---

## 2) Navigation & Information Architecture
- Replace Cart in bottom navbar with Messages (MVP) or Activity:
  - Messages MVP: show user’s direct conversations (existing auth required). Optional: defer community chat until we have moderation, notifications, and abuse handling.
  - Activity option: consolidated likes, follows, offers, purchases.
- Keep tabs (For You, Following, Trending). Fix logic; keep the UI as-is.
- Preserve Wishlist (hearts). Remove cart entry points from UI and routes (or hide behind feature flag if needed).

Why not community chat now? Moderation, notification infra, bandwidth. Revisit in Phase 3 once marketplace flows are stable.

---

## 3) Feed Logic — Data Model & Rules
Assumes common marketplace tables. If any do not exist, add them.

Tables (suggested/minimal):
- profiles(id, username, avatar_url, interests jsonb[] or text[])
- products(id, user_id, title, description, price_cents, category_id, media[], is_sold, created_at)
- follows(id, follower_id, following_id, created_at)
- likes(id, user_id, product_id, created_at)
- views(id, user_id nullable, product_id, created_at)
- promotions(id, product_id, type enum('premium','sponsored'), starts_at, ends_at, budget_cents)
- categories(id, name, slug, parent_id nullable)
- offers(id, product_id, buyer_id, amount_cents, status, created_at)
- purchases(id, product_id, buyer_id, amount_cents, created_at)

Indexes (key examples):
- follows(follower_id, following_id)
- likes(product_id, created_at DESC), likes(user_id, created_at DESC)
- views(product_id, created_at DESC)
- products(category_id, created_at DESC), products(user_id, created_at DESC), products(is_sold, created_at DESC)
- promotions(product_id), promotions(starts_at, ends_at)

RLS (high-level):
- products: SELECT enabled for all; INSERT/UPDATE/DELETE only by owner.
- likes/views: INSERT by authenticated users; SELECT all (aggregates). For anonymous views, use an Edge Function with service role to write.
- follows: users can read their own follow graph; public read optional if needed for counts.

---

## 4) Tab Definitions & Retrieval Strategies

For You
- Goal: relevant, diverse, fresh suggestions.
- Candidate generation:
  - Recent unsold products (last 30–60 days).
  - Category affinity: categories the user liked/viewed most.
  - Exclude user’s own items and products marked sold/purchased.
- Ranking (example score):
  - score = w_like*like_count + w_view*sqrt(view_count) + w_recency*decay(created_at) + w_match*category_affinity + w_premium*is_premium
  - Add diversity: cap per-seller count in a page.

Following
- Filter products where seller ∈ accounts the user follows and is_sold=false.
- Sort primarily by recency; tie-break with engagement.
- Include promoted items from followed sellers when active.

Trending
- Union of: active premium/sponsored promotions + organically top items by likes/views in last 7–30 days (is_sold=false).
- Weight by recency and penalize seller repetition.

Pagination
- Use keyset pagination: (created_at, id) cursor (descending). Avoid offset.
- Page size 20.

Metrics
- Increment view counts server-side on page fetch using an Edge Function/Action to avoid client tampering.

---

## 5) Supabase Implementation Sketches (Server-Side)

General notes
- Use server-side `+page.server.ts` to fetch feed pages per tab.
- Use `supabaseAdmin` or Edge Function for view writes and any sensitive aggregations.
- Return plain arrays plus a `nextCursor` for infinite scroll.

For You (simplified pseudo-SQL)
- Inputs: user_id, liked_categories[], cursor(created_at, id)
- Query:
  1) Base recent candidates where is_sold=false and created_at < cursor
  2) LEFT JOIN aggregate likes/views last 30d
  3) Compute category_match = 1 if product.category_id in liked_categories else 0
  4) ORDER BY (w_like*likes + w_view*sqrt(views) + w_recency*decay + w_match*category_match + w_premium*is_premium) DESC, created_at DESC

Following (pseudo-SQL)
- SELECT p.* FROM products p
  JOIN follows f ON f.following_id=p.user_id AND f.follower_id=:user_id
  WHERE p.is_sold=false AND (p.created_at, p.id) < :cursor
  ORDER BY p.created_at DESC

Trending (pseudo-SQL)
- promoted = active promotions window
- organic = products with highest likes/views in last 7–30d
- SELECT UNION with a premium boost weight; ORDER BY score DESC, created_at DESC

Writes (views)
- POST to /api/track-view (server endpoint) with product_ids; server batches insert into views using service role or Edge Function.

---

## 6) SvelteKit Integration Plan

Files to touch/create
- `src/routes/+page.server.ts` — load feed items based on `tab` query param (for-you|following|trending) and `cursor`.
- `src/routes/+page.svelte` — render tabs, list, skeletons, infinite scroll, error/empty states.
- `src/routes/api/feed/+server.ts` (optional) — dedicated endpoints per tab if preferring API routes.
- `src/routes/api/track-view/+server.ts` — batch view inserts.
- `src/lib/components/feed/FeedList.svelte` — item list with virtualization (optional) and skeletons.
- `src/lib/components/feed/FeedTabs.svelte` — tabs with active states.
- `src/lib/components/product/ProductCard.svelte` — ensure CTA: Buy Now / Make Offer; Like/Wishlist; Sponsored badge.

Behavior
- Read tab from URL (default: for-you). Push state when switching.
- On mount/scroll near bottom, request next page with cursor.
- After items render, post product_ids to track views (debounced, in batches).
- Disable/grey out actions when unauthenticated; show login prompt.

Empty/Error/Skeleton
- For each tab: 
  - Empty: helpful copy + CTA (Browse or Sell).
  - Error: retry control, report id.
  - Skeletons: shimmer rows/cards while fetching.

A11y
- Tablist role and keyboard interaction (Left/Right, Home/End).
- Buttons instead of clickable divs; visible focus rings; ARIA labels.

---

## 7) Browse Page — UI/UX Improvements (Non-Drastic)

Layout
- Horizontal category scroller (chips) above the grid with snap scroll and visible scroll buttons on desktop.
- Keep Filters button; include categories inside it as well for redundancy on mobile.
- Keep quick pills (Summer Sale, Vintage Finds, etc.) with clearer styling:
  - Higher contrast text, subtle gradient backgrounds, clear selected state, and close (✕) affordance when active.

Grid
- Maintain current card size; add consistent aspect ratios and object-fit cover for images.
- Add lightweight hover states on desktop; preserve touch affordances on mobile.

Filter UX
- Persist selections in URL query params for shareable states.
- Remember last used filters per visitor (localStorage).

Performance
- Use intersection observers for image lazy-loading; prefetch next page cursor.

---

## 8) Sell Form — Polishing Pass

- Validation: zod schema + friendly inline messages; disable submit until valid.
- Image upload: client-side compression hint; indicate progress; allow reorder.
- Categorization: searchable combobox; optional auto-suggest brand/category.
- Pricing: show similar items price range; minimum/maximum rules; currency formatting.
- Accessibility: labels tied to inputs, error help text with aria-describedby, keyboard traps avoided.
- Drafts: autosave to localStorage until successful submit.

---

## 9) Remove Cart, Promote Wishlist & Messages

- Remove/hide `cart/` route and navigation.
- Bottom navbar: replace Cart with Messages (or Activity).
- Keep Wishlist entry in nav/profile; ensure wishlisting works everywhere a product is shown.

---

## 10) Production Hardening

- Auth & RLS: verify policies for products, offers, purchases, likes, views.
- Rate limiting: throttle feed and track-view endpoints (IP+user key) to prevent abuse.
- Logging/Tracing: log API errors with correlation ids; add basic performance timings.
- Caching: short-lived CDN cache for Trending (e.g., 60–120s). For You/Following are per-user, so no shared cache.
- SvelteKit: handle fetch exceptions; show offline state; retry with exponential backoff.
- Images: serve responsive sizes; ensure caching headers; use placeholders (blurhash or dominant color) to avoid layout shifts.

---

## 11) Refactor Plan (3 Phases)

Phase 1 — Feed + Nav (1–2 days)
- Implement server loaders for For You, Following, Trending with keyset pagination.
- Add `/api/track-view` for batched view writes.
- Replace Cart with Messages/Activity in bottom navbar; hide/remove cart code paths.
- Add skeletons, empty states, and robust error states.

Phase 2 — Browse + Sell polish (1–2 days)
- Horizontal category scroller + improved quick pills.
- Filters in URL; maintain state between visits.
- Sell form validation polish, image UX, and accessibility fixes.

Phase 3 — Performance & Safety (1–2 days)
- Rate limiting, CDN caching for Trending, logging/tracing.
- Final A11y sweep and lighthouse pass; reduce warnings to near-zero.

---

## 12) Acceptance Criteria
- Tabs return correct data:
  - For You: personalized, diverse suggestions (excludes own/sold items).
  - Following: only sellers the user follows; unsold items; recency-ordered.
  - Trending: union of premium and top-engagement items in last 7–30d.
- Infinite scroll works with stable keyset cursors; no duplicates; graceful end.
- Bottom navbar no longer shows Cart; Messages/Activity present and functional.
- Browse: horizontal category scroller; quick pills with selected states; filters in URL.
- Sell form: validated; accessible; image upload flow clear and reliable.
- View tracking and like counts increase as expected; no client-only writes for sensitive data.
- No PII leaks; RLS verified on protected tables.

---

## 13) Open Questions / Decisions
- Choose Messages vs Activity for the navbar replacement (default: Messages).
- Confirm promotions model and business rules (billing/limits, visibility weighting).
- Confirm whether to allow anonymous views writes (likely via Edge Function with rate limit) or require auth.

---

## 14) Implementation Notes & Hints (SvelteKit + Supabase)

- Use `$app/environment` to avoid process.env in browser; prefer `$env/static/public` for public keys.
- Use `devalue`-safe data in `load` to avoid serialization issues (dates -> strings).
- Prefer server-side aggregation; do not compute scores on the client.
- Use `AbortController` to cancel stale fetches on tab switch.
- Add `aria-busy` and `aria-live=polite` for loading feedback.

---

## 15) Minimal Endpoint Sketches (Type Hints Only)

- GET `/api/feed?tab=for-you|following|trending&cursor=...`
  - Returns: { items: ProductCardData[], nextCursor: string|null }
- POST `/api/track-view` { productIds: string[] }
  - Auth optional; server validates and batches writes with rate limits.

---

## 16) Rollout Plan
- Ship hidden behind a feature flag for a small cohort.
- Validate metrics (time to first content, error rates, engagement) for 48–72h.
- Remove flag and announce.

---

Appendix: Safety & Moderation (future)
- If community chat is pursued later: require reporting tools, block/mute, rate limiting, and content moderation.
