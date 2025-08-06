# 🪣 Supabase Storage Setup for Product Images

## Quick Fix for "Bucket not found" Error

You're getting the bucket error because we need to create the storage bucket first. Here are two ways to fix this:

## Option 1: Via Supabase Dashboard (Fastest)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Create Bucket**
3. Create a new bucket with these settings:
   - **Bucket name**: `listing-images`
   - **Public**: ✅ **Enabled**
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

4. Go to **Storage** → **Policies** and add these policies:

```sql
-- Users can upload listing images
CREATE POLICY "Users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

-- Users can update own listing images
CREATE POLICY "Users can update own listing images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete own listing images
CREATE POLICY "Users can delete own listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Option 2: Via Migration (Recommended)

If you're using Supabase CLI, run:

```bash
# Apply the migration we just created
supabase db push
```

The migration file `20250805_create_listing_images_bucket.sql` will automatically create the bucket and policies.

## Option 3: Manual SQL (Supabase SQL Editor)

Copy and paste this into your Supabase SQL Editor:

```sql
-- Create the listing-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Configure bucket settings
UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'listing-images';

-- Add storage policies (paste the policies from Option 1 above)
```

## ✅ Test the Fix

After creating the bucket:

1. Sign in to your app
2. Go to `/sell`
3. Try uploading an image
4. Should work without the "Bucket not found" error!

## 🎯 Why This Happened

I implemented the image upload service before creating the storage infrastructure. In production, you'd typically:

1. Set up database schema ✅ (we did this)
2. Set up storage buckets ✅ (we missed this)
3. Build the frontend features ✅ (we did this)

The bucket creation should have been in our initial setup. Sorry for the oversight!
