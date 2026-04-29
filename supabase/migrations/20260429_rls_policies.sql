-- Enable RLS on all tenant-scoped tables.
-- Service-role connections (server components) bypass RLS; anon/authenticated
-- connections (client, middleware) are subject to these policies.

-- ─── schools ──────────────────────────────────────────────────────────────────
-- Anyone (including unauthenticated) may read active schools.
-- This is needed by middleware to verify a school's status via the anon key.
-- No client-side writes are permitted.
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schools_public_read_active"
  ON schools
  FOR SELECT
  USING (status = 'active');

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- Users can only read and update their own profile row.
-- INSERT is handled exclusively by the handle_new_user trigger (SECURITY DEFINER),
-- which runs as the database owner and bypasses RLS.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── professors ───────────────────────────────────────────────────────────────
-- Authenticated users may only read professors that belong to their school.
-- The subquery resolves the user's school_id from their profile row.
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professors_read_own_school"
  ON professors
  FOR SELECT
  USING (
    school_id = (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ─── departments ──────────────────────────────────────────────────────────────
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_read_own_school"
  ON departments
  FOR SELECT
  USING (
    school_id = (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ─── buildings ────────────────────────────────────────────────────────────────
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buildings_read_own_school"
  ON buildings
  FOR SELECT
  USING (
    school_id = (
      SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );
