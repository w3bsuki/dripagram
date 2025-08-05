-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'new_message', 'new_order', 'listing_liked', 'review_received'
    title TEXT NOT NULL,
    body TEXT,
    link TEXT, -- URL to navigate to when notification is clicked
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster lookup by user and read status
CREATE INDEX notifications_user_id_is_read_idx ON notifications (user_id, is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own notifications (e.g., from client-side actions if needed, though mostly server-generated)
CREATE POLICY "Users can insert their own notifications" ON notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
FOR DELETE
USING (auth.uid() = user_id);
