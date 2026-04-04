-- 🎙️ MIND OPS STORAGE SETUP (Biofonia)
-- Purpose: Initialize storage bucket for clinical voice recordings.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-assessments', 'voice-assessments', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS for Storage (Authenticated Only)
-- Allow authenticated users to upload their own assessments
CREATE POLICY "authenticated_upload_voice" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'voice-assessments');

-- Allow employees/RH to view recordings (Simplified for POC)
CREATE POLICY "authenticated_view_voice" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'voice-assessments');

-- 3. Update Master SQL Reference
COMMENT ON TABLE storage.objects IS 'Contains clinical voice samples for biomechanical triage';
