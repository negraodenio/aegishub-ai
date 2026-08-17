-- ============================================================
-- AegisHub AI — AI Governance Schema Alignment
-- Date: 2026-08-17
-- ============================================================
-- Ensures columns referenced by AI Governance & Human-in-the-Loop
-- repositories exist in public.ai_decisions and public.ai_audit_logs.
-- ============================================================

-- 1. Align ai_decisions columns
ALTER TABLE IF EXISTS public.ai_decisions
  ADD COLUMN IF NOT EXISTS human_validated BOOLEAN,
  ADD COLUMN IF NOT EXISTS human_action TEXT,
  ADD COLUMN IF NOT EXISTS human_feedback TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS input_hash TEXT,
  ADD COLUMN IF NOT EXISTS output_hash TEXT,
  ADD COLUMN IF NOT EXISTS model_used TEXT,
  ADD COLUMN IF NOT EXISTS model_version TEXT,
  ADD COLUMN IF NOT EXISTS score NUMERIC,
  ADD COLUMN IF NOT EXISTS vertical TEXT,
  ADD COLUMN IF NOT EXISTS decision JSONB,
  ADD COLUMN IF NOT EXISTS reasons JSONB,
  ADD COLUMN IF NOT EXISTS recommendation JSONB,
  ADD COLUMN IF NOT EXISTS risk_level TEXT,
  ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN DEFAULT TRUE;

-- 2. Align ai_audit_logs columns
ALTER TABLE IF EXISTS public.ai_audit_logs
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS details JSONB;

COMMENT ON TABLE public.ai_decisions IS 'Registos de decisões e recomendações automatizadas com suporte a Human-in-the-Loop (EU AI Act Compliance).';
