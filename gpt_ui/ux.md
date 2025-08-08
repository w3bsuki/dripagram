# Browse Page UI/UX Audit and Refactor Plan

Date: 2025-08-08
Owner: GitHub Copilot

## Context & Goal
Refactor `/browse` to better match the main page and fix the poor mobile UX where category buttons wrap into two rows. Keep the “Summer Sale”, “Vintage Finds”, etc. quick pills. Aim for visual parity with the main page and a shareable filter state.

## Key Issues
- Category grid renders in two rows on mobile, pushing content down and feeling heavy.
- Local sticky search header differs from main page’s `SearchHeader` (spacing/typography inconsistent).
- Filters aren’t reflected in URL; no active-filter chips; state isn’t shareable or transparent.
- Desktop lacks a left filter rail; everything is top-stacked.
- A11y gaps: chips don’t expose `aria-pressed`; Filter button lacks `aria-expanded` and proper sheet semantics.

## Target UX (parity with main)
Mobile
- Reuse `SearchHeader` for consistency.
- Single-row horizontal Category Chips (Women/Men/Shoes/…) with snap scroll; no wrapping.
- Keep Quick Pills (collections) in a 2nd horizontal scroller; unify chip visuals; clear selected state.
- Toolbar: Results count + Sort + Filters (filters open bottom sheet).
- Show Subcategory scroller under category when selected.
- Keep `BottomNav` as on main.

Desktop
- Keep Category Chips and Quick Pills as horizontal scrollers; show left/right chevrons on hover for discoverability.
- Add a left sticky filter rail (Condition, Price, Size/Brand optional); keep Results + Sort top-right.
- Show active filters as removable chips above the grid.

## Concrete Changes (files)
1) Replace category grid with horizontal chip scroller
- `src/routes/browse/+page.svelte`: Swap the 3×N grid for a single-row scroll container with `scroll-snap` and `flex-shrink: 0` chips. Add `aria-pressed` and selected styles.
- Desktop: add chevrons that scroll the container left/right on click.

2) Keep Quick Pills but unify visuals
- Use same chip component styling (padding, radius, font) with colorful backgrounds and a clear selected/active state.

3) Reuse main Search header
- Replace local sticky search header with `<SearchHeader />` (like `src/routes/+page.svelte`).
- Optional: move “Trending searches” to a small horizontal scroller or remove for parity.

4) Toolbar + Active Filter Chips
- Keep Filter button; add `aria-expanded` and `aria-controls` for the sheet.
- Add an Active Filters chip row (category, subcategory, condition, price range) with X to clear each.

5) Desktop left filter rail (recommended)
- Sticky rail with Condition toggles, Price inputs/slider, optional Size/Brand.
- Keep in sync with top toolbar and chips.

6) URL persistence
- Sync `category`, `subcategory`, `condition`, `price_min`, `price_max`, `sort` in query params via SvelteKit `goto(url, { replaceState: true })`.
- Read initial state from `$page.url.searchParams`.

7) A11y & Keyboard
- Chips: buttons with `aria-pressed={selected}`; Enter/Space toggle; visible focus ring.
- Filter button: `aria-expanded`; sheet closes on Escape; focus trapped inside.
- Scrollers: keyboard-accessible (Left/Right), maintain visible focus.

8) Visual parity with main
- Reuse tokens/colors (`var(--color-*)`) and spacing from main.
- Consistent ProductGrid gutters; single elevation scale.
- Skeletons and loading states match main page style.

9) Performance
- Enable `-webkit-overflow-scrolling: touch;` and `scroll-snap` on horizontal lists.
- Debounce filter changes; prefetch next page when near viewport bottom; lazy-load images.

## Suggested Structure (mobile-first)
- SearchHeader
- Category Chips (horizontal)
- Quick Pills (horizontal)
- Active Filter Chips (if any)
- Toolbar: Results + Sort + Filters
- ProductGrid
- BottomNav

## Acceptance Criteria
- No category wrapping on mobile; smooth horizontal scroll with snap.
- Search/header, spacing, and typography align with main page.
- Filters reflected in URL; active filters visible and clearable.
- Desktop has optional left filter rail; mobile uses bottom sheet.
- A11y: `aria-pressed` on chips; filter button `aria-expanded`; Esc closes sheet.

## Implementation Notes
- Use `goto(url, { replaceState: true, keepfocus: true, noScroll: true })` to update URL without jank.
- Keep state single-sourced from URL; initialize local state from it.
- Trap focus in the filter sheet and restore on close.

## Next Steps
- Implement chip scrollers and swap in `SearchHeader`.
- Add Active Filters chip row and URL sync.
- (Optional) Build desktop left rail component under `src/lib/components/browse/`.
