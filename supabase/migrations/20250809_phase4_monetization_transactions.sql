-- Phase 4 Monetization: Transactions & Payment System
-- This migration creates the core transaction management tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for transaction status
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'processing', 
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
);

CREATE TYPE payment_method AS ENUM (
    'stripe',
    'paypal', 
    'bank_transfer',
    'wallet'
);

-- Main transactions table for order management
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction details
    transaction_id TEXT UNIQUE NOT NULL, -- External reference (Stripe payment intent, etc.)
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Financial details
    item_price DECIMAL(10,2) NOT NULL CHECK (item_price >= 0),
    shipping_price DECIMAL(10,2) DEFAULT 0 CHECK (shipping_price >= 0),
    platform_fee DECIMAL(10,2) NOT NULL CHECK (platform_fee >= 0),
    payment_processing_fee DECIMAL(10,2) DEFAULT 0 CHECK (payment_processing_fee >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    seller_earnings DECIMAL(10,2) NOT NULL CHECK (seller_earnings >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Status and metadata
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL DEFAULT 'stripe',
    notes TEXT,
    
    -- Tracking info
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure total calculation is correct
    CONSTRAINT check_total_calculation CHECK (
        total_amount = item_price + shipping_price + platform_fee + payment_processing_fee
    ),
    
    -- Ensure seller earnings calculation
    CONSTRAINT check_seller_earnings CHECK (
        seller_earnings = item_price + shipping_price - platform_fee - payment_processing_fee
    )
);

-- Create payments table for tracking Stripe/external payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Payment identifiers
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    status TEXT NOT NULL, -- Stripe status: requires_payment_method, requires_confirmation, succeeded, etc.
    
    -- Metadata
    payment_method_details JSONB,
    failure_reason TEXT,
    receipt_url TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seller wallets for earnings management
CREATE TABLE IF NOT EXISTS public.seller_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner
    seller_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Balance tracking
    available_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    pending_balance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
    total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_earnings >= 0),
    total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0),
    
    -- Currency
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Payout details
    payout_method TEXT DEFAULT 'bank_transfer',
    bank_account_details JSONB, -- Encrypted bank details
    paypal_email TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create wallet transactions for balance tracking
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    wallet_id UUID NOT NULL REFERENCES public.seller_wallets(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    
    -- Transaction details
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Description
    description TEXT NOT NULL,
    reference_id TEXT, -- External reference (payout ID, etc.)
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create platform commission tracking
CREATE TABLE IF NOT EXISTS public.platform_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    
    -- Commission details
    commission_rate DECIMAL(5,4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1), -- e.g., 0.05 for 5%
    commission_amount DECIMAL(10,2) NOT NULL CHECK (commission_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'BGN',
    
    -- Metadata
    commission_type TEXT NOT NULL DEFAULT 'standard', -- standard, premium, promotional
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON public.transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON public.transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_seller_wallets_seller_id ON public.seller_wallets(seller_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_commissions_transaction_id ON public.platform_commissions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_created_at ON public.platform_commissions(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions as buyers" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Payments policies (admin-only for security)
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Seller wallets policies
CREATE POLICY "Sellers can view their own wallet" ON public.seller_wallets
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own wallet details" ON public.seller_wallets
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "System can create wallets" ON public.seller_wallets
    FOR INSERT WITH CHECK (true); -- Will be controlled by application logic

-- Wallet transactions policies
CREATE POLICY "Sellers can view their wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.seller_wallets 
            WHERE id = wallet_id AND seller_id = auth.uid()
        )
    );

-- Platform commissions policies (admin-only)
CREATE POLICY "Admins can manage platform commissions" ON public.platform_commissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Create functions for wallet balance updates
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update wallet balance based on transaction type
    IF NEW.type = 'credit' THEN
        UPDATE public.seller_wallets 
        SET 
            available_balance = available_balance + NEW.amount,
            total_earnings = total_earnings + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'debit' THEN
        UPDATE public.seller_wallets 
        SET 
            available_balance = available_balance - NEW.amount,
            total_withdrawn = total_withdrawn + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.wallet_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic wallet balance updates
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT ON public.wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Create function to automatically create wallet for new sellers
CREATE OR REPLACE FUNCTION public.create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- Create wallet when user becomes a seller or updates to seller role
    IF (TG_OP = 'INSERT' AND NEW.role IN ('seller', 'admin', 'moderator')) 
       OR (TG_OP = 'UPDATE' AND OLD.role NOT IN ('seller', 'admin', 'moderator') 
           AND NEW.role IN ('seller', 'admin', 'moderator')) THEN
        
        INSERT INTO public.seller_wallets (seller_id)
        VALUES (NEW.id)
        ON CONFLICT (seller_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic wallet creation
CREATE TRIGGER trigger_create_seller_wallet
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_seller_wallet();

-- Add updated_at trigger for transactions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_seller_wallets_updated_at
    BEFORE UPDATE ON public.seller_wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add sample commission rates (these would be configurable in the app)
COMMENT ON TABLE public.platform_commissions IS 'Standard commission rates: 5% for regular listings, 3% for premium sellers, 7% for promoted listings';