-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- The user being reviewed
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (transaction_id) -- Ensure only one review per transaction
);

-- Add indexes for faster lookup
CREATE INDEX reviews_reviewer_id_idx ON reviews (reviewer_id);
CREATE INDEX reviews_seller_id_idx ON reviews (seller_id);
CREATE INDEX reviews_transaction_id_idx ON reviews (transaction_id);

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all reviews
CREATE POLICY "Reviews are public" ON reviews
FOR SELECT
USING (true);

-- Policy for users to insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON reviews
FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

-- Policy for users to update their own reviews (optional, if editing is allowed)
CREATE POLICY "Users can update their own reviews" ON reviews
FOR UPDATE
USING (auth.uid() = reviewer_id);

-- Policy for users to delete their own reviews (optional)
CREATE POLICY "Users can delete their own reviews" ON reviews
FOR DELETE
USING (auth.uid() = reviewer_id);

-- Function to update seller's average rating and review count
CREATE OR REPLACE FUNCTION update_seller_rating() RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET
        seller_rating = (SELECT AVG(rating) FROM reviews WHERE seller_id = NEW.seller_id),
        seller_rating_count = (SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id)
    WHERE id = NEW.seller_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update seller rating after a review is inserted or updated
CREATE TRIGGER update_seller_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_seller_rating();
