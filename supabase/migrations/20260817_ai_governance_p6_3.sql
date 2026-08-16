-- ==============================================================================
-- AEGISHUB AI — FASE P6.3 AI GOVERNANCE, MODEL REGISTRY & INCIDENT RESPONSE
-- MÓDULO: MODEL REGISTRY, PROMPT REGISTRY, INCIDENT MANAGEMENT & RLS
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. MODEL REGISTRY CENTRALIZADO
CREATE TABLE IF NOT EXISTS public.ai_model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    model_family TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'draft',
        'pending_approval',
        'approved',
        'active',
        'suspended',
        'retired'
    )) DEFAULT 'draft',
    owner TEXT NOT NULL,
    risk_classification TEXT NOT NULL CHECK (risk_classification IN (
        'minimal',
        'limited',
        'high',
        'unacceptable'
    )) DEFAULT 'limited',
    intended_use TEXT NOT NULL,
    jurisdiction TEXT NOT NULL DEFAULT 'EU',
    deployment_environment TEXT NOT NULL DEFAULT 'production',
    approved_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_model_name_version UNIQUE (model_name, model_version)
);

CREATE INDEX IF NOT EXISTS idx_ai_model_status ON public.ai_model_registry(status);
CREATE INDEX IF NOT EXISTS idx_ai_model_risk ON public.ai_model_registry(risk_classification);

-- 2. PROMPT REGISTRY VERSIONADO
CREATE TABLE IF NOT EXISTS public.ai_prompt_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id TEXT NOT NULL,
    version TEXT NOT NULL,
    purpose TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'draft',
        'active',
        'deprecated',
        'retired'
    )) DEFAULT 'draft',
    owner TEXT NOT NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_prompt_id_version UNIQUE (prompt_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_id ON public.ai_prompt_registry(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_status ON public.ai_prompt_registry(status);

-- 3. GESTÃO DE INCIDENTES DE IA (INCIDENT MANAGEMENT)
CREATE TABLE IF NOT EXISTS public.ai_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.ai_model_registry(id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    type TEXT NOT NULL CHECK (type IN (
        'model_drift',
        'anomalous_behavior',
        'safety_event',
        'governance_violation',
        'privacy_event',
        'unauthorized_model_change'
    )),
    status TEXT NOT NULL CHECK (status IN (
        'detected',
        'triaged',
        'investigating',
        'mitigated',
        'resolved',
        'closed'
    )) DEFAULT 'detected',
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    detected_by TEXT NOT NULL,
    assigned_to TEXT,
    mitigation TEXT,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_incidents_tenant ON public.ai_incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_status ON public.ai_incidents(status);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_severity ON public.ai_incidents(severity);

-- 4. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_incidents ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS

-- Model Registry: Leitura para authenticated, mutação apenas DPO/Admin
DROP POLICY IF EXISTS "model_registry_select" ON public.ai_model_registry;
CREATE POLICY "model_registry_select" ON public.ai_model_registry
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "model_registry_insert" ON public.ai_model_registry;
CREATE POLICY "model_registry_insert" ON public.ai_model_registry
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'dpo')
              AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "model_registry_update" ON public.ai_model_registry;
CREATE POLICY "model_registry_update" ON public.ai_model_registry
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'dpo')
              AND tm.status = 'active'
        )
    );

-- Prompt Registry: Leitura para authenticated, mutação apenas DPO/Admin
DROP POLICY IF EXISTS "prompt_registry_select" ON public.ai_prompt_registry;
CREATE POLICY "prompt_registry_select" ON public.ai_prompt_registry
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "prompt_registry_insert" ON public.ai_prompt_registry;
CREATE POLICY "prompt_registry_insert" ON public.ai_prompt_registry
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'dpo')
              AND tm.status = 'active'
        )
    );

-- Incidents: Isolado por tenant e restrito a papéis de governança/SST/Admin
DROP POLICY IF EXISTS "incidents_tenant_select" ON public.ai_incidents;
CREATE POLICY "incidents_tenant_select" ON public.ai_incidents
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = ai_incidents.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'sst_professional', 'dpo', 'auditor')
              AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "incidents_tenant_insert" ON public.ai_incidents;
CREATE POLICY "incidents_tenant_insert" ON public.ai_incidents
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = ai_incidents.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'sst_professional', 'dpo', 'auditor')
              AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "incidents_tenant_update" ON public.ai_incidents;
CREATE POLICY "incidents_tenant_update" ON public.ai_incidents
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = ai_incidents.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'sst_professional', 'dpo', 'auditor')
              AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.ai_model_registry IS 'Catálogo centralizado de modelos de IA e controle de ciclo de vida.';
COMMENT ON TABLE public.ai_prompt_registry IS 'Registro versionado e auditável de prompts de IA governados.';
COMMENT ON TABLE public.ai_incidents IS 'Sistema de gestão e contenção de incidentes e desvios de IA.';
