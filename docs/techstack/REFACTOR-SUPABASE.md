# SUPABASE REFACTOR TASKLIST - EMERGENCY ACTION REQUIRED

**Generated From:** SUPABASE.md audit (2025-08-04)  
**Current Grade:** C- (Functional but major security issues)  
**Target Grade:** A (Production-ready, secure, optimized)

## 🚨 CRITICAL EMERGENCY TASKS (DO IMMEDIATELY)

### Task 1: [EMERGENCY] Revoke and Regenerate All Supabase Keys
**Priority:** CRITICAL - SECURITY BREACH  
**Files:** `.env`, `.env.example`, Supabase Dashboard  
**Impact:** Prevents unauthorized admin access to database  

**Steps:**
1. Go to Supabase Dashboard > Settings > API
2. Click "Regenerate" for ANON key
3. Click "Regenerate" for SERVICE ROLE key  
4. Update local `.env` file with new keys
5. Verify `.env` is in `.gitignore`
6. Remove `.env` from git history if committed

**Commands:**
```bash
# Check if .env is tracked
git status

# If .env appears in git status, add to .gitignore immediately
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore - security fix"

# If .env was already committed, remove from history
git rm --cached .env
git commit -m "Remove .env from repository - security fix"
```

**Verification:**
- ☐ New keys generated in Supabase Dashboard
- ☐ Local `.env` updated with new keys
- ☐ `.env` file not visible in `git status`
- ☐ App still connects to Supabase correctly

---

### Task 2: [EMERGENCY] Clean Up Duplicate Client Patterns
**Priority:** CRITICAL - ARCHITECTURAL CONFUSION  
**Files:** `src/lib/supabase.ts`, `src/lib/supabase/client.ts`, All service files  
**Impact:** Fixes inconsistent auth handling and client initialization  

**Steps:**
1. Delete the legacy client file: `src/lib/supabase.ts`
2. Update all service imports to use SSR pattern
3. Ensure all files import from `src/lib/supabase/client.ts`

**Commands:**
```bash
# Remove legacy client file
rm src/lib/supabase.ts

# Find all files importing the old client
grep -r "from.*lib/supabase'" src/
grep -r "from.*lib/supabase\"" src/

# Update imports (manual step - see files affected)
```

**Files to Update:**
- `src/lib/services/categoryService.ts`
- `src/lib/services/favoriteService.ts`  
- `src/lib/services/productService.ts`
- `src/lib/services/userService.ts`
- Any other files importing old supabase client

**Change imports from:**
```typescript
import { supabase } from '$lib/supabase';
```
**To:**
```typescript
import { createClient } from '$lib/supabase/client';
const supabase = createClient();
```

**Verification:**
- ☐ `src/lib/supabase.ts` file deleted
- ☐ All service files use new import pattern
- ☐ `pnpm run check` passes with 0 errors
- ☐ App authentication still works

---

### Task 3: [EMERGENCY] Update Database Type Definitions
**Priority:** CRITICAL - TYPE SAFETY  
**Files:** `src/lib/types/`, Generated types from Supabase  
**Impact:** Ensures type safety matches actual database schema  

**Steps:**
1. Generate fresh types from Supabase CLI
2. Replace old type definitions
3. Fix any type mismatches in service files

**Commands:**
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (use project ref from dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Generate new types
supabase gen types typescript --local > src/lib/types/database.types.ts
```

**Manual Steps:**
1. Compare new generated types with existing `src/app.d.ts`
2. Update Database interface in `src/app.d.ts`
3. Fix any breaking changes in service files
4. Remove old `src/lib/types/db.ts` if it exists

**Verification:**
- ☐ New types generated successfully
- ☐ `src/app.d.ts` updated with latest Database interface
- ☐ All service files compile without type errors
- ☐ `pnpm run check` passes

---

## 🔥 URGENT SECURITY FIXES (THIS WEEK)

### Task 4: Implement Proper Row Level Security (RLS)
**Priority:** HIGH - SECURITY  
**Files:** Database migrations, Service files  
**Impact:** Ensures users can only access their own data  

**Steps:**
1. Verify RLS is enabled on all tables
2. Test RLS policies work correctly
3. Add server-side operations for sensitive data

**Commands:**
```bash
# Check RLS status in Supabase Dashboard
# Go to Database > Tables > Select each table > Settings
# Verify "Enable Row Level Security" is checked
```

**Tables to Verify RLS:**
- ☐ `profiles` table
- ☐ `products` table  
- ☐ `listings` table
- ☐ `conversations` table
- ☐ `reviews` table
- ☐ `categories` table

**Test Commands:**
1. Create test user account
2. Try to access another user's data
3. Verify access is denied

**Verification:**
- ☐ All tables have RLS enabled
- ☐ RLS policies tested and working
- ☐ Users cannot access other users' data

---

### Task 5: Remove Fake Data and Implement Real Queries
**Priority:** HIGH - DATA INTEGRITY  
**Files:** `src/lib/services/productService.ts`, Related service files  
**Impact:** Replaces hardcoded fake data with real database joins  

**Current Issue:**
```typescript
// BAD: Fake seller data
seller: {
  name: 'Seller',          // HARDCODED
  rating: 4.5,             // FAKE DATA  
  verified: true           // LIES
}
```

**Steps:**
1. Create proper database joins for seller data
2. Remove all hardcoded values
3. Add proper error handling for missing data

**Implementation:**
```typescript
// GOOD: Real seller data with joins
.select(`
  *,
  profiles!products_seller_id_fkey (
    id,
    full_name,
    avatar_url,
    verified,
    rating
  )
`)
```

**Files to Fix:**
- `src/lib/services/productService.ts` - Remove fake seller data
- `src/lib/services/userService.ts` - Add real profile queries
- Any other files with hardcoded data

**Verification:**
- ☐ No hardcoded fake data remaining
- ☐ Real seller data displayed
- ☐ Proper error handling for missing profiles
- ☐ All joins working correctly

---

### Task 6: Fix Table Name Consistency  
**Priority:** MEDIUM - DATA MODEL  
**Files:** Database, Service files, Type definitions  
**Impact:** Resolves confusion between 'products' and 'listings' tables  

**Current Issue:**
- Types reference `products` table
- Services sometimes query `listings` table
- Inconsistent naming causing confusion

**Steps:**
1. Decide on single table name (recommend `products`)
2. Update all queries to use consistent table name
3. Update database migrations if needed
4. Regenerate types

**Commands:**
```bash
# Search for inconsistent table names
grep -r "listings" src/
grep -r "products" src/

# Update queries to use consistent naming
```

**Verification:**
- ☐ Single table name used throughout app
- ☐ All queries updated
- ☐ Types match actual table names
- ☐ No broken queries

---

## 📈 IMPORTANT IMPROVEMENTS (NEXT WEEK)

### Task 7: Implement Proper Storage Management
**Priority:** MEDIUM - FEATURE COMPLETENESS  
**Files:** Storage service files, Upload components  
**Impact:** Adds proper image upload with error handling and optimization  

**Current Issues:**
- Hardcoded 'avatars' bucket
- No error handling for storage limits
- No image optimization
- No CDN configuration

**Steps:**
1. Create comprehensive storage service
2. Add proper error handling
3. Implement image optimization
4. Configure CDN settings

**Implementation Files:**
- Create `src/lib/services/storageService.ts`
- Update upload components with proper error handling
- Add image resizing/optimization

**Verification:**
- ☐ Image uploads work reliably  
- ☐ Proper error messages for failures
- ☐ Images optimized for web
- ☐ CDN delivering images

---

### Task 8: Add Real-time Features
**Priority:** MEDIUM - USER EXPERIENCE  
**Files:** Message components, Product listing components  
**Impact:** Adds live updates for marketplace interactions  

**Features to Implement:**
1. Real-time messaging
2. Live product listing updates
3. User presence indicators

**Steps:**
1. Add Supabase real-time subscriptions
2. Update UI components to handle live data
3. Implement proper cleanup on unmount

**Files to Create/Update:**
- `src/lib/stores/realtime.ts` - Real-time store
- Message components - Add subscriptions
- Product listing - Live updates

**Verification:**
- ☐ Messages appear instantly
- ☐ Product listings update live
- ☐ No memory leaks from subscriptions

---

### Task 9: Optimize Database Queries
**Priority:** MEDIUM - PERFORMANCE  
**Files:** All service files  
**Impact:** Improves app performance and reduces database load  

**Current Issues:**
- No specific column selection
- No pagination limits  
- No caching strategies
- All searches client-side

**Steps:**
1. Add specific column selection to queries
2. Implement pagination
3. Add server-side filtering
4. Consider query caching

**Query Optimization Examples:**
```typescript
// BAD: Select all columns
.select('*')

// GOOD: Select specific columns
.select('id, title, price, image_url, created_at')

// GOOD: Add pagination
.range(start, end)

// GOOD: Server-side filtering
.ilike('title', `%${searchTerm}%`)
```

**Verification:**
- ☐ Queries select only needed columns
- ☐ Pagination implemented
- ☐ Server-side search working
- ☐ Performance improved measurably

---

### Task 10: Migrate to Svelte 5 State Management
**Priority:** LOW - MODERNIZATION  
**Files:** `src/lib/stores/auth.ts`, Related store files  
**Impact:** Uses latest Svelte 5 patterns for state management  

**Current Issue:**
```typescript
// OLD: Svelte 4 writable stores
import { writable } from 'svelte/store';
export const user = writable(null);
```

**Target:**
```typescript  
// NEW: Svelte 5 $state runes
let user = $state(null);
```

**Steps:**
1. Convert auth store to use $state
2. Update components using the store
3. Test reactivity still works

**Files to Update:**
- `src/lib/stores/auth.ts`
- Components importing auth store

**Verification:**
- ☐ Auth store uses Svelte 5 syntax
- ☐ Reactivity still works
- ☐ Components updated accordingly

---

## 🔍 VERIFICATION CHECKLIST

After completing all tasks, verify the following:

### Security ✅
- ☐ No credentials in repository
- ☐ New Supabase keys generated and secure
- ☐ RLS enabled and tested on all tables
- ☐ Service role key not exposed

### Architecture ✅  
- ☐ Single client pattern used consistently
- ☐ Proper SSR implementation maintained
- ☐ Type safety with updated definitions
- ☐ No duplicate code or patterns

### Data Integrity ✅
- ☐ No fake/hardcoded data
- ☐ Real database joins working
- ☐ Consistent table naming
- ☐ Proper error handling

### Performance ✅
- ☐ Optimized database queries
- ☐ Pagination implemented
- ☐ Server-side filtering
- ☐ Storage properly configured

### Features ✅
- ☐ Real-time updates working
- ☐ Image upload/storage functional
- ☐ All core features tested
- ☐ Proper monitoring in place

### Code Quality ✅
- ☐ TypeScript errors: 0
- ☐ Build succeeds: `pnpm run build`
- ☐ Type check passes: `pnpm run check`
- ☐ Svelte 5 patterns used where applicable

---

## 🎯 EXPECTED OUTCOMES

After completing this refactor:

**Security Grade:** F → A  
**Architecture Grade:** D+ → A-  
**Feature Usage:** 60% → 85%  
**Overall Grade:** C- → A-

**Key Improvements:**
- Zero security vulnerabilities
- Consistent, maintainable architecture  
- Real data throughout the application
- Modern Svelte 5 patterns
- Optimized performance
- Production-ready codebase

---

## 🚀 EXECUTION STRATEGY

**Week 1 - EMERGENCY FIXES:**
- Tasks 1-3 (Security critical)
- Daily progress updates

**Week 2 - SECURITY & DATA:**  
- Tasks 4-6 (RLS, fake data, consistency)
- Testing and validation

**Week 3 - FEATURES & OPTIMIZATION:**
- Tasks 7-10 (Storage, real-time, performance)
- Final verification checklist

**SUCCESS CRITERIA:** All tasks completed, verification checklist passed, grade improved to A-

---

**REMEMBER:** This is a comprehensive refactor that will take the Supabase implementation from "functional but amateur" to "production-ready and professional". Start with the emergency tasks immediately - they are security critical.