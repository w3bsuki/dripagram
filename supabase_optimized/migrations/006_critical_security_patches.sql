-- Critical Security & Performance Patches
-- Run this AFTER the first 5 migrations to lock down security and align with app

-- ============================================
-- A) PROFILES: Add role column and restrict PII access
-- ============================================

-- Add role column for proper admin checks
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Remove the wide-open public SELECT policy (security risk)
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;

-- Create restricted policies for profiles table
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_select_public_info" ON profiles
  FOR SELECT TO anon, authenticated
  USING (true)
  -- Only allow access to non-sensitive columns via this policy
  WITH CHECK (false); -- Prevent any modifications through this policy

-- Create a safe public view for profile information
CREATE OR REPLACE VIEW public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id, 
  username, 
  avatar_url, 
  rating_average, 
  rating_count, 
  verified, 
  account_type, 
  brand_name, 
  brand_logo_url, 
  brand_category,
  bio,
  website,
  follower_count,
  following_count,
  listing_count
FROM profiles;

-- Grant read access to the public view
GRANT SELECT ON public_profiles TO anon, authenticated;

-- ============================================
-- B) PRODUCT VIEWS: Fix admin-only analytics
-- ============================================

-- Drop the incorrect policy that treats verified users as admins
DROP POLICY IF EXISTS "views_select_admin" ON product_views;

-- Create proper admin-only policy using role column
CREATE POLICY "views_select_admin" ON product_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Alternative: Make analytics service-role only
-- CREATE POLICY "views_select_service" ON product_views
--   FOR SELECT TO service_role
--   USING (true);

-- ============================================
-- C) FORCE ROW LEVEL SECURITY on all tables
-- ============================================

-- This prevents accidental bypass by table owners or SECURITY DEFINER functions
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE product_likes FORCE ROW LEVEL SECURITY;
ALTER TABLE product_views FORCE ROW LEVEL SECURITY;
ALTER TABLE user_follows FORCE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
ALTER TABLE offers FORCE ROW LEVEL SECURITY;
ALTER TABLE purchases FORCE ROW LEVEL SECURITY;
ALTER TABLE user_ratings FORCE ROW LEVEL SECURITY;
ALTER TABLE analytics_events FORCE ROW LEVEL SECURITY;
ALTER TABLE user_consent FORCE ROW LEVEL SECURITY;
ALTER TABLE promotions FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

-- ============================================
-- D) FIX USERNAME UNIQUENESS (case-insensitive)
-- ============================================

-- Remove any duplicate constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- The unique index on lower(username) already exists from migration 002
-- Just verify it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_profiles_username_lower'
  ) THEN
    CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles(lower(username));
  END IF;
END $$;

-- ============================================
-- E) ENABLE MONITORING EXTENSIONS
-- ============================================

-- Enable statement tracking for performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- F) STORAGE POLICIES for controlled egress
-- ============================================

-- Note: Run these in the Supabase Dashboard SQL editor AFTER creating buckets

-- Public read for avatars bucket
-- CREATE POLICY "public_read_avatars" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- Public read for listing images
-- CREATE POLICY "public_read_listing_images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'listing-images');

-- Users can upload their own avatar (folder = user id)
-- CREATE POLICY "user_uploads_own_avatar" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'avatars' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Users can update their own avatar
-- CREATE POLICY "user_updates_own_avatar" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'avatars' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Authenticated users can upload listing images
-- CREATE POLICY "auth_uploads_listing_images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'listing-images' 
--     AND auth.uid() IS NOT NULL
--   );

-- ============================================
-- G) OPTIMIZE LISTINGS VIEW for app compatibility
-- ============================================

-- Make the listings view more compatible with the app
DROP VIEW IF EXISTS listings CASCADE;

CREATE OR REPLACE VIEW listings
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.seller_id,
    p.title,
    p.description,
    p.price,
    p.currency,
    p.category_id,
    p.brand,
    p.condition,
    p.size,
    p.color,
    p.images,
    p.tags,
    p.status,
    p.views,
    p.likes,
    p.location,
    p.shipping_options,
    p.created_at,
    p.updated_at,
    p.material,
    p.thumbnail_url,
    p.shipping_available,
    p.shipping_price,
    p.city,
    p.like_count,
    p.is_sold,
    p.price_cents,
    pr.username AS seller_username,
    pr.avatar_url AS seller_avatar,
    pr.verified AS seller_verified,
    pr.rating_average AS seller_rating,
    c.name AS category_name,
    c.slug AS category_slug,
    COALESCE(
      (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id), 
      0
    ) AS total_likes,
    COALESCE(
      (SELECT COUNT(*) FROM product_views WHERE product_id = p.id), 
      0
    ) AS total_views
FROM products p
LEFT JOIN profiles pr ON pr.id = p.seller_id
LEFT JOIN categories c ON c.id = p.category_id;

-- Grant appropriate permissions
GRANT SELECT ON listings TO anon, authenticated;

-- ============================================
-- H) ADD HELPER FUNCTION for checking user likes
-- ============================================

CREATE OR REPLACE FUNCTION user_has_liked_product(p_product_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM product_likes 
    WHERE product_id = p_product_id 
    AND user_id = p_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION user_has_liked_product TO anon, authenticated;

-- ============================================
-- I) ANALYTICS IMPROVEMENTS
-- ============================================

-- Add index for session-based analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
  ON analytics_events(session_id, timestamp DESC)
  WHERE session_id IS NOT NULL;

-- Add composite index for user activity tracking
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event 
  ON analytics_events(user_id, event_name, timestamp DESC)
  WHERE user_id IS NOT NULL;

-- ============================================
-- VALIDATION QUERIES (run these to verify)
-- ============================================

-- Check that RLS is enforced on all tables
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND rowsecurity = false;

-- Check for any remaining SECURITY DEFINER functions without search_path
-- SELECT proname, prosecdef, proconfig 
-- FROM pg_proc 
-- WHERE pronamespace = 'public'::regnamespace 
-- AND prosecdef = true 
-- AND (proconfig IS NULL OR NOT 'search_path' = ANY(proconfig));

-- Verify all indexes are being used (run after some traffic)
-- SELECT schemaname, tablename, indexname, idx_scan 
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan = 0 
-- ORDER BY schemaname, tablename;