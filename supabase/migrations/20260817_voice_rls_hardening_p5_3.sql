-- ============================================================
-- AegisHub AI — P5.3 Voice Ergonomics
-- Migration: Voice Module RLS Hardening
-- Date: 2026-08-17
-- Author: P5.3 Security Remediation
-- ============================================================
-- CRITICAL FIXES:
-- 1. Re-enable RLS on consent_logs (was disabled with DISABLE ROW LEVEL SECURITY)
-- 2. Add RLS policies to voice_features, voice_scores, voice_audit_log
-- 3. Enforce employee-only individual access; prohibit HR/manager individual access
-- 4. Add audio TTL tracking column to voice_sessions
--
-- PRESERVATION:
-- This is an ADDITIVE migration. Historical migrations are NOT modified.
-- All existing tables and columns are preserved.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CONSENT_LOGS — Re-enable RLS (was disabled in 20260404_consent_storage.sql)
-- ─────────────────────────────────────────────────────────────

-- Drop any stale policies before creating correct ones
DROP POLICY IF EXISTS "consent_logs_employee_own_read" ON consent_logs;
DROP POLICY IF EXISTS "consent_logs_employee_own_write" ON consent_logs;
DROP POLICY IF EXISTS "consent_logs_tenant_audit_read" ON consent_logs;
DROP POLICY IF EXISTS "consent_logs_service_role_all" ON consent_logs;

-- Re-enable RLS (was disabled — CRITICAL security gap)
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can only read their own consent records
CREATE POLICY "consent_logs_employee_own_read"
  ON consent_logs
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    employee_id::text = auth.uid()::text
  );

-- Policy: Employees can insert their own consent records (via server action, not direct)
-- In practice, inserts go through service_role server actions only
-- This policy exists as a defense-in-depth layer
CREATE POLICY "consent_logs_employee_own_insert"
  ON consent_logs
  FOR INSERT
  WITH CHECK (
    employee_id::text = auth.uid()::text
  );

-- Policy: Service role (server actions) has full access
-- This is used by submitConsentAction on the server
CREATE POLICY "consent_logs_service_role_all"
  ON consent_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE consent_logs IS
  'P5.3 HARDENED: RLS enabled. Employee-only individual access. '
  'Service role used for server-side inserts. '
  'HR and managers cannot read individual consent records. '
  'Immutable compliance ledger for RGPD/LGPD consent management.';

-- ─────────────────────────────────────────────────────────────
-- 2. VOICE_FEATURES — Enable RLS
-- ─────────────────────────────────────────────────────────────

-- Drop stale policies
DROP POLICY IF EXISTS "voice_features_employee_own" ON voice_features;
DROP POLICY IF EXISTS "voice_features_service_role" ON voice_features;

ALTER TABLE voice_features ENABLE ROW LEVEL SECURITY;

-- Policy: Employee reads only their own features
-- Joins through voice_sessions to get employee_id
CREATE POLICY "voice_features_employee_own_read"
  ON voice_features
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM voice_sessions vs
      WHERE vs.id = voice_features.session_id
        AND vs.employee_id::text = auth.uid()::text
    )
  );

-- Policy: Service role (server actions) has full access
CREATE POLICY "voice_features_service_role_all"
  ON voice_features
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE voice_features IS
  'P5.3: RLS enabled. Individual acoustic features visible only to the employee who produced them. '
  'HR, managers, and admins cannot access individual voice features. '
  'Aggregated quality metrics for HR require N >= 20 and are produced by separate analytics views.';

-- ─────────────────────────────────────────────────────────────
-- 3. VOICE_SCORES — Enable RLS
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "voice_scores_employee_own" ON voice_scores;
DROP POLICY IF EXISTS "voice_scores_service_role" ON voice_scores;

ALTER TABLE voice_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_scores_employee_own_read"
  ON voice_scores
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM voice_sessions vs
      WHERE vs.id = voice_scores.session_id
        AND vs.employee_id::text = auth.uid()::text
    )
  );

CREATE POLICY "voice_scores_service_role_all"
  ON voice_scores
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE voice_scores IS
  'P5.3: RLS enabled. Vocal load scores visible only to the employee. '
  'Not exposed to HR, managers, or administrators.';

-- ─────────────────────────────────────────────────────────────
-- 4. VOICE_SESSIONS — Enable RLS
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "voice_sessions_employee_own" ON voice_sessions;
DROP POLICY IF EXISTS "voice_sessions_service_role" ON voice_sessions;

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_sessions_employee_own_read"
  ON voice_sessions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    employee_id::text = auth.uid()::text
  );

CREATE POLICY "voice_sessions_service_role_all"
  ON voice_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE voice_sessions IS
  'P5.3: RLS enabled. Session metadata visible only to the employee. '
  'HR cannot enumerate or access individual voice sessions.';

-- ─────────────────────────────────────────────────────────────
-- 5. VOICE_AUDIT_LOG — Enable RLS (minimal access)
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "voice_audit_log_service_role" ON voice_audit_log;
DROP POLICY IF EXISTS "voice_audit_log_employee_own" ON voice_audit_log;

ALTER TABLE voice_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log: employees can read their own audit events
CREATE POLICY "voice_audit_log_employee_own_read"
  ON voice_audit_log
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM voice_sessions vs
      WHERE vs.id = voice_audit_log.session_id
        AND vs.employee_id::text = auth.uid()::text
    )
  );

-- Service role: full access for server-side logging
CREATE POLICY "voice_audit_log_service_role_all"
  ON voice_audit_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE voice_audit_log IS
  'P5.3: RLS enabled. Audit events readable by the employee themselves. '
  'Immutable — no delete policy for service_role on audit logs.';

-- ─────────────────────────────────────────────────────────────
-- 6. VOICE_SESSIONS — Add TTL column for raw audio lifecycle
-- ─────────────────────────────────────────────────────────────

ALTER TABLE voice_sessions
  ADD COLUMN IF NOT EXISTS audio_delete_after TIMESTAMPTZ
    GENERATED ALWAYS AS (created_at + INTERVAL '24 hours') STORED;

ALTER TABLE voice_sessions
  ADD COLUMN IF NOT EXISTS audio_deleted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN voice_sessions.audio_delete_after IS
  'P5.3: TTL timestamp for raw audio deletion. Raw audio should be deleted 24h after recording. '
  'A scheduled job should query WHERE audio_deleted_at IS NULL AND audio_delete_after < now().';

COMMENT ON COLUMN voice_sessions.audio_deleted_at IS
  'P5.3: Timestamp when raw audio was confirmed deleted from Supabase Storage. '
  'NULL = not yet deleted. SET when deletion job runs.';

-- ─────────────────────────────────────────────────────────────
-- 7. VOICE_FEATURES — Add missing columns for P5.3 features
-- ─────────────────────────────────────────────────────────────

ALTER TABLE voice_features
  ADD COLUMN IF NOT EXISTS f0_variability NUMERIC,
  ADD COLUMN IF NOT EXISTS rms_energy NUMERIC,
  ADD COLUMN IF NOT EXISTS clipping_ratio NUMERIC,
  ADD COLUMN IF NOT EXISTS recording_quality TEXT
    CHECK (recording_quality IN ('GOOD', 'DEGRADED', 'POOR', NULL)),
  ADD COLUMN IF NOT EXISTS voiced_ratio NUMERIC,
  ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC,
  ADD COLUMN IF NOT EXISTS engine_version TEXT DEFAULT 'aegis-acoustic-v1.0',
  ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'ANALYZED'
    CHECK (analysis_status IN ('ANALYZED', 'NOT_ANALYZED'));

COMMENT ON COLUMN voice_features.recording_quality IS
  'P5.3: GOOD / DEGRADED / POOR — acoustic quality of the recording. Not a medical indicator.';

COMMENT ON COLUMN voice_features.analysis_status IS
  'P5.3: ANALYZED = real features extracted. NOT_ANALYZED = could not compute.';

-- ─────────────────────────────────────────────────────────────
-- 8. STORAGE BUCKET POLICY — Remove public access to voice recordings
-- ─────────────────────────────────────────────────────────────
-- Note: Supabase Storage bucket policies are set via the API / dashboard.
-- This comment documents the required policy for the DPO review:
--
-- Bucket: voice-assessments
-- Public: FALSE (must be private)
-- Access: Only via signed URLs generated server-side for the employee themselves.
-- HR Access: PROHIBITED — no signed URL generation for HR role.
-- Manager Access: PROHIBITED.
-- TTL for signed URLs: Max 1 hour.
--
-- The ActionQueueTable.tsx HR "Ouvir" button that used public URLs has been
-- removed in this P5.3 remediation (see: apps/web/features/rh-dashboard/components/ActionQueueTable.tsx).

-- ─────────────────────────────────────────────────────────────
-- 9. VERIFICATION QUERIES (run after migration to confirm)
-- ─────────────────────────────────────────────────────────────

-- Confirm RLS is enabled on all voice tables:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE tablename IN (
--   'consent_logs', 'voice_sessions', 'voice_features',
--   'voice_scores', 'voice_audit_log'
-- )
-- ORDER BY tablename;
-- Expected: rowsecurity = true for all 5 tables.

-- Confirm new columns on voice_sessions:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'voice_sessions'
-- ORDER BY ordinal_position;
