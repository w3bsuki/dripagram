-- Add account type and brand fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'brand')),
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS brand_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS brand_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS brand_logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_description TEXT,
ADD COLUMN IF NOT EXISTS brand_website TEXT,
ADD COLUMN IF NOT EXISTS brand_category TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payout_method JSONB;

-- Create index for verified brands
CREATE INDEX IF NOT EXISTS idx_profiles_brand_verified ON public.profiles(brand_verified) WHERE brand_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

-- Create brand verification requests table
CREATE TABLE IF NOT EXISTS public.brand_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_registration TEXT,
  tax_id TEXT,
  documents JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Create onboarding progress table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  account_type_selected BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  payout_method_added BOOLEAN DEFAULT FALSE,
  preferences_set BOOLEAN DEFAULT FALSE,
  first_listing_created BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to get verified brands for display
CREATE OR REPLACE FUNCTION get_verified_brands(
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  brand_name TEXT,
  brand_logo_url TEXT,
  brand_category TEXT,
  follower_count INTEGER,
  listing_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.brand_name,
    p.brand_logo_url,
    p.brand_category,
    p.follower_count,
    COUNT(DISTINCT l.id)::INTEGER as listing_count,
    p.created_at
  FROM profiles p
  LEFT JOIN listings l ON l.seller_id = p.id AND l.status = 'active'
  WHERE p.brand_verified = TRUE
    AND p.account_type = 'brand'
  GROUP BY p.id
  ORDER BY p.follower_count DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user needs onboarding
CREATE OR REPLACE FUNCTION needs_onboarding(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  onboarding_status BOOLEAN;
BEGIN
  SELECT NOT onboarding_completed INTO onboarding_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(onboarding_status, TRUE);
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for new tables
ALTER TABLE public.brand_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
  ON public.brand_verification_requests
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can create verification requests for themselves
CREATE POLICY "Users can create own verification requests"
  ON public.brand_verification_requests
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can view and update their own onboarding progress
CREATE POLICY "Users can view own onboarding"
  ON public.user_onboarding
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.user_onboarding
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to initialize onboarding record on profile creation
CREATE OR REPLACE FUNCTION init_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_init_onboarding
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_onboarding();

-- Add some demo verified brands (for development)
INSERT INTO public.profiles (id, username, email, account_type, brand_name, brand_verified, brand_logo_url, brand_category, follower_count)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'nike_bulgaria', 'nike@example.com', 'brand', 'Nike Bulgaria', TRUE, 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', 'Sportswear', 15234),
  ('b2c3d4e5-f678-90ab-cdef-123456789012', 'zara_bg', 'zara@example.com', 'brand', 'Zara', TRUE, 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg', 'Fashion', 12890),
  ('c3d4e5f6-7890-abcd-ef12-345678901234', 'hm_bulgaria', 'hm@example.com', 'brand', 'H&M', TRUE, 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg', 'Fashion', 9876)
ON CONFLICT (id) DO NOTHING;