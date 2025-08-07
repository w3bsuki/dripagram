-- Create the listing-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images', 
  true, -- Public bucket so images can be viewed without authentication
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable select for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON storage.objects;

-- Create RLS policies for the listing-images bucket

-- 1. Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload their own listing images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'listing-images' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. Allow anyone to view images (since they're public product listings)
CREATE POLICY "Anyone can view listing images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'listing-images');

-- 3. Allow users to update their own images
CREATE POLICY "Users can update their own listing images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'listing-images' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'listing-images' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Allow users to delete their own images
CREATE POLICY "Users can delete their own listing images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'listing-images' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);