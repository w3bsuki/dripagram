# Driplo - Fashion Marketplace PRD 🚀

## Project Overview

**Driplo** is a modern fashion marketplace connecting users and brands through secure buying/selling transactions. Think "Depop meets Grailed" with brand verification and professional seller features.

## Technical Stack Requirements

- **Frontend:** SvelteKit 2 + Svelte 5 (latest syntax only)
- **Styling:** Tailwind CSS v4 + Shadcn-Svelte components
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe
- **Deployment:** Vercel
- **Language:** TypeScript (strict mode)

## Core Features Specification

### 1. Authentication & User Management

#### User Registration
- Email/password signup with verification
- Optional Google OAuth
- Profile setup wizard after registration
- Username availability checking
- Age verification (13+ required)

#### User Profiles
- Public profile pages (/profile/[username])
- Profile photos with upload
- Bio, location, social links
- Seller ratings and reviews
- Join date and verification badges

#### Brand Accounts
- Separate brand registration flow
- Brand verification process with document upload
- Business information (tax ID, address)
- Brand analytics dashboard
- Verified brand badges

### 2. Product Listings & Marketplace

#### Product Listings
- Create/edit/delete listings
- Multiple image upload (up to 8 images)
- Product details:
  - Title, description, price
  - Category and subcategory
  - Brand, size, condition
  - Materials, color, measurements
- Draft listings functionality
- Listing analytics for sellers

#### Categories & Navigation
- **Main Categories:** Men, Women, Kids
- **Subcategories:** 
  - Clothing: Tops, Bottoms, Dresses, Outerwear, etc.
  - Shoes: Sneakers, Boots, Dress shoes, etc.
  - Accessories: Bags, Jewelry, Watches, etc.
- Dynamic category filters
- Brand filtering
- Price range filters
- Condition filters (New, Like New, Good, Fair)

#### Search & Discovery
- Global search with autocomplete
- Filter combinations (price, size, brand, condition)
- Sort options (newest, price low/high, popularity)
- Saved searches
- Recently viewed items

### 3. E-commerce & Payments

#### Shopping Experience
- Add to cart / Buy now options
- Guest checkout (with account creation)
- Wishlist/favorites system
- Product recommendations
- Recently viewed items

#### Checkout Flow
- Shipping address management
- Payment method selection (Stripe)
- Order summary and confirmation
- Email confirmations
- Invoice generation

#### Order Management
- Order status tracking
- Shipping notifications
- Delivery confirmations
- Order history for buyers/sellers

#### Payment Processing
- Stripe integration for payments
- Seller payout management
- Commission handling (5-10% platform fee)
- Refund processing
- Tax calculation and reporting

### 4. Communication & Support

#### Messaging System
- User-to-user messaging
- Real-time chat interface
- Image sharing in messages
- Message history and search
- Block/report functionality

#### Notifications
- In-app notifications
- Email notifications
- Push notifications (PWA)
- Notification preferences

### 5. Reviews & Trust

#### Review System
- 5-star rating system
- Written reviews
- Buyer and seller reviews
- Review moderation
- Response to reviews

#### Trust & Safety
- User verification system
- Report listing/user functionality
- Content moderation
- Fraud detection
- Account suspension system

### 6. Admin Dashboard

#### User Management
- User list with search/filter
- Account status management
- Verification review process
- Support ticket system

#### Content Management
- Listing moderation queue
- Review moderation
- Category management
- Featured listings

#### Analytics
- Platform metrics (users, listings, sales)
- Revenue tracking
- User engagement metrics
- Performance monitoring

## Database Schema (Existing - Use Same Supabase)

### Core Tables
```sql
-- Users (extend auth.users)
profiles (id, username, full_name, bio, avatar_url, location, etc.)

-- Listings
listings (id, user_id, title, description, price, images, category, etc.)

-- Orders
orders (id, buyer_id, seller_id, listing_id, amount, status, etc.)

-- Messages
conversations (id, participants)
messages (id, conversation_id, sender_id, content, created_at)

-- Reviews
reviews (id, reviewer_id, reviewed_id, order_id, rating, comment)

-- Categories
categories (id, name, slug, parent_id)

-- Brand verification
brand_verification_requests (id, user_id, business_name, documents, status)
```

## API Routes Specification

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/reset-password` - Password reset

### Listings
- `GET /api/listings` - Get listings with filters
- `POST /api/listings` - Create listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `GET /api/listings/[id]` - Get single listing

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/[id]` - Update order status
- `POST /api/orders/[id]/refund` - Process refund

### Payments
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/stripe/webhooks` - Stripe webhook handler

### Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations/[id]` - Get conversation messages

## Page Structure & Routing

### Public Pages
- `/` - Homepage with featured listings
- `/browse` - Browse all listings
- `/[category_slug]` - Category pages (men, women, kids)
- `/[category_slug]/[subcategory]` - Subcategory pages
- `/listings/[id]` - Listing detail page
- `/profile/[username]` - Public profile pages

### Authenticated Pages
- `/sell` - Create listing
- `/messages` - Messages inbox
- `/messages/[id]` - Conversation view
- `/orders` - Order history
- `/wishlist` - Saved items
- `/profile/settings` - Profile settings

### Brand Pages
- `/brands` - Brand directory
- `/brands/[slug]` - Brand profile pages
- `/brands/onboarding` - Brand registration
- `/brands/analytics` - Brand dashboard

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/listings` - Listing moderation
- `/admin/orders` - Order management

## UI/UX Requirements

### Design System
- Modern, clean interface
- Mobile-first responsive design
- Consistent color scheme (likely dark mode support)
- Accessible components (WCAG 2.1)
- Loading states and error handling

### Key Components Needed
```
Header with search, navigation, user menu
ProductCard for listing display
ListingForm for creating/editing listings
CheckoutFlow for purchase process
MessageThread for conversations
ProfileHeader for user profiles
CategoryFilter for browsing
SearchBar with autocomplete
Modal components for various actions
```

### Mobile Experience
- Touch-friendly interface
- Swipe gestures where appropriate
- Optimized image loading
- Mobile payment options (Apple Pay, Google Pay)

## Performance Requirements

- Page load times < 3 seconds
- Image optimization and lazy loading
- Efficient database queries
- CDN for static assets
- Progressive Web App (PWA) capabilities

## Security Requirements

- HTTPS only
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting on APIs
- Secure file uploads

## Integration Requirements

### Stripe Integration
- Payment processing
- Subscription management (future)
- Webhook handling
- Payout management

### Supabase Integration
- Authentication
- Real-time subscriptions for messages
- File storage for images
- Row Level Security (RLS) policies

### Email Integration
- Transactional emails (welcome, verification, orders)
- Email service (Resend or similar)

## Launch Requirements

### MVP Features (Must Have)
- User registration/login
- Create and browse listings
- Purchase flow with Stripe
- Basic messaging
- User profiles
- Category browsing

### Post-MVP Features (Nice to Have)
- Brand verification
- Advanced search
- Reviews system
- Admin dashboard
- Advanced analytics

## Success Metrics

- User registration rate
- Listing creation rate
- Transaction volume (GMV)
- User engagement (DAU/MAU)
- Platform commission revenue

## Development Approach

1. **Setup:** Clean SvelteKit 2 + Svelte 5 project
2. **Database:** Connect to existing Supabase instance
3. **Authentication:** Implement user registration/login
4. **Core Features:** Build MVP features in priority order
5. **Testing:** Test each feature thoroughly
6. **Deploy:** Deploy to Vercel for production

## Environment Variables Needed

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Other
RESEND_API_KEY=your_email_api_key
```

---

## Implementation Notes for Claude

**Use Svelte 5 syntax exclusively:**
- `onclick` not `on:click`
- `$props()` not `export let`
- `$state()` for reactive variables
- `$derived()` for computed values
- `{@render children()}` not `<slot>`

**Database queries should:**
- Use Row Level Security (RLS)
- Include proper error handling
- Use TypeScript for type safety
- Handle edge cases gracefully

**UI should be:**
- Mobile-first responsive
- Accessible (ARIA labels, keyboard navigation)
- Fast loading with proper loading states
- Consistent with design system

This PRD captures all the functionality we've built so far and provides a clear roadmap for rebuilding clean. Ready to start fresh?