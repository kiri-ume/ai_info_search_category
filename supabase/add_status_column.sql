-- Create an enum type for post status
CREATE TYPE post_status AS ENUM ('published', 'pending_review', 'rejected');

-- Add status and is_tech_related columns to analyzed_posts
ALTER TABLE analyzed_posts ADD COLUMN status post_status DEFAULT 'published';
ALTER TABLE analyzed_posts ADD COLUMN is_tech_related BOOLEAN DEFAULT true;

-- Drop default value after migration if needed, but keeping it 'published' for legacy rows is usually fine.
-- However, for new rows, we want to control it via script.

-- Index for filtering by status
CREATE INDEX idx_analyzed_posts_status ON analyzed_posts(status);
