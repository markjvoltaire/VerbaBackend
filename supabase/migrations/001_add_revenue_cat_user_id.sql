-- Migration: Add revenue_cat_user_id and onboarding columns to users table
-- Run this if your users table was created before these columns existed

ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_cat_user_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_language TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS native_language TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_speed TEXT;

-- Allow app to insert and update users (for onboarding sync)
DROP POLICY IF EXISTS "Allow anon insert users" ON users;
DROP POLICY IF EXISTS "Allow anon upsert users" ON users;
CREATE POLICY "Allow anon insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update users" ON users FOR UPDATE USING (true);
