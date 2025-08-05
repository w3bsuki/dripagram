# Instructions for New Claude Instance 🚀

## Project Status: Ready for Development

**Location:** `K:\driplo.bg-main\driplo-fresh\`  
**Status:** ✅ Fresh SvelteKit 2 + Svelte 5 project ready  
**Database:** ✅ Connected to existing Supabase instance  
**Dependencies:** ✅ All dev tools and core packages installed  

---

## Quick Start

```bash
cd K:\driplo.bg-main\driplo-fresh
pnpm run dev
# Project will start on http://localhost:3003
```

## What's Already Set Up ✅

### Core Technologies
- **SvelteKit 2** with **Svelte 5.37.2** (latest)
- **TypeScript** in strict mode
- **Tailwind CSS v4** with direct Vite integration
- **pnpm** for fast package management

### Development Tools
- ✅ **ESLint** + **Prettier** (code quality)
- ✅ **Vitest** (unit testing)
- ✅ **Playwright** (e2e testing)
- ✅ **TypeScript** (type safety)

### Core Dependencies
- ✅ **Supabase** (@supabase/supabase-js, @supabase/ssr)
- ✅ **Stripe** (@stripe/stripe-js, stripe)
- ✅ **UI Components** (bits-ui, lucide-svelte)
- ✅ **Forms** (zod, sveltekit-superforms)
- ✅ **State** (@tanstack/svelte-query)
- ✅ **Styling** (class-variance-authority, clsx, tailwind-merge)
- ✅ **Utils** (date-fns, uuid, @fontsource-variable/inter)

### Migrated Assets
- ✅ **Database Types** (`src/lib/types/db.ts`) - Complete TypeScript definitions
- ✅ **UI Components** (`src/lib/components/ui/`) - Working Svelte 5 components
- ✅ **Database Migrations** (`supabase/migrations/`) - All schema definitions
- ✅ **Configuration** (tailwind.config.js, vite.config.ts, .env template)

---

## Your Mission

Build a **production-ready fashion marketplace** following these documents:

1. **FRESH-START-PRD.md** - Complete product requirements
2. **UI-UX-GUIDE.md** - Design system specifications  
3. **VISUAL-REFERENCE-PACKAGE.md** - Implementation guide
4. **CLAUDE-PROMPT-GUIDE.md** - Step-by-step instructions

## Development Priority Order

### Phase 1: Foundation (Week 1)
1. ✅ Project setup (DONE)
2. **Authentication system** (register/login/logout)
3. **Basic homepage** with search bar
4. **User profiles** (public view)
5. **Product listing creation** form

### Phase 2: Core Features (Week 2)  
6. **Browse/search listings** page
7. **Individual listing** detail pages
8. **Shopping cart** + checkout flow
9. **Stripe payment** integration
10. **Order management** system

### Phase 3: Advanced (Week 3)
11. **User messaging** system
12. **User settings** and profile editing
13. **Wishlist/favorites**
14. **Reviews and ratings**
15. **Basic admin** functionality

### Phase 4: Production (Week 4)
16. **Brand verification** system
17. **Advanced search/filters**  
18. **Performance optimization**
19. **Mobile responsive polish**
20. **Production deployment**

---

## Critical Requirements ⚠️

### Svelte 5 Syntax (MANDATORY)
```svelte
<!-- ✅ CORRECT Svelte 5 -->
<script lang="ts">
  let { title, price }: { title: string; price: number } = $props()
  let loading = $state(false)
  
  function handleClick() {
    // event handler
  }
</script>

<button onclick={handleClick}>
  {@render children()}
</button>

<!-- ❌ NEVER USE Svelte 4 -->
<script>
  export let title  // NO
  let loading = false  // NO
  
  $: computed = something  // NO
</script>

<button on:click={handleClick}>  <!-- NO -->
  <slot />  <!-- NO -->
</button>
```

### Database Connection
- **URL:** Use existing Supabase instance (credentials in .env)
- **Types:** Already imported (`src/lib/types/db.ts`)
- **Migrations:** Already copied (`supabase/migrations/`)
- **RLS:** All policies already implemented

### Design System
- **Colors:** Black primary (#000000), white background (#ffffff)
- **Font:** Inter Variable (already imported)
- **UI:** Clean, minimal, professional (like Airbnb/Stripe)
- **Mobile:** Mobile-first responsive design
- **Inspiration:** Grailed.com, Vinted.com, Depop.com

---

## Available Commands

```bash
# Development
pnpm run dev          # Start dev server
pnpm run check        # TypeScript validation
pnpm run build        # Production build

# Testing  
pnpm run test         # Unit tests (Vitest)
pnpm run test:e2e     # E2E tests (Playwright)

# Code Quality
pnpm run lint         # ESLint
pnpm run format       # Prettier
```

---

## Working Component Examples

The following components are **already working** with Svelte 5 syntax:

```
src/lib/components/ui/
├── button.svelte          ✅ Use as reference
├── card/                  ✅ Use as reference
├── input.svelte           ✅ Use as reference  
├── modal.svelte           ✅ Use as reference
├── badge.svelte           ✅ Use as reference
└── avatar/                ✅ Use as reference
```

Use these as patterns for building new components.

---

## Success Criteria

### Week 1 Complete When:
- [ ] User can register/login/logout
- [ ] Homepage loads with search bar
- [ ] Can create product listings
- [ ] Basic navigation works
- [ ] Mobile responsive

### Week 2 Complete When:
- [ ] Can browse and search products
- [ ] Checkout flow works with Stripe
- [ ] Orders are created and tracked
- [ ] User profiles display correctly
- [ ] Core user journeys work

### Week 3 Complete When:
- [ ] Users can message each other
- [ ] Wishlist/favorites work
- [ ] Reviews and ratings system
- [ ] Admin can manage users/content
- [ ] Performance optimized

### Week 4 Complete When:
- [ ] Brand verification complete
- [ ] Advanced filters work
- [ ] Mobile app-like experience
- [ ] Production deployment ready
- [ ] All features tested and working

---

## Database Schema Overview

The database includes all marketplace features:

- **profiles** - User accounts (personal + brand)
- **listings** - Product listings
- **categories** - Product organization
- **transactions** - Payment processing
- **orders** - Order management  
- **messages/conversations** - User chat
- **favorites** - Wishlist system
- **user_ratings** - Review system
- **brand_verification_requests** - Brand approval
- **admin_approvals** - Content moderation

All tables have RLS policies and proper indexes.

---

## Environment Variables

Your `.env` file is ready. You need to add:

```bash
# Supabase (get from original project)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (get from original project)
STRIPE_SECRET_KEY=your_stripe_secret
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# Other (optional)
RESEND_API_KEY=your_resend_key
PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_key
```

---

## Next Steps

1. **Read all documentation files** in `docs/`
2. **Set up environment variables** in `.env`
3. **Start with authentication** (register/login pages)
4. **Follow the phase-by-phase plan**
5. **Test each feature thoroughly** before moving on
6. **Ask for clarification** if anything is unclear

**Remember:** This needs to be production-ready for real users making real purchases. Quality is critical.

**Good luck!** 🚀