-- Performance indexes for posts.getFeed offset pagination
-- Run in Supabase SQL Editor (idempotent — uses IF NOT EXISTS)

CREATE INDEX IF NOT EXISTS idx_posts_feed_hot
  ON posts (channel_id, is_deleted, hot_score DESC);

CREATE INDEX IF NOT EXISTS idx_posts_feed_new
  ON posts (channel_id, is_deleted, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_feed_top
  ON posts (channel_id, is_deleted, upvote_count DESC);

-- Aggregate feed (no channel filter)
CREATE INDEX IF NOT EXISTS idx_posts_global_hot
  ON posts (is_deleted, hot_score DESC);

CREATE INDEX IF NOT EXISTS idx_posts_global_new
  ON posts (is_deleted, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_global_top
  ON posts (is_deleted, upvote_count DESC);
