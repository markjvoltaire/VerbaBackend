-- Progress tables (revenue_cat_user_id as the link)
-- Run if you need to create these tables (e.g. after running 001_add_revenue_cat_user_id)

CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_cat_user_id TEXT NOT NULL,
  date DATE NOT NULL,
  usage_seconds INTEGER DEFAULT 0,
  phrase_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(revenue_cat_user_id, date)
);

-- Streaks with revenue_cat_user_id (drop old if exists with user_id)
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_cat_user_id TEXT UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions with revenue_cat_user_id
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_cat_user_id TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
