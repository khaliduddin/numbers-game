-- Create game_stats table to store game history and statistics
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('Solo', '1v1', 'Tournament')),
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2),
  time_per_round NUMERIC(5,2),
  outcome TEXT NOT NULL CHECK (outcome IN ('Win', 'Loss', 'Draw', 'Completed')),
  opponent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  round_details JSONB
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS game_stats_user_id_idx ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS game_stats_guest_id_idx ON game_stats(guest_id);
CREATE INDEX IF NOT EXISTS game_stats_created_at_idx ON game_stats(created_at);

-- Enable row level security
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view their own game stats"
ON game_stats FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL AND guest_id = (SELECT guest_id FROM guest_profiles WHERE guest_id = guest_id LIMIT 1))
);

CREATE POLICY "Users can insert their own game stats"
ON game_stats FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR
  (guest_id IS NOT NULL)
);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE game_stats;
