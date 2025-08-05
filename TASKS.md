# Driplo.bg - Production Roadmap & Task Management

## Project Overview
**Status**: 15% Complete (Homepage + UI Foundation)  
**Stack**: SvelteKit 2 + Svelte 5 + Tailwind CSS v4 + Supabase  
**Target**: Production-ready marketplace platform  
**Timeline**: 2-3 weeks to feature parity

## Critical Rules - NEVER VIOLATE

### 1. Svelte 5 Syntax ONLY
```typescript
// ✅ CORRECT - Always use these patterns
onclick={() => handleClick()}           // NOT on:click
let { title } = $props();               // NOT export let
let count = $state(0);                  // NOT let count = 0
let doubled = $derived(count * 2);      // NOT $: doubled = 
$effect(() => { ... });                 // NOT $: { ... }
{@render children()}                    // NOT <slot>

// ❌ NEVER USE - These are deprecated
on:click, on:submit, on:change         // Use onclick, onsubmit, onchange
export let prop                         // Use $props()
<slot>                                  // Use {@render children()}
$: computed = value                     // Use $derived()
```

### 2. Zero Tolerance for Errors
- Run `pnpm run check` before EVERY commit
- Fix ALL TypeScript errors immediately
- No mixed syntax patterns
- No duplicate components
- No unused code

### 3. Component Standards
- Use shadcn/ui components as base
- Follow existing patterns in `/lib/components/ui`
- Mobile-first responsive design
- Proper TypeScript types for all props
- Error boundaries for all pages

## Immediate Fixes Required

### High Priority - Fix Now
- [ ] Fix vite.config.ts TypeScript errors (conflicting Vite versions)
- [ ] Add shadcn/ui properly configured
- [ ] Fix Sheet component type errors
- [ ] Fix MobileHeader routing type errors

### Medium Priority
- [ ] Fix accessibility warnings (add ARIA roles)
- [ ] Clean up unused CSS classes
- [ ] Standardize component exports

## Development Phases

### Phase 1: Core Infrastructure (Week 1)
**Goal**: Stable foundation with zero errors

#### 1.1 Fix Current Issues (Day 1)
- [ ] Resolve all TypeScript errors
- [ ] Configure shadcn/ui properly
- [ ] Set up proper error boundaries
- [ ] Establish coding standards

#### 1.2 Authentication System (Day 2)
- [ ] Login page with Supabase Auth
- [ ] Register page with validation
- [ ] Password reset flow
- [ ] Social auth (Google, GitHub)
- [ ] Protected route middleware

#### 1.3 Browse & Search (Day 3-4)
- [ ] Product grid with filters
- [ ] Search functionality
- [ ] Category navigation
- [ ] Price range filtering
- [ ] Condition filtering
- [ ] Infinite scroll pagination

#### 1.4 Product Details (Day 5)
- [ ] Product detail page
- [ ] Image gallery with zoom
- [ ] Seller information
- [ ] Size/condition display
- [ ] Add to cart functionality
- [ ] Like/wishlist feature

### Phase 2: E-commerce Features (Week 2)
**Goal**: Complete marketplace functionality

#### 2.1 User Profiles (Day 6-7)
- [ ] Profile page layout
- [ ] Edit profile functionality
- [ ] Profile settings
- [ ] Address management
- [ ] Payment methods

#### 2.2 Listing Management (Day 8-9)
- [ ] Create listing form
- [ ] Multi-step wizard
- [ ] Image upload with compression
- [ ] Category selection
- [ ] Price & shipping options
- [ ] Draft/publish functionality

#### 2.3 Shopping Cart & Checkout (Day 10-11)
- [ ] Cart management
- [ ] Checkout flow
- [ ] Stripe integration
- [ ] Order confirmation
- [ ] Email notifications

#### 2.4 Order Management (Day 12)
- [ ] Order history
- [ ] Order tracking
- [ ] Refund requests
- [ ] Order status updates

### Phase 3: Advanced Features (Week 3)
**Goal**: Production-ready platform

#### 3.1 Messaging System
- [ ] Conversation list
- [ ] Real-time messaging
- [ ] Notification system
- [ ] Unread indicators

#### 3.2 Reviews & Ratings
- [ ] Review submission
- [ ] Star ratings
- [ ] Review display
- [ ] Seller ratings

#### 3.3 Admin Dashboard
- [ ] User management
- [ ] Listing moderation
- [ ] Analytics dashboard
- [ ] Payment management

#### 3.4 Performance & Polish
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Error monitoring (Sentry)
- [ ] Production deployment

## Component Architecture

### UI Component Library (shadcn/ui)
```
/lib/components/ui/
├── primitives/        # Base shadcn components
│   ├── button.svelte
│   ├── input.svelte
│   ├── dialog.svelte
│   └── sheet.svelte
├── composed/          # Complex components
│   ├── data-table/
│   ├── form/
│   └── combobox/
└── index.ts          # Centralized exports
```

### Feature Components
```
/lib/components/
├── auth/             # Authentication components
├── marketplace/      # Product cards, grids
├── checkout/         # Cart, payment forms
├── messaging/        # Chat components
└── admin/           # Admin-specific UI
```

## Database Schema (Existing)
- `profiles` - User profiles
- `listings` - Product listings
- `orders` - Order management
- `messages` - Messaging system
- `reviews` - Ratings and reviews
- `categories` - Product categories
- `brands` - Brand accounts

## API Routes Pattern
```typescript
// Always use this pattern for API routes
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Validate auth
    const session = await locals.getSession();
    if (!session) throw error(401, 'Unauthorized');
    
    // Fetch data
    const { data, error: dbError } = await supabase
      .from('table')
      .select('*');
    
    if (dbError) throw error(500, dbError.message);
    
    return json(data);
  } catch (err) {
    console.error('API Error:', err);
    throw error(500, 'Internal Server Error');
  }
};
```

## State Management Pattern
```typescript
// Use class-based stores with Svelte 5 runes
class AppStore {
  user = $state<User | null>(null);
  cart = $state<CartItem[]>([]);
  
  get cartTotal() {
    return $derived(
      this.cart.reduce((sum, item) => sum + item.price, 0)
    );
  }
  
  addToCart(item: CartItem) {
    this.cart = [...this.cart, item];
  }
  
  clearCart() {
    this.cart = [];
  }
}

export const appStore = new AppStore();
```

## Error Prevention Checklist

### Before Every Commit
1. [ ] Run `pnpm run check` - MUST pass with 0 errors
2. [ ] Run `pnpm run lint` - Fix all warnings
3. [ ] Test in browser - No console errors
4. [ ] Check mobile responsiveness
5. [ ] Verify Svelte 5 syntax only

### Code Review Standards
- No `on:event` handlers (use `onevent`)
- No `export let` (use `$props()`)
- No `<slot>` (use `{@render children()}`)
- All async operations have error handling
- All forms have validation
- All API calls have loading states

## Testing Strategy
```bash
# Type checking
pnpm run check

# Linting
pnpm run lint

# Build test
pnpm run build

# Preview production build
pnpm run preview
```

## Deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Supabase connection verified
- [ ] Stripe keys configured
- [ ] Error monitoring enabled
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Security headers configured

## Common Pitfalls to Avoid

### From Old Project Analysis
1. **Mixed Syntax**: NEVER mix Svelte 4 and 5 patterns
2. **Component Duplication**: Check existing components first
3. **Missing Error Handling**: Always wrap async operations
4. **Type Errors**: Fix immediately, don't ignore
5. **Performance Issues**: Use lazy loading and code splitting
6. **State Management**: Use Svelte 5 runes consistently

### Prevention Strategies
- Use TypeScript strictly
- Follow established patterns
- Test incrementally
- Document decisions
- Review before committing

## Success Metrics
- [ ] 0 TypeScript errors
- [ ] 0 Console warnings in production
- [ ] < 3s initial page load
- [ ] 100% mobile responsive
- [ ] All critical paths tested
- [ ] Proper error boundaries
- [ ] Graceful fallbacks

## Resources
- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [SvelteKit 2 Docs](https://kit.svelte.dev/docs)
- [shadcn/ui for Svelte](https://www.shadcn-svelte.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## Next Steps
1. Fix immediate TypeScript errors
2. Add shadcn/ui configuration
3. Begin Phase 1 implementation
4. Maintain zero-error policy throughout

---

**Remember**: Quality over speed. Better to build slowly with zero errors than rush and accumulate technical debt.