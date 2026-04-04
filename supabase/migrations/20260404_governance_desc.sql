-- 🛡️ MIND OPS GOVERNANCE FIX (M2.7)
-- Purpose: Add human-readable control descriptions for EU AI Act compliance.

-- 1. Expand AI Decisions with governance context
ALTER TABLE public.ai_decisions 
ADD COLUMN IF NOT EXISTS control_description TEXT,
ADD COLUMN IF NOT EXISTS automated_action_taken TEXT;

-- 2. Expand Risk Alerts with remediation data
ALTER TABLE public.risk_alerts
ADD COLUMN IF NOT EXISTS remediation_plan TEXT,
ADD COLUMN IF NOT EXISTS audit_reference_id TEXT;

-- 3. Update RLS (Ensure descriptions are selectable)
-- (Implicitly covers new columns if policies use SELECT *)

COMMENT ON COLUMN public.ai_decisions.control_description IS 'Human-readable explanation of the AI control applied (EU AI Act Requirement)';
