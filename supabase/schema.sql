-- Sources table: Twitter accounts to monitor
create table learning_sources (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  description text,
  last_checked_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Posts table: Analyzed tweets
create table analyzed_posts (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references learning_sources(id) on delete cascade,
  external_id text not null unique, -- Tweet ID
  content text,
  url text, -- The URL found in the tweet
  category text, -- AI determined category
  difficulty text, -- AI determined difficulty
  tags text[],
  summary text, -- Brief description if needed
  is_paywalled boolean default false,
  posted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create an index on category for faster filtering
create index idx_analyzed_posts_category on analyzed_posts(category);
create index idx_analyzed_posts_created_at on analyzed_posts(created_at);

-- Example data
insert into learning_sources (username, description) values 
('huggingface', 'AI and ML updates'),
('verge', 'Tech news');
