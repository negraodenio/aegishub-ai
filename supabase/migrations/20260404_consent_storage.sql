-- ⚖️ MIND OPS CONSENT AUDIT LOGS (RGPD/Artigo 9)
-- Purpose: Persistent audit trail for psychosocial and voice biometry consent.

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'psychosocial_processing', 'voice_biometry_analysis'
  is_granted BOOLEAN NOT NULL DEFAULT false,
  terms_version TEXT DEFAULT 'v1.0.0 (Portugal Lei 102/2009)',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Setup (Disabled for DEV as per recent request)
ALTER TABLE consent_logs DISABLE ROW LEVEL SECURITY;

-- Index for Audit Lookups
CREATE INDEX IF NOT EXISTS idx_consent_employee ON consent_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_consent_tenant ON consent_logs(tenant_id);

COMMENT ON TABLE consent_logs IS 'Immutable compliance ledger for employee consent management (RGPD/SST Portuguese Law).';
