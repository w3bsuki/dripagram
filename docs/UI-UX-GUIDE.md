# Driplo UI/UX Design Guide 🎨

## Design System Specification

### Color Palette
```css
/* Primary Colors */
--primary: #000000;          /* Black */
--primary-foreground: #ffffff; /* White */
--secondary: #f5f5f5;        /* Light gray */
--secondary-foreground: #000000;

/* Accent Colors */
--accent: #3b82f6;           /* Blue */
--accent-foreground: #ffffff;
--destructive: #ef4444;      /* Red */
--destructive-foreground: #ffffff;

/* Neutral Colors */
--background: #ffffff;
--foreground: #000000;
--muted: #f8fafc;
--muted-foreground: #64748b;
--border: #e2e8f0;
--input: #ffffff;
```

### Typography
```css
/* Font Stack */
font-family: 'Inter Variable', system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale (Tailwind-based) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.125rem;  /* 2px */
--radius: 0.375rem;     /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
```

## Component Design Specifications

### Header/Navigation
```
Layout: Fixed top header, white background, subtle shadow
Height: 64px
Contents: Logo (left) | Search bar (center) | User menu (right)
Mobile: Hamburger menu, search icon, user avatar
```

### Product Cards
```
Aspect Ratio: 4:5 for product images
Card Style: Clean white background, subtle border
Hover State: Slight shadow elevation
Image: Rounded corners (8px), lazy loaded
Price: Bold, prominent display
Title: 2 lines max with ellipsis
Seller: Small text with avatar
```

### Buttons
```
Primary: Black background, white text, 8px radius
Secondary: White background, black border, black text
Destructive: Red background, white text
Sizes: sm (32px), md (40px), lg (48px)
States: hover, focus, disabled
```

### Forms
```
Input Style: White background, gray border, 6px radius
Focus State: Blue border, blue ring
Label: Above input, medium weight
Error State: Red border, red text below
Spacing: 16px between form groups
```

### Layout Patterns
```
Max Width: 1200px centered
Grid: 12-column responsive grid
Gutters: 16px mobile, 24px tablet, 32px desktop
Section Spacing: 48px vertical
```

## Page-Specific Layouts (C2C Marketplace Style)

### Homepage (Grailed/Vinted Inspired)
```
Hero Section:
- Large search bar prominently centered (like Vinted)
- Categories below search (Men/Women/Kids tabs)
- "Sell Now" CTA button prominent
- Clean, minimal background

Featured/Trending:
- "Just Dropped" or "Trending Now" sections
- Horizontal scrollable product cards
- Designer spotlight or brand features

Recent Listings:
- Infinite scroll product grid (like Grailed)
- 2 columns mobile, 4+ desktop
- Quick view on hover
- Heart/save icons on cards
```

### Browse/Category Pages
```
Layout: Sidebar filters (desktop) + product grid
Filters: Collapsible sections, checkbox/radio inputs
Grid: Responsive (1 col mobile, 2 tablet, 4 desktop)
Pagination: Load more button or infinite scroll
Sort: Dropdown in top right
```

### Product Detail Page
```
Layout: Two-column (images left, details right)
Images: Main image + thumbnail carousel
Details: Title, price, seller, description, buy button
Mobile: Stacked layout, sticky buy button
```

### User Profile
```
Header: Cover photo + avatar + basic info
Tabs: Listings, Reviews, About
Grid: Same as browse page for listings
Stats: Followers, following, items sold
```

### Messaging
```
Layout: Sidebar conversations + main chat area
Mobile: Full-screen conversation view
Messages: Chat bubbles, timestamp, read status
Input: Bottom sticky with attach button
```

## Existing Component Examples

### Current Working Components (Reference)
```
✅ Button - src/lib/components/ui/button.svelte
✅ Card - src/lib/components/ui/card/
✅ Input - src/lib/components/ui/input.svelte
✅ Modal - src/lib/components/ui/modal.svelte
✅ Badge - src/lib/components/ui/badge.svelte
✅ Avatar - src/lib/components/ui/avatar/
```

### Broken Components (Rebuild with same design)
```
🔧 ListingCard - Product display cards
🔧 SearchBar - Header search with autocomplete
🔧 CategoryFilter - Sidebar filters
🔧 CheckoutFlow - Payment forms
🔧 MessageThread - Chat interface
🔧 ProfileHeader - User profile top section
```

## Mobile-First Breakpoints
```css
/* Mobile First Approach */
/* Base styles: 320px+ */

@media (min-width: 640px) {
  /* Tablet: sm */
}

@media (min-width: 768px) {
  /* Desktop: md */
}

@media (min-width: 1024px) {
  /* Large desktop: lg */
}

@media (min-width: 1280px) {
  /* Extra large: xl */
}
```

## Interactive States

### Hover Effects
```
Cards: Subtle shadow elevation (0 4px 12px rgba(0,0,0,0.1))
Buttons: Slight opacity change (opacity: 0.9)
Links: Underline on hover
Images: Slight zoom (transform: scale(1.02))
```

### Loading States
```
Buttons: Spinner + disabled state
Cards: Skeleton placeholders
Images: Blur-to-sharp progressive loading
Forms: Disabled inputs during submission
```

### Empty States
```
No listings: Illustration + "Start selling" CTA
No messages: Simple text + "Browse items" link
No results: Search suggestions
404 pages: Friendly message + navigation
```

## Accessibility Requirements

### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Focus indicators clearly visible

### Interactive Elements
- Minimum 44px touch targets
- Keyboard navigation support
- Screen reader friendly
- ARIA labels where needed

### Images
- Alt text for all images
- Proper loading states
- Error fallbacks

## Animation Guidelines

### Subtle Animations
```
Hover transitions: 150ms ease-out
Modal entrance: 200ms ease-out scale + fade
Page transitions: 300ms ease-in-out
Loading spinners: Smooth infinite rotation
```

### Performance
- Use CSS transforms over position changes
- Prefer opacity over visibility
- Limit animations on mobile
- Respect prefers-reduced-motion

## Content Guidelines

### Messaging Tone
- Friendly but professional
- Clear and concise
- Action-oriented CTAs
- Error messages helpful, not blame-y

### Button Text
- "Sign Up" (not "Register")
- "Buy Now" (not "Purchase")
- "Add to Cart" (not "Add to Basket")
- "Message Seller" (not "Contact")

### Placeholder Text
- Descriptive, not "Lorem ipsum"
- Real example data
- Helpful hints in form fields

---

## Implementation Notes for New Claude

**Priority:** Focus on clean, modern design that feels professional but approachable. Think Airbnb or Stripe's design language - minimal, functional, trustworthy.

**Brand Personality:** Premium but accessible, fashion-forward without being flashy, trustworthy marketplace.

**Key Principle:** Every design decision should support the core goal of facilitating safe, easy transactions between fashion buyers and sellers.

Use this guide alongside the PRD to rebuild the exact same user experience with clean, working code.