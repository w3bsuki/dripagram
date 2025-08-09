-- Performance Indexes - Only creating USED indexes based on actual query patterns
-- This avoids the 19 unused indexes from the old setup

-- Primary lookup indexes (most used)
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status_created ON products(status, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_products_category_id ON products(category_id) WHERE category_id IS NOT NULL;

-- Foreign key indexes (fixes unindexed foreign key warnings)
CREATE INDEX idx_categories_parent_id ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_conversations_participant2_id ON conversations(participant2_id);
CREATE INDEX idx_conversations_product_id ON conversations(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_messages_product_id ON messages(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_product_views_user_id ON product_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_ratings_product_id ON user_ratings(product_id) WHERE product_id IS NOT NULL;

-- Optimized composite indexes for common queries
CREATE INDEX idx_product_likes_product_user ON product_likes(product_id, user_id);
CREATE INDEX idx_product_views_product_date ON product_views(product_id, viewed_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_offers_product_status ON offers(product_id, status) WHERE status = 'pending';

-- Text search index for products (replaces inefficient LIKE queries)
CREATE INDEX idx_products_search_text ON products USING gin(
    to_tsvector('simple', coalesce(title, '') || ' ' || 
                          coalesce(description, '') || ' ' || 
                          coalesce(brand, ''))
);

-- User activity indexes
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_purchases_buyer_status ON purchases(buyer_id, status);
CREATE INDEX idx_purchases_seller_status ON purchases(seller_id, status);

-- Analytics optimization
CREATE INDEX idx_analytics_events_user_time ON analytics_events(user_id, timestamp DESC) 
    WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_consent_user_id ON user_consent(user_id);

-- Partial indexes for active/common queries (more efficient than full indexes)
CREATE INDEX idx_products_active_views ON products(views DESC) 
    WHERE status = 'active' AND views > 0;
CREATE INDEX idx_products_active_likes ON products(like_count DESC) 
    WHERE status = 'active' AND like_count > 0;
CREATE INDEX idx_categories_active ON categories(display_order, name) 
    WHERE is_active = TRUE;

-- Username lookup (case-insensitive)
CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles(lower(username));

-- Location-based queries (if needed)
CREATE INDEX idx_products_city ON products(city) 
    WHERE city IS NOT NULL AND status = 'active';

-- Note: We're NOT creating these unused indexes from the old setup:
-- idx_orders_status, idx_order_items_order_id, idx_orders_created_at
-- idx_profiles_verified, idx_profiles_username (duplicate)
-- idx_categories_slug, idx_categories_is_active (redundant)
-- idx_products_search (replaced with better GIN index)
-- idx_messages_conversation_id (replaced with composite)
-- idx_promotions_active, idx_offers_status (redundant with partials)
-- idx_product_likes_user_id (covered by composite)
-- idx_product_views_viewed_at (covered by composite)
-- idx_analytics_events_timestamp, idx_analytics_events_event_name (covered)