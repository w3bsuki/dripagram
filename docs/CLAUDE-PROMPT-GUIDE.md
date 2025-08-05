# Complete Prompt Guide for New Claude Instance 🎯

## Initial Setup Prompt

```
I need you to build a complete fashion marketplace called "Driplo" from scratch using SvelteKit 2 + Svelte 5. This is a C2C (consumer-to-consumer) clothing marketplace like Grailed, Vinted, and Depop.

I have 3 reference documents:
1. FRESH-START-PRD.md - Complete product requirements 
2. UI-UX-GUIDE.md - Design system and visual specifications
3. VISUAL-REFERENCE-PACKAGE.md - Implementation guide and references

CRITICAL REQUIREMENTS:
- Use ONLY Svelte 5 syntax (onclick, $props(), $state(), $derived(), {@render children()})
- Never use Svelte 4 patterns (on:click, export let, $:, <slot>)
- Connect to existing Supabase database (I'll provide credentials)
- Build for production launch - this needs to work perfectly
- Focus on core C2C marketplace features first

START BY:
1. Reading all 3 reference documents thoroughly
2. Creating a clean SvelteKit 2 project 
3. Setting up the basic project structure
4. Asking me for the Supabase credentials
5. Building core features in this priority order

Let me know when you've read the documents and are ready to start.
```

## Priority Order Prompt

```
Build features in this exact order:

PHASE 1 (CRITICAL - Week 1):
1. Project setup + Supabase connection
2. User authentication (register/login/logout)
3. Basic homepage with search bar
4. Product listing creation form
5. Browse/search listings page
6. Individual listing detail pages
7. User profiles (public view)

PHASE 2 (CORE - Week 2):
8. Shopping cart + checkout flow
9. Stripe payment integration
10. Order management system
11. Basic messaging between users
12. User settings/profile editing
13. Basic admin functionality

PHASE 3 (POLISH - Week 3):
14. Advanced search/filters
15. Wishlist/favorites
16. Reviews and ratings
17. Image optimization
18. Mobile responsive polish
19. Performance optimization
20. Production deployment

ONLY move to the next phase when current phase is 100% working.
Test each feature thoroughly before proceeding.
```

## Technical Requirements Prompt

```
STRICT TECHNICAL REQUIREMENTS:

Svelte 5 Syntax (REQUIRED):
✅ onclick (NOT on:click)
✅ $props() (NOT export let)
✅ $state() for reactive variables
✅ $derived() for computed values  
✅ {@render children()} (NOT <slot>)

Database:
✅ Use existing Supabase instance (I'll provide credentials)
✅ All queries must use Row Level Security (RLS)
✅ Handle errors gracefully with try/catch
✅ Use TypeScript types for all data

Styling:
✅ Tailwind CSS v4 only
✅ Mobile-first responsive design
✅ Follow the exact color scheme in UI-UX-GUIDE.md
✅ Use Inter font family
✅ Match the component patterns specified

Code Quality:
✅ TypeScript strict mode
✅ Zero TypeScript errors allowed
✅ Proper error handling everywhere
✅ Loading states for all async operations
✅ Accessibility compliance (ARIA labels, keyboard nav)

Performance:
✅ Lazy loading for images
✅ Code splitting for large components  
✅ Optimized bundle size
✅ Web Vitals compliance
```

## Design Requirements Prompt

```
VISUAL DESIGN REQUIREMENTS:

Study these C2C marketplaces for inspiration:
- Grailed.com (premium streetwear marketplace)
- Vinted.com (European fashion leader)
- Depop.com (mobile-first Gen-Z platform)
- Poshmark.com (social commerce)

Key Design Principles:
✅ Clean, minimal, professional (like Airbnb)
✅ Photo-heavy product focus (like Instagram)
✅ Trust indicators everywhere (ratings, badges, verification)
✅ Mobile-first design (thumb-friendly navigation)
✅ Clear information hierarchy
✅ Strong visual contrast for readability

Color Scheme (EXACT):
- Primary: #000000 (black)
- Background: #ffffff (white)  
- Secondary: #f5f5f5 (light gray)
- Accent: #3b82f6 (blue)
- Text: #000000 / #64748b (black/gray)

Typography:
- Font: Inter Variable
- Sizes: Follow Tailwind scale
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

Component Style:
- Rounded corners: 6-8px
- Subtle shadows on hover
- Clean borders: 1px #e2e8f0
- Generous spacing/padding
- Consistent button styles
```

## Feature-Specific Prompts

### Authentication Prompt
```
Build authentication system:

PAGES NEEDED:
- /login - Clean login form
- /register - Registration with email verification
- /forgot-password - Password reset flow

FEATURES:
✅ Email/password authentication via Supabase Auth
✅ Email verification required
✅ Password strength validation
✅ Remember me functionality
✅ Redirect to profile setup after first login
✅ Proper error handling and loading states

UI REQUIREMENTS:
✅ Center-aligned forms with max-width
✅ Clean input fields with labels
✅ Primary button for submit actions
✅ Link to switch between login/register
✅ Show loading spinners during submission
✅ Display clear error messages

Make it look professional and trustworthy like Stripe's auth pages.
```

### Product Listings Prompt  
```
Build product listing system:

LISTING CREATION (/sell):
✅ Multi-step form with progress indicator
✅ Image upload (up to 8 images) with drag & drop
✅ Product details: title, description, price, category, size, condition, brand
✅ Preview before publishing
✅ Save as draft functionality
✅ Image optimization and resizing

BROWSE PAGE (/browse):
✅ Responsive product grid (2 cols mobile, 4+ desktop)
✅ Sidebar filters (categories, price, size, condition, brand)
✅ Sort options (newest, price low/high, popularity)
✅ Infinite scroll or pagination
✅ Search bar with real-time filtering

PRODUCT CARDS:
✅ 4:5 aspect ratio images
✅ Price prominently displayed
✅ Seller username with avatar
✅ Like/heart button
✅ Quick view on hover (desktop)
✅ Condition badge
✅ Clean hover effects

LISTING DETAIL (/listings/[id]):
✅ Image carousel with thumbnails
✅ Product info and description
✅ Seller profile sidebar
✅ "Buy Now" and "Make Offer" buttons
✅ Size guide and shipping info
✅ Related items section

Copy the exact layout and feel from Grailed.com product pages.
```

### Checkout & Payments Prompt
```
Build checkout and payment system:

CHECKOUT FLOW:
✅ Add to cart functionality
✅ Shopping cart page with item management
✅ Guest checkout option (with account creation)
✅ Shipping address form
✅ Payment method selection

STRIPE INTEGRATION:
✅ Stripe Elements for card input
✅ Payment intent creation
✅ 3D Secure support
✅ Webhook handling for order updates
✅ Error handling for failed payments

ORDER MANAGEMENT:
✅ Order confirmation page
✅ Email confirmations
✅ Order tracking for buyers
✅ Order fulfillment for sellers
✅ Refund processing

SECURITY:
✅ All payments server-side only
✅ Never expose Stripe secret keys
✅ Validate all inputs
✅ Rate limit payment attempts

Make the checkout feel as smooth and trustworthy as Stripe's own checkout.
```

## Testing & Quality Prompts

```
TESTING REQUIREMENTS:

After each major feature, test these user journeys:
✅ New user registration → email verification → profile setup
✅ Create listing → upload images → publish → view on browse page
✅ Search for item → view details → add to cart → checkout → payment
✅ Seller receives order → marks as shipped → buyer confirms delivery
✅ User-to-user messaging → make offer → accept/decline

QUALITY CHECKLIST:
✅ pnpm run build succeeds with 0 errors
✅ pnpm run check passes (0 TypeScript errors)
✅ All pages load in <3 seconds
✅ Mobile responsive on iPhone/Android
✅ Accessible with keyboard navigation
✅ Works with JavaScript disabled (where possible)
✅ Images load properly and are optimized
✅ Forms validate properly with good error messages

Don't consider any feature "done" until it passes all these tests.
```

## Deployment Prompt

```
PRODUCTION DEPLOYMENT:

Environment Setup:
✅ Vercel deployment with SvelteKit adapter
✅ Environment variables properly configured
✅ Custom domain setup (if needed)
✅ SSL/HTTPS enforced

Performance:
✅ Bundle analysis to check size
✅ Image optimization enabled  
✅ Lazy loading implemented
✅ Web Vitals scores >90

Security:
✅ All Supabase RLS policies tested
✅ No sensitive data in client-side code
✅ CSRF protection enabled
✅ Rate limiting on API routes

Monitoring:
✅ Basic error tracking (Sentry integration)
✅ Health check endpoints
✅ Database connection monitoring

Only deploy when ALL core features work perfectly.
```

## Communication Guidelines

```
COMMUNICATION STYLE:

✅ Ask specific questions when requirements are unclear
✅ Show me code snippets for complex components
✅ Update me on progress at each phase
✅ Flag any issues or blockers immediately
✅ Suggest improvements but prioritize core functionality
✅ Test thoroughly before saying something is "done"

❌ Don't assume requirements - ask for clarification
❌ Don't skip testing steps
❌ Don't move to next phase until current is perfect
❌ Don't add extra features without asking
❌ Don't use Svelte 4 syntax ever

Remember: This needs to be production-ready for real users making real purchases. Quality is critical.
```

---

## Complete Prompt Package

Give the new Claude:
1. **This prompt guide** (CLAUDE-PROMPT-GUIDE.md)
2. **FRESH-START-PRD.md** (requirements)  
3. **UI-UX-GUIDE.md** (design system)
4. **VISUAL-REFERENCE-PACKAGE.md** (visual specs)

This should give them everything needed to build a production-ready Driplo from scratch!