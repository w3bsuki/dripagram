# UI/UX AUDIT - Driplo.bg Marketplace
*No BS. No fluff. Just what needs fixing and how.*

## The Harsh Reality
Your current design is trying to be Linear when it should be studying Facebook Marketplace. Bulgarian users don't care about "radical minimalism" - they care about finding deals fast and not getting scammed.

---

## What Actually Matters (Priority Order)

### 1. **Mobile Experience (70% of your traffic)**
```css
/* Bottom-safe navigation */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 20px);
  height: calc(56px + env(safe-area-inset-bottom));
}

/* Thumb-zone critical actions */
.action-zone {
  position: fixed;
  bottom: calc(72px + env(safe-area-inset-bottom));
  right: 16px;
}

/* Swipeable image galleries */
.gallery {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
```

### 2. **Trust Indicators (Make or Break)**
```typescript
// Every listing needs these visible signals
interface TrustSignals {
  verifiedSeller: boolean;      // Blue checkmark
  responseTime: string;         // "Отговаря до 1 час"
  activeListings: number;       // "42 активни обяви"
  memberSince: Date;            // "Член от 2023"
  lastSeen: string;             // "Онлайн преди 5 мин"
  reviews: { count: number; rating: number };
}
```

### 3. **Speed Perception (Not Just Actual Speed)**
```css
/* Skeleton screens that match actual content */
.skeleton-product {
  /* Match exact dimensions to prevent layout shift */
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Optimistic updates */
.favorite-button {
  /* Update UI immediately, sync later */
  transition: none; /* Instant feedback */
}
```

---

## Real Design System (That Actually Ships)

### Colors (5 Total, Not 50)
```css
@theme {
  /* Backgrounds */
  --white: #FFFFFF;
  --gray-50: #F9FAFB;   /* Slight background */
  --gray-200: #E5E7EB;  /* Borders */
  --gray-900: #111827;  /* Text */
  
  /* Actions */
  --brand: #DC2626;     /* Red like OLX - urgency works */
  --success: #10B981;   /* Green for money/success */
  
  /* That's it. No purple gradients. */
}
```

### Typography (Cyrillic-First)
```css
@theme {
  /* Bulgarian-optimized stack */
  --font-sans: 'Inter', -apple-system, 'Segoe UI', 'Roboto', 'Ubuntu', sans-serif;
  
  /* Only sizes you need */
  --text-xs: 0.75rem;   /* Metadata */
  --text-sm: 0.875rem;  /* Body */
  --text-base: 1rem;    /* Default */
  --text-lg: 1.25rem;   /* Headings */
  --text-xl: 1.5rem;    /* Page titles */
  
  /* Mobile-first line heights */
  --leading-tight: 1.25;  /* Headings */
  --leading-normal: 1.5;  /* Body */
}
```

### Spacing (Strict 4px Grid)
```css
@theme {
  /* Every value divisible by 4 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## Component Patterns That Convert

### Product Card (Optimized for Scanning)
```svelte
<article class="product-card">
  <!-- 4:3 ratio - clothes look better -->
  <img loading="lazy" decoding="async" />
  
  <!-- Price first - it's what users scan for -->
  <div class="price">45 лв</div>
  
  <!-- Size + Brand on same line -->
  <div class="meta">M • Zara</div>
  
  <!-- Location + Time -->
  <div class="location">София • преди 2 часа</div>
  
  <!-- Trust signal -->
  {#if seller.verified}
    <CheckBadge class="verified" />
  {/if}
</article>
```

### Search That Actually Works
```svelte
<!-- Persistent search with recent/suggestions -->
<div class="search-container">
  <input 
    type="search"
    inputmode="search"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />
  
  <!-- Show these IMMEDIATELY on focus -->
  <div class="search-suggestions">
    <!-- Recent searches -->
    <!-- Popular in your city -->
    <!-- Trending now -->
  </div>
</div>
```

### Chat That Builds Trust
```svelte
<!-- Quick responses build trust -->
<div class="chat-input">
  <!-- Pre-written quick responses -->
  <button>Още ли е налично?</button>
  <button>Възможна ли е доставка?</button>
  <button>Последна цена?</button>
</div>
```

---

## Performance Budget (Non-Negotiable)

### CSS Limits
- **Total CSS:** < 50KB gzipped
- **Critical CSS:** < 14KB (inline in head)
- **Utility classes:** Use Tailwind JIT, purge aggressively

### Loading Strategy
```html
<!-- Critical CSS inline -->
<style>/* 14KB max critical styles */</style>

<!-- Non-critical deferred -->
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Fonts async -->
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Image Optimization
```svelte
<!-- Responsive images with WebP -->
<picture>
  <source 
    type="image/webp"
    srcset="img-200.webp 200w, img-400.webp 400w"
    sizes="(max-width: 640px) 50vw, 25vw"
  />
  <img 
    src="img-400.jpg"
    loading="lazy"
    decoding="async"
    alt={product.title}
  />
</picture>
```

---

## Implementation (Real Timeline)

### Week 1: Foundation
**Monday-Tuesday:** Audit current CSS, identify what breaks
**Wednesday:** Set up feature flags for gradual rollout
**Thursday-Friday:** Implement new tokens behind flags

### Week 2: Critical Path
**Monday-Tuesday:** Update product cards and search
**Wednesday:** Update navigation and mobile experience  
**Thursday-Friday:** Update forms and checkout flow

### Week 3: Testing
**Monday-Tuesday:** A/B test with 10% of users
**Wednesday:** Fix issues from testing
**Thursday-Friday:** Gradual rollout to 50%

### Week 4: Polish
**Full rollout with monitoring and rollback ready**

---

## Metrics That Matter

### Track These Daily
- **Time to First Listing View:** < 2 seconds
- **Search to Contact:** < 4 taps
- **Image Load Time:** < 1 second on 3G
- **Cart Abandonment:** < 60%
- **Message Response Rate:** > 70%

### User Feedback Loop
```javascript
// Add this to every critical flow
if (Math.random() < 0.01) { // 1% of users
  showMicroSurvey({
    question: "Лесно ли намерихте това, което търсите?",
    options: ["Да", "Не"],
    followUp: true
  });
}
```

---

## Stop Doing This Shit

1. **Stop copying Linear/Vercel** - You're not a SaaS tool
2. **Stop using 50 shades of gray** - Users can't see the difference
3. **Stop with the "subtle" animations** - 0ms or 200ms, nothing between
4. **Stop ignoring Cyrillic** - It's wider, plan for it
5. **Stop desktop-first thinking** - Nobody's buying jeans on their MacBook Pro

---

## Start Doing This

1. **Study Facebook Marketplace** - 3 billion users can't be wrong
2. **Add quick actions everywhere** - "Запази", "Сподели", "Питай"
3. **Show seller response time** - "Обикновено отговаря до час"
4. **Cache aggressively** - Users browse the same stuff repeatedly
5. **Pre-load common next actions** - User views product → preload chat

---

## The Bottom Line

Your design system is overthinking simple problems. Bulgarian users want:
- Fast loading (work on shitty 3G)
- Clear prices (big, bold, in BGN)
- Trust signals (verified, reviews, response time)
- Easy contact (one-tap to message)
- Mobile-first (everything works with thumb)

Everything else is noise. Ship fast, test with real users, iterate based on data.

---

*Stop reading design blogs. Start watching users.*
*Status: Ready to implement. No more excuses.*