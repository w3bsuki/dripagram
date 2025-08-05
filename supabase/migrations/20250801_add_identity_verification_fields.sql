-- Add identity verification fields to profiles table
ALTER TABLE profiles
ADD COLUMN is_identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN id_document_url TEXT, -- URL to uploaded ID document
ADD COLUMN id_verification_date TIMESTAMPTZ,
ADD COLUMN identity_verification_notes TEXT; -- Notes from admin review

-- Add RLS policies for the new columns (only admins can update, users can view their own)

-- Allow users to view their own identity verification status and document URL
CREATE POLICY "Users can view their own identity verification" ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow authenticated users to update their own identity verification fields (for submission)
CREATE POLICY "Users can submit identity documents" ON profiles
FOR UPDATE
WITH CHECK (auth.uid() = id)
USING (auth.uid() = id);

-- Revoke public update access to these sensitive fields
REVOKE UPDATE (is_identity_verified, id_document_url, id_verification_date, identity_verification_notes) ON profiles FROM authenticated;

-- Grant specific update access to admins for verification fields
CREATE POLICY "Admins can update identity verification fields" ON profiles
FOR UPDATE
TO service_role -- Or a specific admin role
USING (true)
WITH CHECK (true);
