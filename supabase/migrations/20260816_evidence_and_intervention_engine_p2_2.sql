-- ==============================================================================
-- AEGISHUB AI — P2.2 EVIDENCE & INTERVENTION ENGINE SCHEMA
-- Migration: 20260816_evidence_and_intervention_engine_p2_2.sql
-- Description: Complete closed-loop SST / PGR intervention lifecycle,
-- multi-evidence management, and immutable audit trail.
-- ==============================================================================

BEGIN;

-- 1. Estender corrective_actions com vínculo de campanha e campos de eficácia
ALTER TABLE public.corrective_actions
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reassessment_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS effectiveness_rating TEXT CHECK (effectiveness_rating IN ('effective', 'partially_effective', 'ineffective', 'not_assessed')),
ADD COLUMN IF NOT EXISTS effectiveness_rationale TEXT,
ADD COLUMN IF NOT EXISTS effectiveness_evaluated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS effectiveness_evaluated_at TIMESTAMPTZ;

-- 2. Tabela de Evidências Documentais de Intervenção (action_evidence)
CREATE TABLE IF NOT EXISTS public.action_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.corrective_actions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'document', 'policy', 'procedure', 'training_record',
    'meeting_minutes', 'work_schedule', 'ergonomic_assessment', 'photo', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_hash TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_action_evidence_tenant_action ON public.action_evidence(tenant_id, action_id);
CREATE INDEX IF NOT EXISTS idx_action_evidence_campaign ON public.action_evidence(campaign_id);

-- 3. Tabela de Rastro Imutável de Auditoria de Ações (action_audit_logs)
CREATE TABLE IF NOT EXISTS public.action_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.corrective_actions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'status_changed', 'assigned', 'evidence_added',
    'reassessment_recorded', 'effectiveness_evaluated', 'closed', 'reopened'
  )),
  previous_state JSONB,
  new_state JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_audit_logs_tenant_action ON public.action_audit_logs(tenant_id, action_id, created_at DESC);

-- 4. Habilitar RLS em todas as tabelas
ALTER TABLE public.action_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para action_evidence
DROP POLICY IF EXISTS "action_evidence_tenant_isolation_select" ON public.action_evidence;
CREATE POLICY "action_evidence_tenant_isolation_select" ON public.action_evidence
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "action_evidence_tenant_isolation_insert" ON public.action_evidence;
CREATE POLICY "action_evidence_tenant_isolation_insert" ON public.action_evidence
  FOR INSERT
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "action_evidence_tenant_isolation_delete" ON public.action_evidence;
CREATE POLICY "action_evidence_tenant_isolation_delete" ON public.action_evidence
  FOR DELETE
  USING (tenant_id = public.current_tenant_id());

-- 6. Políticas RLS para action_audit_logs
DROP POLICY IF EXISTS "action_audit_logs_tenant_isolation_select" ON public.action_audit_logs;
CREATE POLICY "action_audit_logs_tenant_isolation_select" ON public.action_audit_logs
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "action_audit_logs_tenant_isolation_insert" ON public.action_audit_logs;
CREATE POLICY "action_audit_logs_tenant_isolation_insert" ON public.action_audit_logs
  FOR INSERT
  WITH CHECK (tenant_id = public.current_tenant_id());

COMMIT;
