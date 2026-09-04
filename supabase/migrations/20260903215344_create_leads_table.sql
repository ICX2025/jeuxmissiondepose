/*
# Create leads table for game lead generation

1. New Tables
- `leads`
  - `id` (uuid, primary key)
  - `email` (text, not null) — the player's email for the monthly pro gift draw
  - `score` (integer, not null) — the player's final game score
  - `name` (text, nullable) — optional player name
  - `created_at` (timestamptz, defaults to now)
2. Security
- Enable RLS on `leads`.
- Allow anon + authenticated INSERT (anyone playing the game can submit their score).
- Allow anon + authenticated SELECT (so the leaderboard can display top scores).
- No UPDATE or DELETE policies — leads are immutable once submitted.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a lead (game players submitting their score)
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Allow anyone to read leads (for leaderboard display)
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
TO anon, authenticated USING (true);
