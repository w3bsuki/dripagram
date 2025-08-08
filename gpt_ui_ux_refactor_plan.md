# Project-wide UI/UX Improvement & Refactor Plan

Date: 2025-08-08
Owner: GitHub Copilot

Goal
- Deliver a cohesive, conversion-focused, mobile-first experience using Svelte 5 (runes), shadcn-svelte, and TailwindCSS best practices.
- Unify visuals, interactions, and accessibility across every page.
- Reduce cognitive load, improve speed-to-value, and remove friction in the shopping and selling flows.

Guiding Principles
- Mobile-first, content-first: optimize FMP/LCP, reduce layout shifts, and keep actions reachable.
- Conversion-first: clear primary CTAs, minimized steps, helpful defaults, and progressive disclosure.
- One design system: centralized tokens, components, and behaviors (shadcn-svelte + Tailwind utility-first).
- Accessible by default: keyboardable, ARIA-correct, visible focus, color contrast, reduced motion.
- URL as state where shareable: filters, sort, pagination; SSR-friendly for crawlability.
- Performance budgets: lightweight components, image optimization, route-level code splitting.

Technical Foundations
- Svelte 5 runes: favor $state, $derived, $effect for component state; minimize global stores to cross-cutting concerns only.
- TailwindCSS design tokens: define consistent colors, radius, spacing, shadows, typography in tailwind.config.
- shadcn-svelte: adopt for buttons, inputs, forms, sheets/drawers, dialogs, toasts, tabs, dropdowns, tooltips, skeletons.
- i18n: leverage existing inlang setup; ensure all UI copy is keyed; support pluralization and RTL readiness.
- Data fetching: prefer server load where SEO-salient; use streaming/skeletons for perceived speed; debounce client filters.
- Accessibility: use semantic HTML; aria-* completeness; focus traps in overlays; escape closes modals; announce changes with live regions.

Global System Changes
- Tokens & Theme
  - Establish primary, secondary, success, warning, destructive palettes, surface/background scales, and elevation tokens.
  - Define typography scale (e.g., fluid type for h1–h6, body, caption) with robust line-heights.
  - Standardize spacing (4/8pt) and radius (sm/md/lg/full) across all components.
- Layout & Grid
  - Container widths: xs/sm/md/lg/xl/2xl; consistent gutters; container queries for card density.
  - Safe areas on iOS; sticky headers with compensating content padding.
- Components (Core shadcn-svelte set)
  - Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch.
  - Tabs, SegmentedControl, Breadcrumbs, Pagination.
  - Dialog, Drawer/Sheet (mobile), Popover, Tooltip, Toast.
  - Chip/Pill (filter), Badge, Tag, Skeleton, EmptyState.
  - RangeSlider (price), Carousel (gallery), Rating, Avatar, Progress, Stepper.
- Patterns
  - Horizontal chip scrollers with snap, visible focus, and optional hover chevrons on desktop.
  - Active-filter chips with one-tap clear; Clear All.
  - Infinite scroll with sentinel + “Load more” fallback for a11y; preserve scroll on back.
  - Form validation with zod + superforms/supervalidate (or equivalent), inline errors, and toasts.
- Feedback & States
  - Consistent skeletons; optimistic UI where safe (favorites, follows).
  - Toasts for success/failure; non-blocking; actionable when relevant (Undo).
- Analytics & Experimentation
  - Define key events: view_item_list, select_item, view_item, add_to_favorites, start_checkout (if applicable), message_sent, listing_created.
  - Track funnel drop-off; set up A/B test toggles for critical flows (hero, filters, PDP CTAs).

Navigation & Shell
- Global Header: reuse SearchHeader across routes that need search; sticky on scroll; compact mode on scroll-down.
- Bottom Navigation (mobile): Home, Browse, Sell, Favorites, Profile; surface badges (e.g., messages).
- Breadcrumbs (desktop): on PDP and nested pages; improve discoverability and SEO.
- Empty/404/500: branded, actionable, with discovery paths back to shopping.
- Instagram-style alignment (non-disruptive)
  - Keep current Home layout; optionally adopt a slimmer top bar (logo left, actions right), search accessible via dedicated route or overlay.
  - Bottom Nav uses icon-first labels; center primary action (Sell) for prominence; persistent and non-transparent over content.
  - Support double-tap to like with subtle heart burst animation; haptic on supported devices (progressive enhancement).
  - Optional “story/highlight” circles for collections/brands at top of Home as an experiment flag (no IA changes).

Page-by-Page Plan (src/routes)
- Home (/)
  - Keep current look; refine toward Instagram feed ergonomics without structural change.
  - PostCard pattern for product posts: header (avatar, username/shop, • time), carousel (1–10 images, swipe on mobile), action row (Like, Comment, Share, Save), likes count, truncated caption with “more…”, top 1–2 comments preview, timestamp.
  - Preserve existing hero/collections if present; place feed immediately visible after header; ensure smooth, inertial scroll.
  - Interactions: single-tap toggles Like; double-tap on media likes with animation; Save adds to Favorites silently with toast.
  - Performance: prioritize first image decode; defer offscreen carousels; recycle card components.
  - Acceptance: interactions < 100ms; 60fps scroll; first image visible < 1s on mid device; no layout shift when actions toggle.
- Browse (/browse)
  - Keep horizontal Category Chips and Quick Pills; snap scroll; no wrapping on mobile.
  - Toolbar: results count + Sort + Filters; filters open bottom sheet on mobile; left rail on desktop.
  - URL sync: category, subcategory, condition, price_min, price_max, sort; initialize from $page.url.
  - A11y: aria-pressed on chips; aria-expanded on filter button; focus trap in sheet; Escape closes.
  - Acceptance: zero wrap; scroll hints on desktop; sharable URLs; keyboardable scrollers.
- Search (/search)
  - Explore-style grid: 3-col square grid on mobile (auto-fills on desktop); occasional larger tiles for variety (masonry opt-in behind flag).
  - Sticky minimal search bar; trending chips beneath; recent searches as tappable pills.
  - Tap opens Product Detail; long-press (desktop: hover focus) surfaces quick actions (Favorite, Share).
  - Acceptance: grid fills without gaps; images use object-cover and aspect-square; input focuses on route; URL reflects q, sort, page.
- Product List (/products, category routes if present)
  - Consistent ProductGrid card: image ratio, badge (New/Sale), price, brand, condition, likes.
  - Quick favorite (toggle) with optimistic update; accessible button name changes.
  - Infinite scroll + sentinel; maintain scroll on back; preserve applied filters.
  - Acceptance: uniform card heights; visible price; tap targets >= 44px.
- Product Detail (/products/[id])
  - Gallery: pinch-zoom on mobile, swipe carousel, thumbnails on desktop.
  - Clear pricing, size, condition, shipping/returns; trust signals (secure checkout, seller rating).
  - Primary CTA prominent; secondary actions: favorite, share, message seller.
  - Recommendations: related products beneath; skeletal while loading.
  - Acceptance: first image visible < 1s on 4G; all controls keyboardable; accessible gallery labeling.
- Favorites (/favorites)
  - Saved-style grid of favorited items; 3-col square grid on mobile, responsive on desktop.
  - Collections (optional): allow grouping saved items into named folders; simple create/edit UI.
  - Empty state: encourage browsing; show recent categories as chips.
  - Acceptance: grid scrolls smoothly; quick un-favorite from grid with undo toast; batch select behind Edit mode.
- Messages (/messages)
  - Chat list and thread split (desktop); single view with header (mobile).
  - Typing indicator, read receipts; image attachment preview; safe-content handling.
  - Composer with validation; send on Ctrl/Cmd+Enter; accessible labels and roles.
  - Acceptance: virtualized list for long threads; focus returns to composer on send.
- Sell (/sell)
  - Multi-step listing flow with Stepper, autosave drafts, image uploader (reorder, crop, compress), category/attributes.
  - Price guidance; validation with inline hints; preview listing before publish.
  - Acceptance: draft is never lost; image processing under 2s per image; clear success state.
- Profile (/profile)
  - Instagram-like header: avatar (large), username, display name; inline stats (Posts, Followers, Following) with strong emphasis.
  - Bio with link; action buttons (Edit Profile, Share Profile). Own profile shows settings icon; others show Follow/Message.
  - Highlights row (optional): round cover thumbnails linking to curated collections.
  - Tabs: Listings (grid, 3-col square), Likes (private saved grid), About/Reviews as secondary tabs.
  - Acceptance: header collapses on scroll to maximize grid viewport; tabs preserve scroll position; avatars have focus rings and alt text.
- User (/user/[id])
  - Mirrors Profile with Follow/Message primary actions; hide private tabs; surface trust badges and seller rating.
  - Acceptance: consistent CTAs; grid parity with Profile; clear report/block entry in overflow menu.
- Onboarding (/onboarding)
  - Progressive profile: basics, preferences (style/size), notifications.
  - Use delightful microcopy; skippable but encouraged to complete with incentives.
  - Acceptance: each step < 30s; can resume later; keyboard-only completion possible.
- Auth (/auth/*)
  - Streamlined sign in/up; passwordless/magic link support; SSO if available.
  - Strong error recovery; email field auto-focus; device-appropriate keyboards.
  - Acceptance: median completion < 20s; no layout shift while typing; clear states.

Shared Components To Build/Refine (with shadcn-svelte)
- SearchHeader, BottomNav, ProductCard, ProductGrid, FilterChip, FilterSheet, LeftFilterRail (desktop), SortDropdown.
- ImageUploader (sell), Stepper, Progress, StatusBadge, Avatar with fallback.
- Dialog/ConfirmDialog, Drawer/Sheet, Toast, Tooltip, Skeleton, EmptyState, Pagination/InfiniteScrollSentinel.
- Form primitives (Field, Label, Description, ErrorMessage) integrated with zod.
- Instagram-style primitives
  - PostCard (header/media/actions/caption/comments), ActionBar (like/comment/share/save), Story/HighlightCircle, ProfileHeader, ProfileTabs.

Accessibility Checklist
- Color contrast AA minimum; outline-visible focus styles; :focus-visible tuned.
- aria-pressed on toggles; aria-expanded + aria-controls on disclosure; aria-live for async results.
- Ensure headings hierarchy; landmark roles (header, nav, main, aside, footer).
- Trap focus in overlays; Escape closes; return focus to invoker.
- Keyboard patterns: Left/Right in scrollers; Up/Down in menus; Enter/Space activation.

Performance & Quality
- Images: responsive sources, aspect-ratio placeholders, lazy loading, decode=async.
- Lists: virtualization for long lists where applicable; intersection observers for prefetch.
- JS: defer non-critical; remove unused variants/classes; bundle analysis quarterly.
- CSS: Tailwind JIT purging; prefer utilities; component-level variants via cva.
- Metrics: LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-tier devices and 4G.

State & URL Strategy
- URL is source of truth for shareable state: filters, sort, page, query.
- Keep ephemeral UI state local (sheets open, hover) via runes; cross-route store for auth/user.
- goto(url, { replaceState: true, keepfocus: true, noScroll: true }) for smooth updates.

Internationalization
- All copy in messages with keys; avoid concatenation; include placeholders and gender/plural rules.
- Test truncation in narrow widths; provide shorter variants where needed.

Testing & QA
- Automated: accessibility tests (axe), visual regression (Percy or equivalent), E2E critical flows (Playwright).
- Manual: device matrix (iOS/Android small/large, desktop), reduced motion, RTL snapshot.
- PR checklist: a11y, focus order, keyboard paths, URL sync, skeletons, empty/error states, analytics events.

Phased Roadmap
- Phase 0: Foundations (tokens, Tailwind config, shadcn-svelte install, component scaffolds, analytics)
- Phase 1: Shell & Home (SearchHeader, BottomNav, hero improvements, core components, PostCard + ActionBar, basic ProfileHeader/Tabs)
- Phase 2: Browse & Search (chip scrollers, filter sheet, URL sync, left rail desktop, Explore grid)
- Phase 3: Product Detail & Product List (gallery, recommendations, card refinements)
- Phase 4: Sell & Messages (uploader, stepper, chat polish)
- Phase 5: Profile, Favorites, User, Onboarding (highlights, saved collections, tabs, performance)
- Phase 6: Polish & Experiments (micro-interactions, story/highlight experiment, A/B tests, performance budget review)

Acceptance for Completion
- Visual parity and consistency across routes; no orphan UI patterns.
- All interactive elements keyboard-accessible with visible focus and correct ARIA.
- Filters and search states are shareable via URL and restore correctly.
- Core metrics within budgets; skeletons and fallbacks throughout.
- Documented components and usage examples; design tokens enforced.

References
- See docs/techstack for Svelte 5, Tailwind, shadcn, Supabase guides.
- Existing browse plan: gpt_ui/ux.md (to be merged into this plan as implemented).

Next Steps
- Implement Phase 0 foundations; open tracking issues per phase and route.
- Begin with Shell & Home (IG-aligned refinements) and Browse/Search for immediate UX gains and conversion impact.
