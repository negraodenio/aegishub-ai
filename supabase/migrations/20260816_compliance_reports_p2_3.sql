-- ==============================================================================
-- AEGISHUB AI — P2.3 REGULATORY COMPLIANCE & REPORTING ENGINE SCHEMA
-- Migration: 20260816_compliance_reports_p2_3.sql
-- Description: Regulatory report versioning, cryptographic content hashing,
-- and immutable audit trail for Portuguese (ACT/Lei 102/2009) and Brazilian (NR-1/GRO/PGR) compliance.
-- ==============================================================================

BEGIN;

-- 1. Tabela de Relatórios Regulatórios Versionados (compliance_reports)
CREATE TABLE IF NOT EXISTS public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'campaign_executive',
    'sst_action_plan',
    'act_evidence_pt',
    'nr1_pgr_evidence_br',
    'intervention_effectiveness',
    'ai_governance_audit'
  )),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('PT', 'BR')),
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  content_hash TEXT NOT NULL,
  report_data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para pesquisa e filtragem rápida
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant ON public.compliance_reports(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_campaign ON public.compliance_reports(tenant_id, campaign_id, report_type);

-- 2. Tabela de Auditoria de Relatórios (report_audit_logs)
CREATE TABLE IF NOT EXISTS public.report_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.compliance_reports(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN (
    'REPORT_GENERATED',
    'REPORT_DOWNLOADED',
    'REPORT_REGENERATED',
    'REPORT_VIEWED'
  )),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_audit_logs_tenant_report ON public.report_audit_logs(tenant_id, report_id, created_at DESC);

-- 3. Habilitar RLS em ambas as tabelas
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para compliance_reports
DROP POLICY IF EXISTS "compliance_reports_tenant_isolation_select" ON public.compliance_reports;
CREATE POLICY "compliance_reports_tenant_isolation_select" ON public.compliance_reports
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "compliance_reports_tenant_isolation_insert" ON public.compliance_reports;
CREATE POLICY "compliance_reports_tenant_isolation_insert" ON public.compliance_reports
  FOR INSERT
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "compliance_reports_tenant_isolation_delete" ON public.compliance_reports;
CREATE POLICY "compliance_reports_tenant_isolation_delete" ON public.compliance_reports
  FOR DELETE
  USING (tenant_id = public.current_tenant_id());

-- 5. Políticas RLS para report_audit_logs
DROP POLICY IF EXISTS "report_audit_logs_tenant_isolation_select" ON public.report_audit_logs;
CREATE POLICY "report_audit_logs_tenant_isolation_select" ON public.report_audit_logs
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "report_audit_logs_tenant_isolation_insert" ON public.report_audit_logs;
CREATE POLICY "report_audit_logs_tenant_isolation_insert" ON public.report_audit_logs
  FOR INSERT
  WITH CHECK (tenant_id = public.current_tenant_id());

COMMIT;
