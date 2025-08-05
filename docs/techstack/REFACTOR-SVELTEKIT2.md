# SvelteKit 2 - Minor Improvements Refactor Tasks

## 🎯 Overview
Based on the SVELTEKIT2.md audit (Grade A, 90/100), this refactor addresses the missing components and optimizations to achieve A+ grade (95+/100).

**Target Areas:**
- Adding +error.svelte pages for better error handling
- Implementing page options for performance optimization
- Creating error boundary templates
- Performance improvements with selective rendering

**Estimated Impact:** +5-10 points, bringing total score to A+ (95-100/100)

---

## 📋 Task List

### Priority 1: Error Pages Implementation

#### Task 1.1: Root Error Page
**Route:** `/` (root)
**File:** `src/routes/+error.svelte`

**Template Code:**
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  let { message = 'Something went wrong' } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-red-600 mb-4">{$page.status}</h1>
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Oops! {message}</h2>
    <p class="text-gray-600 mb-8">
      {#if $page.status === 404}
        The page you're looking for doesn't exist.
      {:else if $page.status === 500}
        We're experiencing technical difficulties.
      {:else}
        An unexpected error occurred.
      {/if}
    </p>
    <div class="space-x-4">
      <a 
        href="/" 
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Go Home
      </a>
      <button 
        onclick={() => window.history.back()} 
        class="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
</div>
```

**Testing:** Navigate to non-existent route, verify error page displays correctly

---

#### Task 1.2: Auth Error Page
**Route:** `/auth/*` (authentication routes)
**File:** `src/routes/auth/+error.svelte`

**Template Code:**
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  let { message = 'Authentication error' } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full text-center">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
      <p class="text-gray-600 mb-6">
        {#if $page.status === 401}
          You need to sign in to access this page.
        {:else if $page.status === 403}
          You don't have permission to access this resource.
        {:else}
          {message}
        {/if}
      </p>
      
      <div class="space-y-3">
        <a 
          href="/auth/login" 
          class="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Sign In
        </a>
        <a 
          href="/" 
          class="block w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
</div>
```

**Testing:** Try accessing protected routes while logged out, verify auth error displays

---

#### Task 1.3: Products Error Page
**Route:** `/products/*` (product routes)
**File:** `src/routes/products/+error.svelte`

**Template Code:**
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  let { message = 'Product not found' } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-lg w-full text-center">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Product {$page.status === 404 ? 'Not Found' : 'Error'}</h1>
      <p class="text-gray-600 mb-8">
        {#if $page.status === 404}
          This product might have been sold or removed from our marketplace.
        {:else}
          We're having trouble loading this product right now.
        {/if}
      </p>
      
      <div class="space-y-3">
        <a 
          href="/browse" 
          class="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors"
        >
          Browse All Products
        </a>
        <a 
          href="/" 
          class="block w-full border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
</div>
```

**Testing:** Navigate to invalid product ID, verify product-specific error displays

---

#### Task 1.4: Cart/Checkout Error Page
**Route:** `/cart` and `/checkout`
**File:** `src/routes/cart/+error.svelte` and `src/routes/checkout/+error.svelte`

**Template Code (same for both):**
```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  let { message = 'Shopping error' } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full text-center">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
        </svg>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Shopping Error</h1>
      <p class="text-gray-600 mb-6">
        We encountered an issue processing your request. Your cart items are safe.
      </p>
      
      <div class="space-y-3">
        <a 
          href="/cart" 
          class="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          View Cart
        </a>
        <a 
          href="/browse" 
          class="block w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  </div>
</div>
```

**Testing:** Simulate cart/checkout errors, verify appropriate error handling

---

### Priority 2: Page Options Configuration

#### Task 2.1: Static Pages - Enable Prerendering
**Routes:** Homepage, category pages (men, women, kids)

**Files to modify:**
- `src/routes/+page.ts` (create if doesn't exist)
- `src/routes/men/+page.ts`
- `src/routes/women/+page.ts` 
- `src/routes/kids/+page.ts`

**Template Code:**
```typescript
// Static content pages - optimal for SEO and performance
export const prerender = true;  // Pre-render at build time
export const ssr = true;        // Server-side rendering
export const csr = true;        // Client-side routing
```

**Testing:** Build project, verify static files generated in .svelte-kit/output

---

#### Task 2.2: Dynamic Pages - Hybrid Rendering
**Routes:** Product details, user profiles

**Files to modify:**
- `src/routes/products/[id]/+page.ts`
- `src/routes/profile/+page.ts`

**Template Code:**
```typescript
// Dynamic content - hybrid rendering for best UX
export const prerender = false; // Dynamic content  
export const ssr = true;        // SER for SEO
export const csr = true;        // Client navigation
```

**Testing:** Navigate between dynamic routes, verify SSR + client navigation

---

#### Task 2.3: Client-Heavy Pages - Optimize for Interactivity
**Routes:** Cart, checkout, dashboard

**Files to modify:**
- `src/routes/cart/+page.ts`
- `src/routes/checkout/+page.ts`
- `src/routes/dashboard/+page.ts`

**Template Code:**
```typescript
// Interactive pages - prioritize client-side performance
export const prerender = false; // Dynamic cart/checkout state
export const ssr = false;       // Skip SSR for heavy client interactions  
export const csr = true;        // Full client-side rendering
```

**Testing:** Verify fast client-side interactions, check cart updates

---

#### Task 2.4: Auth Pages - Secure Configuration
**Routes:** Login, signup, logout

**Files to modify:**
- `src/routes/auth/login/+page.ts`
- `src/routes/auth/signup/+page.ts`

**Template Code:**
```typescript
// Auth pages - balance security and UX
export const prerender = false; // Never cache auth pages
export const ssr = true;        // Initial server render for forms
export const csr = true;        // Client interactions for UX
```

**Testing:** Test auth flows, verify no caching of sensitive pages

---

### Priority 3: Error Boundaries in Load Functions

#### Task 3.1: Enhanced Error Handling in Server Load Functions
**Files to modify:** All `+page.server.ts` files

**Pattern to add:**
```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  try {
    const { session, user } = await locals.safeGetSession();
    
    // Your existing logic here
    const data = await fetchData(params);
    
    if (!data) {
      error(404, 'Resource not found');
    }
    
    return { session, user, data };
  } catch (err) {
    console.error('Load function error:', err);
    error(500, 'Failed to load data');
  }
};
```

**Files to update:**
- `src/routes/+page.server.ts`
- `src/routes/profile/+page.server.ts`
- `src/routes/sell/+page.server.ts`
- `src/routes/auth/signup/+page.server.ts`

**Testing:** Simulate database errors, verify proper error page display

---

#### Task 3.2: Form Action Error Improvements
**Files to modify:** Form action files

**Enhanced pattern:**
```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const email = formData.get('email') as string;
      
      // Validation
      if (!email) {
        return fail(400, { 
          error: 'Email is required', 
          email: '' 
        });
      }
      
      if (!email.includes('@')) {
        return fail(400, { 
          error: 'Please enter a valid email', 
          email 
        });
      }
      
      // Process action
      const result = await processAction(email);
      
      if (!result.success) {
        return fail(422, { 
          error: result.message, 
          email 
        });
      }
      
      redirect(303, '/success');
    } catch (err) {
      console.error('Action error:', err);
      return fail(500, { 
        error: 'Server error occurred' 
      });
    }
  }
};
```

**Files to update:**
- `src/routes/auth/signup/+page.server.ts`
- `src/routes/sell/+page.server.ts`

**Testing:** Submit invalid forms, verify proper error display and field retention

---

### Priority 4: Performance Optimizations

#### Task 4.1: Add Route Groups for Better Organization
**Action:** Create route groups for better code organization

**New structure:**
```bash
src/routes/
├── (app)/          # Main app routes
│   ├── browse/
│   ├── cart/
│   └── checkout/
├── (auth)/         # Authentication routes  
│   ├── login/
│   ├── signup/
│   └── logout/
└── (categories)/   # Category routes
    ├── men/
    ├── women/
    └── kids/
```

**Note:** This is optional and can be done in a later refactor to avoid breaking existing routes.

---

#### Task 4.2: Add Loading States for Better UX
**Files to create:** Loading components

**Template:** `src/routes/products/[id]/+loading.svelte`
```svelte
<div class="animate-pulse p-6">
  <div class="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div class="h-64 bg-gray-200 rounded mb-4"></div>
  <div class="space-y-2">
    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
</div>
```

**Routes to add loading states:**
- `src/routes/browse/+loading.svelte`
- `src/routes/products/[id]/+loading.svelte` 
- `src/routes/profile/+loading.svelte`

**Testing:** Throttle network, verify loading states display during data fetching

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Navigate to non-existent routes → Error pages display
- [ ] Try accessing protected routes while logged out → Auth error displays
- [ ] Submit invalid forms → Form errors display with field retention
- [ ] Simulate network errors → Proper fallbacks shown
- [ ] Check build output → Static files generated for prerendered routes
- [ ] Test navigation speed → Client-side routing works smoothly

### Performance Testing
- [ ] Run `pnpm run build` → No errors
- [ ] Check bundle size → No significant increase
- [ ] Test Core Web Vitals → Improved scores for static pages
- [ ] Verify SSR/CSR behavior matches configuration

### Browser Testing
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test with JavaScript disabled → SSR pages still work
- [ ] Test with slow network → Loading states appear

---

## 📈 Expected Outcomes

**Before Refactor:**
- Grade: A (90/100)
- Missing error pages
- No page options optimization
- Basic error handling

**After Refactor:**
- Grade: A+ (95-100/100)
- Complete error boundary coverage
- Optimized rendering strategies
- Enhanced user experience
- Better performance metrics

**Estimated Time:** 4-6 hours for complete implementation

---

## 🔗 References
- [SvelteKit Error Pages](https://svelte.dev/docs/kit/routing#error)
- [Page Options](https://svelte.dev/docs/kit/page-options)
- [Loading Data](https://svelte.dev/docs/kit/load)
- [Form Actions](https://svelte.dev/docs/kit/form-actions)

**Status:** ✅ Ready for implementation
**Priority:** Medium (Quality improvement)
**Impact:** High (User experience + SEO)