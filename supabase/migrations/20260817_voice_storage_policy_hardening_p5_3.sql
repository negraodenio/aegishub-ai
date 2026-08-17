-- ============================================================
-- AegisHub AI — P5.3 Storage Policy Hardening
-- CRITICAL SECURITY FIX: voice-assessments bucket
-- Date: 2026-08-17
-- ============================================================
-- PROBLEM IDENTIFIED:
-- Both existing policies (allow_voice_upload, allow_voice_select)
-- are applied to the PUBLIC role — meaning any unauthenticated
-- person can upload and download individual employee voice recordings.
-- 
-- This is a CRITICAL LGPD/RGPD violation:
-- - Unauthenticated read access to biometric/sensitive voice recordings
-- - Unauthenticated write access (anyone can inject files)
--
-- FIX:
-- 1. Drop the two insecure public policies
-- 2. Create authenticated-only policies with ownership enforcement
--    (employees can only access their OWN folder)
-- ============================================================

-- ─────────────────────────────────────────────
-- STEP 1: Remove insecure or existing policies (Idempotent)
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "allow_voice_upload" ON storage.objects;
DROP POLICY IF EXISTS "allow_voice_select" ON storage.objects;
DROP POLICY IF EXISTS "voice_upload_own_folder_only" ON storage.objects;
DROP POLICY IF EXISTS "voice_select_own_folder_only" ON storage.objects;
DROP POLICY IF EXISTS "voice_delete_own_folder_only" ON storage.objects;

-- ─────────────────────────────────────────────
-- STEP 2: Create secure authenticated policies
-- ─────────────────────────────────────────────

-- INSERT: Only authenticated employees can upload to their OWN folder
-- Files must be in the path: {employee_id}/{filename}
-- The employee can only upload to the folder matching their auth.uid()
CREATE POLICY "voice_upload_own_folder_only"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-assessments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- SELECT: Only authenticated employees can read their OWN files
CREATE POLICY "voice_select_own_folder_only"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-assessments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: Only authenticated employees can delete their OWN files
-- (Required for consent revocation / right to erasure)
CREATE POLICY "voice_delete_own_folder_only"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'voice-assessments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────
-- STEP 3: Service role access (for server-side deletion jobs)
-- ─────────────────────────────────────────────

-- The service role (used by server-side API routes) has full access
-- by default in Supabase — no explicit policy needed for service_role.
-- Verify with: SELECT * FROM storage.objects WHERE bucket_id = 'voice-assessments';
-- This query run with service_role key should work.

-- ─────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────

-- After running this migration, verify:
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects'
--   AND schemaname = 'storage'
-- ORDER BY policyname;
--
-- Expected result:
-- voice_delete_own_folder_only | DELETE | {authenticated} | ...
-- voice_select_own_folder_only | SELECT | {authenticated} | ...
-- voice_upload_own_folder_only | INSERT | {authenticated} | ...
--
-- CRITICAL: No policy should have roles = {anon} or {public}
-- ============================================================

-- ─────────────────────────────────────────────
-- SECURITY VALIDATION QUERIES
-- ─────────────────────────────────────────────

-- Check that no public/anon policies exist on voice-assessments:
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'objects'
--   AND schemaname = 'storage'
--   AND (roles::text LIKE '%anon%' OR roles::text LIKE '%public%')
--   AND qual LIKE '%voice-assessments%';
-- Expected: 0 rows
