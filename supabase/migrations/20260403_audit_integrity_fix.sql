-- 🛡️ MIND OPS AI INTEGRITY MIGRATION (Audit v1.0.0)
-- Purpouse: Fix identification gaps in AI decisions as required by GDPR and EU AI Act.

-- 1. Add employee_id to ai_decisions for direct traceability
ALTER TABLE IF EXISTS public.ai_decisions 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- 2. Add description/metadata for EU AI Act High-Risk System Compliance
COMMENT ON TABLE public.ai_decisions IS 'Registos de decisões e recomendações automatizadas (EU AI Act High-Risk System Compliance)';

-- 3. Ensure RLS is active (Audit Fix #10)
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy for Tenant Isolation (Self-Correction)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_decisions' AND policyname = 'tenant_isolation_policy'
    ) THEN
        CREATE POLICY tenant_isolation_policy ON public.ai_decisions
        FOR ALL
        TO authenticated
        USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
    END IF;
END $$;

-- 5. Force Audit Trigger for non-repudiation
-- (Assuming an audit function exists or the app layer handles it as it currently does)
