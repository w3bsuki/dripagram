# Visual Reference Package for Claude 📸

## What to Give the New Claude Instance

### 1. Design System Files ✅
- `FRESH-START-PRD.md` - Complete product requirements
- `UI-UX-GUIDE.md` - Detailed design specifications
- This `VISUAL-REFERENCE-PACKAGE.md` - Implementation guide

### 2. Working Component References
Copy these specific files to show working patterns:

```bash
# Working UI components (copy these exact files):
src/lib/components/ui/button.svelte
src/lib/components/ui/card/
src/lib/components/ui/input.svelte
src/lib/components/ui/badge.svelte
src/lib/components/ui/modal.svelte
src/lib/components/ui/avatar/

# Tailwind config (design tokens):
tailwind.config.js

# Package.json (dependencies):
package.json
```

### 3. Design References to Mention

Tell Claude to build in the style of:
- **Airbnb** (clean, trustworthy, professional)
- **Stripe** (minimal, functional)
- **Grailed/Depop** (fashion marketplace feel)
- **Linear** (modern, sharp UI)

### 4. Specific Visual Requirements

#### Color Scheme
```
Primary: Black (#000000) - for headers, buttons, text
Secondary: Light gray (#f5f5f5) - for backgrounds
Accent: Blue (#3b82f6) - for links, CTAs
White: (#ffffff) - main background
```

#### Typography
```
Font: Inter Variable (clean, modern)
Hierarchy: Clear size differences
Weight: Regular for body, medium for labels, bold for prices
```

#### Layout Style
```
Spacing: Generous whitespace
Alignment: Clean grids and consistent margins
Borders: Subtle, rounded corners (6-8px)
Shadows: Minimal, only on hover/elevation
```

### 5. Component Visual Descriptions

#### Header
- Clean white background with subtle shadow
- Logo on left, search bar center, user menu right
- Height: 64px, sticky positioning
- Mobile: Collapsible with hamburger menu

#### Product Cards
- 4:5 aspect ratio images
- White background, subtle border
- Price prominent and bold
- Seller info with small avatar
- Hover: slight shadow elevation

#### Buttons
- Primary: Black background, white text
- Secondary: White background, black border
- Rounded corners (8px)
- Good padding, proper typography

#### Forms
- Clean input fields with gray borders
- Blue focus states
- Labels above inputs
- Proper spacing between fields

### 6. Page Layout Patterns

#### Homepage
```
Hero section with large search bar
Category cards (Men/Women/Kids) 
Recent listings grid
Clean, lots of whitespace
```

#### Browse Page
```
Sidebar filters (desktop) or modal (mobile)
Product grid responsive
Sort/filter controls at top
Load more pagination
```

#### Product Detail
```
Two-column: images left, details right
Image carousel with thumbnails
Clear price, title, seller info
Prominent buy/message buttons
```

### 7. Interaction Patterns

#### Hover States
- Cards lift slightly with shadow
- Buttons darken or change opacity
- Links underline
- Images zoom slightly

#### Loading States
- Skeleton screens for content
- Spinners in buttons
- Progressive image loading
- Disabled states during actions

#### Mobile Behavior
- Touch-friendly tap targets (44px+)
- Swipe gestures where appropriate
- Bottom navigation consideration
- Sticky elements properly sized

### 8. Example Component Code Style

Show Claude this pattern for Svelte 5:

```svelte
<!-- Good Svelte 5 pattern -->
<script lang="ts">
  interface Props {
    title: string
    price: number
    image: string
  }
  
  let { title, price, image }: Props = $props()
  let loading = $state(false)
</script>

<div class="product-card bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
  <img src={image} alt={title} class="w-full aspect-[4/5] object-cover" />
  <div class="p-4">
    <h3 class="font-medium text-gray-900 line-clamp-2">{title}</h3>
    <p class="text-lg font-bold text-gray-900">${price}</p>
  </div>
</div>

<style>
  .product-card {
    /* Additional styles if needed */
  }
</style>
```

### 9. What to Emphasize to New Claude

**High Priority:**
- Use Svelte 5 syntax exclusively (`onclick`, `$props()`, `$state()`)
- Follow the exact color scheme and typography
- Make it mobile-responsive from day 1
- Keep design clean and minimal
- Focus on user experience over flashy design

**Medium Priority:**
- Add subtle animations and hover effects
- Implement proper loading states
- Ensure accessibility compliance
- Use consistent spacing and alignment

**Low Priority:**
- Advanced animations
- Complex interactions
- Decorative elements

### 10. C2C Marketplace Design References

**Primary Inspiration - Top C2C Clothing Platforms:**
- **Grailed.com** - Premium streetwear/designer marketplace
- **Vinted.com** - European fashion marketplace leader  
- **Depop.com** - Gen-Z fashion app (mobile-first)
- **Poshmark.com** - Social commerce fashion platform
- **TheRealReal.com** - Luxury consignment marketplace
- **Vestiaire Collective** - Global luxury fashion marketplace

**Secondary References for UX Patterns:**
- **Airbnb.com** - Trust systems, user profiles, messaging
- **Etsy.com** - Seller shops, reviews, search filters
- **eBay.com** - Auction/buy-now, seller ratings
- **Facebook Marketplace** - Local selling, simple listing creation

**Key C2C Design Patterns to Copy:**
- **Product Grid Layout** (Grailed/Vinted style)
- **Trust Indicators** (seller ratings, verification badges)
- **Search & Filter UI** (size, brand, price, condition filters)
- **Seller Profiles** (stats, reviews, shop layout)
- **Messaging Interface** (offer negotiations, quick replies)
- **Mobile-First Design** (thumb-friendly navigation)
- **Photo-Heavy Listings** (multiple angles, details)
- **Social Proof** (likes, favorites, follower counts)

### 11. Quality Standards

The new build should be:
- ✅ Mobile-first responsive
- ✅ Accessible (WCAG 2.1)
- ✅ Fast loading (<3s)
- ✅ Clean, professional design
- ✅ Consistent with brand
- ✅ User-friendly interactions

---

## Complete Package for New Claude

Give them:
1. `FRESH-START-PRD.md` (requirements)
2. `UI-UX-GUIDE.md` (design system)
3. `VISUAL-REFERENCE-PACKAGE.md` (this file)
4. Working component files from current project
5. Tailwind config
6. Package.json for dependencies

This should give them everything needed to rebuild the exact same experience but with clean, working code.