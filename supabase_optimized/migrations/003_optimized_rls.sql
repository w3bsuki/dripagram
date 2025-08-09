-- Optimized RLS Policies - Following Supabase best practices
-- Uses (SELECT auth.uid()) pattern for 100x performance improvement
-- Combines multiple policies where possible

-- ============ PROFILES ============
-- Public read access
CREATE POLICY "profiles_select_public" ON profiles
    FOR SELECT TO anon, authenticated
    USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

-- ============ PRODUCTS ============
-- Public can view active products
CREATE POLICY "products_select_active" ON products
    FOR SELECT TO anon, authenticated
    USING (status = 'active');

-- Sellers can view all their products
CREATE POLICY "products_select_own" ON products
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = seller_id);

-- Users can create products
CREATE POLICY "products_insert" ON products
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = seller_id);

-- Sellers can update their products
CREATE POLICY "products_update_own" ON products
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = seller_id)
    WITH CHECK ((SELECT auth.uid()) = seller_id);

-- Sellers can delete their products
CREATE POLICY "products_delete_own" ON products
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = seller_id);

-- ============ PRODUCT LIKES ============
-- Public can view all likes
CREATE POLICY "likes_select_all" ON product_likes
    FOR SELECT TO anon, authenticated
    USING (true);

-- Users can like products
CREATE POLICY "likes_insert" ON product_likes
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can unlike products
CREATE POLICY "likes_delete_own" ON product_likes
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============ PRODUCT VIEWS ============
-- Anonymous tracking allowed
CREATE POLICY "views_insert_all" ON product_views
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Only admins can read views (for analytics)
CREATE POLICY "views_select_admin" ON product_views
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = (SELECT auth.uid())
            AND verified = true
        )
    );

-- ============ USER FOLLOWS ============
-- Public can view follows
CREATE POLICY "follows_select_all" ON user_follows
    FOR SELECT TO anon, authenticated
    USING (true);

-- Users can follow others
CREATE POLICY "follows_insert" ON user_follows
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = follower_id);

-- Users can unfollow
CREATE POLICY "follows_delete_own" ON user_follows
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = follower_id);

-- ============ CONVERSATIONS ============
-- Users can view their conversations
CREATE POLICY "conversations_select_own" ON conversations
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IN (participant1_id, participant2_id)
    );

-- Users can create conversations
CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) IN (participant1_id, participant2_id)
    );

-- Participants can update conversation
CREATE POLICY "conversations_update_own" ON conversations
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) IN (participant1_id, participant2_id)
    );

-- ============ MESSAGES ============
-- Participants can view messages
CREATE POLICY "messages_select_own" ON messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (SELECT auth.uid()) IN (c.participant1_id, c.participant2_id)
        )
    );

-- Users can send messages
CREATE POLICY "messages_insert_own" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = sender_id
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (SELECT auth.uid()) IN (c.participant1_id, c.participant2_id)
        )
    );

-- Recipients can mark as read
CREATE POLICY "messages_update_recipient" ON messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (SELECT auth.uid()) IN (c.participant1_id, c.participant2_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (SELECT auth.uid()) IN (c.participant1_id, c.participant2_id)
        )
    );

-- ============ OFFERS ============
-- Combined policy for viewing offers (buyer or seller)
CREATE POLICY "offers_select_involved" ON offers
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = buyer_id
        OR EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_id
            AND p.seller_id = (SELECT auth.uid())
        )
    );

-- Users can make offers
CREATE POLICY "offers_insert" ON offers
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = buyer_id);

-- Combined update policy (buyer or seller can update)
CREATE POLICY "offers_update_involved" ON offers
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) = buyer_id
        OR EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_id
            AND p.seller_id = (SELECT auth.uid())
        )
    );

-- ============ PURCHASES ============
-- Users view their purchases (as buyer or seller)
CREATE POLICY "purchases_select_involved" ON purchases
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) IN (buyer_id, seller_id)
    );

-- Buyers create purchases
CREATE POLICY "purchases_insert" ON purchases
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = buyer_id);

-- Both parties can update
CREATE POLICY "purchases_update_involved" ON purchases
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) IN (buyer_id, seller_id)
    );

-- ============ USER RATINGS ============
-- Public can view ratings
CREATE POLICY "ratings_select_all" ON user_ratings
    FOR SELECT TO anon, authenticated
    USING (true);

-- Users can rate after purchase
CREATE POLICY "ratings_insert" ON user_ratings
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = rater_id
        AND EXISTS (
            SELECT 1 FROM purchases
            WHERE id = purchase_id
            AND buyer_id = (SELECT auth.uid())
            AND status = 'delivered'
        )
    );

-- Users can update their ratings
CREATE POLICY "ratings_update_own" ON user_ratings
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = rater_id)
    WITH CHECK ((SELECT auth.uid()) = rater_id);

-- ============ ANALYTICS EVENTS ============
-- Service role only (handled by backend)
CREATE POLICY "analytics_service_only" ON analytics_events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============ USER CONSENT ============
-- Users view own consent
CREATE POLICY "consent_select_own" ON user_consent
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Users manage own consent
CREATE POLICY "consent_insert_own" ON user_consent
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "consent_update_own" ON user_consent
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============ CATEGORIES ============
-- Public read access
CREATE POLICY "categories_select_all" ON categories
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

-- ============ PROMOTIONS ============
-- Public can view active promotions
CREATE POLICY "promotions_select_active" ON promotions
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- ============ ORDERS ============
-- Users view own orders
CREATE POLICY "orders_select_own" ON orders
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Users create orders
CREATE POLICY "orders_insert_own" ON orders
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users update own orders
CREATE POLICY "orders_update_own" ON orders
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- ============ ORDER ITEMS ============
-- Users view own order items
CREATE POLICY "order_items_select_own" ON order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_id
            AND o.user_id = (SELECT auth.uid())
        )
    );