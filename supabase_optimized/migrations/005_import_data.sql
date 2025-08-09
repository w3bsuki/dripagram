-- Data Import - Clean essential data only
-- Run this after all structure migrations

-- Import your existing profiles
INSERT INTO profiles (id, username, full_name, avatar_url, verified, account_type, created_at, updated_at) VALUES
('fdf5add1-3de0-4ed8-aaef-5f45bb7d00cc', 'w3bsuki', 'Valentin Radev', NULL, true, 'personal', '2025-08-04 14:34:57.327488+00', '2025-08-08 21:32:01.017325+00')
ON CONFLICT (id) DO NOTHING;

-- Sample categories for marketplace
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Women''s Fashion', 'womens-fashion', 'Women''s clothing, shoes, and accessories', 1, true),
('Men''s Fashion', 'mens-fashion', 'Men''s clothing, shoes, and accessories', 2, true),
('Electronics', 'electronics', 'Phones, laptops, and gadgets', 3, true),
('Home & Garden', 'home-garden', 'Furniture, decor, and garden items', 4, true),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 5, true),
('Beauty & Health', 'beauty-health', 'Cosmetics, skincare, and health products', 6, true),
('Kids & Baby', 'kids-baby', 'Children''s clothing, toys, and baby items', 7, true),
('Books & Media', 'books-media', 'Books, movies, music, and games', 8, true),
('Vintage & Collectibles', 'vintage-collectibles', 'Antiques, vintage items, and collectibles', 9, true),
('Handmade', 'handmade', 'Handcrafted and artisan items', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Sample products for testing (cleaned up versions)
INSERT INTO products (
    id, seller_id, title, description, price, currency, brand, 
    condition, size, color, images, status, views, location, 
    material, thumbnail_url, shipping_available, shipping_price, 
    city, created_at, updated_at
) VALUES
(
    'd7d3179f-ee6a-4bda-9166-26dc24677331', 
    'fdf5add1-3de0-4ed8-aaef-5f45bb7d00cc', 
    'Nike Athletic Shorts', 
    'Premium quality athletic shorts, perfect for sports and casual wear. Excellent condition, worn only twice.', 
    69.00, 
    'BGN', 
    'Nike', 
    'like_new', 
    'M', 
    'Black', 
    ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'], 
    'active', 
    25, 
    '{"city":"Sofia, Bulgaria"}'::jsonb, 
    '100% Polyester', 
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400', 
    true, 
    5.00, 
    'Sofia, Bulgaria', 
    '2025-08-05 19:43:52.686888+00', 
    NOW()
),
(
    '853d1c0c-90b7-4659-81bd-e2438780674d', 
    'fdf5add1-3de0-4ed8-aaef-5f45bb7d00cc', 
    'Stylish Summer Top', 
    'Trendy black top perfect for summer evenings. Brand new with tags.', 
    35.00, 
    'BGN', 
    'Zara', 
    'new', 
    'S', 
    'Black', 
    ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'], 
    'active', 
    42, 
    '{"city":"Sofia, Bulgaria"}'::jsonb, 
    'Cotton Blend', 
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 
    true, 
    5.00, 
    'Sofia, Bulgaria', 
    '2025-08-08 21:32:01.017325+00', 
    NOW()
)
ON CONFLICT (id) DO NOTHING;