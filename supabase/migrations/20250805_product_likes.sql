-- Create product_likes table for tracking user likes on products
CREATE TABLE IF NOT EXISTS public.product_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- Add like_count column to products if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON public.product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_user_id ON public.product_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_products_like_count ON public.products(like_count DESC);

-- Enable RLS
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all likes" ON public.product_likes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can like products" ON public.product_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.product_likes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to update like count on products
CREATE OR REPLACE FUNCTION update_product_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.products 
        SET like_count = like_count + 1 
        WHERE id = NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.products 
        SET like_count = GREATEST(0, like_count - 1) 
        WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like counts
DROP TRIGGER IF EXISTS update_product_like_count_trigger ON public.product_likes;
CREATE TRIGGER update_product_like_count_trigger
AFTER INSERT OR DELETE ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION update_product_like_count();

-- Update existing like counts (in case there's existing data)
UPDATE public.products p
SET like_count = (
    SELECT COUNT(*) 
    FROM public.product_likes pl 
    WHERE pl.product_id = p.id
);