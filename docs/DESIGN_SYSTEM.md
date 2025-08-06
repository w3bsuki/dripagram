# Driplo.bg Design System - Facebook Marketplace Style

## 🎨 Color Palette (Final Implementation)

### Core Colors (80% of UI)

```css
--color-white: #ffffff; /* Pure white backgrounds */
--color-gray-50: #f5f5f5; /* Light background like Facebook */
--color-gray-100: #e4e6ea; /* Border color like Facebook */
--color-gray-500: #65676b; /* Text secondary like Facebook */
--color-gray-900: #1c1e21; /* Text primary like Facebook */
```

### Action Colors (20% of UI)

```css
--color-brand: #1877f2; /* Facebook blue for trust */
--color-accent: #42b883; /* Success green */
--color-danger: #e41e3f; /* Red for warnings */
```

### shadcn-svelte Variables

```css
--primary: #1877f2; /* Facebook blue */
--secondary: #f5f5f5; /* Light gray */
--muted: #f5f5f5; /* Same as secondary */
--border: #e4e6ea; /* Facebook border gray */
--background: #ffffff; /* Pure white */
--foreground: #1c1e21; /* Facebook text dark */
```

## 🏗️ Component Design Principles

### 1. Facebook Marketplace Aesthetic

- **Clean white backgrounds** with subtle gray borders
- **Minimal shadows** (shadow-sm, shadow-md max)
- **Professional trust indicators** over flashy elements
- **Subtle hover states** (gray-50 backgrounds, not colorful)

### 2. Color Usage Guidelines

- **Primary blue (#1877F2)**: CTAs, links, active states, trust elements
- **Gray spectrum**: Backgrounds (50), borders (100), text (500, 900)
- **Green accent (#42B883)**: Success states, verification badges
- **Red danger (#E41E3F)**: Errors, warnings, destructive actions

### 3. Component Patterns

#### Cards

```css
.product-card {
	@apply rounded-lg border border-gray-100 bg-white;
	@apply transition-shadow hover:shadow-md;
}
```

#### Buttons

```css
.btn-primary {
	@apply bg-primary hover:bg-primary/90 text-white;
	@apply rounded-lg px-4 py-2 font-medium transition-colors;
}

.btn-secondary {
	@apply bg-gray-50 text-gray-900 hover:bg-gray-100;
	@apply rounded-lg px-4 py-2 font-medium transition-colors;
}
```

#### Form Elements

```css
.input {
	@apply rounded-lg border border-gray-100 bg-white;
	@apply focus:ring-primary focus:border-primary focus:ring-2;
}
```

## 🚫 What We Eliminated

### ❌ Old Purple System (73 references removed)

- `bg-purple-600`, `from-purple-600`, `to-pink-500`
- Flashy gradients and colorful overlays
- Inconsistent mobile vs desktop styling
- Component duplication (separate mobile headers)

### ❌ Over-designed Elements

- Complex gradient backgrounds
- Heavy animations and effects
- Flashy fashion app aesthetics
- 50+ color variations

## ✅ New Professional Standards

### Trust-Focused Design

- Clean product cards with subtle shadows
- Professional seller indicators
- Clear pricing without distracting elements
- Facebook-style interaction patterns

### Responsive Consistency

- Single Header component for all devices
- Consistent color usage across breakpoints
- Unified bottom navigation for mobile
- Same component styling everywhere

### Performance Optimized

- Minimal CSS bundle size
- Hardware-accelerated animations only where needed
- Optimized skeleton loaders
- Efficient hover states

## 📱 Mobile-First Approach

### Bottom Navigation

```css
.bottom-nav {
	@apply fixed bottom-0 z-40 border-t bg-white;
	@apply safe-bottom; /* iOS safe area support */
}
```

### Touch Targets

- Minimum 44px tap targets
- Safe area padding for notched devices
- Thumb-friendly positioning
- Swipe-friendly galleries

## 🔄 Migration Summary

### Before (Purple Fashion App)

- 73 purple color references
- Separate mobile/desktop components
- Flashy gradients and effects
- Inconsistent styling patterns

### After (Facebook Marketplace Professional)

- 0 purple references
- Unified responsive components
- Clean white/gray/blue palette
- Consistent trust-focused design

## 📋 Usage Guidelines

### When to Use Colors

1. **Primary Blue**: CTAs, links, selected states, trust badges
2. **Gray 50**: Subtle backgrounds, disabled states
3. **Gray 100**: Borders, dividers
4. **Gray 500**: Secondary text, icons
5. **Gray 900**: Primary text, headings

### Component Consistency Rules

1. **Always** use CSS variables from app.css
2. **Never** hardcode colors in components
3. **Prefer** hover:bg-gray-50 over colorful hovers
4. **Use** shadow-sm/md for depth, not gradients
5. **Apply** border-gray-100 for subtle separation

### Brand Expression

- Logo remains colorful (primary blue)
- CTA buttons use primary blue
- Success states use green accent
- Error states use danger red
- Everything else is neutral grays

## 🎯 Conversion Optimization

### Trust Elements

- Verified seller badges (green)
- Star ratings (yellow/gray)
- Professional avatars with subtle indicators
- Clean pricing without distractions

### User Experience

- Facebook-familiar interaction patterns
- Predictable hover states
- Clear visual hierarchy
- Mobile-optimized touch interfaces

---

**Last Updated:** 2025-08-03  
**Status:** ✅ Fully Implemented  
**Build Status:** ✅ Passing (0 TypeScript errors)

This design system transforms Driplo from a flashy fashion app into a professional, trustworthy marketplace that users recognize and trust, following Facebook Marketplace's proven conversion patterns.
