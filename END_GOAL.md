# END GOAL - Driplo.bg C2C Platform

## 🎯 Vision
**Bulgaria's fastest, most trusted C2C marketplace** - Where buying and selling second-hand items is instant, safe, and delightful.

## 🏆 Success Metrics
- **Performance:** < 1s page load, 100 Lighthouse score
- **Scale:** 100k+ active listings, 50k+ MAU within 6 months  
- **Quality:** Zero runtime errors, 100% type safety
- **Revenue:** €10k MRR within 12 months

## 📐 Technical Architecture

### Database Schema (Supabase PostgreSQL)
```sql
users
├─ id (uuid, primary)
├─ email, phone, name
├─ avatar_url, verified
└─ created_at, ratings

products  
├─ id (uuid, primary)
├─ user_id (foreign)
├─ title, description, price
├─ category, condition
├─ images[] (urls)
├─ location (point)
└─ status, views, created_at

messages
├─ id, product_id
├─ sender_id, receiver_id  
├─ content, read
└─ created_at

reviews
├─ id, transaction_id
├─ reviewer_id, reviewed_id
├─ rating (1-5), comment
└─ created_at
```

### API Routes Structure
```
/api/
├─ auth/      → login, register, logout, verify
├─ products/  → CRUD, search, filter, trending
├─ users/     → profile, ratings, listings
├─ messages/  → send, inbox, mark-read
├─ uploads/   → images, compress, validate
└─ analytics/ → views, clicks, conversions
```

### Component Architecture
```
$lib/
├─ components/
│   ├─ auth/        → LoginForm, RegisterForm, AuthGuard
│   ├─ products/    → ProductCard, ProductGrid, ProductDetail
│   ├─ messaging/   → ChatBox, MessageList, NotificationBell
│   ├─ user/        → Profile, Dashboard, Settings
│   └─ ui/          → shadcn components
├─ stores/          → auth, products, messages (using $state)
├─ utils/           → validators, formatters, helpers
└─ server/          → db client, api helpers, middleware
```

## 🚀 Development Phases

### ✅ Phase 1: Foundation (Week 1-2)
- [x] Project setup with SvelteKit 2 + Svelte 5
- [ ] Complete type safety (zero errors)
- [ ] Authentication flow (register/login/logout)
- [ ] Basic product CRUD
- [ ] Responsive UI with Tailwind v4

### 📦 Phase 2: Core Features (Week 3-4)
- [ ] Product search & filters
- [ ] Category navigation
- [ ] Image upload (max 10 per listing)
- [ ] Location-based filtering
- [ ] In-app messaging
- [ ] User profiles & ratings

### 🎨 Phase 3: Enhanced UX (Week 5-6)
- [ ] Real-time notifications
- [ ] Saved searches & favorites
- [ ] Price negotiation flow
- [ ] Map integration for meetups
- [ ] PWA with offline support
- [ ] Dark mode

### 💰 Phase 4: Monetization (Week 7-8)
- [ ] Premium listings (featured/bumped)
- [ ] Shop subscriptions for power sellers
- [ ] Promoted products in search
- [ ] Analytics dashboard for sellers
- [ ] Transaction fees for escrow service

### 🌍 Phase 5: Scale (Week 9+)
- [ ] React Native mobile apps
- [ ] AI-powered features:
  - [ ] Auto-categorization from photos
  - [ ] Price recommendations
  - [ ] Fraud detection
  - [ ] Content moderation
- [ ] Multi-language support (BG, EN, RU)
- [ ] API for partners
- [ ] Export to Facebook Marketplace/OLX

## 🎯 MVP Definition (Phase 1 Complete)
**A user can:**
1. Sign up and verify email
2. Create a listing with photos
3. Search and filter products
4. Contact sellers via messaging
5. Leave reviews after transactions

**The system has:**
- Zero TypeScript errors
- < 2s page loads
- Mobile-responsive design
- Basic SEO optimization
- Error tracking

## 🛠️ Tech Stack (Locked)
```yaml
Frontend:
  - Svelte 5.37+ (runes, snippets)
  - SvelteKit 2.27+ (SSR, routing)
  - TypeScript 5.9+ (strict mode)
  - Tailwind CSS v4 (with config)

Backend:
  - Supabase (auth, db, storage, realtime)
  - Edge Functions (for complex logic)
  
Tools:
  - Vite (bundling)
  - Vitest (testing)
  - Playwright (e2e)
  - GitHub Actions (CI/CD)
```

## 💎 Unique Selling Points
1. **Speed** - Fastest marketplace in Bulgaria (< 1s loads)
2. **Trust** - Video verification, escrow, buyer protection
3. **Smart** - AI categorization, price suggestions
4. **Local** - Bulgarian-first features (ePay, Speedy integration)
5. **Modern** - Best-in-class UX, not another OLX clone

## 🎬 User Journeys

### Seller Flow
```
Open app → Take photos → AI suggests category/price → 
Add details → Post → Get notifications → Chat with buyers → 
Arrange meetup → Complete sale → Get review
```

### Buyer Flow  
```
Browse/Search → Filter (location, price, condition) →
View details → Check seller rating → Message seller →
Negotiate → Meet & inspect → Buy → Leave review
```

## 📈 Business Model
| Revenue Stream | Target | Monthly |
|---------------|--------|---------|
| Featured Listings | 1000 × €5 | €5,000 |
| Shop Subscriptions | 100 × €20 | €2,000 |
| Transaction Fees | 500 × €5 | €2,500 |
| Display Ads | CPM based | €500 |
| **Total MRR** | | **€10,000** |

---
**Remember:** Every line of code should move us closer to this vision. No bloat, no over-engineering, just a fast, reliable marketplace that users love.