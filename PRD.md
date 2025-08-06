# 📋 Driplo.bg - Product Requirements Document

## Executive Summary

Build **Driplo.bg** - Bulgaria's fastest second-hand fashion marketplace. Think Vinted meets Facebook Marketplace, optimized for Bulgarian users.

## Success Metrics

- **Performance**: <2s page loads, 95+ Lighthouse score
- **Usage**: 1000+ listings within first month
- **Revenue**: €500 MRR within 3 months via listing fees
- **Quality**: Zero runtime errors, 100% mobile responsive

## Target Users

- **Primary**: Bulgarian millennials/Gen-Z (18-35)
- **Secondary**: Fashion-conscious bargain hunters
- **Tertiary**: Sustainable fashion advocates

## Core User Journeys

### Buyer Journey

```
Browse homepage → Filter by category → View product →
Contact seller → Negotiate → Meet & buy → Leave review
```

### Seller Journey

```
Click "Sell" → Upload photos → Add details →
Set price → Publish → Respond to buyers → Complete sale
```

## Feature Prioritization

### Phase 1: MVP (Week 1-2)

- [ ] User authentication (email/phone)
- [ ] Product CRUD (create, read, update, delete)
- [ ] Image upload (max 5 per product)
- [ ] Basic search & filters
- [ ] Contact seller messaging
- [ ] Responsive design

### Phase 2: Growth (Week 3-4)

- [ ] Advanced filters (price, location, condition)
- [ ] User profiles & ratings
- [ ] Favorites/watchlist
- [ ] Push notifications
- [ ] Social login (Google/Facebook)

### Phase 3: Monetization (Week 5-6)

- [ ] Premium listings (€2 bump feature)
- [ ] Featured products on homepage
- [ ] Analytics dashboard for sellers
- [ ] Bulk upload for power sellers

## Technical Requirements

### Performance

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s
- Mobile PageSpeed: 90+

### Security

- Input sanitization for all user data
- Image upload size/type validation
- Rate limiting on API endpoints
- HTTPS everywhere

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast 4.5:1 minimum

## Business Model & Monetization

### Revenue Streams

1. **Listing Fees**: €1 per premium listing (highlighted, top placement)
2. **Bump Feature**: €2 to move listing to top for 24h
3. **Featured Products**: €5/week homepage banner placement
4. **Subscription Plans**: €10/month for power sellers (unlimited listings)

### Growth Strategy

1. **Phase 1**: Free launch, build user base
2. **Phase 2**: Introduce premium features
3. **Phase 3**: Expand to other categories (electronics, furniture)
4. **Phase 4**: Mobile app launch

### Success Metrics Timeline

- **Month 1**: 1,000 registered users, 500 listings
- **Month 3**: 5,000 users, 2,000 listings, €500 MRR
- **Month 6**: 15,000 users, 5,000 listings, €2,000 MRR
- **Year 1**: 50,000 users, 20,000 listings, €10,000 MRR

## Competitive Analysis

### Direct Competitors

- **OLX Bulgaria**: Established but outdated UI, poor mobile experience
- **Bazar.bg**: Legacy platform, not fashion-focused
- **Facebook Marketplace**: Good reach but poor categorization

### Competitive Advantages

1. **Fashion-first**: Specialized for clothing/accessories
2. **Modern UX**: Mobile-first, fast, intuitive
3. **Local focus**: Bulgarian language, local payment methods
4. **Trust & Safety**: Verified users, rating system, secure messaging

## Key Features Specification

### Authentication

- Email/phone registration
- SMS verification for phone numbers
- Social login (Google, Facebook)
- Profile completion wizard

### Product Listings

- **Required fields**: Title, price, category, condition, location, images (min 1)
- **Optional fields**: Brand, size, description
- **Image requirements**: Max 5 photos, 5MB each, JPG/PNG only
- **Categories**: Дамски, Мъжки, Детски, Обувки, Чанти, Аксесоари

### Search & Discovery

- **Search**: Full-text search in title/description
- **Filters**: Category, price range, condition, location, size
- **Sorting**: Newest, price (low/high), distance, relevance
- **Location**: City-based filtering (София, Пловдив, Варна, etc.)

### Messaging System

- **Direct messaging** between buyers/sellers
- **Product-specific** chat threads
- **Message status**: Sent, delivered, read
- **Safety features**: Report inappropriate messages

### User Profiles

- **Public profile**: Display name, rating, total sales, location
- **Profile verification**: Phone number, email, optional ID
- **Seller stats**: Response time, successful sales, user reviews

## Technical Constraints

### Platform Requirements

- **Mobile-first**: 80% of traffic expected from mobile
- **Browser support**: Chrome 90+, Safari 14+, Firefox 88+
- **Offline capability**: Basic browsing when offline
- **PWA features**: Add to home screen, push notifications

### Data Requirements

- **Image storage**: Compressed images, multiple sizes (thumb, medium, full)
- **Database**: Support for 100K+ products, 50K+ users
- **Search**: Full-text search with Bulgarian language support
- **Backup**: Daily automated backups, 30-day retention

### Legal & Compliance

- **GDPR compliance**: User data protection, right to deletion
- **Terms of service**: Clear policies on prohibited items
- **Content moderation**: Automated and manual review systems
- **Payment processing**: PCI DSS compliance when payments added

---

**Last Updated**: 2025-08-05  
**Version**: 1.0  
**Status**: Draft
