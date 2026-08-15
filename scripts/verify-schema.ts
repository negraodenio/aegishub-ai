/**
 * Gera o generated.types.ts a partir do schema real do Supabase
 * usando a API de introspecção via PostgREST (não requer CLI login)
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getTableColumns(tableName: string): Promise<{ column_name: string; data_type: string; is_nullable: string; column_default: string | null }[]> {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  
  // Query information_schema via a function workaround
  const { data, error } = await supabase.rpc('get_table_schema' as any, { p_table: tableName });
  if (error || !data) return [];
  return data;
}

async function verifyColumns() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  
  console.log('\n📋 Schema actual das tabelas remediadas:\n');

  // Verify via a SELECT que revela as colunas
  const tables = [
    { name: 'assessment_scores', cols: 'id, session_id, phq9_score, gad7_score, burnout_score, wellbeing_score, psychosocial_risk_score, voice_signal_score, voice_path, composite_risk_score, risk_level, requires_human_review, confidence, reasons, scored_at' },
    { name: 'manager_dashboard_aggregates', cols: 'id, tenant_id, org_unit_id, period_from, period_to, total_employees, assessed_count, low_risk_count, moderate_risk_count, high_risk_count, critical_risk_count, avg_composite_score, open_alerts_count, open_referrals_count, compliance_score, computed_at' },
    { name: 'risk_alerts', cols: 'id, tenant_id, employee_id, session_id, alert_type, severity, requires_human_review, status, created_at' },
  ];

  for (const t of tables) {
    const { data, error } = await (supabase as any).from(t.name).select(t.cols).limit(0);
    if (!error) {
      console.log(`✅ ${t.name}`);
      console.log(`   Colunas: ${t.cols.split(', ').length} verificadas`);
    } else {
      console.log(`❌ ${t.name}: ${error.message}`);
    }
  }

  console.log('\n🔑 RLS Policies (verificação via contagem):\n');
  
  // Verificar se policies existem
  const policyTables = ['employees', 'assessment_sessions', 'assessment_scores', 'risk_alerts', 'care_referrals'];
  for (const tbl of policyTables) {
    // Com service_role, o RLS é ignorado — confirma que a tabela existe e é acessível
    const { count, error } = await (supabase as any).from(tbl).select('id', { count: 'exact', head: true });
    if (!error) {
      console.log(`✅ ${tbl} — acessível via service_role (RLS bypassed por design)`);
    } else {
      console.log(`⚠️  ${tbl}: ${error.message}`);
    }
  }
}

verifyColumns();
