-- Social Commerce Features Migration
-- Adds tables for social interactions, following, collections, and analytics

-- ============================================
-- 1. USER FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);

-- ============================================
-- 2. LISTING LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.listing_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Indexes for likes
CREATE INDEX idx_listing_likes_user_id ON public.listing_likes(user_id);
CREATE INDEX idx_listing_likes_listing_id ON public.listing_likes(listing_id);
CREATE INDEX idx_listing_likes_created_at ON public.listing_likes(created_at DESC);

-- ============================================
-- 3. COLLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  item_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for collections
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collections_is_public ON public.collections(is_public);

-- ============================================
-- 4. COLLECTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, listing_id)
);

-- Indexes for collection items
CREATE INDEX idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_listing_id ON public.collection_items(listing_id);

-- ============================================
-- 5. HASHTAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  trending_score DECIMAL(10, 2) DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for hashtags
CREATE INDEX idx_hashtags_slug ON public.hashtags(slug);
CREATE INDEX idx_hashtags_trending_score ON public.hashtags(trending_score DESC);
CREATE INDEX idx_hashtags_usage_count ON public.hashtags(usage_count DESC);

-- ============================================
-- 6. LISTING HASHTAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.listing_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES public.hashtags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, hashtag_id)
);

-- Indexes for listing hashtags
CREATE INDEX idx_listing_hashtags_listing_id ON public.listing_hashtags(listing_id);
CREATE INDEX idx_listing_hashtags_hashtag_id ON public.listing_hashtags(hashtag_id);

-- ============================================
-- 7. ACTIVITY FEED TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'listing', 'collection', 'review', 'share')),
  target_type TEXT CHECK (target_type IN ('user', 'listing', 'collection', 'review')),
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for activity feed
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_actor_id ON public.activity_feed(actor_id);
CREATE INDEX idx_activity_feed_type ON public.activity_feed(type);

-- ============================================
-- 8. SHOPPING CART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Indexes for shopping cart
CREATE INDEX idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_listing_id ON public.shopping_cart(listing_id);

-- ============================================
-- 9. WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  price_alert DECIMAL(10, 2),
  size_alert TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Indexes for wishlists
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_listing_id ON public.wishlists(listing_id);

-- ============================================
-- 10. TRENDING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('listing', 'hashtag', 'collection', 'user')),
  item_id UUID NOT NULL,
  score DECIMAL(10, 2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  time_window TEXT DEFAULT 'daily' CHECK (time_window IN ('hourly', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(type, item_id, time_window)
);

-- Indexes for trending
CREATE INDEX idx_trending_items_type_score ON public.trending_items(type, score DESC);
CREATE INDEX idx_trending_items_time_window ON public.trending_items(time_window);

-- ============================================
-- 11. UPDATE PROFILES TABLE
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS listing_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS collection_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS style_tags TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- ============================================
-- 12. UPDATE LISTINGS TABLE
-- ============================================
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS style_tags TEXT[],
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS sustainability_score INTEGER CHECK (sustainability_score >= 0 AND sustainability_score <= 100);

-- ============================================
-- 13. ENABLE RLS
-- ============================================
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. RLS POLICIES - FOLLOWS
-- ============================================
CREATE POLICY "Anyone can view follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- 15. RLS POLICIES - LIKES
-- ============================================
CREATE POLICY "Anyone can view likes" ON public.listing_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like listings" ON public.listing_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike listings" ON public.listing_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 16. RLS POLICIES - COLLECTIONS
-- ============================================
CREATE POLICY "Public collections viewable by all" ON public.collections
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 17. RLS POLICIES - HASHTAGS
-- ============================================
CREATE POLICY "Anyone can view hashtags" ON public.hashtags
  FOR SELECT USING (true);

-- ============================================
-- 18. RLS POLICIES - ACTIVITY FEED
-- ============================================
CREATE POLICY "Users can view own feed" ON public.activity_feed
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 19. RLS POLICIES - SHOPPING CART
-- ============================================
CREATE POLICY "Users can view own cart" ON public.shopping_cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to cart" ON public.shopping_cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update cart" ON public.shopping_cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from cart" ON public.shopping_cart
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 20. FUNCTIONS FOR SOCIAL FEATURES
-- ============================================

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET like_count = like_count + 1 WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET like_count = like_count - 1 WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 21. CREATE TRIGGERS
-- ============================================
CREATE TRIGGER trigger_update_follower_counts
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

CREATE TRIGGER trigger_update_like_counts
AFTER INSERT OR DELETE ON public.listing_likes
FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- ============================================
-- 22. INSERT DEFAULT HASHTAGS
-- ============================================
INSERT INTO public.hashtags (name, slug, category, usage_count, trending_score) VALUES
('#vintage', 'vintage', 'style', 0, 0),
('#streetwear', 'streetwear', 'style', 0, 0),
('#designer', 'designer', 'brand', 0, 0),
('#sustainable', 'sustainable', 'values', 0, 0),
('#y2k', 'y2k', 'style', 0, 0),
('#minimalist', 'minimalist', 'style', 0, 0),
('#cottagecore', 'cottagecore', 'aesthetic', 0, 0),
('#darkacademia', 'darkacademia', 'aesthetic', 0, 0),
('#90s', '90s', 'era', 0, 0),
('#thrifted', 'thrifted', 'values', 0, 0)
ON CONFLICT (slug) DO NOTHING;