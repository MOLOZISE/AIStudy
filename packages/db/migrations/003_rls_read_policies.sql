ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select_public"
  ON channels
  FOR SELECT
  USING (true);

CREATE POLICY "channel_members_select_own"
  ON channel_members
  FOR SELECT
  USING (auth.uid() = user_id);
