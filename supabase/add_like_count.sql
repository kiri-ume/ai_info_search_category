-- Add like_count column to analyzed_posts table
ALTER TABLE analyzed_posts ADD COLUMN like_count INTEGER DEFAULT 0;

-- Optional: Create an index if sorting by likes becomes frequent
CREATE INDEX idx_analyzed_posts_like_count ON analyzed_posts(like_count);

-- Function to atomically increment like count
create or replace function increment_like(post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update analyzed_posts
  set like_count = coalesce(like_count, 0) + 1
  where id = post_id;
end;
$$;
