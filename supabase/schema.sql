-- Verba V1 Database Schema
-- Run this in Supabase SQL Editor to create tables

-- Users table (extends Supabase auth.users or standalone)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_cat_user_id TEXT UNIQUE,
  email TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  name TEXT,
  learning_language TEXT,
  language_level TEXT,
  motivation TEXT,
  native_language TEXT,
  age_range TEXT,
  learning_speed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phrases for practice
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_lang TEXT NOT NULL,
  phrase TEXT NOT NULL,
  translation TEXT NOT NULL,
  scenario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (grouped phrases)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phrase_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice sessions (for usage tracking and streaks)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  current_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - optional, configure as needed
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Allow public read for phrases (no auth needed for phrase list)
CREATE POLICY "Allow public read phrases" ON phrases FOR SELECT USING (true);

-- Allow app (anon role) to insert and update users (for onboarding sync with RevenueCat user ID)
CREATE POLICY "Allow anon insert users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
