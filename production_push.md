# Production Push - Component Audit & Refactoring Plan

## 📋 Complete Component Inventory

### 🏠 Main Page (`/` - redirects to localized)
**Components Used:**
- **Layout**: AppHeader, BottomNav
- **Social Feed**: NewListingsStories, FeedTabs, ProductFeed, UserModal, FeedStateManager
- **Product Display**: ProductGrid (via marketplace index)
- **Modals**: QuickViewModal (via NewListingsStories)

**Imported Components:**
```typescript
import BottomNav from '$lib/components/navigation/BottomNav.svelte';
import AppHeader from '$lib/components/navigation/AppHeader.svelte';
import NewListingsStories from '$lib/components/social/NewListingsStories.svelte';
import FeedTabs from '$lib/components/social/FeedTabs.svelte';
import ProductFeed from '$lib/components/social/ProductFeed.svelte';
import UserModal from '$lib/components/social/UserModal.svelte';
import FeedStateManager from '$lib/components/social/FeedStateManager.svelte';
import LiveShoppingList from '$lib/components/social/LiveShoppingList.svelte'; // UNUSED in template
```

### 🔍 Browse Page (`/browse`)
**Components Used:**
- **Search**: Custom search bar with Lucide Search icon
- **Filtering**: CategoryPills, FilterBar
- **Product Display**: ProductGrid (via marketplace index)
- **Modals**: Simple filters modal (inline)

**Imported Components:**
```typescript
import { ProductGrid } from '$lib/components/marketplace';
import CategoryPills from '$lib/components/browse/CategoryPills.svelte';
import FilterBar from '$lib/components/browse/FilterBar.svelte';
```

**⚠️ DUPLICATION ALERT**: Browse page exists in BOTH `/browse/+page.svelte` AND `/[lang=locale]/browse/+page.svelte` with IDENTICAL code!

### ❤️ Wishlist Page (`/wishlist`)
**Components Used:**
- **Product Display**: ProductCard (direct import, not via index)
- **UI Elements**: Lucide icons (Heart, Grid, List, ShoppingBag, Sparkles)
- **States**: Loading, Empty state with animations

**Imported Components:**
```typescript
import ProductCard from '$lib/components/marketplace/ProductCard.svelte';
```

### 👤 Account Page (`/account`)
**Components Used:**
- **UI Elements**: Lucide icons for various account sections
- **Auth**: getAuthContext for user data
- **Navigation**: Direct icon-based sections

**No component imports** - Uses only Lucide icons and auth store.

### 📦 Listings Page (`/profile/listings`)
**Components Used:**
- **UI**: Button component, Lucide icons
- **Product Display**: ProductCard (via marketplace index)
- **Layout**: Grid/List view toggle, Stats cards

**Imported Components:**
```typescript
import Button from '$lib/components/ui/button/button.svelte';
import { ProductCard } from '$lib/components/marketplace';
```

### 💰 Sell Page (`/sell`)
**Components Used:**
- **Form**: SellForm component (wrapper only)

**Imported Components:**
```typescript
import SellForm from '$lib/components/sell/SellForm.svelte';
```

## 🚨 Critical Issues Identified

### 1. **DUPLICATE PAGES** 
- `/browse/+page.svelte` and `/(localized)/[lang=locale]/browse/+page.svelte` are IDENTICAL
- `/wishlist/+page.svelte` exists alongside localized version
- Multiple auth pages duplicated across localized/non-localized routes

### 2. **UNUSED IMPORTS**
- `LiveShoppingList` imported but never used in main page
- Multiple auth-related components imported but may not be used efficiently

### 3. **INCONSISTENT IMPORT PATTERNS**
- ProductCard: Sometimes `from '$lib/components/marketplace/ProductCard.svelte'`
- ProductCard: Sometimes `from '$lib/components/marketplace'` (via index)
- Button: Inconsistent path variations

### 4. **MISSING DELETED COMPONENTS** (Per git status)
- `EnhancedSearchBar.svelte` - DELETED
- `FilterBottomSheet.svelte` - DELETED  
- `BottomSheet.svelte` - DELETED
- Check if any pages still reference these!

## 📊 Component Usage Statistics

### Most Used Components:
1. **Button** (ui/button) - 15+ imports across pages
2. **ProductCard/ProductGrid** - 8+ imports
3. **Lucide Icons** - Heavily used across all pages
4. **Auth components** - Multiple auth pages

### UI Component Library Usage:
- **shadcn-svelte**: Heavily used (Button, Input, Label, Alert, Dialog, etc.)
- **Lucide Icons**: Primary icon system
- **Custom Components**: Social feed, marketplace, navigation

## 🎯 Refactoring Recommendations

### Phase 1: Remove Duplicates (URGENT)
1. **Decide on route structure**: Keep localized OR non-localized, not both
2. **Delete duplicate browse pages**
3. **Consolidate auth pages**
4. **Update git status to remove deleted component references**

### Phase 2: Standardize Imports
1. **Always use marketplace index** for ProductCard/ProductGrid
2. **Standardize Button import path**
3. **Remove unused imports** (LiveShoppingList on main page)

### Phase 3: Component Optimization
1. **Merge similar functionality** (browse page search vs global search)
2. **Create shared filter components** instead of inline modals
3. **Standardize loading/empty states** across pages

### Phase 4: Svelte 5 Migration Verification
1. **Check all components use `$state()`** instead of `let`
2. **Verify `onclick` instead of `on:click`**
3. **Ensure `{@render children()}` instead of `<slot>`**
4. **Validate `let { prop } = $props()`** pattern

## 🗂️ Clean Component Architecture

### Recommended Structure:
```
src/lib/components/
├── ui/              # shadcn-svelte components (keep as-is)
├── navigation/      # AppHeader, BottomNav (optimize)
├── marketplace/     # ProductCard, ProductGrid (standardize imports)
├── social/          # Feed components (optimize unused imports)
├── browse/          # CategoryPills, FilterBar (consolidate)
├── auth/            # Auth modals/banners (consolidate duplicates)
├── sell/            # SellForm and related (verify usage)
└── shared/          # NEW: Common loading, empty states, modals
```

## 🎯 Component-by-Component Refactoring Tasks

### 🏠 Main Page (`/(localized)/[lang=locale]/+page.svelte`)

#### **AppHeader** (`$lib/components/navigation/AppHeader.svelte`)
**Tasks:**
- [ ] **Full Audit**: Check current prop usage, event handling, responsive behavior
- [ ] **Svelte 5 Compliance**: Verify `$props()`, `onclick` events, no `export let`
- [ ] **UI/UX Analysis**: Compare header patterns from modern social platforms (Instagram, TikTok)
- [ ] **Code Reduction**: 
  - Eliminate redundant CSS classes
  - Use CSS custom properties instead of hardcoded values
  - Combine similar responsive breakpoints
  - Replace complex state logic with `$derived` where applicable
- [ ] **Performance**: Implement sticky positioning optimizations, reduce layout shifts
- [ ] **Accessibility**: Ensure ARIA labels, keyboard navigation, focus management

#### **BottomNav** (`$lib/components/navigation/BottomNav.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review navigation state management, active state logic
- [ ] **Svelte 5 Compliance**: Check for reactive statements, update to `$effect`
- [ ] **UI/UX Analysis**: Study native mobile app navigation patterns (iOS/Android guidelines)
- [ ] **Code Reduction**:
  - Simplify active state calculations with `$derived`
  - Reduce CSS duplication with utility functions
  - Optimize touch targets and animations
  - Use CSS Grid instead of flexbox for cleaner layout
- [ ] **Performance**: Implement tab switching animations, prevent unnecessary re-renders
- [ ] **Mobile UX**: Add haptic feedback simulation, improve touch responsiveness

#### **NewListingsStories** (`$lib/components/social/NewListingsStories.svelte`)
**Tasks:**
- [ ] **Full Audit**: Analyze story carousel logic, image loading, user interactions
- [ ] **Svelte 5 Compliance**: Convert to `$state` for story tracking, `$effect` for auto-progression
- [ ] **UI/UX Analysis**: Compare to Instagram Stories, TikTok, Pinterest story implementations
- [ ] **Code Reduction**:
  - Simplify carousel logic with modern CSS scroll-snap
  - Reduce JavaScript for story navigation
  - Optimize image loading with native lazy loading
  - Combine similar animation keyframes
- [ ] **Performance**: Implement virtual scrolling for large story lists
- [ ] **Accessibility**: Add story navigation via keyboard, screen reader support

#### **FeedTabs** (`$lib/components/social/FeedTabs.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review tab switching logic, URL state management
- [ ] **Svelte 5 Compliance**: Use `$props()` for active tab, `onclick` for tab switching
- [ ] **UI/UX Analysis**: Study tab patterns from social platforms, ensure smooth transitions
- [ ] **Code Reduction**:
  - Replace complex tab state with simple `$state` variable
  - Use CSS transforms instead of JavaScript for tab indicator
  - Eliminate redundant hover/active styles
  - Optimize transition animations
- [ ] **Performance**: Preload tab content, debounce rapid tab switching
- [ ] **Accessibility**: ARIA tabs pattern, keyboard navigation

#### **ProductFeed** (`$lib/components/social/ProductFeed.svelte`)
**Tasks:**
- [ ] **Full Audit**: Analyze infinite scroll, product interactions, feed algorithms
- [ ] **Svelte 5 Compliance**: Convert complex reactivity to `$derived`, optimize re-renders
- [ ] **UI/UX Analysis**: Compare to Instagram feed, Pinterest grid, TikTok shopping
- [ ] **Code Reduction**:
  - Simplify infinite scroll with Intersection Observer
  - Reduce product card complexity
  - Optimize like/save animations
  - Use CSS Grid with auto-fit for responsive layout
- [ ] **Performance**: Virtual scrolling, image optimization, lazy loading
- [ ] **Interactions**: Smooth like animations, optimistic updates

#### **UserModal** (`$lib/components/social/UserModal.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review modal behavior, user profile display, follow/unfollow logic
- [ ] **Svelte 5 Compliance**: Use `$props()` for user data, proper modal lifecycle
- [ ] **UI/UX Analysis**: Study user profile modals from social platforms
- [ ] **Code Reduction**:
  - Simplify modal overlay with CSS backdrop-filter
  - Reduce animation complexity
  - Optimize user data display
  - Use native dialog element where possible
- [ ] **Performance**: Portal-based rendering, focus management
- [ ] **Accessibility**: Focus trap, ESC key handling, ARIA modal

#### **FeedStateManager** (`$lib/components/social/FeedStateManager.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review state management patterns, event handling
- [ ] **Svelte 5 Compliance**: Convert to pure `$state` and `$effect` patterns
- [ ] **UI/UX Analysis**: Ensure smooth state transitions, loading states
- [ ] **Code Reduction**:
  - Consolidate state management logic
  - Eliminate redundant reactive statements
  - Simplify event handling
  - Use modern state patterns
- [ ] **Performance**: Debounce state updates, optimize event listeners
- [ ] **Architecture**: Consider extracting to shared store

#### **LiveShoppingList** (`$lib/components/social/LiveShoppingList.svelte`) - UNUSED
**Tasks:**
- [ ] **Decision**: Remove completely OR implement properly
- [ ] **If Implementing**: Full Svelte 5 conversion, optimize for real-time updates
- [ ] **If Removing**: Clean up import, check for other references

### 🔍 Browse Page (`/browse` + `/[lang=locale]/browse`)

#### **ProductGrid** (`$lib/components/marketplace/ProductGrid.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review grid layout, product card rendering, pagination
- [ ] **Svelte 5 Compliance**: Optimize with `$props()`, efficient list rendering
- [ ] **UI/UX Analysis**: Compare to e-commerce grids (Amazon, Etsy, Shopify)
- [ ] **Code Reduction**:
  - Use CSS Grid auto-fit instead of complex breakpoints
  - Simplify responsive logic
  - Optimize product card layout
  - Reduce CSS duplication
- [ ] **Performance**: Virtual scrolling, image lazy loading, skeleton states
- [ ] **Accessibility**: Proper grid navigation, screen reader support

#### **CategoryPills** (`$lib/components/browse/CategoryPills.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review category selection logic, scrolling behavior
- [ ] **Svelte 5 Compliance**: Use `$state` for selection, `$derived` for filtering
- [ ] **UI/UX Analysis**: Study filter pills from shopping apps (Amazon, ASOS)
- [ ] **Code Reduction**:
  - Simplify horizontal scroll with CSS scroll-snap
  - Reduce JavaScript for pill interactions
  - Optimize active state styling
  - Use CSS custom properties for theming
- [ ] **Performance**: Debounce category changes, optimize scroll performance
- [ ] **Accessibility**: ARIA multiselect, keyboard navigation

#### **FilterBar** (`$lib/components/browse/FilterBar.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review filter options, modal triggers, state management
- [ ] **Svelte 5 Compliance**: Optimize filter state with `$state` and `$derived`
- [ ] **UI/UX Analysis**: Compare to modern filter bars (Airbnb, Amazon)
- [ ] **Code Reduction**:
  - Simplify dropdown logic
  - Reduce CSS for filter buttons
  - Optimize mobile filter modal
  - Use semantic HTML elements
- [ ] **Performance**: Debounce filter applications, optimize re-renders
- [ ] **Accessibility**: Proper button roles, filter announcements

### ❤️ Wishlist Page (`/wishlist`)

#### **ProductCard** (`$lib/components/marketplace/ProductCard.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review card layout, action buttons, hover states
- [ ] **Svelte 5 Compliance**: Use `$props()` for product data, optimize interactions
- [ ] **UI/UX Analysis**: Study product cards from Pinterest, Instagram Shopping
- [ ] **Code Reduction**:
  - Simplify card layout with CSS Grid
  - Reduce hover animation complexity
  - Optimize image aspect ratios
  - Use CSS custom properties for consistent spacing
- [ ] **Performance**: Optimize image loading, smooth animations
- [ ] **Accessibility**: Proper button labels, card navigation

### 📦 Listings Page (`/profile/listings`)

#### **Button** (`$lib/components/ui/button/button.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review button variants, styling system, interaction states
- [ ] **Svelte 5 Compliance**: Ensure proper prop handling with `$props()`
- [ ] **UI/UX Analysis**: Compare to design system buttons (Ant Design, Chakra)
- [ ] **Code Reduction**:
  - Simplify variant system with CSS custom properties
  - Reduce size calculations
  - Optimize loading and disabled states
  - Use modern CSS for focus styles
- [ ] **Performance**: Optimize ripple effects, reduce layout shifts
- [ ] **Accessibility**: Proper focus management, loading states

### 💰 Sell Page (`/sell`)

#### **SellForm** (`$lib/components/sell/SellForm.svelte`)
**Tasks:**
- [ ] **Full Audit**: Review form structure, validation, file uploads, step management
- [ ] **Svelte 5 Compliance**: Convert complex form state to `$state`, use `$effect` for validation
- [ ] **UI/UX Analysis**: Study selling flows from Vinted, Depop, Poshmark
- [ ] **Code Reduction**:
  - Simplify multi-step form logic
  - Reduce validation complexity
  - Optimize file upload handling
  - Use native form validation where possible
- [ ] **Performance**: Lazy load form steps, optimize image previews
- [ ] **Accessibility**: Form navigation, error announcements, progress indication

## 🛠️ Cross-Component Optimizations

### **Shared Patterns to Extract:**
- [ ] **Loading States**: Create unified skeleton/spinner components
- [ ] **Error Boundaries**: Implement consistent error handling
- [ ] **Modal System**: Standardize modal/dialog patterns
- [ ] **Form Controls**: Extract common input/validation patterns
- [ ] **Animation Library**: Create consistent motion system
- [ ] **Icon System**: Optimize Lucide icon usage

### **Performance Optimizations:**
- [ ] **Code Splitting**: Lazy load non-critical components
- [ ] **CSS Optimization**: Extract common utilities, reduce duplication
- [ ] **Bundle Analysis**: Identify largest components for optimization
- [ ] **Image Optimization**: Implement modern formats, responsive images

## 🔬 Svelte 5 Best Practices Integration

### **Runes Migration Compliance**

Based on official Svelte 5 documentation, ensure all components follow these patterns:

#### **$state() Best Practices**
- [ ] **Deep Reactivity**: Use `$state()` for objects/arrays that need deep reactivity
- [ ] **Raw State**: Use `$state.raw()` for large objects that won't be mutated (performance gain)
- [ ] **Snapshot**: Use `$state.snapshot()` when passing reactive state to external libraries
- [ ] **Class Fields**: Properly implement `$state` in class components where needed

```typescript
// ✅ GOOD: Deep reactive state
let todos = $state([
    { done: false, text: 'refactor components' }
]);

// ✅ GOOD: Raw state for performance
let largeDataset = $state.raw(bigArray);

// ✅ GOOD: Snapshot for external libs
console.log($state.snapshot(reactiveObject));
```

#### **$derived() Optimization Patterns**
- [ ] **Push-Pull Reactivity**: Leverage automatic dependency tracking
- [ ] **Conditional Dependencies**: Use conditional logic to optimize re-computations
- [ ] **Complex Derivations**: Use `$derived.by()` for multi-step calculations
- [ ] **Override Support**: Implement derivations that can be temporarily overridden (optimistic UI)

```typescript
// ✅ GOOD: Conditional dependencies
let expensiveComputation = $derived(
    needsUpdate ? heavyCalculation(data) : cachedResult
);

// ✅ GOOD: Complex derivations
let processedData = $derived.by(() => {
    let result = [];
    for (const item of rawData) {
        result.push(processItem(item));
    }
    return result;
});
```

#### **$effect() Guidelines** 
- [ ] **Side Effects Only**: Never update state inside effects (use $derived instead)
- [ ] **Teardown Functions**: Always clean up resources (intervals, listeners, etc.)
- [ ] **Dependency Management**: Understand synchronous vs asynchronous dependency tracking
- [ ] **Effect Types**: Use `$effect.pre()` for DOM-before updates, `$effect()` for after

```typescript
// ✅ GOOD: Effect with proper cleanup
$effect(() => {
    const interval = setInterval(() => {
        updateTimestamp();
    }, 1000);
    
    return () => clearInterval(interval);
});

// ✅ GOOD: Pre-effect for DOM measurements
$effect.pre(() => {
    if (container) {
        const height = container.offsetHeight;
        adjustLayout(height);
    }
});
```

#### **$props() Modern Patterns**
- [ ] **Destructuring**: Use destructuring with defaults
- [ ] **Rest Properties**: Properly handle ...rest for forwarding
- [ ] **Type Safety**: Add TypeScript annotations for props
- [ ] **Bindable Props**: Use `$bindable()` for two-way binding props

```typescript
// ✅ GOOD: Modern props pattern
let { 
    title = 'Default Title',
    items = [],
    onItemClick,
    ...restProps 
}: {
    title?: string;
    items?: Item[];
    onItemClick?: (item: Item) => void;
} = $props();
```

### **Event Handling Modernization**

#### **Component Events → Callback Props**
- [ ] **Replace createEventDispatcher**: Convert to callback props
- [ ] **Event Bubbling**: Use direct prop passing instead of event forwarding
- [ ] **Multiple Handlers**: Combine multiple handlers into single functions
- [ ] **Type Safety**: Properly type callback props

```typescript
// ❌ OLD: Event dispatcher pattern
const dispatch = createEventDispatcher();
dispatch('change', value);

// ✅ NEW: Callback props pattern
let { onChange } = $props();
onChange?.(value);
```

#### **DOM Event Attributes**
- [ ] **on:click → onclick**: Migrate all DOM event handlers
- [ ] **Event Modifiers**: Replace modifiers with explicit logic
- [ ] **Multiple Listeners**: Combine into single handlers
- [ ] **Passive Events**: Handle touch/wheel events properly

```typescript
// ❌ OLD: Event directive with modifiers
<button on:click|preventDefault|once={handler}>

// ✅ NEW: Event attribute with explicit logic
<button onclick={(e) => {
    e.preventDefault();
    if (!hasRun) {
        hasRun = true;
        handler(e);
    }
}}>
```

### **Snippet System Migration**

#### **Slots → Snippets Conversion**
- [ ] **Default Slots**: Convert `<slot />` to `{@render children?.()}`
- [ ] **Named Slots**: Convert to snippet props
- [ ] **Slot Props**: Convert `let:` syntax to snippet parameters
- [ ] **Fragment Elimination**: Remove unnecessary `<svelte:fragment>` tags

```svelte
<!-- ❌ OLD: Named slots with props -->
<slot name="item" {item} {index} />

<!-- ✅ NEW: Snippet with parameters -->
{@render itemSnippet?.(item, index)}
```

## 🚀 SvelteKit Remote Functions Integration

### **Remote Functions Analysis & Recommendations**

Based on the official SvelteKit remote functions documentation, here are optimization opportunities for our codebase:

#### **Current API Patterns to Modernize**

Our components currently make direct API calls and handle data fetching manually. Remote functions can significantly improve this by:

1. **Type-Safe Data Fetching**: Replace manual fetch calls with typed remote functions
2. **Server-Only Access**: Safely access database/environment variables 
3. **Optimistic Updates**: Built-in support for optimistic UI patterns
4. **Single-Flight Mutations**: Eliminate unnecessary roundtrips

#### **Implementation Strategy**

**Phase 1: Create Remote Function Modules**
- [ ] **Product Data**: `src/lib/server/products.remote.ts`
  - `getProducts()` - for browse page
  - `getProduct(id)` - for individual products  
  - `searchProducts(query)` - for search functionality
  
- [ ] **User Data**: `src/lib/server/users.remote.ts`
  - `getUserProfile()` - for account page
  - `getUserListings(userId)` - for listings page
  - `getUserWishlist()` - for wishlist page

- [ ] **Marketplace Actions**: `src/lib/server/marketplace.remote.ts`
  - `toggleWishlist(productId)` - command function
  - `createListing(data)` - form function
  - `deleteListing(id)` - command function

**Phase 2: Component Integration**
- [ ] **Browse Page Optimization**:
  ```typescript
  // src/routes/browse/data.remote.ts
  export const getProducts = query(
    v.object({
      category: v.optional(v.string()),
      search: v.optional(v.string()),
      size: v.optional(v.string()),
      sort: v.optional(v.string())
    }),
    async (filters) => {
      return await db.products.find(filters);
    }
  );
  ```

- [ ] **Wishlist Page Enhancement**:
  ```typescript
  // src/routes/wishlist/data.remote.ts
  export const getWishlistItems = query(async () => {
    const user = await getUser();
    return await db.wishlist.findByUser(user.id);
  });
  
  export const toggleWishlistItem = command(
    v.string(),
    async (productId) => {
      await db.wishlist.toggle(productId);
      // Auto-refresh wishlist
      getWishlistItems().refresh();
    }
  );
  ```

- [ ] **Sell Form Modernization**:
  ```typescript
  // src/routes/sell/data.remote.ts  
  export const createListing = form(async (data) => {
    const user = await auth.getUser();
    if (!user) error(401, 'Unauthorized');
    
    const listing = await db.listings.create({
      userId: user.id,
      title: data.get('title'),
      // ... other fields
    });
    
    redirect(303, `/listings/${listing.id}`);
  });
  ```

**Phase 3: Optimistic Updates**
- [ ] **Like/Unlike Actions**: Immediate UI feedback
- [ ] **Wishlist Toggles**: Instant visual changes
- [ ] **Form Submissions**: Progressive enhancement

#### **Configuration Requirements**

Add to `svelte.config.js`:
```javascript
export default {
  kit: {
    experimental: {
      remoteFunctions: true  // Enable remote functions
    }
  }
};
```

#### **Performance Benefits**

- **Reduced Bundle Size**: Server logic stays on server
- **Type Safety**: End-to-end type safety without code generation
- **Optimistic Updates**: Built-in patterns for responsive UI
- **Request Coalescing**: Automatic batching of related requests
- **Cache Management**: Automatic invalidation and refresh patterns

#### **Migration Priority**

1. **High Impact**: Browse page search/filter functionality
2. **Medium Impact**: Wishlist operations, user profile data
3. **Low Impact**: Forms and creation flows (already work well)

#### **Validation Integration**

Use Valibot for schema validation:
```typescript
// src/lib/schemas.ts
export const ProductFilters = v.object({
  category: v.optional(v.string()),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number())
});

// In remote function
export const searchProducts = query(ProductFilters, async (filters) => {
  // Type-safe, validated data
});
```

## ✅ Updated Execution Priority

### **Phase 1: Foundation & Critical Fixes (Week 1-2)**

#### **Week 1: Infrastructure**
1. **Remove duplicate pages** (browse, wishlist) - immediate code reduction
2. **Fix unused imports** (LiveShoppingList) - clean up dead code
3. **Standardize import patterns** - consistency across codebase
4. **Configure remote functions** - add experimental flag to svelte.config.js
5. **Svelte 5 compliance audit** - verify all components use proper runes

#### **Week 2: Core Runes Migration**
1. **$state() migration** - convert all reactive variables
2. **$derived() implementation** - replace $: reactive statements  
3. **$effect() cleanup** - proper effect management with teardowns
4. **$props() standardization** - modern props patterns with TypeScript
5. **Event handler migration** - on:click → onclick throughout codebase

### **Phase 2: Component Modernization (Week 3-4)**

#### **Week 3: High-Impact Components**
1. **ProductCard/ProductGrid optimization**:
   - Implement virtual scrolling for large lists
   - Add $state.raw() for performance on large datasets
   - Convert to snippet-based rendering
   - Add optimistic wishlist updates
   
2. **Navigation components (AppHeader, BottomNav)**:
   - Migrate to modern event patterns
   - Implement $derived for active states
   - Add proper focus management
   - Optimize mobile responsiveness

3. **Button component streamlining**:
   - Consolidate variants using CSS custom properties
   - Add proper TypeScript props interface
   - Implement loading states with $derived

#### **Week 4: Social & Browse Features**
1. **Browse page with remote functions**:
   - Implement `getProducts()` query function
   - Add optimistic search updates
   - Convert filters to snippet components
   - Add infinite scroll with virtual rendering

2. **Feed components optimization**:
   - Convert story carousel to modern patterns
   - Add $effect.pre() for smooth animations
   - Implement optimistic like/save actions
   - Extract common feed patterns

### **Phase 3: Remote Functions Integration (Week 5-6)**

#### **Week 5: Data Layer**
1. **Create remote function modules**:
   - `products.remote.ts` - product queries and mutations
   - `users.remote.ts` - user profile and wishlist data
   - `marketplace.remote.ts` - marketplace actions and forms

2. **Schema validation setup**:
   - Install and configure Valibot
   - Create shared validation schemas
   - Add type-safe API boundaries

#### **Week 6: Component Integration**
1. **Browse page enhancement**:
   - Replace manual fetch with typed queries
   - Add single-flight mutations for filters
   - Implement optimistic search results

2. **Wishlist modernization**:
   - Convert to remote function queries
   - Add optimistic toggle actions
   - Implement automatic cache invalidation

3. **Sell form optimization**:
   - Convert to remote form function
   - Add progressive enhancement
   - Implement optimistic UI updates

### **Phase 4: Advanced Patterns & Performance (Week 7-8)**

#### **Week 7: Snippet System Migration**
1. **Slots → Snippets conversion**:
   - Convert all `<slot />` to `{@render children?.()}`
   - Migrate named slots to snippet props
   - Eliminate `<svelte:fragment>` usage
   - Add proper TypeScript for snippet props

2. **Shared pattern extraction**:
   - Create common loading/error snippets
   - Build consistent modal system
   - Extract form control patterns
   - Standardize animation library

#### **Week 8: Final Optimization**
1. **Performance improvements**:
   - Bundle analysis and optimization
   - Image optimization implementation
   - CSS custom property standardization
   - Code splitting for non-critical components

2. **Quality assurance**:
   - Accessibility audit with screen readers
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile performance optimization
   - SEO optimization for server-rendered content

### **Phase 5: Testing & Documentation (Week 9)**

#### **Testing Strategy**
1. **Component testing**: Verify all runes work correctly
2. **Remote function testing**: Test query/command/form functions
3. **Performance testing**: Measure before/after metrics
4. **Accessibility testing**: Verify WCAG compliance
5. **Type checking**: Ensure full TypeScript coverage

#### **Documentation Updates**
1. **Component documentation**: Update all component APIs
2. **Remote function guides**: Document new data patterns  
3. **Migration notes**: Record lessons learned
4. **Performance metrics**: Document improvements achieved

## 🔧 Commands to Run After Each Component

```bash
pnpm run check      # Must show 0 errors
pnpm run build      # Must succeed  
pnpm run lint       # Clean code standards
pnpm run dev        # Test in development
```

## 📊 Updated Project Metrics

### **Comprehensive Task Breakdown**
- **Core Component Tasks**: 150+ individual refactoring tasks across 15 components
- **Svelte 5 Migration Tasks**: 75+ runes, events, and snippet migrations  
- **Remote Functions Tasks**: 25+ data layer and API modernizations
- **Performance Optimizations**: 40+ targeted improvements
- **Quality Assurance Tasks**: 30+ testing and documentation items

**Total Tasks**: 320+ individual tasks across 9 weeks

### **Expected Outcomes**

#### **Code Quality Improvements**
- **Code Reduction**: 25-35% reduction in component complexity
- **Type Safety**: 100% TypeScript coverage with remote function validation
- **Performance**: 20-30% improvement in page load and interaction speed
- **Bundle Size**: 15-20% reduction through better tree-shaking and remote functions
- **Maintainability**: Unified patterns across all components

#### **Developer Experience Enhancements**
- **Modern Patterns**: Full Svelte 5 runes adoption
- **Type Safety**: End-to-end type safety with remote functions
- **Developer Productivity**: Faster development with better patterns
- **Error Handling**: Comprehensive error boundaries and validation
- **Testing**: Improved testability with modern component architecture

#### **User Experience Benefits**
- **Performance**: Faster interactions with optimistic updates
- **Responsiveness**: Better mobile experience with modern patterns
- **Accessibility**: WCAG compliant components throughout
- **Progressive Enhancement**: Works without JavaScript where applicable
- **Visual Consistency**: Unified design system implementation

#### **Risk Mitigation Strategy**

##### **Technical Risks**
- **Remote Functions are experimental**: gate rollout behind feature flags, keep current fetch paths as fallback, and pilot on Browse only before expanding.
- **Runed event migration (onclick) across third‑party components**: don’t modify vendor libs (shadcn-svelte); wrap instead and migrate only local code. Verify library compatibility first.
- **Large-slot → snippet migration**: do incrementally. Converting complex nested slots all at once is brittle; migrate leaf components first.
- **Route dedup (localized vs non-localized)**: ensure redirects and link updates to avoid broken navigation; test SSR/CSR parity and hydration.

##### **Timeline Risks**  
- **Buffer Time**: 20% buffer built into each phase
- **Parallel Work**: Independent tasks can be worked on simultaneously
- **Fallback Options**: Each phase delivers value independently
- **Testing Gates**: No progression without passing quality gates

## 🎯 Immediate Next Steps

### **Week 1 Kickoff Tasks**
1. **Environment Setup**:
   ```bash
   # Enable remote functions
   # Update svelte.config.js
   kit: { experimental: { remoteFunctions: true } }
   
   # Install validation library
   pnpm add valibot
   
   # Update TypeScript config for stricter checking
   ```

2. **Quick Wins**:
   - [ ] Delete duplicate browse pages (immediate ~200 lines reduction)
   - [ ] Remove unused LiveShoppingList import
   - [ ] Standardize ProductCard imports across 5 files
   - [ ] Run type checking audit: `pnpm run check`

3. **Documentation**:
   - [ ] Create migration tracking spreadsheet
   - [ ] Set up before/after performance benchmarks  
   - [ ] Document current component API contracts
   - [ ] Create testing checklist for each phase

### **Success Criteria Per Phase**

#### **Phase 1**: Zero TypeScript errors, 15% code reduction
#### **Phase 2**: All components use Svelte 5 patterns, improved performance metrics
#### **Phase 3**: Remote functions integrated, type-safe API layer
#### **Phase 4**: Snippet system complete, performance targets met
#### **Phase 5**: Full test coverage, documentation complete

---

GPT AUDIT: High-level audit and actionable recommendations

- What’s strong
  - Clear, phased roadmap with success criteria and measurable outcomes (code reduction, perf targets).
  - Early focus on duplicate routes, import standardization, and removing unused code.
  - Intent to adopt Svelte 5 runes, validation (Valibot), and Remote Functions for a thinner client.

- Biggest risks + mitigations

  - Runed event migration (onclick) across third‑party components: don’t modify vendor libs (shadcn-svelte); wrap instead and migrate only local code. Verify library compatibility first.
  - Large-slot → snippet migration: do incrementally. Converting complex nested slots all at once is brittle; migrate leaf components first.
  - Route dedup (localized vs non-localized): ensure redirects and link updates to avoid broken navigation; test SSR/CSR parity and hydration.

- Gaps / clarifications needed
  - CI gates are implied but not specified: define required checks (type check, lint, unit, e2e, bundle size budget, Lighthouse).
  - Error boundary pattern: choose a shared error UI/contract early so components converge on one approach.
  - Image pipeline: specify tooling (e.g., SvelteKit’s built-in images or external service) for responsive, modern formats (AVIF/WebP) and caching.

- Priority adjustments (low effort, high impact)
  - Create/import barrels for marketplace and ui components; fix all import inconsistencies in one pass.
  - Delete duplicate wishlist/browse routes and add redirects the same PR; run a workspace-wide reference check for deleted components.
  - Add perf budgets and enforce in CI (e.g., JS < X kB per route, LCP/INP thresholds in lab runs).

- Measurable checkpoints to add
  - svelte-check: 0 errors; TypeScript strict mode enabled (noImplicitAny, exactOptionalPropertyTypes, etc.).
  - Bundle budgets per route and regression guard via CI comment/report.
  - Perf lab (Lighthouse) gates: mobile LCP < 2.5s, INP < 200ms on key pages (browse, feed, wishlist).
  - Accessibility baseline: axe violations = 0 critical/serious before merge.

- Immediate actions (next 48 hours)
  - Remove LiveShoppingList import and any stale references to deleted components (EnhancedSearchBar, FilterBottomSheet, BottomSheet).
  - Unify to [lang=locale] routing; add redirects from non-localized routes and update internal links.
  - Add barrels and standardize imports (ProductCard/ProductGrid/Button) across codebase.
  - Enable remoteFunctions flag in svelte.config.js, but only implement on /browse with a clearly named data.remote.ts; keep fetch fallback.

- Notes on Svelte 5 runes + shadcn-svelte
  - Limit runes migration to your own components first; treat shadcn-svelte as stable vendor code.
  - Replace on:click with onclick only where you control the DOM; verify semantics and event modifiers replaced intentionally.
  - Prefer $derived over ad-hoc $: chains; use $effect strictly for side effects with teardown.

- Remote Functions guardrails
  - Organize as lib/server/*.remote.ts for domain concerns and route-level *data.remote.ts for page-specific needs.
  - Validate inputs with Valibot at the boundary; return minimal DTOs (no ORM entities).
  - Plan optimistic UI with explicit refresh/invalidation; document cache lifetimes.

- i18n dedup strategy
  - Keep a single page component; localized routes should only handle params/load and render the shared component.
  - Centralize dictionary access; avoid per-page duplication. Use project.inlang assets consistently.

- Supabase + data integrity
  - Re-run and audit RLS; add tests for wishlist/listings access control.
  - Regenerate TS types if using typed client; verify storage policies for images in Sell flow.

- CI/CD and quality gates
  - Required checks: svelte-check, tsc, eslint, unit (Vitest), e2e (Playwright), Lighthouse lab, bundle-size.
  - Preview deployments for every PR; block merge on budget/perf/accessibility regressions.

Overall: Proceed with Phase 1 immediately (dedup, imports, dead code). Pilot Remote Functions on /browse behind a flag, then expand. Convert to runes incrementally, starting with leaf components and avoiding vendor lib edits. Add concrete budgets and CI gates now to prevent regressions later.