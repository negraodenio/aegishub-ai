-- 🛡️ MIND OPS INFRASTRUCTURE FIX (Enterprise 2.0)
-- Purpouse: Resolve 'care_referrals' missing relation and deploy Advanced SOS & Voice infrastructure.

-- 1. Create Expert Clinical Enums
DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Expert Clinical Referral Table (Missing Relation Fix)
CREATE TABLE IF NOT EXISTS care_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE SET NULL,
  referral_type TEXT NOT NULL, -- e.g., 'physical_therapy', 'psychology', 'emergency_sos'
  urgency risk_level_enum DEFAULT 'low',
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  sla_deadline TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Deploy SOS Dynamic Infrastructure (M2.7)
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

-- Link Referrals to SOS
ALTER TABLE care_referrals ADD COLUMN IF NOT EXISTS sos_session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE;

-- 4. Deploy Structured Biofonia (Vocal Fatigue Registry)
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

-- 5. Audit Traceability (State Machine)
CREATE TABLE IF NOT EXISTS sos_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sos_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'opened', 'ai_triage', 'human_escalated', 'closed'
  actor TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Indices (Scalability Audit #2)
CREATE INDEX IF NOT EXISTS idx_sos_sessions_tenant ON sos_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sos_messages_session ON sos_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_referrals_tenant ON care_referrals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session ON voice_sessions(session_id);

-- Registrar ativação do Hotfix Enterprise v2.0
INSERT INTO ai_audit_logs (action, actor, status, details) 
VALUES ('enterprise_infra_fix_v2', 'MindOps_Agent', 'success', '{"details": "Resolved care_referrals missing relation, deployed Enterprise SOS & Voice structure"}');
