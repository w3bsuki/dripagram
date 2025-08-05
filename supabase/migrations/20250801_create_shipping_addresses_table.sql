-- Create shipping_addresses table
CREATE TABLE shipping_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster lookup by user
CREATE INDEX shipping_addresses_user_id_idx ON shipping_addresses (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own shipping addresses
CREATE POLICY "Users can view their own shipping addresses" ON shipping_addresses
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own shipping addresses
CREATE POLICY "Users can insert their own shipping addresses" ON shipping_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own shipping addresses
CREATE POLICY "Users can update their own shipping addresses" ON shipping_addresses
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own shipping addresses
CREATE POLICY "Users can delete their own shipping addresses" ON shipping_addresses
FOR DELETE
USING (auth.uid() = user_id);
