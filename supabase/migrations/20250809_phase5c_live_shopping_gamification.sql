-- Phase 5C: Live Shopping and Gamification Features Migration
-- Creates tables and functions for live shopping sessions, gamification system,
-- badges, loyalty points, and referral programs

-- ============================================================================
-- LIVE SHOPPING TABLES
-- ============================================================================

-- Live shopping sessions
CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'ended')) DEFAULT 'scheduled',
    viewer_count INTEGER DEFAULT 0,
    peak_viewer_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    stream_url TEXT,
    chat_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live chat messages
CREATE TABLE IF NOT EXISTS live_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('chat', 'question', 'system', 'purchase')) DEFAULT 'chat',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group buying offers
CREATE TABLE IF NOT EXISTS group_buying_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    session_id UUID REFERENCES live_sessions(id) ON DELETE SET NULL,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    expires_at TIMESTAMPTZ NOT NULL,
    current_participants INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'expired')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group buying participants
CREATE TABLE IF NOT EXISTS group_buying_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES group_buying_offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(offer_id, user_id)
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- Seller reputation scores
CREATE TABLE IF NOT EXISTS seller_reputation (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL DEFAULT 70 CHECK (overall_score >= 0 AND overall_score <= 100),
    response_time_score INTEGER NOT NULL DEFAULT 70 CHECK (response_time_score >= 0 AND response_time_score <= 100),
    shipping_score INTEGER NOT NULL DEFAULT 70 CHECK (shipping_score >= 0 AND shipping_score <= 100),
    quality_score INTEGER NOT NULL DEFAULT 70 CHECK (quality_score >= 0 AND quality_score <= 100),
    communication_score INTEGER NOT NULL DEFAULT 70 CHECK (communication_score >= 0 AND communication_score <= 100),
    total_sales INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    positive_feedback_rate DECIMAL(5,2) DEFAULT 0.00,
    level TEXT NOT NULL CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
    level_progress INTEGER DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge definitions (static data)
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('sales', 'quality', 'engagement', 'social', 'special')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    points_reward INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Loyalty points system
CREATE TABLE IF NOT EXISTS loyalty_points (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    current_tier TEXT NOT NULL CHECK (current_tier IN ('newcomer', 'regular', 'vip', 'elite', 'champion')) DEFAULT 'newcomer',
    tier_progress INTEGER DEFAULT 0 CHECK (tier_progress >= 0 AND tier_progress <= 100),
    points_to_next_tier INTEGER DEFAULT 100,
    multiplier DECIMAL(3,1) DEFAULT 1.0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transactions log
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    points_earned INTEGER NOT NULL, -- Can be negative for spending
    multiplier_applied DECIMAL(3,1) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral program
CREATE TABLE IF NOT EXISTS referral_programs (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    total_rewards_earned INTEGER DEFAULT 0,
    referral_tier TEXT NOT NULL CHECK (referral_tier IN ('starter', 'ambassador', 'influencer', 'legend')) DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'cashback', 'discount')),
    reward_value INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'expired')) DEFAULT 'pending',
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Achievement events log
CREATE TABLE IF NOT EXISTS achievement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social shares tracking
CREATE TABLE IF NOT EXISTS social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Live shopping indexes
CREATE INDEX IF NOT EXISTS idx_live_sessions_seller_id ON live_sessions(seller_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_product_id ON live_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON live_sessions(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_live_messages_session_id ON live_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_live_messages_created_at ON live_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_group_buying_product_id ON group_buying_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_group_buying_status ON group_buying_offers(status);
CREATE INDEX IF NOT EXISTS idx_group_buying_expires ON group_buying_offers(expires_at);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_seller_reputation_score ON seller_reputation(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_seller_reputation_level ON seller_reputation(level);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(current_tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_lifetime ON loyalty_points(lifetime_points DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_programs(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to increment viewer count
CREATE OR REPLACE FUNCTION increment_viewer_count(session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    UPDATE live_sessions 
    SET viewer_count = viewer_count + 1,
        total_views = total_views + 1,
        updated_at = NOW()
    WHERE id = session_id
    RETURNING viewer_count INTO current_count;
    
    -- Update peak if necessary
    UPDATE live_sessions 
    SET peak_viewer_count = GREATEST(peak_viewer_count, viewer_count)
    WHERE id = session_id;
    
    RETURN COALESCE(current_count, 0);
END;
$$;

-- Function to update session viewers (for real-time updates)
CREATE OR REPLACE FUNCTION update_session_viewers(session_id UUID, viewer_count INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE live_sessions 
    SET viewer_count = viewer_count,
        peak_viewer_count = GREATEST(peak_viewer_count, viewer_count),
        updated_at = NOW()
    WHERE id = session_id;
END;
$$;

-- Function to increment group buying participants
CREATE OR REPLACE FUNCTION increment_group_participants(offer_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    UPDATE group_buying_offers
    SET current_participants = current_participants + 1
    WHERE id = offer_id
    RETURNING current_participants INTO participant_count;
    
    RETURN COALESCE(participant_count, 0);
END;
$$;

-- Function to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE referral_programs
    SET total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE user_id = user_id;
END;
$$;

-- Function to get seller sales metrics (for reputation calculation)
CREATE OR REPLACE FUNCTION get_seller_sales_metrics(seller_id UUID)
RETURNS TABLE(
    total_sales INTEGER,
    completed_orders INTEGER,
    average_order_value DECIMAL,
    avg_shipping_days INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_sales,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::INTEGER as completed_orders,
        AVG(amount)::DECIMAL as average_order_value,
        5::INTEGER as avg_shipping_days -- Placeholder - would calculate from actual shipping data
    FROM orders o
    JOIN products p ON p.id = o.product_id
    WHERE p.seller_id = seller_id;
END;
$$;

-- Function to get seller review metrics
CREATE OR REPLACE FUNCTION get_seller_review_metrics(seller_id UUID)
RETURNS TABLE(
    total_reviews INTEGER,
    average_rating DECIMAL,
    positive_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_reviews,
        AVG(rating)::DECIMAL as average_rating,
        (COUNT(CASE WHEN rating >= 4 THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL as positive_rate
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    WHERE p.seller_id = seller_id;
END;
$$;

-- Function to get seller response metrics
CREATE OR REPLACE FUNCTION get_seller_response_metrics(seller_id UUID)
RETURNS TABLE(
    average_response_time INTEGER,
    response_rate INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This is a placeholder - would calculate from actual message/conversation data
    RETURN QUERY
    SELECT 
        6::INTEGER as average_response_time, -- Hours
        85::INTEGER as response_rate; -- Percentage
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at columns
CREATE TRIGGER update_live_sessions_updated_at
    BEFORE UPDATE ON live_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at
    BEFORE UPDATE ON loyalty_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_programs_updated_at
    BEFORE UPDATE ON referral_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA - BADGE DEFINITIONS
-- ============================================================================

INSERT INTO badges (id, name, description, icon, category, rarity, points_reward) VALUES
('first_sale', 'First Sale', 'Complete your first sale', '🎉', 'sales', 'common', 100),
('rising_star', 'Rising Star', 'Complete 10 sales', '⭐', 'sales', 'common', 250),
('top_seller', 'Top Seller', 'Complete 100 sales', '🏆', 'sales', 'rare', 1000),
('perfectionist', 'Perfectionist', 'Maintain 4.8+ rating with 20+ reviews', '💎', 'quality', 'epic', 2000),
('speed_demon', 'Speed Demon', 'Respond to messages within 1 hour consistently', '⚡', 'engagement', 'rare', 500),
('social_butterfly', 'Social Butterfly', 'Share 50+ products on social media', '🦋', 'social', 'rare', 750),
('influencer', 'Influencer', 'Refer 10 successful users', '📢', 'social', 'epic', 1500),
('streak_master', 'Streak Master', 'Sell at least one item for 30 consecutive days', '🔥', 'engagement', 'legendary', 5000),
('live_star', 'Live Shopping Star', 'Host 5 successful live shopping sessions', '📺', 'engagement', 'rare', 800),
('group_leader', 'Group Buy Leader', 'Create 3 successful group buying offers', '👥', 'social', 'epic', 1200)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buying_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buying_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Live Sessions Policies
CREATE POLICY "Anyone can view live sessions" ON live_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own live sessions" ON live_sessions
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own live sessions" ON live_sessions
    FOR UPDATE USING (auth.uid() = seller_id);

-- Live Messages Policies
CREATE POLICY "Anyone can view live messages" ON live_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON live_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id = 'system');

-- Group Buying Policies
CREATE POLICY "Anyone can view group buying offers" ON group_buying_offers
    FOR SELECT USING (true);

CREATE POLICY "Product owners can create group offers" ON group_buying_offers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_id AND p.seller_id = auth.uid()
        )
    );

CREATE POLICY "Users can join group buying" ON group_buying_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their group participations" ON group_buying_participants
    FOR SELECT USING (auth.uid() = user_id);

-- Gamification Policies
CREATE POLICY "Anyone can view seller reputation" ON seller_reputation
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own reputation" ON seller_reputation
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view user badges" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Users can earn badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their loyalty points" ON loyalty_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their loyalty points" ON loyalty_points
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their point transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create point transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their referral program" ON referral_programs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their referral program" ON referral_programs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view referral rewards they're involved in" ON referral_rewards
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can view their achievements" ON achievement_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create achievement events" ON achievement_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can track their social shares" ON social_shares
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;