-- Add summary_model column to analyzed_posts table
ALTER TABLE analyzed_posts 
ADD COLUMN summary_model TEXT;

COMMENT ON COLUMN analyzed_posts.summary_model IS 'The name of the LLM model used for summarization';
