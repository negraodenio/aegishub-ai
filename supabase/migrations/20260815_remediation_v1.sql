-- ============================================================
-- AEGISHUB DATABASE REMEDIATION MIGRATION v1.0.0
-- Date: 2026-08-15
-- Strategy: EXTEND > REUSE > REFACTOR > CREATE
-- Additive only — no tables dropped, no data removed
-- ============================================================

-- ============================================================
-- BLOCO 0 — PRÉ-VERIFICAÇÃO
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_scores' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'ERRO: tabela assessment_scores não existe. Executar MASTER_SCHEMA.sql primeiro.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manager_dashboard_aggregates' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'ERRO: tabela manager_dashboard_aggregates não existe.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risk_alerts' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'ERRO: tabela risk_alerts não existe.';
  END IF;
  RAISE NOTICE '✅ Pré-verificação OK.';
END $$;

-- ============================================================
-- BLOCO 1 — ASSESSMENT_SCORES: Sub-scores em falta
-- Evidence: 0001_init.sql L61-66, route.ts L46-51, score-composer.ts
-- ============================================================

COMMENT ON TABLE public.assessment_scores IS 'Scores compostos e por instrumento de avaliações psicossociais. Sub-scores são opcionais (nullable).';

ALTER TABLE public.assessment_scores
  ADD COLUMN IF NOT EXISTS phq9_score NUMERIC,
  ADD COLUMN IF NOT EXISTS gad7_score NUMERIC,
  ADD COLUMN IF NOT EXISTS burnout_score NUMERIC,
  ADD COLUMN IF NOT EXISTS wellbeing_score NUMERIC,
  ADD COLUMN IF NOT EXISTS psychosocial_risk_score NUMERIC,
  ADD COLUMN IF NOT EXISTS voice_signal_score NUMERIC,
  ADD COLUMN IF NOT EXISTS voice_path TEXT;

COMMENT ON COLUMN public.assessment_scores.phq9_score IS 'PHQ-9 score 0-27. NULL se instrumento não aplicado.';
COMMENT ON COLUMN public.assessment_scores.gad7_score IS 'GAD-7 score 0-21. NULL se instrumento não aplicado.';
COMMENT ON COLUMN public.assessment_scores.burnout_score IS 'Score burnout normalizado 0-100.';
COMMENT ON COLUMN public.assessment_scores.wellbeing_score IS 'Score bem-estar 0-100 (inverso de risco).';
COMMENT ON COLUMN public.assessment_scores.psychosocial_risk_score IS 'Score psicossocial COPSOQ/Worker Voice 0-100.';
COMMENT ON COLUMN public.assessment_scores.voice_signal_score IS 'Score fadiga vocal 0-100. NULL se avaliação vocal não realizada.';
COMMENT ON COLUMN public.assessment_scores.voice_path IS 'Path para ficheiro de áudio no bucket voice-assessments. NULL se sem avaliação vocal.';

-- ============================================================
-- BLOCO 2 — MANAGER_DASHBOARD_AGGREGATES: Colunas em falta
-- Evidence: 0001_init.sql L98-115, rh.ts L35/37/60/62/70/79
-- ============================================================

ALTER TABLE public.manager_dashboard_aggregates
  ADD COLUMN IF NOT EXISTS org_unit_id UUID,
  ADD COLUMN IF NOT EXISTS low_risk_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderate_risk_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS high_risk_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS critical_risk_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_composite_score NUMERIC,
  ADD COLUMN IF NOT EXISTS open_alerts_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_referrals_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.manager_dashboard_aggregates.org_unit_id IS 'UUID lógico da unidade organizacional. NULL = agregado de tenant completo.';
COMMENT ON COLUMN public.manager_dashboard_aggregates.high_risk_count IS 'Nº colaboradores com risk_level=high no período.';
COMMENT ON COLUMN public.manager_dashboard_aggregates.critical_risk_count IS 'Nº colaboradores com risk_level=critical no período.';
COMMENT ON COLUMN public.manager_dashboard_aggregates.avg_composite_score IS 'Média composite_risk_score no período.';
COMMENT ON COLUMN public.manager_dashboard_aggregates.open_alerts_count IS 'Nº risk_alerts open/in_review no momento do cálculo.';
COMMENT ON COLUMN public.manager_dashboard_aggregates.open_referrals_count IS 'Nº care_referrals pending/scheduled no momento do cálculo.';

CREATE INDEX IF NOT EXISTS idx_manager_dashboard_org_unit
  ON public.manager_dashboard_aggregates(tenant_id, org_unit_id, computed_at DESC);

-- ============================================================
-- BLOCO 3 — RISK_ALERTS: requires_human_review em falta
-- Evidence: 0001_init.sql L82, generated.types.ts L62, seed-ai.ts L95
-- ============================================================

ALTER TABLE public.risk_alerts
  ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.risk_alerts.requires_human_review IS 'Indica se o alerta requer revisão explícita por profissional SST. Default TRUE — human-in-the-loop enforced.';

-- ============================================================
-- BLOCO 4 — SECURITY DEFINER FUNCTIONS: search_path + tenant validation
-- ============================================================

-- 4.1 current_tenant_id() — adicionar search_path
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

COMMENT ON FUNCTION public.current_tenant_id() IS 'Retorna tenant_id do utilizador autenticado. SECURITY DEFINER com search_path fixo.';

-- 4.2 current_user_role() — existe em 0001_init.sql, ausente no MASTER_SCHEMA
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

COMMENT ON FUNCTION public.current_user_role() IS 'Retorna role do utilizador autenticado. Usada em RLS policies role-based.';

-- 4.3 complete_clinical_assessment() — search_path + tenant ownership validation
CREATE OR REPLACE FUNCTION public.complete_clinical_assessment(
    p_session_id UUID,
    p_composite_risk_score NUMERIC,
    p_risk_level TEXT,
    p_reasons TEXT[],
    p_requires_human_review BOOLEAN DEFAULT FALSE,
    p_confidence NUMERIC DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_session_tenant_id UUID;
BEGIN
  -- Validar que a sessão pertence ao tenant do caller
  SELECT tenant_id INTO v_session_tenant_id
  FROM public.assessment_sessions
  WHERE id = p_session_id;

  IF v_session_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Session not found: %', p_session_id;
  END IF;

  IF v_session_tenant_id IS DISTINCT FROM public.current_tenant_id() THEN
    RAISE EXCEPTION 'Access denied: session % does not belong to caller tenant', p_session_id;
  END IF;

  -- Inserir scores (lógica original preservada)
  INSERT INTO public.assessment_scores (
    session_id, composite_risk_score, risk_level,
    reasons, requires_human_review, confidence, scored_at
  ) VALUES (
    p_session_id, p_composite_risk_score, p_risk_level,
    p_reasons, p_requires_human_review, p_confidence, now()
  );

  -- Fechar sessão (lógica original preservada)
  UPDATE public.assessment_sessions
  SET status = 'completed', completed_at = now()
  WHERE id = p_session_id;
END;
$$;

COMMENT ON FUNCTION public.complete_clinical_assessment IS 'Transação atómica para finalizar avaliação clínica. SECURITY DEFINER com tenant validation e search_path fixo. Remediation v1.0.0.';

-- ============================================================
-- BLOCO 5 — RLS: Activar em tabelas críticas
-- ============================================================

-- Re-activar tabelas potencialmente desactivadas pelo dev_rls_unlock
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Activar em tabelas sem RLS
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_dashboard_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BLOCO 6 — POLICIES: Tenant isolation canónico
-- ============================================================

-- tenants
DROP POLICY IF EXISTS "tenant_self_access" ON public.tenants;
CREATE POLICY "tenant_self_access" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());

-- profiles
DROP POLICY IF EXISTS "tenant_profiles_access" ON public.profiles;
CREATE POLICY "tenant_profiles_access" ON public.profiles
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- employees
DROP POLICY IF EXISTS "tenant_iso_employees" ON public.employees;
DROP POLICY IF EXISTS "rh_manage_own_tenant_employees" ON public.employees;
CREATE POLICY "tenant_iso_employees" ON public.employees
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- assessment_sessions
DROP POLICY IF EXISTS "tenant_session_access" ON public.assessment_sessions;
CREATE POLICY "tenant_session_access" ON public.assessment_sessions
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- assessment_answers (via EXISTS join)
DROP POLICY IF EXISTS "tenant_answers_access" ON public.assessment_answers;
CREATE POLICY "tenant_answers_access" ON public.assessment_answers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = public.assessment_answers.session_id
        AND s.tenant_id = public.current_tenant_id()
    )
  );

-- assessment_scores (via EXISTS join)
DROP POLICY IF EXISTS "tenant_scores_access" ON public.assessment_scores;
CREATE POLICY "tenant_scores_access" ON public.assessment_scores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions s
      WHERE s.id = public.assessment_scores.session_id
        AND s.tenant_id = public.current_tenant_id()
    )
  );

-- risk_alerts
DROP POLICY IF EXISTS "tenant_risk_alerts_access" ON public.risk_alerts;
CREATE POLICY "tenant_risk_alerts_access" ON public.risk_alerts
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- care_referrals
DROP POLICY IF EXISTS "tenant_care_referrals_access" ON public.care_referrals;
CREATE POLICY "tenant_care_referrals_access" ON public.care_referrals
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- ai_decisions — alinhar para current_tenant_id() (remover jwt->>'tenant_id')
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.ai_decisions;
DROP POLICY IF EXISTS "tenant_ai_decisions_access" ON public.ai_decisions;
CREATE POLICY "tenant_ai_decisions_access" ON public.ai_decisions
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- ai_audit_logs (via EXISTS join a ai_decisions)
DROP POLICY IF EXISTS "tenant_ai_audit_logs_access" ON public.ai_audit_logs;
CREATE POLICY "tenant_ai_audit_logs_access" ON public.ai_audit_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_decisions d
      WHERE d.id = public.ai_audit_logs.decision_id
        AND d.tenant_id = public.current_tenant_id()
    )
  );

-- sos_sessions
DROP POLICY IF EXISTS "tenant_sos_sessions_access" ON public.sos_sessions;
CREATE POLICY "tenant_sos_sessions_access" ON public.sos_sessions
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- sos_messages (via EXISTS join a sos_sessions)
DROP POLICY IF EXISTS "tenant_sos_messages_access" ON public.sos_messages;
CREATE POLICY "tenant_sos_messages_access" ON public.sos_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sos_sessions ss
      WHERE ss.id = public.sos_messages.session_id
        AND ss.tenant_id = public.current_tenant_id()
    )
  );

-- voice_sessions
DROP POLICY IF EXISTS "tenant_voice_sessions_access" ON public.voice_sessions;
CREATE POLICY "tenant_voice_sessions_access" ON public.voice_sessions
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- predictive_risk_signals
DROP POLICY IF EXISTS "tenant_predictive_risk_signals_access" ON public.predictive_risk_signals;
CREATE POLICY "tenant_predictive_risk_signals_access" ON public.predictive_risk_signals
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- manager_dashboard_aggregates
DROP POLICY IF EXISTS "tenant_dashboard_aggregates_access" ON public.manager_dashboard_aggregates;
CREATE POLICY "tenant_dashboard_aggregates_access" ON public.manager_dashboard_aggregates
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- consent_logs
DROP POLICY IF EXISTS "tenant_consent_logs_access" ON public.consent_logs;
CREATE POLICY "tenant_consent_logs_access" ON public.consent_logs
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- corrective_actions
DROP POLICY IF EXISTS "tenant_corrective_actions_access" ON public.corrective_actions;
CREATE POLICY "tenant_corrective_actions_access" ON public.corrective_actions
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- ============================================================
-- BLOCO 7 — ÍNDICES de suporte às RLS policies
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_tenant ON public.assessment_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sos_messages_session_id ON public.sos_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_decision_id ON public.ai_audit_logs(decision_id);

-- ============================================================
-- BLOCO 8 — COMENTÁRIOS DE INTENÇÃO NOT NULL
-- ============================================================

COMMENT ON COLUMN public.consent_logs.tenant_id IS 'tenant_id deve ser NOT NULL. Actualmente nullable. Aplicar NOT NULL após verificar dados existentes. (P2)';
COMMENT ON COLUMN public.sos_sessions.tenant_id IS 'tenant_id deve ser NOT NULL. SOS sessions sem tenant são dados órfãos. (P2)';
COMMENT ON COLUMN public.care_referrals.tenant_id IS 'tenant_id deve ser NOT NULL. (P2)';
COMMENT ON COLUMN public.corrective_actions.tenant_id IS 'tenant_id deve ser NOT NULL. (P2)';

-- ============================================================
-- BLOCO 9 — REGISTO DE AUDITORIA
-- ============================================================

INSERT INTO public.audit_logs (
  action, resource_type, metadata, occurred_at
) VALUES (
  'database_remediation_migration_v1',
  'schema',
  jsonb_build_object(
    'version', '1.0.0',
    'blocks', ARRAY[
      'assessment_scores_7_columns',
      'manager_dashboard_aggregates_8_columns',
      'risk_alerts_requires_human_review',
      'security_definer_search_path_tenant_validation',
      'rls_enable_15_tables',
      'rls_policies_17_created',
      'performance_indexes_4_created'
    ],
    'notes', 'Additive only. No data removed. No tables dropped.'
  ),
  now()
);
