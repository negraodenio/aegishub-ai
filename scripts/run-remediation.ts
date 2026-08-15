/**
 * AegisHub Database Remediation Migration Runner
 * Applies DDL via pg (direct Postgres connection) using Supabase connection string
 * 
 * Usage: npx tsx scripts/run-remediation.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Each block is a separate DDL statement group executed sequentially
const blocks: { name: string; sql: string }[] = [
  {
    name: 'BLOCO 1 — assessment_scores sub-scores + voice_path',
    sql: `
      ALTER TABLE public.assessment_scores
        ADD COLUMN IF NOT EXISTS phq9_score NUMERIC,
        ADD COLUMN IF NOT EXISTS gad7_score NUMERIC,
        ADD COLUMN IF NOT EXISTS burnout_score NUMERIC,
        ADD COLUMN IF NOT EXISTS wellbeing_score NUMERIC,
        ADD COLUMN IF NOT EXISTS psychosocial_risk_score NUMERIC,
        ADD COLUMN IF NOT EXISTS voice_signal_score NUMERIC,
        ADD COLUMN IF NOT EXISTS voice_path TEXT
    `
  },
  {
    name: 'BLOCO 2 — manager_dashboard_aggregates 8 colunas + índice',
    sql: `
      ALTER TABLE public.manager_dashboard_aggregates
        ADD COLUMN IF NOT EXISTS org_unit_id UUID,
        ADD COLUMN IF NOT EXISTS low_risk_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS moderate_risk_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS high_risk_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS critical_risk_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS avg_composite_score NUMERIC,
        ADD COLUMN IF NOT EXISTS open_alerts_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS open_referrals_count INTEGER NOT NULL DEFAULT 0
    `
  },
  {
    name: 'BLOCO 3 — risk_alerts.requires_human_review',
    sql: `
      ALTER TABLE public.risk_alerts
        ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN NOT NULL DEFAULT true
    `
  },
  {
    name: 'BLOCO 4.1 — current_tenant_id() search_path fix',
    sql: `
      CREATE OR REPLACE FUNCTION public.current_tenant_id()
      RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public, pg_catalog
      AS $$ SELECT tenant_id FROM public.profiles WHERE id = auth.uid() $$
    `
  },
  {
    name: 'BLOCO 4.2 — current_user_role() (função em falta)',
    sql: `
      CREATE OR REPLACE FUNCTION public.current_user_role()
      RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public, pg_catalog
      AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$
    `
  },
  {
    name: 'BLOCO 4.3 — complete_clinical_assessment() tenant validation + search_path',
    sql: `
      CREATE OR REPLACE FUNCTION public.complete_clinical_assessment(
          p_session_id UUID,
          p_composite_risk_score NUMERIC,
          p_risk_level TEXT,
          p_reasons TEXT[],
          p_requires_human_review BOOLEAN DEFAULT FALSE,
          p_confidence NUMERIC DEFAULT 0
      ) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog
      AS $$
      DECLARE
        v_session_tenant_id UUID;
      BEGIN
        SELECT tenant_id INTO v_session_tenant_id
        FROM public.assessment_sessions
        WHERE id = p_session_id;

        IF v_session_tenant_id IS NULL THEN
          RAISE EXCEPTION 'Session not found: %', p_session_id;
        END IF;

        IF v_session_tenant_id IS DISTINCT FROM public.current_tenant_id() THEN
          RAISE EXCEPTION 'Access denied: session % does not belong to caller tenant', p_session_id;
        END IF;

        INSERT INTO public.assessment_scores (
          session_id, composite_risk_score, risk_level,
          reasons, requires_human_review, confidence, scored_at
        ) VALUES (
          p_session_id, p_composite_risk_score, p_risk_level,
          p_reasons, p_requires_human_review, p_confidence, now()
        );

        UPDATE public.assessment_sessions
        SET status = 'completed', completed_at = now()
        WHERE id = p_session_id;
      END;
      $$
    `
  },
  {
    name: 'BLOCO 5 — RLS ENABLE em 15 tabelas',
    sql: `
      ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.care_referrals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.sos_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.sos_messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.predictive_risk_signals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.manager_dashboard_aggregates ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY
    `
  },
  {
    name: 'BLOCO 6a — Policies: tenants, profiles, employees, sessions, answers, scores',
    sql: `
      DROP POLICY IF EXISTS "tenant_self_access" ON public.tenants;
      CREATE POLICY "tenant_self_access" ON public.tenants FOR SELECT TO authenticated USING (id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_profiles_access" ON public.profiles;
      CREATE POLICY "tenant_profiles_access" ON public.profiles FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_iso_employees" ON public.employees;
      DROP POLICY IF EXISTS "rh_manage_own_tenant_employees" ON public.employees;
      CREATE POLICY "tenant_iso_employees" ON public.employees FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_session_access" ON public.assessment_sessions;
      CREATE POLICY "tenant_session_access" ON public.assessment_sessions FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_answers_access" ON public.assessment_answers;
      CREATE POLICY "tenant_answers_access" ON public.assessment_answers FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.assessment_sessions s WHERE s.id = public.assessment_answers.session_id AND s.tenant_id = public.current_tenant_id()));

      DROP POLICY IF EXISTS "tenant_scores_access" ON public.assessment_scores;
      CREATE POLICY "tenant_scores_access" ON public.assessment_scores FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.assessment_sessions s WHERE s.id = public.assessment_scores.session_id AND s.tenant_id = public.current_tenant_id()))
    `
  },
  {
    name: 'BLOCO 6b — Policies: risk_alerts, care_referrals, ai_decisions, ai_audit_logs',
    sql: `
      DROP POLICY IF EXISTS "tenant_risk_alerts_access" ON public.risk_alerts;
      CREATE POLICY "tenant_risk_alerts_access" ON public.risk_alerts FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_care_referrals_access" ON public.care_referrals;
      CREATE POLICY "tenant_care_referrals_access" ON public.care_referrals FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.ai_decisions;
      DROP POLICY IF EXISTS "tenant_ai_decisions_access" ON public.ai_decisions;
      CREATE POLICY "tenant_ai_decisions_access" ON public.ai_decisions FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_ai_audit_logs_access" ON public.ai_audit_logs;
      CREATE POLICY "tenant_ai_audit_logs_access" ON public.ai_audit_logs FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.ai_decisions d WHERE d.id = public.ai_audit_logs.decision_id AND d.tenant_id = public.current_tenant_id()))
    `
  },
  {
    name: 'BLOCO 6c — Policies: sos, voice, predictive, dashboard, consent, corrective',
    sql: `
      DROP POLICY IF EXISTS "tenant_sos_sessions_access" ON public.sos_sessions;
      CREATE POLICY "tenant_sos_sessions_access" ON public.sos_sessions FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_sos_messages_access" ON public.sos_messages;
      CREATE POLICY "tenant_sos_messages_access" ON public.sos_messages FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.sos_sessions ss WHERE ss.id = public.sos_messages.session_id AND ss.tenant_id = public.current_tenant_id()));

      DROP POLICY IF EXISTS "tenant_voice_sessions_access" ON public.voice_sessions;
      CREATE POLICY "tenant_voice_sessions_access" ON public.voice_sessions FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_predictive_risk_signals_access" ON public.predictive_risk_signals;
      CREATE POLICY "tenant_predictive_risk_signals_access" ON public.predictive_risk_signals FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_dashboard_aggregates_access" ON public.manager_dashboard_aggregates;
      CREATE POLICY "tenant_dashboard_aggregates_access" ON public.manager_dashboard_aggregates FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_consent_logs_access" ON public.consent_logs;
      CREATE POLICY "tenant_consent_logs_access" ON public.consent_logs FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "tenant_corrective_actions_access" ON public.corrective_actions;
      CREATE POLICY "tenant_corrective_actions_access" ON public.corrective_actions FOR ALL TO authenticated USING (tenant_id = public.current_tenant_id())
    `
  },
  {
    name: 'BLOCO 7 — Índices de performance',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_manager_dashboard_org_unit ON public.manager_dashboard_aggregates(tenant_id, org_unit_id, computed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON public.profiles(id);
      CREATE INDEX IF NOT EXISTS idx_assessment_sessions_tenant ON public.assessment_sessions(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_sos_messages_session_id ON public.sos_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_decision_id ON public.ai_audit_logs(decision_id)
    `
  }
];

async function runMigration() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  console.log('');
  console.log('🚀 AegisHub Database Remediation v1.0.0');
  console.log('📍', SUPABASE_URL);
  console.log('');

  let passed = 0;
  let failed = 0;
  const errors: { block: string; error: string }[] = [];

  for (const block of blocks) {
    process.stdout.write(`  ⏳ ${block.name}...`);
    
    try {
      // Use the Supabase REST API to execute SQL via the query endpoint
      // This works for DDL when using service role
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      // Try via Supabase's query endpoint (available in some configurations)
      const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      
      const ddlResponse = await fetch(
        `${SUPABASE_URL}/pg/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: block.sql.trim() })
        }
      );

      if (ddlResponse.ok) {
        const result = await ddlResponse.json();
        console.log(` ✅ OK`);
        passed++;
      } else {
        // Try the alternative endpoint
        const altResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql: block.sql.trim() })
          }
        );

        const altText = await altResponse.text();
        
        if (altResponse.ok) {
          console.log(` ✅ OK (alt)`);
          passed++;
        } else {
          console.log(` ❌ FAILED`);
          console.log(`     Response: ${altResponse.status} ${altText.substring(0, 200)}`);
          failed++;
          errors.push({ block: block.name, error: altText.substring(0, 300) });
        }
      }
    } catch (e: any) {
      console.log(` ❌ ERROR: ${e.message}`);
      failed++;
      errors.push({ block: block.name, error: e.message });
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`📊 Resultado: ${passed} blocos OK / ${failed} falharam`);
  
  if (failed > 0) {
    console.log('');
    console.log('❌ Blocos com erros:');
    errors.forEach(e => {
      console.log(`  - ${e.block}`);
      console.log(`    ${e.error}`);
    });
    console.log('');
    console.log('📋 AÇÃO NECESSÁRIA:');
    console.log('Execute o SQL manualmente no Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/hffdgtldtjflkozeavoi/sql/new');
    console.log('');
    console.log('O SQL completo está em:');
    console.log('supabase/migrations/20260815_remediation_v1.sql');
  } else {
    console.log('✅ Migration aplicada com sucesso!');
    console.log('');
    console.log('PRÓXIMOS PASSOS:');
    console.log('1. npx supabase gen types typescript --project-id hffdgtldtjflkozeavoi > packages/database/src/generated.types.ts');
    console.log('2. Corrigir rh.ts L88 (FK hint incorrecta)');
    console.log('3. pnpm typecheck');
  }
}

runMigration();
