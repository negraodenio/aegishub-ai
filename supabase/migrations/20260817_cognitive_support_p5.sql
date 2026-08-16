-- ==============================================================================
-- AEGISHUB AI — FASE P5 MIGRATION
-- MÓDULO: COGNITIVE SUPPORT & NEURODIVERSITY PLATFORM (BENEFÍCIO CORPORATIVO)
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. TABELA DE CONFIGURAÇÕES DO BENEFÍCIO CORPORATIVO POR TENANT
CREATE TABLE IF NOT EXISTS tenant_cognitive_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    max_seats INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABELA DE PERFIL COGNITIVO PESSOAL (ISOLAMENTO ESTRITO POR USUÁRIO)
CREATE TABLE IF NOT EXISTS cognitive_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    consent_given_at TIMESTAMPTZ,
    consent_version TEXT,
    is_consent_revoked BOOLEAN NOT NULL DEFAULT false,
    preferences JSONB NOT NULL DEFAULT '{"focusBlockMinutes": 25, "decompressionBreaks": true, "soundEnabled": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABELA DE TAREFAS E BLOCOS DE FOCO PESSOAIS
CREATE TABLE IF NOT EXISTS cognitive_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
    energy_level TEXT DEFAULT 'medium' CHECK (energy_level IN ('low', 'medium', 'high')),
    estimated_minutes INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABELA DE LEASES E CONSUMO DE LLM (RATE LIMITING & COST GUARD)
CREATE TABLE IF NOT EXISTS llm_usage_leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_tokens_used INTEGER NOT NULL DEFAULT 0,
    daily_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
    lease_expiry TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 seconds'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_date_llm_lease UNIQUE (user_id, date)
);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE tenant_cognitive_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_leases ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES: ISOLAMENTO ESTREITO & BLINDAGEM DE PRIVACIDADE
-- ==============================================================================

-- tenant_cognitive_settings: visualização por membros do tenant
CREATE POLICY "tenant_cognitive_settings_select_policy"
    ON tenant_cognitive_settings
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_memberships
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- tenant_cognitive_settings: atualização exclusiva por administradores e RH
CREATE POLICY "tenant_cognitive_settings_admin_policy"
    ON tenant_cognitive_settings
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'rh') AND is_active = true
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_memberships
            WHERE user_id = auth.uid() AND role IN ('admin', 'rh') AND is_active = true
        )
    );

-- cognitive_user_profiles: ACESSO EXCLUSIVO DO PRÓPRIO UTILIZADOR (ZERO ACESSO AO RH/ADMIN)
CREATE POLICY "cognitive_user_profiles_owner_only_select"
    ON cognitive_user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "cognitive_user_profiles_owner_only_insert"
    ON cognitive_user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cognitive_user_profiles_owner_only_update"
    ON cognitive_user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cognitive_user_profiles_owner_only_delete"
    ON cognitive_user_profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- cognitive_tasks: ACESSO EXCLUSIVO DO PRÓPRIO UTILIZADOR (ZERO ACESSO AO RH/ADMIN)
CREATE POLICY "cognitive_tasks_owner_only_select"
    ON cognitive_tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "cognitive_tasks_owner_only_insert"
    ON cognitive_tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cognitive_tasks_owner_only_update"
    ON cognitive_tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cognitive_tasks_owner_only_delete"
    ON cognitive_tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- llm_usage_leases: ACESSO DO PRÓPRIO UTILIZADOR
CREATE POLICY "llm_usage_leases_owner_only"
    ON llm_usage_leases
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- FUNÇÃO ATÔMICA PARA REGISTRO DE CONSUMO DE LLM (SECURITY DEFINER COM SEARCH_PATH SEGURO)
CREATE OR REPLACE FUNCTION record_llm_usage(
    p_user_id UUID,
    p_tenant_id UUID,
    p_tokens INTEGER,
    p_cost NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_record llm_usage_leases%ROWTYPE;
BEGIN
    INSERT INTO llm_usage_leases (user_id, tenant_id, date, daily_tokens_used, daily_cost_usd, updated_at)
    VALUES (p_user_id, p_tenant_id, CURRENT_DATE, p_tokens, p_cost, now())
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        daily_tokens_used = llm_usage_leases.daily_tokens_used + EXCLUDED.daily_tokens_used,
        daily_cost_usd = llm_usage_leases.daily_cost_usd + EXCLUDED.daily_cost_usd,
        updated_at = now()
    RETURNING * INTO v_record;

    RETURN jsonb_build_object(
        'success', true,
        'daily_tokens_used', v_record.daily_tokens_used,
        'daily_cost_usd', v_record.daily_cost_usd
    );
END;
$$;
