-- ==============================================================================
-- AEGISHUB AI — FASE P6.6 COMMERCIAL CONTROL PLANE & SERVER-SIDE QUOTAS
-- MÓDULO: SUBSCRIPTION PLANS, TENANT SUBSCRIPTIONS, QUOTAS & COMMERCIAL AUDIT
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. TABELA DO CATÁLOGO DE PLANOS (SUBSCRIPTION PLANS)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise')),
    quotas JSONB NOT NULL DEFAULT '{
        "seats": 25,
        "campaigns": 3,
        "reports": 10,
        "ai_requests_monthly": 100,
        "storage_mb": 500
    }'::jsonb,
    entitlements JSONB NOT NULL DEFAULT '{
        "campaign_management": true,
        "regulatory_reports": true,
        "ai_governance": false,
        "interventions": true,
        "evidence": true,
        "cognitive_support": false,
        "advanced_analytics": false,
        "csv_import": true,
        "multi_tenant": false,
        "api_access": false
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed de Planos Padrão (Starter, Professional, Enterprise)
INSERT INTO public.subscription_plans (plan_key, name, description, tier, quotas, entitlements)
VALUES
(
    'starter',
    'Aegis Starter',
    'Plano inicial para PMEs em conformidade SST/NR-1 e ACT.',
    'starter',
    '{"seats": 25, "campaigns": 3, "reports": 10, "ai_requests_monthly": 100, "storage_mb": 500}'::jsonb,
    '{"campaign_management": true, "regulatory_reports": true, "ai_governance": false, "interventions": true, "evidence": true, "cognitive_support": false, "advanced_analytics": false, "csv_import": true, "multi_tenant": false, "api_access": false}'::jsonb
),
(
    'professional',
    'Aegis Professional',
    'Plano corporativo completo com Governança de IA e Suporte Cognitivo.',
    'professional',
    '{"seats": 100, "campaigns": 20, "reports": 50, "ai_requests_monthly": 1000, "storage_mb": 5000}'::jsonb,
    '{"campaign_management": true, "regulatory_reports": true, "ai_governance": true, "interventions": true, "evidence": true, "cognitive_support": true, "advanced_analytics": true, "csv_import": true, "multi_tenant": true, "api_access": false}'::jsonb
),
(
    'enterprise',
    'Aegis Enterprise Custom',
    'Plano de alto volume com cotas personalizadas e acesso à API de auditoria.',
    'enterprise',
    '{"seats": 1000, "campaigns": 100, "reports": 500, "ai_requests_monthly": 10000, "storage_mb": 50000}'::jsonb,
    '{"campaign_management": true, "regulatory_reports": true, "ai_governance": true, "interventions": true, "evidence": true, "cognitive_support": true, "advanced_analytics": true, "csv_import": true, "multi_tenant": true, "api_access": true}'::jsonb
)
ON CONFLICT (plan_key) DO UPDATE
SET quotas = EXCLUDED.quotas,
    entitlements = EXCLUDED.entitlements;

-- 2. TABELA DE SUBSCRIÇÕES DE TENANTS (TENANT SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    plan_key TEXT NOT NULL REFERENCES public.subscription_plans(plan_key),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN (
        'trial',
        'active',
        'past_due',
        'suspended',
        'cancelled'
    )),
    contracted_seats INTEGER NOT NULL DEFAULT 25,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    custom_quotas JSONB,
    custom_entitlements JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant ON public.tenant_subscriptions(tenant_id, status);

-- 3. TABELA DE MEDIÇÃO REAL DE USO (TENANT USAGE COUNTERS)
CREATE TABLE IF NOT EXISTS public.tenant_usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    period_key TEXT NOT NULL,
    current_value BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenant_usage_metric UNIQUE (tenant_id, metric_key, period_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_counters ON public.tenant_usage_counters(tenant_id, metric_key, period_key);

-- 4. TABELA DE AUDITORIA COMERCIAL (COMMERCIAL AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.commercial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'subscription_created',
        'subscription_changed',
        'plan_changed',
        'seat_limit_changed',
        'status_changed',
        'feature_enabled',
        'feature_disabled',
        'quota_warning',
        'quota_exceeded',
        'manual_override'
    )),
    old_value JSONB,
    new_value JSONB,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_audit_logs_tenant ON public.commercial_audit_logs(tenant_id, event_type);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_audit_logs ENABLE ROW LEVEL SECURITY;

-- Planos são públicos para leitura por utilizadores autenticados
DROP POLICY IF EXISTS "plans_select_auth" ON public.subscription_plans;
CREATE POLICY "plans_select_auth" ON public.subscription_plans
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Subscrições: Somente Admins do próprio tenant podem consultar e atualizar
DROP POLICY IF EXISTS "tenant_subscriptions_admin" ON public.tenant_subscriptions;
CREATE POLICY "tenant_subscriptions_admin" ON public.tenant_subscriptions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_subscriptions.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'admin'
              AND tm.status = 'active'
        )
    );

-- Usage Counters: Consulta por membros ativos do tenant
DROP POLICY IF EXISTS "tenant_usage_select" ON public.tenant_usage_counters;
CREATE POLICY "tenant_usage_select" ON public.tenant_usage_counters
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_usage_counters.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

-- Audit Logs: Consulta restrita a administradores e auditores
DROP POLICY IF EXISTS "commercial_audit_admin_auditor" ON public.commercial_audit_logs;
CREATE POLICY "commercial_audit_admin_auditor" ON public.commercial_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = commercial_audit_logs.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('admin', 'auditor')
              AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.subscription_plans IS 'Catálogo central de planos comerciais e matriz de quotas e features.';
COMMENT ON TABLE public.tenant_subscriptions IS 'Subscrições de organizações com status, seats contratados e personalizações.';
COMMENT ON TABLE public.tenant_usage_counters IS 'Medição atômica de recursos consumidos por organização por período.';
COMMENT ON TABLE public.commercial_audit_logs IS 'Trilha de auditoria imutável de eventos comerciais e de cota.';
