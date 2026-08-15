-- ==============================================================================
-- AEGISHUB AI — P1 CAMPAIGN MANAGEMENT ENGINE & PARTICIPANTS SCHEMA
-- Migration: 20260816_campaign_management_p1.sql
-- ==============================================================================

-- 1. Enum para Status da Campanha
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE public.campaign_status AS ENUM (
      'draft',
      'scheduled',
      'active',
      'closing',
      'completed',
      'archived'
    );
  END IF;
END $$;

-- 2. Tabela de Campanhas Corporativas
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  country_code VARCHAR(2) NOT NULL DEFAULT 'PT' CHECK (country_code IN ('PT', 'BR')),
  methodology TEXT NOT NULL DEFAULT 'COPSOQ_II',
  instruments TEXT[] NOT NULL DEFAULT '{"COPSOQ","GAD7","PHQ9"}',
  target_departments TEXT[] DEFAULT '{}',
  target_business_units TEXT[] DEFAULT '{}',
  min_anonymity_group_size INTEGER NOT NULL DEFAULT 5 CHECK (min_anonymity_group_size >= 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  allow_voice_screening BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 3. Função para Geração Segura e Sequencial de Código de Campanha por Tenant
CREATE OR REPLACE FUNCTION public.generate_campaign_code(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
  v_count INTEGER;
  v_code TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.campaigns
  WHERE tenant_id = p_tenant_id
    AND code LIKE 'AEG-' || v_year || '-%';

  v_code := 'AEG-' || v_year || '-' || lpad(v_count::TEXT, 6, '0');
  RETURN v_code;
END;
$$;

-- 4. Tabela de Participantes da População-Alvo
CREATE TABLE IF NOT EXISTS public.campaign_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'in_progress', 'completed', 'opted_out')),
  invited_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, employee_id)
);

-- 5. Vincular Avaliações à Campanha (preservando histórico)
ALTER TABLE public.assessment_sessions 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- 6. Habilitar RLS em Campanhas e Participantes
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Segurança RLS — Campanhas
DROP POLICY IF EXISTS "campaigns_tenant_isolation_select" ON public.campaigns;
CREATE POLICY "campaigns_tenant_isolation_select" ON public.campaigns
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "campaigns_tenant_isolation_insert" ON public.campaigns;
CREATE POLICY "campaigns_tenant_isolation_insert" ON public.campaigns
  FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('admin', 'rh', 'sst_professional')
  );

DROP POLICY IF EXISTS "campaigns_tenant_isolation_update" ON public.campaigns;
CREATE POLICY "campaigns_tenant_isolation_update" ON public.campaigns
  FOR UPDATE
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('admin', 'rh', 'sst_professional')
  );

DROP POLICY IF EXISTS "campaigns_tenant_isolation_delete" ON public.campaigns;
CREATE POLICY "campaigns_tenant_isolation_delete" ON public.campaigns
  FOR DELETE
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'admin'
  );

-- 8. Políticas de Segurança RLS — Participantes
DROP POLICY IF EXISTS "campaign_participants_tenant_isolation_select" ON public.campaign_participants;
CREATE POLICY "campaign_participants_tenant_isolation_select" ON public.campaign_participants
  FOR SELECT
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "campaign_participants_tenant_isolation_insert" ON public.campaign_participants;
CREATE POLICY "campaign_participants_tenant_isolation_insert" ON public.campaign_participants
  FOR INSERT
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('admin', 'rh', 'sst_professional')
  );

DROP POLICY IF EXISTS "campaign_participants_tenant_isolation_update" ON public.campaign_participants;
CREATE POLICY "campaign_participants_tenant_isolation_update" ON public.campaign_participants
  FOR UPDATE
  USING (tenant_id = public.current_tenant_id());

-- 9. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON public.campaigns(tenant_id, status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON public.campaign_participants(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_campaign ON public.assessment_sessions(campaign_id);
