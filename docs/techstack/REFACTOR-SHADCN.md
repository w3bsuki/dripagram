# SHADCN-SVELTE TO NATIVE SVELTE 5 CONVERSION TASKLIST

## 🎯 MISSION BRIEFING

**GOAL:** Convert from shadcn-svelte bloat to pure Svelte 5 components  
**STATUS:** Ready for execution  
**PRIORITY:** HIGH - Build is broken, dependencies are bloat  
**ESTIMATED TIME:** 2-3 days

---

## 📋 CONVERSION STRATEGY

### Phase 1: Core Components (Day 1)

Convert the most used components first - Button, Input, Badge, Card

### Phase 2: Complex Components (Day 2)

Convert form components, dialogs, and interactive elements

### Phase 3: Cleanup (Day 3)

Remove dependencies, update imports, verify everything works

---

## 🔥 COMPONENT CONVERSION TASKS

### TASK 1: BUTTON COMPONENT

**Priority: CRITICAL**  
**Current Location:** `src/lib/components/ui/button.svelte`  
**Dependencies:** `bits-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`  
**Usage Count:** 25+ files importing this component

#### Current Problems:

- Uses `ButtonPrimitive` from bits-ui (unnecessary abstraction)
- Uses `cva` for variants (over-engineered)
- 112 lines for a simple button
- Complex dependency chain

#### Native Svelte 5 Template:

```svelte
<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon';
		children: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		children,
		...props
	}: Props = $props();

	const variants = {
		default: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900',
		destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-600',
		outline: 'border border-gray-200 bg-white hover:bg-black hover:text-white',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
		ghost: 'hover:bg-black hover:text-white',
		link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
	};

	const sizes = {
		xs: 'h-7 px-2 text-xs',
		sm: 'h-9 px-3 text-sm',
		default: 'h-10 px-4 text-sm',
		lg: 'h-11 px-5 text-sm',
		xl: 'h-12 px-6 text-sm',
		icon: 'h-10 w-10 p-0',
	};

	const baseClasses =
		'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-100 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 rounded-sm';
</script>

<button class="{baseClasses} {variants[variant]} {sizes[size]} {className}" {...props}>
	{@render children()}
</button>
```

#### Files to Update:

- `src/routes/+page.svelte`
- `src/routes/men/+page.svelte`
- `src/routes/women/+page.svelte`
- `src/routes/sell/+page.svelte`
- `src/routes/checkout/+page.svelte`
- `src/routes/cart/+page.svelte`
- `src/routes/profile/+page.svelte`
- `src/routes/dashboard/+page.svelte`
- `src/routes/auth/login/+page.svelte`
- `src/routes/auth/signup/+page.svelte`
- `src/routes/products/[id]/+page.svelte`
- `src/lib/components/layout/Header.svelte`
- `src/lib/components/layout/Footer.svelte`
- `src/lib/components/layout/MobileBottomNav.svelte`
- `src/lib/components/marketplace/ProductCard.svelte`
- `src/lib/components/marketplace/ProductGrid.svelte`
- `src/lib/components/home/CallToAction.svelte`
- `src/lib/components/home/CategoryPills.svelte`
- `src/lib/components/home/FloatingCTA.svelte`
- `src/lib/components/home/HeroSearch.svelte`
- `src/lib/components/home/ProductFeed.svelte`
- `src/lib/components/home/SellersShowcase.svelte`
- `src/lib/components/ui/ErrorBoundary.svelte`
- `src/lib/components/ui/data-table/DataTablePagination.svelte`
- `src/lib/components/ui/alert-dialog/AlertDialogAction.svelte`
- `src/lib/components/ui/alert-dialog/AlertDialogCancel.svelte`
- `src/lib/components/ui/carousel/carousel-previous.svelte`
- `src/lib/components/ui/carousel/carousel-next.svelte`

#### Testing Approach:

1. Replace Button component with native version
2. Update all imports to use new Button
3. Test all button variants and sizes
4. Verify hover/focus states work
5. Check accessibility with screen reader

---

### TASK 2: INPUT COMPONENT

**Priority: CRITICAL**  
**Current Location:** `src/lib/components/ui/input/input.svelte`  
**Dependencies:** `cn` utility from tailwind-merge  
**Usage Count:** 10+ files importing this component

#### Current Problems:

- Over-engineered with `WithElementRef` type gymnastics
- Uses `cn` utility for class merging
- Complex type handling for file inputs
- Unnecessary abstractions

#### Native Svelte 5 Template:

```svelte
<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		error?: boolean;
	}

	let { class: className = '', error = false, ...props }: Props = $props();

	const baseClasses =
		'flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50';

	const errorClasses = error ? 'border-red-500 focus-visible:ring-red-500' : '';
</script>

<input class="{baseClasses} {errorClasses} {className}" {...props} />
```

#### Files to Update:

- `src/routes/men/+page.svelte`
- `src/routes/women/+page.svelte`
- `src/routes/sell/+page.svelte`
- `src/routes/checkout/+page.svelte`
- `src/lib/components/layout/Header.svelte`
- `src/lib/components/marketplace/ProductGrid.svelte`

#### Testing Approach:

1. Replace Input component with native version
2. Test all input types (text, email, password, file)
3. Verify error states display correctly
4. Check form validation integration
5. Test accessibility and keyboard navigation

---

### TASK 3: BADGE COMPONENT

**Priority: HIGH**  
**Current Location:** `src/lib/components/ui/badge.svelte`  
**Dependencies:** `class-variance-authority`, `clsx`  
**Usage Count:** 15+ files importing this component

#### Current Problems:

- Uses `cva` for simple variants
- Over-engineered for basic styling
- Unnecessary complexity for a span element

#### Native Svelte 5 Template:

```svelte
<!-- src/lib/components/ui/Badge.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
		children: import('svelte').Snippet;
	}

	let { variant = 'default', class: className = '', children, ...props }: Props = $props();

	const variants = {
		default: 'bg-black text-white hover:bg-gray-800',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
		destructive: 'bg-red-500 text-white hover:bg-red-600',
		outline: 'border border-gray-200 text-gray-900 bg-white',
		success: 'bg-green-500 text-white hover:bg-green-600',
		warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
	};

	const baseClasses =
		'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
</script>

<span class="{baseClasses} {variants[variant]} {className}" {...props}>
	{@render children()}
</span>
```

#### Files to Update:

- `src/routes/women/+page.svelte`
- `src/routes/men/+page.svelte`
- `src/routes/checkout/+page.svelte`
- `src/routes/cart/+page.svelte`
- `src/routes/products/[id]/+page.svelte`
- `src/lib/components/layout/MobileBottomNav.svelte`
- `src/lib/components/layout/Footer.svelte`
- `src/lib/components/marketplace/ProductCard.svelte`
- `src/lib/components/marketplace/ProductGrid.svelte`
- `src/lib/components/home/FloatingCTA.svelte`
- `src/lib/components/home/HeroSearch.svelte`
- `src/lib/components/home/ProductFeed.svelte`
- `src/lib/components/home/ProductSection.svelte`
- `src/lib/components/home/SocialProof.svelte`

#### Testing Approach:

1. Replace Badge component with native version
2. Test all badge variants and colors
3. Verify sizing and spacing
4. Check usage in ProductCard and other contexts

---

### TASK 4: CARD COMPONENT

**Priority: HIGH**  
**Current Location:** `src/lib/components/ui/card/`  
**Dependencies:** `cn` utility, complex file structure  
**Usage Count:** 10+ files importing card components

#### Current Problems:

- Split into multiple files (Card, CardContent, CardHeader, etc.)
- Uses `WithElementRef` type complexity
- Over-engineered for simple container

#### Native Svelte 5 Template:

```svelte
<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: import('svelte').Snippet;
	}

	let { class: className = '', children, ...props }: Props = $props();

	const baseClasses = 'rounded-lg border bg-white text-gray-950 shadow-sm';
</script>

<div class="{baseClasses} {className}" {...props}>
	{@render children()}
</div>
```

```svelte
<!-- src/lib/components/ui/CardHeader.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: import('svelte').Snippet;
	}

	let { class: className = '', children, ...props }: Props = $props();
</script>

<div class="flex flex-col space-y-1.5 p-6 {className}" {...props}>
	{@render children()}
</div>
```

```svelte
<!-- src/lib/components/ui/CardContent.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: import('svelte').Snippet;
	}

	let { class: className = '', children, ...props }: Props = $props();
</script>

<div class="p-6 pt-0 {className}" {...props}>
	{@render children()}
</div>
```

#### Files to Update:

- `src/routes/sell/+page.svelte`
- All card component files in `src/lib/components/ui/card/`

#### Testing Approach:

1. Replace card components with native versions
2. Test card layouts and spacing
3. Verify nested content displays correctly
4. Check responsive behavior

---

### TASK 5: REMOVE SHADCN DEPENDENCIES

**Priority: CRITICAL**  
**Phase:** Cleanup

#### Dependencies to Remove:

```json
// Remove from package.json dependencies:
"bits-ui": "^2.9.1",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"tailwind-merge": "^3.3.1",

// Remove from devDependencies:
"shadcn-svelte": "^1.0.6"
```

#### Commands to Execute:

```bash
pnpm remove bits-ui class-variance-authority clsx tailwind-merge shadcn-svelte
```

#### Files to Delete:

- `src/lib/utils/index.js` (cn utility and related)
- All unused shadcn component directories
- `src/lib/components/ui/compat/` (compatibility wrappers)

---

### TASK 6: COMPLEX COMPONENTS (PHASE 2)

#### Dialog Components

**Location:** `src/lib/components/ui/dialog/`  
**Strategy:** Convert to native Svelte 5 with `<dialog>` element

#### Alert Dialog Components

**Location:** `src/lib/components/ui/alert-dialog/`  
**Strategy:** Convert to native Svelte 5 modal system

#### Form Components (Select, Checkbox, Radio, Textarea)

**Strategy:** Create simple native wrappers without bits-ui

#### Data Table Components

**Location:** `src/lib/components/ui/data-table/`  
**Strategy:** Keep functionality, remove shadcn abstractions

---

### TASK 7: VERIFICATION CHECKLIST

#### Build Verification:

- [ ] `pnpm run check` shows 0 errors
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run dev` starts without issues
- [ ] All pages load without console errors

#### Component Testing:

- [ ] Button: All variants and sizes work
- [ ] Input: Text, email, password, file inputs work
- [ ] Badge: All variants display correctly
- [ ] Card: Layout and spacing correct
- [ ] Forms: Validation and submission work
- [ ] Accessibility: Screen reader and keyboard navigation

#### Performance Verification:

- [ ] Bundle size reduced (check with `pnpm run build`)
- [ ] No unused dependencies in package.json
- [ ] Fast hot reload in development
- [ ] No import errors or circular dependencies

---

## 🚀 EXECUTION ORDER

### Day 1: Core Components

1. **TASK 1:** Replace Button component
2. **TASK 2:** Replace Input component
3. **TASK 3:** Replace Badge component
4. **TASK 4:** Replace Card component
5. Update all imports across codebase
6. Test basic functionality

### Day 2: Complex Components

1. **TASK 6:** Convert Dialog and Alert components
2. Convert Form components (Select, Checkbox, etc.)
3. Convert Data Table components
4. Test complex interactions

### Day 3: Cleanup & Verification

1. **TASK 5:** Remove all shadcn dependencies
2. **TASK 7:** Run full verification checklist
3. Delete unused files and utilities
4. Update documentation

---

## 🎯 SUCCESS METRICS

### Before (Current State):

- **131 shadcn component files**
- **5 major dependencies** (bits-ui, CVA, clsx, etc.)
- **Build status:** BROKEN
- **Bundle size:** Unknown (bloated)

### After (Target State):

- **~20 native Svelte 5 components**
- **0 shadcn dependencies**
- **Build status:** WORKING
- **Bundle size:** Reduced by ~50KB+

---

## 💡 AGENT PICKUP INSTRUCTIONS

Any agent can start executing this plan by:

1. **Pick a task** from the list above
2. **Read the template** for the component you're converting
3. **Replace the file** with the native Svelte 5 version
4. **Update imports** in all listed files
5. **Test the component** using the provided testing approach
6. **Mark task complete** when verification passes

**Pro tip:** Start with TASK 1 (Button) as it's the most used component and will give immediate impact.

---

**FINAL NOTE:** This refactor will make the codebase cleaner, faster, and more maintainable while staying true to Svelte's philosophy of simplicity and performance.
