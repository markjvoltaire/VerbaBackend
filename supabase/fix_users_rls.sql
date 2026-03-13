-- Fix RLS policies for users table (run in Supabase SQL Editor)
-- Use this if you're getting "new row violates row-level security policy" when syncing onboarding

DROP POLICY IF EXISTS "Allow anon insert users" ON users;
DROP POLICY IF EXISTS "Allow anon update users" ON users;

CREATE POLICY "Allow anon insert users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
