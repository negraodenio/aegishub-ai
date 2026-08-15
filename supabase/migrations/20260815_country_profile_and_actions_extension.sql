-- 🛡️ AEGISHUB MULTI-JURISDICTION & EXTENDED SST ACTION LIFECYCLE (v2.3.0)
-- Purpose: Support Portugal (Lei 102/2009) and Brazil (NR-1 / GRO / PGR) without duplicate engines.

-- 1. Extend tenants table with jurisdiction and fiscal metadata
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) NOT NULL DEFAULT 'PT',
ADD COLUMN IF NOT EXISTS tax_id TEXT, -- NIF (PT) / CNPJ (BR)
ADD COLUMN IF NOT EXISTS economic_activity_code TEXT; -- CAE (PT) / CNAE (BR)

-- 2. Extend corrective_actions table to complete the full SST lifecycle:
-- Assess -> Identify -> Analyze -> Intervene -> Monitor -> Reassess -> Evidence
ALTER TABLE public.corrective_actions
ADD COLUMN IF NOT EXISTS responsible_name TEXT,
ADD COLUMN IF NOT EXISTS hazard_factor TEXT,
ADD COLUMN IF NOT EXISTS process_activity TEXT,
ADD COLUMN IF NOT EXISTS evidence_url TEXT,
ADD COLUMN IF NOT EXISTS evidence_notes TEXT,
ADD COLUMN IF NOT EXISTS effectiveness_score NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reassessment_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reassessment_status TEXT DEFAULT 'pending'; -- 'pending', 'effective', 'needs_revision'

-- 3. Indices for multi-tenant and jurisdiction queries
CREATE INDEX IF NOT EXISTS idx_tenants_country_code ON public.tenants(country_code);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_reassessment ON public.corrective_actions(tenant_id, reassessment_status);

COMMENT ON COLUMN public.tenants.country_code IS 'Country profile code: PT (Portugal / Lei 102) or BR (Brazil / NR-1 PGR)';
COMMENT ON COLUMN public.corrective_actions.reassessment_status IS 'Continuous effectiveness tracking for SST and PGR action plans';
