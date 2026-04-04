-- 🛡️ MIND OPS HARDENING PHASE 1 (Audit Fix v2.0.0)
-- Purpouse: Finalize RLS isolation and establish atomic transactions for clinical integrity.

-- 1. [PRIORIDADE 3] Atomic Clinical Completion (Avoid Ghost Records)
CREATE OR REPLACE FUNCTION public.complete_clinical_assessment(
    p_session_id UUID,
    p_composite_risk_score NUMERIC,
    p_risk_level TEXT,
    p_reasons TEXT[],
    p_requires_human_review BOOLEAN DEFAULT FALSE,
    p_confidence NUMERIC DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    -- Insert final scores
    INSERT INTO public.assessment_scores (
        session_id, 
        composite_risk_score, 
        risk_level, 
        reasons, 
        requires_human_review, 
        confidence,
        scored_at
    ) VALUES (
        p_session_id, 
        p_composite_risk_score, 
        p_risk_level, 
        p_reasons, 
        p_requires_human_review, 
        p_confidence,
        now()
    );

    -- Seal the session
    UPDATE public.assessment_sessions
    SET status = 'completed',
        completed_at = now()
    WHERE id = p_session_id;

    -- Security: Audit logs are managed at the app level or via separate trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. [PRIORIDADE 1] Enable RLS on Essential Tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_referrals ENABLE ROW LEVEL SECURITY;

-- 3. Define Standard Tenant Isolation Policies
-- (Using the current_tenant_id() helper defined in 0001_init.sql)

-- [Employees] RH can manage their own tenant's employees
DROP POLICY IF EXISTS "rh_manage_own_tenant_employees" ON public.employees;
CREATE POLICY "rh_manage_own_tenant_employees" ON public.employees
FOR ALL TO authenticated
USING (tenant_id = (SELECT current_tenant_id()));

-- [Sessions] Workers/Managers can access sessions of their tenant
DROP POLICY IF EXISTS "tenant_session_access" ON public.assessment_sessions;
CREATE POLICY "tenant_session_access" ON public.assessment_sessions
FOR ALL TO authenticated
USING (tenant_id = (SELECT current_tenant_id()));

-- [Scores] Manager access control
DROP POLICY IF EXISTS "tenant_scores_access" ON public.assessment_scores;
CREATE POLICY "tenant_scores_access" ON public.assessment_scores
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assessment_sessions
        WHERE id = public.assessment_scores.session_id
        AND tenant_id = (SELECT current_tenant_id())
    )
);

-- [Answers] Isolation
DROP POLICY IF EXISTS "tenant_answers_access" ON public.assessment_answers;
CREATE POLICY "tenant_answers_access" ON public.assessment_answers
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assessment_sessions
        WHERE id = public.assessment_answers.session_id
        AND tenant_id = (SELECT current_tenant_id())
    )
);

-- Documentation
COMMENT ON FUNCTION public.complete_clinical_assessment IS 'Atomic transaction to secure clinical scores and session state (Compliance Audit Fix #3)';
