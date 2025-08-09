-- Phase 4 Monetization: Fraud Prevention & Security
-- This migration creates fraud detection and prevention systems

-- Create enum types for fraud status
CREATE TYPE fraud_status AS ENUM (
    'clean',
    'suspicious',
    'flagged',
    'blocked',
    'reviewed'
);

CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Create fraud detection rules
CREATE TABLE IF NOT EXISTS public.fraud_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule details
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rule_type TEXT NOT NULL, -- 'velocity', 'pattern', 'behavioral', 'identity'
    
    -- Rule configuration
    conditions JSONB NOT NULL, -- Rule conditions as JSON
    threshold_value DECIMAL(10,2),
    time_window_minutes INTEGER,
    
    -- Actions
    action TEXT NOT NULL CHECK (action IN ('flag', 'review', 'block', 'notify')),
    severity risk_level NOT NULL DEFAULT 'medium',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    auto_resolve BOOLEAN DEFAULT false, -- Auto resolve after time period
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    tags TEXT[],
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fraud assessments for transactions
CREATE TABLE IF NOT EXISTS public.fraud_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    
    -- Assessment results
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level NOT NULL,
    status fraud_status NOT NULL DEFAULT 'clean',
    
    -- Triggered rules
    triggered_rules TEXT[], -- Array of rule names that triggered
    risk_factors JSONB, -- Detailed risk factors and scores
    
    -- ML/AI scores (future integration)
    ml_fraud_score DECIMAL(3,2), -- 0.00 to 1.00
    identity_verification_score DECIMAL(3,2),
    behavioral_score DECIMAL(3,2),
    device_fingerprint_score DECIMAL(3,2),
    
    -- Decision
    decision TEXT CHECK (decision IN ('approve', 'review', 'decline', 'pending')),
    decision_reason TEXT,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Metadata
    assessment_data JSONB, -- Raw assessment data
    external_scores JSONB, -- Scores from external services
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user risk profiles
CREATE TABLE IF NOT EXISTS public.user_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Overall risk assessment
    risk_score INTEGER NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level NOT NULL DEFAULT 'low',
    trust_score INTEGER NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    
    -- Behavioral patterns
    avg_transaction_amount DECIMAL(10,2) DEFAULT 0,
    transaction_frequency DECIMAL(5,2) DEFAULT 0, -- Transactions per day
    unusual_activity_count INTEGER DEFAULT 0,
    
    -- Identity verification
    identity_verified BOOLEAN DEFAULT false,
    identity_verification_level INTEGER DEFAULT 0, -- 0-5 verification levels
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    address_verified BOOLEAN DEFAULT false,
    
    -- Device and location patterns
    device_count INTEGER DEFAULT 1,
    location_count INTEGER DEFAULT 1,
    login_pattern_score DECIMAL(3,2) DEFAULT 1.00,
    
    -- Historical data
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    disputed_transactions INTEGER DEFAULT 0,
    refund_rate DECIMAL(5,4) DEFAULT 0.0000,
    
    -- Account age and activity
    account_age_days INTEGER DEFAULT 0,
    days_since_last_activity INTEGER DEFAULT 0,
    profile_completion_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- External scores
    credit_score INTEGER, -- If available
    social_media_verification JSONB,
    external_identity_checks JSONB,
    
    -- Flags and notes
    manual_review_flag BOOLEAN DEFAULT false,
    whitelist_flag BOOLEAN DEFAULT false,
    blacklist_flag BOOLEAN DEFAULT false,
    notes TEXT,
    
    -- Audit fields
    last_assessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fraud alerts and incidents
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Alert details
    alert_type TEXT NOT NULL, -- 'rule_triggered', 'manual_report', 'ml_detection', 'pattern_anomaly'
    severity risk_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- References
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    rule_id UUID REFERENCES public.fraud_rules(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed', 'escalated')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest
    
    -- Investigation
    assigned_to UUID REFERENCES public.profiles(id),
    investigated_at TIMESTAMPTZ,
    resolution TEXT,
    resolution_notes TEXT,
    
    -- Metadata
    alert_data JSONB,
    evidence JSONB, -- Screenshots, logs, etc.
    false_positive BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payment dispute tracking
CREATE TABLE IF NOT EXISTS public.payment_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    disputed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Dispute details
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('chargeback', 'refund_request', 'item_not_received', 'item_not_as_described', 'unauthorized', 'fraud')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'escalated', 'closed')),
    
    -- Stripe/external references
    stripe_dispute_id TEXT,
    chargeback_id TEXT,
    
    -- Evidence
    buyer_evidence JSONB,
    seller_evidence JSONB,
    platform_evidence JSONB,
    
    -- Resolution
    resolution TEXT,
    resolved_amount DECIMAL(10,2) DEFAULT 0,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    
    -- Communication
    buyer_contacted_at TIMESTAMPTZ,
    seller_contacted_at TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transaction monitoring logs
CREATE TABLE IF NOT EXISTS public.transaction_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Monitoring details
    event_type TEXT NOT NULL, -- 'created', 'payment_attempt', 'payment_failed', 'completed', 'suspicious_activity'
    risk_indicators JSONB, -- Detailed risk indicators
    
    -- Device and location
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    geolocation JSONB, -- Country, city, timezone
    
    -- Timing analysis
    time_since_registration INTEGER, -- Seconds
    time_since_last_transaction INTEGER, -- Seconds
    transaction_speed_score DECIMAL(3,2), -- How fast was this transaction
    
    -- Behavioral indicators
    session_duration INTEGER, -- Seconds
    page_views_before_transaction INTEGER,
    form_completion_time INTEGER, -- Seconds
    
    -- Technical indicators
    proxy_detected BOOLEAN DEFAULT false,
    vpn_detected BOOLEAN DEFAULT false,
    tor_detected BOOLEAN DEFAULT false,
    bot_detected BOOLEAN DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default fraud rules
INSERT INTO public.fraud_rules (name, description, rule_type, conditions, threshold_value, time_window_minutes, action, severity) VALUES
('High Velocity Transactions', 'Too many transactions in short time', 'velocity', '{"max_transactions": 5, "time_window": 60}', 5, 60, 'review', 'high'),
('Large Amount Transaction', 'Transaction amount exceeds threshold', 'pattern', '{"min_amount": 1000}', 1000, null, 'review', 'medium'),
('New User High Value', 'New user making high value transaction', 'pattern', '{"account_age_days": 7, "min_amount": 500}', 500, null, 'flag', 'medium'),
('Multiple Failed Payments', 'Multiple payment failures in short time', 'pattern', '{"max_failures": 3, "time_window": 30}', 3, 30, 'flag', 'high'),
('Unusual Location', 'Transaction from unusual location', 'behavioral', '{"location_deviation": 500}', 500, null, 'flag', 'low'),
('Velocity Spike', 'Unusual increase in transaction frequency', 'behavioral', '{"frequency_multiplier": 3}', 3, 1440, 'review', 'medium')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_transaction_id ON public.fraud_assessments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_user_id ON public.fraud_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_risk_level ON public.fraud_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_status ON public.fraud_assessments(status);
CREATE INDEX IF NOT EXISTS idx_fraud_assessments_decision ON public.fraud_assessments(decision);

CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_user_id ON public.user_risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_risk_level ON public.user_risk_profiles(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_trust_score ON public.user_risk_profiles(trust_score);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON public.fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_assigned_to ON public.fraud_alerts(assigned_to);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_transaction_id ON public.payment_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON public.payment_disputes(status);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_stripe_dispute_id ON public.payment_disputes(stripe_dispute_id);

CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_transaction_id ON public.transaction_monitoring(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_user_id ON public.transaction_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_event_type ON public.transaction_monitoring(event_type);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_ip_address ON public.transaction_monitoring(ip_address);

-- Add RLS policies
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_monitoring ENABLE ROW LEVEL SECURITY;

-- Fraud rules policies (admin only)
CREATE POLICY "Admins can manage fraud rules" ON public.fraud_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Fraud assessments policies (admin only for security)
CREATE POLICY "Admins can view fraud assessments" ON public.fraud_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Users can view their own risk profile (limited)
CREATE POLICY "Users can view their risk profile" ON public.user_risk_profiles
    FOR SELECT USING (
        auth.uid() = user_id AND NOT manual_review_flag
    );

CREATE POLICY "System can manage risk profiles" ON public.user_risk_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Fraud alerts policies (admin/moderator only)
CREATE POLICY "Moderators can manage fraud alerts" ON public.fraud_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Payment disputes policies
CREATE POLICY "Users can view their payment disputes" ON public.payment_disputes
    FOR SELECT USING (
        auth.uid() = disputed_by OR EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can create payment disputes" ON public.payment_disputes
    FOR INSERT WITH CHECK (auth.uid() = disputed_by);

-- Transaction monitoring policies (admin only)
CREATE POLICY "Admins can view transaction monitoring" ON public.transaction_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Create function to calculate user risk score
CREATE OR REPLACE FUNCTION public.calculate_user_risk_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_risk_score INTEGER := 50; -- Start with neutral score
    v_profile public.profiles;
    v_stats RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
    
    -- Get transaction statistics
    SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        AVG(total_amount) as avg_amount,
        EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 86400 as account_age_days
    INTO v_stats
    FROM public.transactions 
    WHERE buyer_id = p_user_id OR seller_id = p_user_id;
    
    -- Risk factors (lower score = higher risk)
    
    -- Account age (newer accounts are riskier)
    IF v_stats.account_age_days < 7 THEN
        v_risk_score := v_risk_score - 20;
    ELSIF v_stats.account_age_days < 30 THEN
        v_risk_score := v_risk_score - 10;
    ELSIF v_stats.account_age_days > 365 THEN
        v_risk_score := v_risk_score + 10;
    END IF;
    
    -- Transaction success rate
    IF v_stats.total_transactions > 0 THEN
        IF (v_stats.successful_transactions::DECIMAL / v_stats.total_transactions) < 0.5 THEN
            v_risk_score := v_risk_score - 30;
        ELSIF (v_stats.successful_transactions::DECIMAL / v_stats.total_transactions) > 0.9 THEN
            v_risk_score := v_risk_score + 15;
        END IF;
    END IF;
    
    -- Profile completeness
    IF v_profile.phone IS NULL THEN v_risk_score := v_risk_score - 5; END IF;
    IF v_profile.address IS NULL THEN v_risk_score := v_risk_score - 5; END IF;
    IF v_profile.avatar_url IS NULL THEN v_risk_score := v_risk_score - 3; END IF;
    IF v_profile.bio IS NULL OR LENGTH(v_profile.bio) < 50 THEN v_risk_score := v_risk_score - 3; END IF;
    
    -- Verification status
    IF v_profile.seller_verified THEN v_risk_score := v_risk_score + 15; END IF;
    
    -- Seller rating (for sellers)
    IF v_profile.role IN ('seller', 'admin', 'moderator') THEN
        IF v_profile.seller_rating >= 4.5 THEN
            v_risk_score := v_risk_score + 10;
        ELSIF v_profile.seller_rating < 3.0 THEN
            v_risk_score := v_risk_score - 15;
        END IF;
    END IF;
    
    -- Ensure score is within bounds
    v_risk_score := GREATEST(0, LEAST(100, v_risk_score));
    
    RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assess transaction fraud risk
CREATE OR REPLACE FUNCTION public.assess_transaction_fraud_risk(p_transaction_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_transaction public.transactions;
    v_buyer_risk INTEGER;
    v_seller_risk INTEGER;
    v_risk_score INTEGER := 0;
    v_risk_factors JSONB := '{}';
BEGIN
    -- Get transaction details
    SELECT * INTO v_transaction FROM public.transactions WHERE id = p_transaction_id;
    
    IF v_transaction IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Get user risk scores
    v_buyer_risk := public.calculate_user_risk_score(v_transaction.buyer_id);
    v_seller_risk := public.calculate_user_risk_score(v_transaction.seller_id);
    
    -- Base risk from user profiles (inverse - higher user risk score = lower transaction risk)
    v_risk_score := 100 - ((v_buyer_risk + v_seller_risk) / 2);
    
    -- Transaction amount risk
    IF v_transaction.total_amount > 1000 THEN
        v_risk_score := v_risk_score + 20;
        v_risk_factors := v_risk_factors || '{"high_amount": true}';
    ELSIF v_transaction.total_amount > 500 THEN
        v_risk_score := v_risk_score + 10;
        v_risk_factors := v_risk_factors || '{"medium_amount": true}';
    END IF;
    
    -- Add more risk factors as needed...
    
    -- Insert fraud assessment
    INSERT INTO public.fraud_assessments (
        transaction_id,
        user_id,
        risk_score,
        risk_level,
        status,
        risk_factors,
        decision
    ) VALUES (
        p_transaction_id,
        v_transaction.buyer_id,
        GREATEST(0, LEAST(100, v_risk_score)),
        CASE 
            WHEN v_risk_score < 30 THEN 'low'
            WHEN v_risk_score < 60 THEN 'medium'
            WHEN v_risk_score < 80 THEN 'high'
            ELSE 'critical'
        END,
        CASE 
            WHEN v_risk_score < 60 THEN 'clean'
            WHEN v_risk_score < 80 THEN 'suspicious'
            ELSE 'flagged'
        END,
        v_risk_factors,
        CASE 
            WHEN v_risk_score < 60 THEN 'approve'
            WHEN v_risk_score < 80 THEN 'review'
            ELSE 'decline'
        END
    );
    
    RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assess new transactions
CREATE OR REPLACE FUNCTION public.auto_assess_transaction_fraud()
RETURNS TRIGGER AS $$
BEGIN
    -- Assess fraud risk for new transactions
    PERFORM public.assess_transaction_fraud_risk(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_assess_fraud
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.auto_assess_transaction_fraud();

-- Add updated_at triggers
CREATE TRIGGER trigger_fraud_rules_updated_at
    BEFORE UPDATE ON public.fraud_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_fraud_assessments_updated_at
    BEFORE UPDATE ON public.fraud_assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_user_risk_profiles_updated_at
    BEFORE UPDATE ON public.user_risk_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_fraud_alerts_updated_at
    BEFORE UPDATE ON public.fraud_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_payment_disputes_updated_at
    BEFORE UPDATE ON public.payment_disputes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.fraud_rules IS 'Configurable fraud detection rules and thresholds';
COMMENT ON TABLE public.fraud_assessments IS 'Fraud risk assessments for transactions';
COMMENT ON TABLE public.user_risk_profiles IS 'Risk profiles and trust scores for users';
COMMENT ON TABLE public.fraud_alerts IS 'Fraud alerts and incidents requiring investigation';
COMMENT ON TABLE public.payment_disputes IS 'Payment disputes and chargebacks tracking';
COMMENT ON TABLE public.transaction_monitoring IS 'Detailed monitoring logs for transaction security';