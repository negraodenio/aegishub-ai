-- ==============================================================================
-- AEGISHUB AI — FASE P6.2 PRIVACY & DATA SUBJECT RIGHTS MIGRATION
-- MÓDULO: PRIVACY AUDIT EVENTS & RGPD/LGPD DATA SUBJECT RIGHTS LEDGER
-- DATA: 2026-08-17
-- ==============================================================================

-- 1. TABELA DE EVENTOS DE AUDITORIA DE PRIVACIDADE
CREATE TABLE IF NOT EXISTS public.privacy_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'data_export_requested',
        'right_to_erasure_executed',
        'consent_granted',
        'consent_revoked',
        'data_rectification_requested'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de consulta rápida e auditoria
CREATE INDEX IF NOT EXISTS idx_privacy_audit_user ON public.privacy_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_tenant ON public.privacy_audit_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_event_type ON public.privacy_audit_events(event_type);

-- 2. HABILITAÇÃO DE RLS
ALTER TABLE public.privacy_audit_events ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE RLS
-- Colaborador pode consultar apenas o seu próprio histórico de eventos de privacidade
DROP POLICY IF EXISTS "privacy_audit_user_select" ON public.privacy_audit_events;
CREATE POLICY "privacy_audit_user_select" ON public.privacy_audit_events
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = privacy_audit_events.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('dpo', 'admin', 'auditor')
              AND tm.status = 'active'
        )
    );

-- Inserção permitida para utilizadores autenticados vinculados ao próprio auth.uid()
DROP POLICY IF EXISTS "privacy_audit_user_insert" ON public.privacy_audit_events;
CREATE POLICY "privacy_audit_user_insert" ON public.privacy_audit_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = privacy_audit_events.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('dpo', 'admin')
              AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.privacy_audit_events IS 
'Trilha de auditoria imutável para solicitações de direitos dos titulares de dados (RGPD Art. 15-22 / LGPD Art. 18).';
