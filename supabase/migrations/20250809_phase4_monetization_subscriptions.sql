-- Phase 4 Monetization: Premium Features & Seller Subscriptions
-- This migration creates subscription and premium feature tables

-- Create enum types for subscription status
CREATE TYPE subscription_status AS ENUM (
    'active',
    'inactive', 
    'past_due',
    'cancelled',
    'unpaid',
    'trialing'
);

CREATE TYPE subscription_plan AS ENUM (
    'basic',
    'premium',
    'pro',
    'enterprise'
);

-- Create seller subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan details
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Pricing
    monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price >= 0),
    yearly_price DECIMAL(10,2) NOT NULL CHECK (yearly_price >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Features
    max_listings INTEGER DEFAULT -1, -- -1 for unlimited
    max_images_per_listing INTEGER DEFAULT 10,
    featured_listings_per_month INTEGER DEFAULT 0,
    promoted_listings_per_month INTEGER DEFAULT 0,
    analytics_access BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false,
    custom_branding BOOLEAN DEFAULT false,
    bulk_upload BOOLEAN DEFAULT false,
    advanced_filters BOOLEAN DEFAULT false,
    
    -- Commission rates (overrides default)
    commission_rate DECIMAL(5,4), -- NULL means use default platform rate
    
    -- Metadata
    features JSONB, -- Additional features as JSON
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Stripe integration
    stripe_product_id TEXT,
    stripe_monthly_price_id TEXT,
    stripe_yearly_price_id TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seller subscriptions
CREATE TABLE IF NOT EXISTS public.seller_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    
    -- Subscription details
    status subscription_status NOT NULL DEFAULT 'inactive',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Pricing (snapshot at time of subscription)
    current_price DECIMAL(10,2) NOT NULL CHECK (current_price >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Usage tracking
    listings_used INTEGER DEFAULT 0,
    featured_listings_used INTEGER DEFAULT 0,
    promoted_listings_used INTEGER DEFAULT 0,
    
    -- Billing dates
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    next_billing_date TIMESTAMPTZ,
    
    -- Stripe integration
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure only one active subscription per seller
    UNIQUE(seller_id, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create subscription usage tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    subscription_id UUID NOT NULL REFERENCES public.seller_subscriptions(id) ON DELETE CASCADE,
    
    -- Usage details
    feature_type TEXT NOT NULL, -- 'listing', 'featured_listing', 'promoted_listing', etc.
    resource_id UUID, -- ID of the resource being tracked (listing_id, etc.)
    usage_count INTEGER DEFAULT 1,
    
    -- Billing period
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create promoted/featured listings management
CREATE TABLE IF NOT EXISTS public.listing_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.seller_subscriptions(id) ON DELETE SET NULL,
    
    -- Promotion details
    promotion_type TEXT NOT NULL CHECK (promotion_type IN ('featured', 'promoted', 'sponsored')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'cancelled')),
    
    -- Pricing (for paid promotions)
    cost DECIMAL(10,2) DEFAULT 0 CHECK (cost >= 0),
    currency TEXT DEFAULT 'BGN',
    payment_method TEXT DEFAULT 'subscription', -- 'subscription', 'one_time', 'wallet'
    
    -- Scheduling
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Performance tracking
    impression_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0, -- Views that led to messages/likes
    
    -- Targeting (for sponsored listings)
    target_categories UUID[],
    target_locations TEXT[],
    target_demographics JSONB,
    
    -- Budget management
    daily_budget DECIMAL(10,2),
    total_budget DECIMAL(10,2),
    spent_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure valid date range
    CONSTRAINT check_promotion_dates CHECK (ends_at > starts_at)
);

-- Create seller analytics data
CREATE TABLE IF NOT EXISTS public.seller_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Date dimension
    date DATE NOT NULL,
    
    -- Metrics
    profile_views INTEGER DEFAULT 0,
    listing_views INTEGER DEFAULT 0,
    listing_likes INTEGER DEFAULT 0,
    listing_shares INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0, -- Messages that led to sales
    
    -- Financial metrics
    gross_sales DECIMAL(10,2) DEFAULT 0,
    net_earnings DECIMAL(10,2) DEFAULT 0,
    platform_fees DECIMAL(10,2) DEFAULT 0,
    
    -- Listing metrics
    active_listings INTEGER DEFAULT 0,
    new_listings INTEGER DEFAULT 0,
    sold_listings INTEGER DEFAULT 0,
    expired_listings INTEGER DEFAULT 0,
    
    -- Engagement metrics
    response_time_minutes INTEGER, -- Average response time
    response_rate DECIMAL(3,2), -- Percentage of messages responded to
    
    -- Search metrics
    search_impressions INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    search_rank_average DECIMAL(5,2),
    
    -- Created/updated
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(seller_id, date)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, description, monthly_price, yearly_price, max_listings, max_images_per_listing, featured_listings_per_month, promoted_listings_per_month, analytics_access, priority_support, custom_branding, bulk_upload, advanced_filters, commission_rate) VALUES
('Basic', 'basic', 'Perfect for casual sellers', 0.00, 0.00, 10, 5, 0, 0, false, false, false, false, false, 0.07), -- 7% commission for free tier
('Premium', 'premium', 'For growing sellers with more features', 19.99, 199.99, 50, 10, 3, 1, true, false, false, true, true, 0.05), -- 5% commission
('Pro', 'pro', 'Professional sellers with advanced tools', 49.99, 499.99, -1, 15, 10, 5, true, true, true, true, true, 0.03), -- 3% commission
('Enterprise', 'enterprise', 'Large businesses with custom needs', 199.99, 1999.99, -1, 20, -1, -1, true, true, true, true, true, 0.02) -- 2% commission
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_seller_id ON public.seller_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_status ON public.seller_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_stripe_subscription_id ON public.seller_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_current_period_end ON public.seller_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_billing_period ON public.subscription_usage(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature_type ON public.subscription_usage(feature_type);

CREATE INDEX IF NOT EXISTS idx_listing_promotions_listing_id ON public.listing_promotions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_seller_id ON public.listing_promotions(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_type_status ON public.listing_promotions(promotion_type, status);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_dates ON public.listing_promotions(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_id ON public.seller_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_date ON public.seller_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_date ON public.seller_analytics(seller_id, date DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_analytics ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Seller subscriptions policies
CREATE POLICY "Sellers can view their own subscriptions" ON public.seller_subscriptions
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "System can manage subscriptions" ON public.seller_subscriptions
    FOR ALL USING (
        auth.uid() = seller_id OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Subscription usage policies
CREATE POLICY "Sellers can view their subscription usage" ON public.subscription_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.seller_subscriptions 
            WHERE id = subscription_id AND seller_id = auth.uid()
        )
    );

-- Listing promotions policies
CREATE POLICY "Sellers can manage their promotions" ON public.listing_promotions
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view active promotions" ON public.listing_promotions
    FOR SELECT USING (status = 'active' AND starts_at <= NOW() AND ends_at > NOW());

-- Seller analytics policies
CREATE POLICY "Sellers can view their own analytics" ON public.seller_analytics
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "System can insert analytics data" ON public.seller_analytics
    FOR INSERT WITH CHECK (true); -- Controlled by application logic

-- Create function to track subscription usage
CREATE OR REPLACE FUNCTION public.track_subscription_usage(
    p_seller_id UUID,
    p_feature_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_usage_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_id UUID;
    v_current_period_start TIMESTAMPTZ;
    v_current_period_end TIMESTAMPTZ;
BEGIN
    -- Get active subscription for seller
    SELECT id, current_period_start, current_period_end
    INTO v_subscription_id, v_current_period_start, v_current_period_end
    FROM public.seller_subscriptions 
    WHERE seller_id = p_seller_id 
    AND status = 'active' 
    AND current_period_start <= NOW() 
    AND current_period_end > NOW()
    LIMIT 1;
    
    -- If no active subscription, return false
    IF v_subscription_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert usage record
    INSERT INTO public.subscription_usage (
        subscription_id,
        feature_type,
        resource_id,
        usage_count,
        billing_period_start,
        billing_period_end
    ) VALUES (
        v_subscription_id,
        p_feature_type,
        p_resource_id,
        p_usage_count,
        v_current_period_start,
        v_current_period_end
    );
    
    -- Update usage counter in subscription
    CASE p_feature_type
        WHEN 'listing' THEN
            UPDATE public.seller_subscriptions 
            SET listings_used = listings_used + p_usage_count
            WHERE id = v_subscription_id;
        WHEN 'featured_listing' THEN
            UPDATE public.seller_subscriptions 
            SET featured_listings_used = featured_listings_used + p_usage_count
            WHERE id = v_subscription_id;
        WHEN 'promoted_listing' THEN
            UPDATE public.seller_subscriptions 
            SET promoted_listings_used = promoted_listings_used + p_usage_count
            WHERE id = v_subscription_id;
    END CASE;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_subscription_limit(
    p_seller_id UUID,
    p_feature_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription public.seller_subscriptions;
    v_plan public.subscription_plans;
    v_current_usage INTEGER;
BEGIN
    -- Get active subscription and plan
    SELECT s.*, p.*
    INTO v_subscription, v_plan
    FROM public.seller_subscriptions s
    JOIN public.subscription_plans p ON s.plan_id = p.id
    WHERE s.seller_id = p_seller_id 
    AND s.status = 'active' 
    AND s.current_period_start <= NOW() 
    AND s.current_period_end > NOW()
    LIMIT 1;
    
    -- If no active subscription, default to basic limits
    IF v_subscription IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check limits based on feature type
    CASE p_feature_type
        WHEN 'listing' THEN
            RETURN (v_plan.max_listings = -1 OR v_subscription.listings_used < v_plan.max_listings);
        WHEN 'featured_listing' THEN
            RETURN (v_plan.featured_listings_per_month = -1 OR v_subscription.featured_listings_used < v_plan.featured_listings_per_month);
        WHEN 'promoted_listing' THEN
            RETURN (v_plan.promoted_listings_per_month = -1 OR v_subscription.promoted_listings_used < v_plan.promoted_listings_per_month);
        ELSE
            RETURN TRUE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get seller's current plan
CREATE OR REPLACE FUNCTION public.get_seller_plan(p_seller_id UUID)
RETURNS TABLE(
    plan_name TEXT,
    max_listings INTEGER,
    max_images_per_listing INTEGER,
    featured_listings_per_month INTEGER,
    promoted_listings_per_month INTEGER,
    analytics_access BOOLEAN,
    priority_support BOOLEAN,
    commission_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.name,
        sp.max_listings,
        sp.max_images_per_listing,
        sp.featured_listings_per_month,
        sp.promoted_listings_per_month,
        sp.analytics_access,
        sp.priority_support,
        sp.commission_rate
    FROM public.seller_subscriptions ss
    JOIN public.subscription_plans sp ON ss.plan_id = sp.id
    WHERE ss.seller_id = p_seller_id 
    AND ss.status = 'active'
    AND ss.current_period_start <= NOW() 
    AND ss.current_period_end > NOW()
    LIMIT 1;
    
    -- If no active subscription, return basic plan
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            'Basic'::TEXT,
            10,
            5,
            0,
            0,
            false,
            false,
            0.07::DECIMAL(5,4);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER trigger_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_seller_subscriptions_updated_at
    BEFORE UPDATE ON public.seller_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_listing_promotions_updated_at
    BEFORE UPDATE ON public.listing_promotions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_seller_analytics_updated_at
    BEFORE UPDATE ON public.seller_analytics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans for sellers with features and pricing';
COMMENT ON TABLE public.seller_subscriptions IS 'Active subscriptions for sellers with Stripe integration';
COMMENT ON TABLE public.subscription_usage IS 'Usage tracking for subscription features and limits';
COMMENT ON TABLE public.listing_promotions IS 'Promoted and featured listings management';
COMMENT ON TABLE public.seller_analytics IS 'Daily analytics data for sellers with premium access';