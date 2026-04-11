-- ============================================================
--  Jigyasa AI — Supabase RLS Policies Migration
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  1. SESSIONS TABLE
--     Each row has a user_id column that must match auth.uid()
-- ────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist (idempotent)
DROP POLICY IF EXISTS "Sessions are publicly readable" ON sessions;
DROP POLICY IF EXISTS "Sessions are publicly writable" ON sessions;

-- SELECT: users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users can only create sessions under their own user_id
CREATE POLICY "Users can insert own sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can only modify their own sessions (e.g., status changes)
CREATE POLICY "Users can update own sessions"
  ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can only delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service-role bypass: backend API (using service role key) can do anything
-- This is automatic — the service role key always bypasses RLS.
-- No extra policy needed.


-- ────────────────────────────────────────────────────────────
--  2. ASSESSMENTS TABLE
--     No direct user_id; security flows through sessions.user_id
-- ────────────────────────────────────────────────────────────

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assessments are publicly readable" ON assessments;
DROP POLICY IF EXISTS "Assessments are publicly writable" ON assessments;

-- SELECT: user can read assessments for sessions they own
CREATE POLICY "Users can view own assessments"
  ON assessments
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- INSERT: user can only create assessments for their own sessions
CREATE POLICY "Users can insert own assessments"
  ON assessments
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- UPDATE: user can only update assessments for their own sessions
CREATE POLICY "Users can update own assessments"
  ON assessments
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- DELETE: user can only delete their own assessment data
CREATE POLICY "Users can delete own assessments"
  ON assessments
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
--  3. GRANT USAGE TO authenticated ROLE
--     Required for auth.uid() to resolve correctly inside policies
-- ────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assessments TO authenticated;


-- ────────────────────────────────────────────────────────────
--  4. VERIFY
--     After running, check RLS is active:
-- ────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('sessions', 'assessments');
-- Expected: rowsecurity = true for both tables.
