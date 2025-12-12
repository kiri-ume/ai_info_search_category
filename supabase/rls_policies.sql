-- Enable RLS on tables
alter table learning_sources enable row level security;
alter table analyzed_posts enable row level security;

-- Policy for 'learning_sources': Allow everyone (anon and authenticated) to read
create policy "Allow public read access"
on learning_sources
for select
to anon, authenticated
using (true);

-- Policy for 'analyzed_posts': Allow everyone (anon and authenticated) to read
create policy "Allow public read access"
on analyzed_posts
for select
to anon, authenticated
using (true);

-- Note: The Service Role (used by the cron job) automatically bypasses RLS,
-- so no specific policy is needed for writes if you use the service_role key.
