-- 🛡️ MIND OPS MASTER CONSOLIDATED SCHEMA (v2.1.0)
-- Purpouse: Single execution script for new Supabase project setup.
-- Includes: Base Tables, RLS, Governance (desc de contr), and ATOMIC Clinical Functions.

-- 0. Cleanup and Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 0.1 Storage Initialization
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-assessments', 'voice-assessments', false)
ON CONFLICT (id) DO NOTHING;

-- 1. Core Sovereignty
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  vertical TEXT NOT NULL DEFAULT 'generic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. User/Identity Layer
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'admin', 'rh', 'health_professional', 'manager'
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Occupational Layer (SST PT)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id TEXT,
  full_name TEXT NOT NULL,
  department TEXT,
  business_unit TEXT,
  site_name TEXT,
  manager_id UUID,
  shift_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Clinical Data (Protocolo Lei 102/2009)
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  protocol_version TEXT NOT NULL DEFAULT '1.0',
  vertical_pack TEXT NOT NULL DEFAULT 'generic',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  instrument_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  answer_numeric NUMERIC,
  answer_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, instrument_code, item_code)
);

CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  composite_risk_score NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  confidence NUMERIC NOT NULL DEFAULT 0,
  reasons TEXT[] NOT NULL DEFAULT '{}',
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Governance & AI M2.7 (Audit-Ready)
CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  control_description TEXT, -- O seu "desc de contr" solicitado
  automated_action_taken TEXT,
  memory_updates JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES ai_decisions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  old_memory JSONB,
  new_memory JSONB,
  scaffold_changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Infrastructure/Analysis
CREATE TABLE IF NOT EXISTS manager_dashboard_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  total_employees INTEGER NOT NULL DEFAULT 0,
  assessed_count INTEGER NOT NULL DEFAULT 0,
  compliance_score NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS return_to_work_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  return_status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmark_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical TEXT NOT NULL,
  metric_code TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  reference_period DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictive_risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  predicted_risk_score NUMERIC NOT NULL,
  predicted_risk_level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Advanced Intelligence Functions
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  remediation_plan TEXT, -- Governança Phase 1
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SECURITY (RLS & Policies)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Help Functions for RLS
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

-- Policies (Audit-Hardened)
DROP POLICY IF EXISTS "tenant_iso_employees" ON public.employees;
CREATE POLICY "tenant_iso_employees" ON public.employees FOR ALL TO authenticated USING (tenant_id = (SELECT current_tenant_id()));

-- 10. Consent Management (RGPD Audit Trail)
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT false,
  terms_version TEXT DEFAULT 'v1.0.0 (Portugal Lei 102/2009)',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consent_logs DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_consent_employee ON consent_logs(employee_id);

-- 11. Corrective Actions (Preventive SST Lifecycle)
CREATE TABLE IF NOT EXISTS corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  assessment_score_id UUID REFERENCES assessment_scores(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PLANNED',
  priority TEXT DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES employees(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE corrective_actions DISABLE ROW LEVEL SECURITY;

-- 12. Clinical Care & Emergency SOS (Enterprise 2.0)
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE IF NOT EXISTS care_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  referral_type TEXT NOT NULL,
  urgency risk_level_enum DEFAULT 'low',
  status TEXT DEFAULT 'pending',
  sla_deadline TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open', 
  risk_level risk_level_enum DEFAULT 'low',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sos_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL, 
  content TEXT NOT NULL,
  risk_score FLOAT DEFAULT 0,
  intent_label TEXT DEFAULT 'neutral',
  explainability JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sos_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  duration_seconds FLOAT,
  quality_score FLOAT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE care_referrals ADD COLUMN IF NOT EXISTS sos_session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE;

-- 13. Security & Performance (Audited Indexes)
CREATE INDEX IF NOT EXISTS idx_sos_sessions_tenant ON sos_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sos_messages_session ON sos_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_referrals_tenant ON care_referrals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session ON voice_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_decision ON ai_audit_logs(decision_id);

-- 14. ATOMIC CLINICAL FUNCTIONS (Anti-Ghosting)
CREATE OR REPLACE FUNCTION public.complete_clinical_assessment(
    p_session_id UUID,
    p_composite_risk_score NUMERIC,
    p_risk_level TEXT,
    p_reasons TEXT[],
    p_requires_human_review BOOLEAN DEFAULT FALSE,
    p_confidence NUMERIC DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.assessment_scores (
        session_id, composite_risk_score, risk_level, reasons, requires_human_review, confidence, scored_at
    ) VALUES (
        p_session_id, p_composite_risk_score, p_risk_level, p_reasons, p_requires_human_review, p_confidence, now()
    );

    UPDATE public.assessment_sessions SET status = 'completed', completed_at = now() WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🛠️ ATIVADOR DE TESTE
-- Comentário: Execute o seed do repositório após as chaves serem trocadas.
