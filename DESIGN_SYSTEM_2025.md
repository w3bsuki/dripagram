# Driplo Design System 2025 - Social Commerce Edition

> The Amazon of Clothing - Combining marketplace functionality with social shopping experiences inspired by Instagram, TikTok, and modern e-commerce

## 🎯 Quick Reference

### Must-Have Components
1. **Social Feed** - Instagram-style infinite scroll with engagement
2. **Story Bar** - Featured collections and flash sales
3. **Discovery Header** - Logo | AI Search | Live | Sell | Cart | Profile
4. **Trending Pills** - #hashtags and style categories with counts
5. **Smart Product Cards** - Social metrics, quick shop, video previews
6. **Bottom Navigation** - Feed | Discover | Create | Shop | Profile
7. **Floating Action Buttons** - Quick sell, live stream, deals

### Design Formula
```
Instagram Feed + TikTok Discovery + Amazon Commerce + Vinted Simplicity = Driplo
```

## 🎨 Core Design Philosophy

### Principles
1. **Social-First Commerce** - Shopping as entertainment and community
2. **Mobile-Native** - Designed for thumb-friendly vertical scrolling
3. **Instant Gratification** - One-tap actions, quick shop, fast checkout
4. **Trust Through Transparency** - Verified sellers, authentic reviews, live previews
5. **Gamified Shopping** - Rewards, achievements, flash sales, live events
6. **AI-Powered Discovery** - Personalized feeds, style matching, trend predictions

### Key Inspirations
- **Instagram Shopping** - Social feed, stories, reels for products
- **TikTok Shop** - Discovery through entertainment, live streaming
- **Amazon** - Reviews, recommendations, one-click buying
- **Depop** - Youth culture, influencer-driven commerce
- **ASOS** - Visual search, style matching, virtual try-on

### What We're NOT Doing
- ❌ Full-screen modals or drawers
- ❌ Complex mega menus
- ❌ Unnecessary text or descriptions
- ❌ Multiple CTAs competing for attention
- ❌ Heavy animations or parallax effects

## 🎨 Design Tokens

### Color Palette

```css
/* Primary Colors */
--color-primary: #B8A9C9;        /* Light lilac (Vinted-inspired) */
--color-primary-dark: #8B7AA8;   /* Darker lilac for hover states */
--color-primary-light: #D4C5E8;  /* Lighter lilac for backgrounds */

/* Accent Colors */
--color-accent: #FFE066;         /* Pastel yellow for CTAs */
--color-success: #95E1D3;        /* Soft mint green */
--color-warning: #FFA502;        /* Warm orange */
--color-error: #FF6B81;          /* Soft coral red */
--color-live: #FF0050;           /* Live streaming red */
--color-verified: #1DA1F2;       /* Verified blue */
--color-premium: #FFD700;        /* Premium gold */

/* Neutral Colors */
--color-background: #FFFFFF;     /* Pure white */
--color-surface: #FAFAFA;        /* Light gray surface */
--color-border: #E5E7EB;         /* Subtle borders */
--color-text-primary: #1F2937;   /* Dark charcoal */
--color-text-secondary: #6B7280; /* Medium gray */
--color-text-muted: #9CA3AF;     /* Light gray */

/* Dark Mode (Optional) */
--color-dark-bg: #0F172A;        /* Deep blue-black */
--color-dark-surface: #1E293B;   /* Elevated surface */
--color-dark-border: #334155;    /* Subtle dark border */
```

### Tailwind v4 Config Integration

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B8A9C9',
          dark: '#8B7AA8',
          light: '#D4C5E8'
        },
        accent: '#FFE066',
        surface: '#FAFAFA'
      }
    }
  }
}
```

### Typography Scale

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes - Mobile First */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Desktop Overrides */
@media (min-width: 768px) {
  --text-3xl: 2.5rem;  /* 40px */
  --text-4xl: 3rem;    /* 48px */
}

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System

```css
/* 8px Grid System */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Shadows & Elevation

```css
/* Subtle Shadows for Clean Look */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Animation Tokens

```css
/* Durations */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* Easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Common Transitions */
--transition-base: all var(--duration-base) var(--ease-in-out);
--transition-fast: all var(--duration-fast) var(--ease-in-out);
--transition-slow: all var(--duration-slow) var(--ease-in-out);
```

## 📐 Layout Structure

### Homepage Layout (Vinted-Style)

```
┌─────────────────────────────────────────────┐
│  🎯 Promo Banner (Dismissible)              │
├─────────────────────────────────────────────┤
│  Logo │ Search Bar │ Sell │ ❤️ │ 👤         │
├─────────────────────────────────────────────┤
│  [Women] [Men] [Kids] [Home] [Electronics]  │ ← Horizontal scroll pills
├─────────────────────────────────────────────┤
│  [Promoted] [Latest] [Top]                   │ ← Tab navigation
├─────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │    │ │    │ │    │ │    │               │ ← Product grid
│  └────┘ └────┘ └────┘ └────┘               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │    │ │    │ │    │ │    │               │
│  └────┘ └────┘ └────┘ └────┘               │
└─────────────────────────────────────────────┘
```

### Grid System

```css
/* Container */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Product Grid */
--grid-cols-mobile: 2;
--grid-cols-tablet: 3;
--grid-cols-desktop: 4;
--grid-cols-wide: 5;
--grid-gap: var(--space-4);
```

## 🧩 Component Specifications

### 1. Header Component

```svelte
<!-- Clean, functional header -->
<header class="header">
  <div class="header-container">
    <!-- Logo -->
    <a href="/" class="logo">
      <span class="logo-text">driplo</span>
    </a>
    
    <!-- Search Bar -->
    <div class="search-container">
      <SearchIcon class="search-icon" />
      <input 
        type="search" 
        placeholder="Search for items..." 
        class="search-input"
      />
    </div>
    
    <!-- Actions -->
    <nav class="header-actions">
      <button class="sell-btn">Sell now</button>
      <button class="icon-btn" aria-label="Favorites">
        <HeartIcon />
      </button>
      <button class="icon-btn" aria-label="Profile">
        <UserIcon />
      </button>
    </nav>
  </div>
</header>

<style>
.header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.logo-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-10);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  font-size: var(--text-base);
  transition: var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(184, 169, 201, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sell-btn {
  background: var(--color-accent);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-5);
  border-radius: 9999px;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  transition: var(--transition-fast);
  border: none;
  cursor: pointer;
}

.sell-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: #FFD93D;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--space-3);
    gap: var(--space-2);
  }
  
  .sell-btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }
  
  .search-input {
    font-size: var(--text-sm);
  }
}
</style>
```

### 2. Category Pills

```svelte
<!-- Horizontal scrollable categories -->
<div class="category-pills">
  <button class="pill active">Women</button>
  <button class="pill">Men</button>
  <button class="pill">Kids</button>
  <button class="pill">Home</button>
  <button class="pill">Electronics</button>
  <button class="pill">Sports</button>
  <button class="pill">Books</button>
</div>

<style>
.category-pills {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-4) 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.pill {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: var(--space-2) var(--space-4);
  white-space: nowrap;
  transition: var(--transition-fast);
}

.pill.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pill:hover:not(.active) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
</style>
```

### 3. Tab Navigation

```svelte
<!-- Clean tab navigation -->
<div class="tabs">
  <button class="tab active">Promoted</button>
  <button class="tab">Latest</button>
  <button class="tab">Top</button>
</div>

<style>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-6);
}

.tab {
  flex: 1;
  padding: var(--space-3) 0;
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: var(--transition-fast);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-primary);
}

.tab:hover:not(.active) {
  color: var(--color-text-primary);
}
</style>
```

### 4. Product Card

```svelte
<!-- Minimal product card -->
<article class="product-card">
  <a href="/products/{product.id}" class="product-link">
    <div class="product-image">
      <img 
        src={product.image} 
        alt={product.title} 
        loading="lazy"
        class="product-img" 
      />
      {#if product.isPromoted}
        <span class="promoted-badge">Promoted</span>
      {/if}
    </div>
    
    <div class="product-info">
      <p class="product-price">€{product.price}</p>
      <p class="product-size">{product.size}</p>
      <p class="product-brand">{product.brand}</p>
    </div>
  </a>
  
  <button 
    class="favorite-btn" 
    aria-label="Add to favorites"
    onclick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
  >
    <HeartIcon filled={product.isFavorited} />
  </button>
</article>

<style>
.product-card {
  position: relative;
  group: product;
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: var(--space-2);
  background: var(--color-surface);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-slow);
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.promoted-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.favorite-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: var(--transition-fast);
  opacity: 0;
}

.product-card:hover .favorite-btn,
.favorite-btn:focus {
  opacity: 1;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.product-info {
  padding: var(--space-3) 0;
}

.product-price {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  margin-bottom: var(--space-1);
}

.product-size,
.product-brand {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-tight);
}

/* Mobile: Always show favorite button */
@media (max-width: 768px) {
  .favorite-btn {
    opacity: 1;
  }
}
</style>
```

### 5. Modern Dropdown

```svelte
<script>
  let open = $state(false);
  let selected = $state('newest');
  
  const options = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most popular' }
  ];
  
  function handleSelect(value) {
    selected = value;
    open = false;
    // Trigger sort change
  }
  
  // Close on outside click
  function handleClickOutside(e) {
    if (!e.target.closest('.dropdown')) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<!-- Click-based dropdown -->
<div class="dropdown">
  <button 
    class="dropdown-trigger" 
    onclick={() => open = !open}
    aria-expanded={open}
    aria-haspopup="true"
  >
    <span>{options.find(o => o.value === selected)?.label}</span>
    <ChevronDownIcon class="dropdown-icon {open ? 'rotate' : ''}" />
  </button>
  
  {#if open}
    <div class="dropdown-menu" transition:slide={{ duration: 200 }}>
      {#each options as option}
        <button 
          class="dropdown-item {selected === option.value ? 'active' : ''}"
          onclick={() => handleSelect(option.value)}
        >
          {option.label}
          {#if selected === option.value}
            <CheckIcon class="check-icon" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dropdown-trigger:hover {
  border-color: var(--color-primary);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform var(--duration-base) var(--ease-in-out);
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
  box-shadow: var(--shadow-xl);
  min-width: 220px;
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--color-surface);
}

.dropdown-item.active {
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}
</style>
```

## 🏗️ Promo Banner Component

```svelte
<!-- Dismissible promo banner -->
{#if showBanner}
  <div class="promo-banner" transition:slide>
    <div class="promo-content">
      <p class="promo-text">
        🎉 <strong>Free shipping</strong> on orders over €50 - Limited time!
      </p>
    </div>
    <button 
      class="promo-close" 
      onclick={() => showBanner = false}
      aria-label="Close banner"
    >
      <CloseIcon />
    </button>
  </div>
{/if}

<style>
.promo-banner {
  background: linear-gradient(90deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
  color: var(--color-text-primary);
  padding: var(--space-2) 0;
  position: relative;
  text-align: center;
}

.promo-content {
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: 0 var(--space-12);
}

.promo-text {
  font-size: var(--text-sm);
  margin: 0;
}

.promo-close {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: var(--space-1);
  opacity: 0.7;
  transition: var(--transition-fast);
}

.promo-close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .promo-text {
    font-size: var(--text-xs);
  }
  
  .promo-close {
    right: var(--space-2);
  }
}
</style>
```

## 🚀 Implementation Guidelines

### 1. Mobile-First Development
```css
/* Start with mobile styles */
.component {
  /* Mobile styles */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* Tablet overrides */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    /* Desktop overrides */
  }
}
```

### 2. Performance Optimization
- **Lazy Loading**: All images below the fold
- **Code Splitting**: Route-based chunks
- **Image Optimization**: WebP with fallbacks
- **CSS Optimization**: Tailwind v4 with tree-shaking
- **Font Loading**: `font-display: swap`

### 3. Accessibility Requirements
- **Color Contrast**: WCAG AA minimum (4.5:1)
- **Focus States**: Visible keyboard navigation
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Touch Targets**: Minimum 44x44px on mobile
- **Screen Reader**: Proper semantic HTML

### 4. Micro-Interactions
```css
/* Button hover */
.button {
  transition: var(--transition-fast);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Card hover */
.card {
  transition: var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s infinite;
}
```

### 5. Dark Mode (Optional)
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-dark-bg);
    --color-surface: var(--color-dark-surface);
    --color-border: var(--color-dark-border);
    --color-text-primary: #F9FAFB;
    --color-text-secondary: #D1D5DB;
  }
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Breakpoints */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

## 🎯 Key Implementation Steps

### Phase 1: Core Structure
1. **Remove all full-screen overlays** - Replace with dropdowns and inline components
2. **Implement promo banner** - Dismissible, gradient background, cookie-based persistence
3. **Simplify header** - Logo, search bar, "Sell now" CTA, favorites, profile
4. **Add category pills** - Horizontal scrollable filters below header

### Phase 2: Product Display
5. **Implement tab navigation** - Promoted | Latest | Top (no routing, just filter)
6. **Create product grid** - 2 cols mobile, 4-5 cols desktop, infinite scroll
7. **Design product cards** - Image-focused, hover effects, favorite button
8. **Add loading states** - Skeleton loaders for products

### Phase 3: Polish & Performance
9. **Optimize images** - Lazy loading, WebP format, proper sizing
10. **Add micro-interactions** - Smooth transitions, hover states
11. **Ensure accessibility** - ARIA labels, keyboard nav, focus states
12. **Test performance** - Lighthouse score 90+, fast initial load

### Implementation Checklist
- [ ] All components use Svelte 5 syntax
- [ ] No full-screen modals or drawers
- [ ] Mobile-first responsive design
- [ ] Tailwind v4 with CSS variables
- [ ] Proper TypeScript types
- [ ] Accessibility standards met
- [ ] Performance optimized

## 📊 Success Metrics

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Mobile Lighthouse Score**: 90+

### UX Metrics
- **Product Discovery**: < 3 clicks to any product
- **Search Success Rate**: > 80%
- **Mobile Conversion**: Match or exceed desktop
- **Accessibility Score**: WCAG AA compliant

## 🔗 Resources & References

### Design Inspiration
- **Vinted.co.uk**: Clean marketplace layout, excellent mobile UX
- **Depop**: Bold typography, youth-oriented design
- **Grailed**: Premium feel, minimal aesthetic

### Technical Resources
- **Tailwind v4 Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn-svelte**: [shadcn-svelte.com](https://www.shadcn-svelte.com)
- **Svelte 5 Runes**: [svelte.dev/docs/runes](https://svelte.dev/docs/runes)

### 2025 Trends Applied
1. **Bold Typography**: Large, confident headings
2. **Micro-interactions**: Subtle animations on every interaction
3. **AI-Ready**: Structure supports future AI features
4. **Sustainable Design**: Performance-first, reduced carbon footprint
5. **Inclusive UX**: Accessibility baked in, not bolted on

---

**Remember**: Every design decision should answer "Does this help users find and buy products faster?" If not, remove it.

This design system prioritizes **clarity**, **performance**, and **conversions** while maintaining a modern, minimal aesthetic inspired by successful marketplaces.