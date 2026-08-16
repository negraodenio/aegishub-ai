-- ==============================================================================
-- AEGISHUB AI — FASE P5.1 MIGRATION
-- MÓDULO: COGNITIVE ACCESSIBILITY SUITE (WAVE 1)
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. TABELA DE SESSÕES DE FOCO COGNITIVO (ISOLAMENTO ESTRITO POR USUÁRIO & TENANT)
CREATE TABLE IF NOT EXISTS cognitive_focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal TEXT,
    duration_preset_seconds INTEGER NOT NULL DEFAULT 1500,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_actual_seconds INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    energy_level_before INTEGER CHECK (energy_level_before IS NULL OR (energy_level_before >= 1 AND energy_level_before <= 10)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABELA DE TELEMETRIA & EVENTOS DE SUPORTE COGNITIVO (STUCK FLOW, CHECK-INS)
CREATE TABLE IF NOT EXISTS cognitive_support_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE E CONSULTAS TEMPORAIS
CREATE INDEX IF NOT EXISTS idx_cognitive_focus_sessions_user_time 
    ON cognitive_focus_sessions (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_cognitive_focus_sessions_tenant_time 
    ON cognitive_focus_sessions (tenant_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_cognitive_support_events_user_time 
    ON cognitive_support_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cognitive_support_events_tenant_time 
    ON cognitive_support_events (tenant_id, created_at DESC);

-- HABILITAR RLS EM TODAS AS NOVAS TABELAS
ALTER TABLE cognitive_focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_support_events ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES: ISOLAMENTO ESTREITO (AUTH.UID() = USER_ID)
-- ZERO ACESSO PATRONAL / RH / ADMIN A DADOS INDIVIDUAIS
-- ==============================================================================

-- cognitive_focus_sessions: SELECT
DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_select" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_select"
    ON cognitive_focus_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- cognitive_focus_sessions: INSERT
DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_insert" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_insert"
    ON cognitive_focus_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- cognitive_focus_sessions: UPDATE
DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_update" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_update"
    ON cognitive_focus_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- cognitive_focus_sessions: DELETE
DROP POLICY IF EXISTS "cognitive_focus_sessions_owner_delete" ON cognitive_focus_sessions;
CREATE POLICY "cognitive_focus_sessions_owner_delete"
    ON cognitive_focus_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- cognitive_support_events: SELECT
DROP POLICY IF EXISTS "cognitive_support_events_owner_select" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_select"
    ON cognitive_support_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- cognitive_support_events: INSERT
DROP POLICY IF EXISTS "cognitive_support_events_owner_insert" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_insert"
    ON cognitive_support_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- cognitive_support_events: UPDATE
DROP POLICY IF EXISTS "cognitive_support_events_owner_update" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_update"
    ON cognitive_support_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- cognitive_support_events: DELETE
DROP POLICY IF EXISTS "cognitive_support_events_owner_delete" ON cognitive_support_events;
CREATE POLICY "cognitive_support_events_owner_delete"
    ON cognitive_support_events
    FOR DELETE
    USING (auth.uid() = user_id);
