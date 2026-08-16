-- ==============================================================================
-- AEGISHUB AI — FASE P6.5 ENTERPRISE ONBOARDING & CSV BULK IMPORT MIGRATION
-- MÓDULO: ONBOARDING ENGINE, TENANT INVITATIONS & MODULE ACTIVATION
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. TABELA DE ESTADO E PERFIL DE ONBOARDING DO TENANT
CREATE TABLE IF NOT EXISTS public.tenant_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    step TEXT NOT NULL DEFAULT 'organization_created' CHECK (step IN (
        'not_started',
        'organization_created',
        'admin_configured',
        'users_configured',
        'modules_configured',
        'campaign_ready',
        'completed'
    )),
    legal_name TEXT,
    tax_id TEXT, -- NIF/NIPC (PT) / CNPJ (BR)
    economic_activity TEXT, -- CAE (PT) / CNAE (BR)
    timezone TEXT NOT NULL DEFAULT 'Europe/Lisbon',
    currency TEXT NOT NULL DEFAULT 'EUR',
    jurisdiction TEXT NOT NULL DEFAULT 'PT' CHECK (jurisdiction IN ('PT', 'BR')),
    regulatory_authority TEXT NOT NULL DEFAULT 'ACT',
    enabled_modules JSONB NOT NULL DEFAULT '{
        "sst_assessment": true,
        "campaigns": true,
        "interventions": true,
        "compliance_reports": true,
        "ai_governance": true,
        "cognitive_support": false
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_onboarding_tenant ON public.tenant_onboarding(tenant_id);

-- 2. TABELA DE CONVITES DE UTILIZADORES (TENANT INVITATIONS)
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'admin',
        'rh',
        'manager',
        'sst_professional',
        'health_professional',
        'employee',
        'dpo',
        'auditor'
    )) DEFAULT 'employee',
    department TEXT,
    token_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'pending',
        'accepted',
        'revoked',
        'expired'
    )) DEFAULT 'pending',
    invited_by UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant ON public.tenant_invitations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON public.tenant_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON public.tenant_invitations(token_hash);

-- 3. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tenant_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS

-- Onboarding: Visível e editável por Admins do tenant
DROP POLICY IF EXISTS "tenant_onboarding_select" ON public.tenant_onboarding;
CREATE POLICY "tenant_onboarding_select" ON public.tenant_onboarding
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_onboarding.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "tenant_onboarding_admin_update" ON public.tenant_onboarding;
CREATE POLICY "tenant_onboarding_admin_update" ON public.tenant_onboarding
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_onboarding.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'admin'
              AND tm.status = 'active'
        )
    );

-- Invitations: Administradores do tenant podem gerenciar convites
DROP POLICY IF EXISTS "tenant_invitations_admin" ON public.tenant_invitations;
CREATE POLICY "tenant_invitations_admin" ON public.tenant_invitations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_invitations.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'admin'
              AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.tenant_onboarding IS 'Controle de progresso do onboarding corporativo e ativação de módulos por organização.';
COMMENT ON TABLE public.tenant_invitations IS 'Convites de utilizadores por tenant com tokens aleatórios curtos e expiração auditável.';
