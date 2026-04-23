CREATE TABLE IF NOT EXISTS channel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_requests_slug_status ON channel_requests(slug, status);
CREATE INDEX IF NOT EXISTS idx_channel_requests_requested_by ON channel_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_channel_requests_status ON channel_requests(status);

ALTER TABLE channel_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channel_requests_insert"
  ON channel_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "channel_requests_select_own"
  ON channel_requests
  FOR SELECT
  USING (auth.uid() = requested_by);
