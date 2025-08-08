# Instagram-Inspired Product Page Components

This document demonstrates the complete set of Instagram-inspired product page components built with Svelte 5 and shadcn-svelte. All components follow modern UI patterns from Instagram and TikTok while maintaining the professional aesthetic of marketplace platforms.

## 🎨 Component Overview

### 1. **ProductImageCarousel.svelte**
Instagram-style full-width image carousel with advanced gesture support.

**Features:**
- ✅ Smooth swipe gestures (touch & mouse)
- ✅ Dot indicators with navigation
- ✅ Image counter badge
- ✅ Double-tap to like with heart animation
- ✅ Optional pinch-to-zoom support
- ✅ Keyboard navigation (arrows, escape)
- ✅ Video indicator overlay
- ✅ Mobile-optimized touch interactions

**Props:**
```typescript
interface Props {
  images: string[];
  title: string;
  hasVideo?: boolean;
  videoUrl?: string;
  enableDoubleTab?: boolean;
  enablePinchZoom?: boolean;
  showCounter?: boolean;
  onLike?: () => void;
  onImageChange?: (index: number) => void;
}
```

**Usage:**
```svelte
<ProductImageCarousel
  images={product.images}
  title={product.title}
  hasVideo={!!product.video_url}
  enableDoubleTab={true}
  onLike={handleLike}
  onImageChange={(index) => console.log('Image changed to:', index)}
/>
```

---

### 2. **ProductSeller.svelte**
Enhanced seller section with social features and verification badges.

**Features:**
- ✅ Large avatar with verification badge
- ✅ Follow/Following button with optimistic updates
- ✅ Seller stats (rating, sales, followers)
- ✅ Last active status with online indicator
- ✅ Multiple display variants (default, compact, detailed)
- ✅ Integrated with Supabase follows system

**Props:**
```typescript
interface Props {
  seller: Seller;
  showFollowButton?: boolean;
  showStats?: boolean;
  showLastSeen?: boolean;
  showBadges?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed';
  onFollow?: (sellerId: string, isFollowing: boolean) => void;
  onMessage?: (sellerId: string) => void;
}
```

**Usage:**
```svelte
<ProductSeller
  seller={product.seller}
  variant="detailed"
  showStats={true}
  onFollow={handleFollow}
  onMessage={handleMessage}
/>
```

---

### 3. **ProductEngagement.svelte**
Social engagement bar with Instagram-style interactions.

**Features:**
- ✅ Instagram-style like button with animations
- ✅ Comment, share, and save buttons
- ✅ Like count display with formatting
- ✅ Heart animation on like
- ✅ Native share API integration
- ✅ Multiple variants (instagram, compact, detailed)
- ✅ Optimistic updates with error handling

**Props:**
```typescript
interface Props {
  productId: string;
  productTitle: string;
  initialLikeCount?: number;
  initialCommentCount?: number;
  initialShareCount?: number;
  isInitiallyLiked?: boolean;
  isInitiallySaved?: boolean;
  showCounts?: boolean;
  showLabels?: boolean;
  variant?: 'instagram' | 'compact' | 'detailed';
  size?: 'small' | 'medium' | 'large';
  // ... callback props
}
```

**Usage:**
```svelte
<ProductEngagement
  productId={product.id}
  productTitle={product.title}
  variant="instagram"
  initialLikeCount={product.like_count}
  isInitiallyLiked={product.is_liked}
  onLike={handleLike}
  onComment={handleComment}
/>
```

---

### 4. **ProductInfo.svelte**
Modern product information with expandable descriptions and smart tags.

**Features:**
- ✅ Large price display with discount badges
- ✅ Size/condition/brand pills with color coding
- ✅ Expandable description with @mentions and #hashtags
- ✅ Related tags with show more functionality
- ✅ Location and shipping information
- ✅ Sustainability scoring
- ✅ Multiple display variants

**Props:**
```typescript
interface Props {
  title: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  description?: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  condition?: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair';
  tags?: string[];
  styleTags?: string[];
  // ... additional props
}
```

**Usage:**
```svelte
<ProductInfo
  title={product.title}
  price={product.price}
  originalPrice={product.original_price}
  description={product.description}
  condition={product.condition}
  tags={product.tags}
  brand={product.brand}
  size={product.size}
  expandableDescription={true}
/>
```

---

### 5. **ProductActions.svelte**
Sticky bottom action bar with cart integration and messaging.

**Features:**
- ✅ Message seller button
- ✅ Add to cart with cart store integration
- ✅ Buy now with direct checkout
- ✅ Price display with brand info
- ✅ Quick action buttons (like, share)
- ✅ Size selection modal
- ✅ Success notifications
- ✅ Mobile-optimized with safe area support

**Props:**
```typescript
interface Props {
  product: ProductItem;
  isSticky?: boolean;
  showPrice?: boolean;
  showMessageButton?: boolean;
  showAddToCart?: boolean;
  showBuyNow?: boolean;
  showQuickActions?: boolean;
  variant?: 'default' | 'minimal' | 'expanded';
  // ... callback props
}
```

**Usage:**
```svelte
<ProductActions
  product={product}
  isSticky={true}
  showQuickActions={true}
  variant="default"
  onMessage={handleMessage}
  onAddToCart={handleAddToCart}
  onBuyNow={handleBuyNow}
/>
```

## 🚀 Complete Product Page Example

Here's how to combine all components for a complete product page:

```svelte
<script lang="ts">
  import {
    ProductImageCarousel,
    ProductSeller,
    ProductEngagement,
    ProductInfo,
    ProductActions
  } from '$lib/components/marketplace';
  import type { Listing } from '$lib/types';

  interface Props {
    product: Listing;
  }

  let { product }: Props = $props();

  // State management
  let currentImageIndex = $state(0);
  let isLiked = $state(false);
  let likeCount = $state(product.like_count || 0);

  // Event handlers
  function handleLike() {
    isLiked = !isLiked;
    likeCount += isLiked ? 1 : -1;
  }

  function handleFollow(sellerId: string, isFollowing: boolean) {
    console.log('Follow toggled:', sellerId, isFollowing);
  }

  function handleMessage(sellerId: string) {
    goto(`/messages?seller=${sellerId}`);
  }

  function handleComment() {
    // Scroll to comments or open comment modal
    console.log('Open comments');
  }

  function handleAddToCart(product: any) {
    console.log('Added to cart:', product);
  }

  function handleBuyNow(product: any) {
    console.log('Buy now:', product);
  }
</script>

<!-- Product Page Layout -->
<div class="product-page">
  <!-- Image Carousel -->
  <ProductImageCarousel
    images={product.images || []}
    title={product.title}
    hasVideo={!!product.video_url}
    enableDoubleTab={true}
    enablePinchZoom={true}
    onLike={handleLike}
    onImageChange={(index) => currentImageIndex = index}
  />

  <!-- Seller Information -->
  <ProductSeller
    seller={product.seller}
    variant="detailed"
    showStats={true}
    showLastSeen={true}
    onFollow={handleFollow}
    onMessage={handleMessage}
  />

  <!-- Social Engagement -->
  <ProductEngagement
    productId={product.id}
    productTitle={product.title}
    variant="instagram"
    initialLikeCount={likeCount}
    isInitiallyLiked={isLiked}
    onLike={handleLike}
    onComment={handleComment}
    showCounts={true}
  />

  <!-- Product Information -->
  <ProductInfo
    title={product.title}
    price={product.price}
    originalPrice={product.original_price}
    description={product.description}
    condition={product.condition}
    brand={product.brand}
    size={product.size}
    color={product.color}
    tags={product.tags}
    styleTags={product.style_tags}
    location={product.location}
    shippingAvailable={product.shipping_available}
    shippingPrice={product.shipping_price}
    expandableDescription={true}
  />

  <!-- Sticky Action Bar -->
  <ProductActions
    product={{
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      sellerId: product.seller_id,
      size: product.size,
      brand: product.brand
    }}
    isSticky={true}
    showQuickActions={true}
    onMessage={handleMessage}
    onAddToCart={handleAddToCart}
    onBuyNow={handleBuyNow}
  />
</div>

<style>
  .product-page {
    min-height: 100vh;
    background: var(--color-surface-primary);
    margin-bottom: 80px; /* Space for sticky actions */
  }

  @media (max-width: 768px) {
    .product-page {
      margin-bottom: 70px;
    }
  }
</style>
```

## 🎯 Design System Features

### Color Coding
- **Condition Badges**: Green (new), Blue (like new), Yellow (good), Orange (fair)
- **Sustainability**: Green gradient based on score
- **Interactive Elements**: Primary blue for actions, red for likes
- **Text Hierarchy**: Primary, secondary, tertiary text colors

### Typography
- **Prices**: Mono font with large sizing for emphasis
- **Titles**: Bold, readable hierarchy
- **Descriptions**: Proper line height for readability
- **Tags**: Uppercase, spaced lettering for distinction

### Animations & Interactions
- **Heart Animation**: Ping effect on like with floating heart
- **Button States**: Hover, active, disabled states
- **Touch Feedback**: Scale animations for mobile interactions
- **Loading States**: Spinners and skeleton states

### Accessibility
- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML and ARIA attributes
- **High Contrast**: Respects system preferences
- **Reduced Motion**: Disables animations when requested

### Mobile Optimization
- **Touch Gestures**: Swipe, double-tap, pinch-to-zoom
- **Safe Areas**: Support for notched devices
- **Responsive Sizing**: Proper scaling on all screen sizes
- **Performance**: Lazy loading and optimized rendering

## 🔧 Integration Notes

### Supabase Integration
- All components work with the existing Supabase schema
- Optimistic updates with error handling
- Real-time subscriptions for live updates
- Authentication checks built-in

### Cart Integration
- Uses the existing `cartStore` from `$lib/stores/cart.svelte.ts`
- Proper type safety with CartItem interface
- Local storage persistence
- Quantity management

### Type Safety
- Full TypeScript support with proper interfaces
- Compatible with existing `Listing` and `Profile` types
- Proper prop validation and defaults
- Generic components for reusability

## 📱 Usage Recommendations

### For Product Detail Pages
Use all components together as shown in the complete example above.

### For Product Cards in Feeds
Use `ProductEngagement` with `variant="compact"` for grid layouts.

### For Seller Profiles
Use `ProductSeller` with `variant="detailed"` and `showStats={true}`.

### For Mobile Apps
Enable all gesture features and use sticky actions for better UX.

### For Desktop
Show hover states and use larger sizing variants for better visibility.

## 🎨 Customization

All components support CSS custom properties and can be themed using your design system. The components follow the existing design tokens and are fully compatible with the shadcn-svelte theme system.

The components are built with modern CSS features including:
- Container queries for responsive design
- CSS Grid and Flexbox for layouts
- Custom properties for theming
- Modern pseudo-selectors for states
- Backdrop filters for modern effects

---

**Note**: All components are built with Svelte 5 runes (`$state`, `$derived`, `$effect`) and use the new event syntax (`onclick` instead of `on:click`). They are fully TypeScript compatible and follow accessibility best practices.