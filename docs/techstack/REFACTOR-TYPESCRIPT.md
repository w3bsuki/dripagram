# TypeScript Refactoring Tasklist - Eliminate All `any` Types

**Mission**: Transform TypeScript grade from **C-** to **A-** by eliminating all 60+ `any` types and implementing proper type safety patterns.

**Estimated Time**: 40-60 hours
**Priority**: CRITICAL (blocks production quality)

---

## 📊 Overview: The `any` Type Pollution Crisis

Based on audit findings:

- **60+ `any` types** across codebase
- **20+ components** with `any` children props
- **15+ service functions** with untyped parameters
- **10+ catch blocks** using `any` instead of `unknown`
- **8+ event handlers** with loose typing
- **5+ utility functions** over-using `any`

---

## 🎯 Category-Based Refactoring Plan

### Category 1: Component Props (Priority: CRITICAL)

**Files Affected**: 20+ Svelte components
**Issue**: `any` children props and loose component interfaces

#### ❌ Current Broken Patterns:

```typescript
// WRONG - any children everywhere
let { children, data }: { children: any; data: LayoutData } = $props();

// WRONG - Generic any props
interface Props extends Record<string, any> {
  // ...
}

// WRONG - Loose component interfaces
[key: string]: any;
```

#### ✅ Correct Typing Patterns:

```typescript
// CORRECT - Proper Svelte 5 children typing
import type { Snippet } from 'svelte';

interface Props {
	children?: Snippet;
	data: LayoutData;
}
let { children, data }: Props = $props();

// CORRECT - Specific component props
interface ButtonProps extends HTMLButtonAttributes {
	variant?: 'default' | 'destructive' | 'outline';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	children?: Snippet;
	onclick?: () => void;
}

// CORRECT - Event handler typing
interface ProductCardProps {
	product: Product;
	onProductClick?: (product: Product) => void;
	onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
}
```

#### 🔧 Specific Tasks:

1. **src/routes/+layout.svelte** - Fix `children: any` prop
2. **src/lib/components/marketplace/ProductCard.svelte** - Type all props and event handlers
3. **src/lib/components/marketplace/ProductGrid.svelte** - Fix product handling props
4. **src/lib/components/layout/Header.svelte** - Type navigation and user props
5. **All UI carousel components** - Type carousel-specific props

### Category 2: Service Layer (Priority: CRITICAL)

**Files Affected**: 15+ service functions
**Issue**: Transform functions and API responses using `any`

#### ❌ Current Broken Patterns:

```typescript
// WRONG - Transform functions with any
const transformListing = (listing: any) => {
	return {
		...(item as any).products, // Double any abuse
		images: Array.isArray((item as any).products?.images) ? (item as any).products.images : [],
	};
};

// WRONG - Generic any parameters
function handleProductClick(product: any) {
	goto(`/products/${product.id}`);
}
```

#### ✅ Correct Service Patterns:

```typescript
// CORRECT - Proper transform typing
import type { Database } from '$lib/types/database.types';

type DatabaseProduct = Database['public']['Tables']['products']['Row'];
type DatabaseProfile = Database['public']['Tables']['profiles']['Row'];

interface TransformedProduct extends DatabaseProduct {
	seller?: {
		name: string;
		avatar?: string;
		rating: number;
		verified?: boolean;
	};
	images: string[];
	is_favorite?: boolean;
}

const transformListing = (
	product: DatabaseProduct & {
		profiles?: DatabaseProfile;
		product_images?: Array<{ image_url: string }>;
	}
): TransformedProduct => {
	return {
		...product,
		seller: product.profiles
			? {
					name: product.profiles.display_name || 'Anonymous',
					avatar: product.profiles.avatar_url || undefined,
					rating: product.profiles.rating || 0,
					verified: product.profiles.verified || false,
				}
			: undefined,
		images: product.product_images?.map((img) => img.image_url) || [],
	};
};

// CORRECT - Typed navigation handlers
function handleProductClick(product: Pick<Product, 'id' | 'title'>) {
	goto(`/products/${product.id}`);
}
```

#### 🔧 Specific Tasks:

1. **src/lib/services/productService.ts** - Fix all transform functions
2. **src/lib/services/userService.ts** - Type user profile operations
3. **src/lib/services/favoriteService.ts** - Type favorite toggle operations
4. **src/lib/services/categoryService.ts** - Type category filtering
5. **API route handlers** - Type all +page.server.ts functions

### Category 3: Error Handling (Priority: HIGH)

**Files Affected**: 10+ catch blocks
**Issue**: Using `catch (error: any)` instead of proper error typing

#### ❌ Current Broken Patterns:

```typescript
// WRONG - Catch blocks using any
} catch (error: any) {
  console.error('Something went wrong:', error);
}

// WRONG - Generic error details
public readonly details?: any;
```

#### ✅ Correct Error Patterns:

```typescript
// CORRECT - Unknown error handling with type guards
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Known error:', error.message);
    // Handle Error instance
  } else if (typeof error === 'string') {
    console.error('String error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}

// CORRECT - Structured error types
interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  cause?: Error;
}

class ProductServiceError extends Error implements AppError {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

// CORRECT - Typed error result patterns
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

async function getProduct(id: string): Promise<ServiceResult<Product>> {
  try {
    const product = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (product.error) {
      return {
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
          details: { productId: id }
        }
      };
    }

    return { success: true, data: product.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        message: 'Database error',
        code: 'DB_ERROR',
        cause: error instanceof Error ? error : undefined
      }
    };
  }
}
```

#### 🔧 Specific Tasks:

1. **All service files** - Replace `catch (error: any)` with proper error handling
2. **API routes** - Implement structured error responses
3. **Component error boundaries** - Type error state properly
4. **Form validation** - Type validation errors
5. **Create error utility types** - Centralized error handling patterns

### Category 4: Form & Event Types (Priority: MEDIUM)

**Files Affected**: 8+ event handlers and forms
**Issue**: Loose typing on form submissions and event handlers

#### ❌ Current Broken Patterns:

```typescript
// WRONG - Generic form data
function handleSubmit(formData: any) {
  // Process form
}

// WRONG - Loose event typing
onclick={(event: any) => handleClick(event)}
```

#### ✅ Correct Form & Event Patterns:

```typescript
// CORRECT - Typed form data interfaces
interface ProductFormData {
	title: string;
	description: string;
	price: number;
	category_id: string;
	condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
	images: File[];
}

interface SignupFormData {
	email: string;
	password: string;
	display_name: string;
	full_name: string;
}

// CORRECT - Typed form handlers
function handleProductSubmit(event: SubmitEvent) {
	event.preventDefault();
	const formData = new FormData(event.currentTarget as HTMLFormElement);

	const product: Partial<ProductFormData> = {
		title: formData.get('title') as string,
		description: formData.get('description') as string,
		price: Number(formData.get('price')),
		category_id: formData.get('category_id') as string,
		condition: formData.get('condition') as ProductFormData['condition'],
	};

	// Process typed form data
}

// CORRECT - Event handler typing
interface EventHandlers {
	onProductClick: (product: Product) => void;
	onFavoriteToggle: (productId: string, isFavorite: boolean) => void;
	onCategorySelect: (categoryId: string) => void;
	onSearchInput: (query: string) => void;
}

// CORRECT - Component with typed handlers
interface ProductGridProps {
	products: Product[];
	isLoading?: boolean;
	onProductClick?: EventHandlers['onProductClick'];
	onFavoriteToggle?: EventHandlers['onFavoriteToggle'];
}
```

#### 🔧 Specific Tasks:

1. **src/routes/sell/+page.svelte** - Type product creation form
2. **src/routes/auth/signup/+page.server.ts** - Type signup form handling
3. **src/routes/profile/+page.svelte** - Type profile update forms
4. **src/routes/checkout/+page.svelte** - Type checkout form data
5. **Search and filter components** - Type input handlers

### Category 5: Utility Functions (Priority: MEDIUM)

**Files Affected**: 5+ utility functions
**Issue**: Generic utilities over-using `any`

#### ❌ Current Broken Patterns:

```typescript
// WRONG - Generic debounce with any
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	// Implementation
}

// WRONG - Generic data table props
export interface DataTableProps<T = any> {
	data: T[];
	columns: Column<T>[];
}
```

#### ✅ Correct Utility Patterns:

```typescript
// CORRECT - Properly typed debounce
export function debounce<T extends readonly unknown[]>(
	func: (...args: T) => void,
	wait: number
): (...args: T) => void {
	let timeout: NodeJS.Timeout | undefined;

	return (...args: T) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// CORRECT - Specific data table typing
export interface DataTableColumn<T> {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (value: T[keyof T], row: T) => string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
	data: T[];
	columns: DataTableColumn<T>[];
	onRowClick?: (row: T) => void;
	loading?: boolean;
}

// CORRECT - Type-safe utility functions
export function pick<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[]
): Pick<T, K> {
	return keys.reduce(
		(result, key) => {
			if (key in obj) {
				result[key] = obj[key];
			}
			return result;
		},
		{} as Pick<T, K>
	);
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[]
): Omit<T, K> {
	const result = { ...obj };
	keys.forEach((key) => delete result[key]);
	return result;
}
```

#### 🔧 Specific Tasks:

1. **src/lib/utils.ts** - Type all utility functions properly
2. **Carousel components** - Fix generic component typing
3. **Data transformation utilities** - Remove `any` from generic helpers
4. **Validation utilities** - Type input/output properly
5. **Storage utilities** - Type file handling functions

---

## 🛠️ Implementation Strategy

### Phase 1: Critical Component Props (Week 1)

1. Fix all Svelte 5 component `children: any` props
2. Create proper prop interfaces for all components
3. Type event handlers specifically
4. Test each component after typing

### Phase 2: Service Layer Cleanup (Week 2)

1. Type all database transform functions
2. Create proper service interfaces
3. Implement typed API responses
4. Add proper error handling

### Phase 3: Error Handling & Forms (Week 3)

1. Replace all `catch (error: any)` with proper error handling
2. Create centralized error types
3. Type all form data interfaces
4. Implement form validation types

### Phase 4: Utilities & Polish (Week 4)

1. Fix utility function generics
2. Add missing type guards
3. Implement stricter compiler options
4. Add type coverage reporting

---

## 🔧 Configuration Improvements

### Enhanced tsconfig.json:

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"strict": true,
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"skipLibCheck": true,
		"moduleResolution": "bundler",

		// NEW - Additional strict options
		"noUncheckedIndexedAccess": true,
		"exactOptionalPropertyTypes": true,
		"noImplicitReturns": true,
		"noFallthroughCasesInSwitch": true,
		"noImplicitOverride": true,
		"noPropertyAccessFromIndexSignature": true,
		"noUncheckedSideEffectImports": true
	}
}
```

### ESLint TypeScript Rules:

Add to `.eslintrc.js`:

```javascript
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error'
  }
}
```

---

## 📊 Success Metrics

### Before Refactor (Current State):

- ❌ **60+ `any` types** across codebase
- ❌ **C- TypeScript grade**
- ❌ Poor type safety
- ❌ Runtime type errors possible

### After Refactor (Target State):

- ✅ **0 `any` types** (except where absolutely necessary)
- ✅ **A- TypeScript grade**
- ✅ Full type safety
- ✅ Compile-time error prevention

### Quality Gates:

- [ ] `pnpm run check` passes with 0 errors
- [ ] `pnpm run build` succeeds
- [ ] No `any` types in component props
- [ ] All service functions properly typed
- [ ] All error handling uses `unknown`
- [ ] All form data typed
- [ ] ESLint TypeScript rules pass

---

## 🚀 Getting Started

1. **Read this entire document** to understand the scope
2. **Start with Phase 1** (Component Props) - highest impact
3. **Fix one file at a time** - test after each change
4. **Run `pnpm run check`** after every change
5. **Update this document** as tasks are completed

---

## 📝 Task Tracking

### Component Props (20+ files)

- [ ] src/routes/+layout.svelte
- [ ] src/lib/components/marketplace/ProductCard.svelte
- [ ] src/lib/components/marketplace/ProductGrid.svelte
- [ ] src/lib/components/layout/Header.svelte
- [ ] src/lib/components/home/ (all files)
- [ ] src/lib/components/ui/carousel/ (all files)
- [ ] [Additional components to be identified during implementation]

### Service Layer (15+ functions)

- [ ] src/lib/services/productService.ts
- [ ] src/lib/services/userService.ts
- [ ] src/lib/services/favoriteService.ts
- [ ] src/lib/services/categoryService.ts
- [ ] src/routes/+page.server.ts
- [ ] src/routes/auth/signup/+page.server.ts
- [ ] src/routes/profile/+page.server.ts
- [ ] src/routes/sell/+page.server.ts
- [ ] [Additional service files to be identified]

### Error Handling (10+ locations)

- [ ] All service files catch blocks
- [ ] All API route error handling
- [ ] Component error boundaries
- [ ] Form validation errors
- [ ] [Additional error locations to be identified]

### Forms & Events (8+ handlers)

- [ ] src/routes/sell/+page.svelte (product form)
- [ ] src/routes/auth/signup/+page.server.ts (signup form)
- [ ] src/routes/profile/+page.svelte (profile form)
- [ ] src/routes/checkout/+page.svelte (checkout form)
- [ ] Search/filter event handlers
- [ ] [Additional form/event handlers to be identified]

### Utilities (5+ functions)

- [ ] src/lib/utils.ts
- [ ] Carousel component utilities
- [ ] Data transformation utilities
- [ ] Validation utilities
- [ ] Storage utilities

---

**Remember**: Each `any` type eliminated makes the codebase more maintainable, catches more bugs at compile time, and improves developer experience. This refactor is an investment in code quality that will pay dividends in reduced debugging time and increased confidence in changes.
