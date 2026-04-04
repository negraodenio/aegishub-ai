-- 🛠️ MIND OPS CORRECTIVE ACTIONS (Preventive SST)
-- Purpose: Close the risk-assessment loop by generating actionable tasks.

CREATE TABLE IF NOT EXISTS corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  assessment_score_id UUID REFERENCES assessment_scores(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED'
  priority TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  assigned_to UUID REFERENCES employees(id), -- Admin/RH responsible
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Disabled for DEV)
ALTER TABLE corrective_actions DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE corrective_actions IS 'Operational action plans for psychosocial risk mitigation (Lei 102/2009 Portugal).';
