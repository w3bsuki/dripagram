-- Secure Functions with proper search_path and optimization
-- All functions include search_path for security

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(p_product_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Insert view record
    INSERT INTO product_views (product_id, user_id, ip_address)
    VALUES (p_product_id, p_user_id, inet_client_addr());
    
    -- Update view count on product
    UPDATE products 
    SET views = views + 1
    WHERE id = p_product_id;
END;
$$;

-- Function to update product like count (triggered)
CREATE OR REPLACE FUNCTION update_product_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET like_count = like_count + 1
        WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for like count updates
CREATE TRIGGER update_product_likes_trigger
AFTER INSERT OR DELETE ON product_likes
FOR EACH ROW
EXECUTE FUNCTION update_product_like_count();

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update follower's following count
        UPDATE profiles 
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;
        
        -- Update followed user's follower count
        UPDATE profiles 
        SET follower_count = follower_count + 1
        WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update follower's following count
        UPDATE profiles 
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
        
        -- Update followed user's follower count
        UPDATE profiles 
        SET follower_count = GREATEST(0, follower_count - 1)
        WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for follow count updates
CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();

-- Function to update seller rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE profiles
    SET 
        rating_average = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM user_ratings
            WHERE rated_id = NEW.rated_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM user_ratings
            WHERE rated_id = NEW.rated_id
        )
    WHERE id = NEW.rated_id;
    
    RETURN NEW;
END;
$$;

-- Trigger for rating updates
CREATE TRIGGER update_seller_rating_trigger
AFTER INSERT OR UPDATE ON user_ratings
FOR EACH ROW
EXECUTE FUNCTION update_seller_rating();

-- Function to ensure profile has username
CREATE OR REPLACE FUNCTION ensure_profile_has_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.username IS NULL OR NEW.username = '' THEN
        NEW.username := LOWER(REPLACE(COALESCE(NEW.full_name, ''), ' ', '')) || 
                       SUBSTRING(NEW.id::TEXT, 1, 4);
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to ensure username
CREATE TRIGGER ensure_username_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION ensure_profile_has_username();

-- Function to get verified brands (optimized)
CREATE OR REPLACE FUNCTION get_verified_brands()
RETURNS TABLE(brand_name TEXT, logo_url TEXT, category TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.brand_name, p.brand_logo_url, p.brand_category
    FROM profiles p
    WHERE p.verified = true 
    AND p.account_type = 'business'
    AND p.brand_name IS NOT NULL
    ORDER BY p.brand_name;
END;
$$;

-- Function to search products efficiently
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT DEFAULT '',
    p_category_id UUID DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_condition TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    price DECIMAL,
    thumbnail_url TEXT,
    seller_username TEXT,
    seller_verified BOOLEAN,
    like_count INTEGER,
    views INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.price,
        p.thumbnail_url,
        pr.username,
        pr.verified,
        p.like_count,
        p.views,
        p.created_at
    FROM products p
    JOIN profiles pr ON pr.id = p.seller_id
    WHERE p.status = 'active'
    AND (search_query = '' OR 
         to_tsvector('simple', p.title || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.brand, ''))
         @@ plainto_tsquery('simple', search_query))
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_condition IS NULL OR p.condition = p_condition)
    AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Optimized view for listings (using security_invoker)
CREATE OR REPLACE VIEW listings
WITH (security_invoker = true)
AS
SELECT 
    p.*,
    pr.username AS seller_username,
    pr.avatar_url AS seller_avatar,
    pr.verified AS seller_verified,
    pr.rating_average AS seller_rating,
    c.name AS category_name,
    c.slug AS category_slug,
    (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id) AS total_likes,
    (SELECT COUNT(*) FROM product_views WHERE product_id = p.id) AS total_views
FROM products p
LEFT JOIN profiles pr ON pr.id = p.seller_id
LEFT JOIN categories c ON c.id = p.category_id;

-- Create updatable view for product engagement
CREATE OR REPLACE VIEW product_engagement
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.title,
    p.views,
    p.like_count,
    COUNT(DISTINCT pv.user_id) AS unique_viewers,
    COUNT(DISTINCT pv.ip_address) AS unique_ips,
    MAX(pv.viewed_at) AS last_viewed
FROM products p
LEFT JOIN product_views pv ON pv.product_id = p.id
GROUP BY p.id, p.title, p.views, p.like_count;

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', ''))
    );
    RETURN NEW;
END;
$$;

-- Trigger for new user profiles
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_product_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_verified_brands TO anon, authenticated;