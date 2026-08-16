-- ==============================================================================
-- AEGISHUB AI — P5.1 SECURITY HARDENING MIGRATION
-- MÓDULO: COGNITIVE RLS TENANT MEMBERSHIP HARDENING & DELTA RECONCILIATION
-- DATA: 2026-08-18
-- FINDINGS REMEDIATED: SEC-04 (Database Tenant RLS) & SEC-05 (Delta Accounting)
-- ==============================================================================

-- 1. HELPER: is_active_tenant_member
-- Valida se um usuário autenticado possui membership ativa no tenant especificado.
-- SECURITY DEFINER com search_path estrito para evitar escalada de privilégios ou RLS recursion.
CREATE OR REPLACE FUNCTION public.is_active_tenant_member(
    p_user_id UUID,
    p_tenant_id UUID
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_memberships tm
        WHERE tm.user_id = p_user_id
          AND tm.tenant_id = p_tenant_id
          AND tm.status = 'active'
        UNION ALL
        SELECT 1 
        FROM public.profiles p
        WHERE p.id = p_user_id
          AND p.tenant_id = p_tenant_id
    );
$$;

COMMENT ON FUNCTION public.is_active_tenant_member(UUID, UUID) IS 
'Verifica membership ativa do utilizador no tenant. Usado para validação em RLS policies.';

-- 2. FUNÇÃO ATÔMICA DE RECONCILIAÇÃO COM AJUSTE DE DELTA (SEC-05)
-- Evita a contagem dupla de custos subtraindo o valor pré-reservado (p_estimated_cost).
CREATE OR REPLACE FUNCTION public.reconcile_llm_usage(
    p_user_id UUID,
    p_tenant_id UUID,
    p_tokens INTEGER,
    p_actual_cost NUMERIC,
    p_estimated_cost NUMERIC DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_record llm_usage_leases%ROWTYPE;
    v_delta_cost NUMERIC := p_actual_cost - p_estimated_cost;
BEGIN
    INSERT INTO llm_usage_leases (
        user_id, 
        tenant_id, 
        date, 
        daily_tokens_used, 
        daily_cost_usd, 
        updated_at
    )
    VALUES (
        p_user_id, 
        p_tenant_id, 
        CURRENT_DATE, 
        p_tokens, 
        p_actual_cost, 
        now()
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        daily_tokens_used = llm_usage_leases.daily_tokens_used + EXCLUDED.daily_tokens_used,
        daily_cost_usd = GREATEST(0, llm_usage_leases.daily_cost_usd + v_delta_cost),
        updated_at = now()
    RETURNING * INTO v_record;

    RETURN jsonb_build_object(
        'success', true,
        'daily_tokens_used', v_record.daily_tokens_used,
        'daily_cost_usd', v_record.daily_cost_usd
    );
END;
$$;

COMMENT ON FUNCTION public.reconcile_llm_usage(UUID, UUID, INTEGER, NUMERIC, NUMERIC) IS 
'Reconcilia consumo real de LLM aplicando delta (actualCost - estimatedCost) para eliminar contagem dupla.';

-- ==============================================================================
-- 3. RLS POLICIES HARDENING (SEC-04)
-- Enforça auth.uid() = user_id AND is_active_tenant_member(auth.uid(), tenant_id)
-- ==============================================================================

-- A) cognitive_user_profiles
DROP POLICY IF EXISTS "cognitive_user_profiles_owner_only_insert" ON cognitive_user_profiles;
CREATE POLICY "cognitive_user_profiles_owner_only_insert"
    ON cognitive_user_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

DROP POLICY IF EXISTS "cognitive_user_profiles_owner_only_update" ON cognitive_user_profiles;
CREATE POLICY "cognitive_user_profiles_owner_only_update"
    ON cognitive_user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

-- B) cognitive_tasks
DROP POLICY IF EXISTS "cognitive_tasks_owner_only_insert" ON cognitive_tasks;
CREATE POLICY "cognitive_tasks_owner_only_insert"
    ON cognitive_tasks
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

DROP POLICY IF EXISTS "cognitive_tasks_owner_only_update" ON cognitive_tasks;
CREATE POLICY "cognitive_tasks_owner_only_update"
    ON cognitive_tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

-- C) cognitive_focus_sessions
DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_only_insert" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_only_insert"
    ON cognitive_focus_sessions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_only_update" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_only_update"
    ON cognitive_focus_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

-- D) cognitive_support_events
DROP POLICY IF EXISTS "cognitive_support_events_owner_only_insert" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_only_insert"
    ON cognitive_support_events
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

DROP POLICY IF EXISTS "cognitive_support_events_owner_only_update" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_only_update"
    ON cognitive_support_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );

-- E) llm_usage_leases
DROP POLICY IF EXISTS "llm_usage_leases_owner_only" ON llm_usage_leases;
CREATE POLICY "llm_usage_leases_owner_only"
    ON llm_usage_leases
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND public.is_active_tenant_member(auth.uid(), tenant_id)
    );
