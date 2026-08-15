/**
 * Verifica se a migration de remediação foi aplicada correctamente
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function verify() {
  console.log('\n🔍 AEGISHUB — Verificação da Migration v1.0.0\n');

  const checks: { name: string; ok: boolean; detail: string }[] = [];

  // ——— BLOCO 1: assessment_scores sub-scores ———
  const { data: scoresCols } = await supabase
    .rpc('get_columns' as any, { tbl: 'assessment_scores' })
    .select('*');

  // Fallback: usar information_schema via select directo
  const { data: cols1, error: e1 } = await (supabase as any)
    .from('information_schema.columns' as any)
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'assessment_scores');

  // Use a proxy select to check columns
  const scoreCheck = await (supabase as any)
    .from('assessment_scores')
    .select('phq9_score, gad7_score, burnout_score, wellbeing_score, psychosocial_risk_score, voice_signal_score, voice_path')
    .limit(0);

  if (!scoreCheck.error) {
    checks.push({ name: 'assessment_scores — 7 colunas (sub-scores + voice_path)', ok: true, detail: 'SELECT OK' });
  } else {
    checks.push({ name: 'assessment_scores — 7 colunas', ok: false, detail: scoreCheck.error.message });
  }

  // ——— BLOCO 2: manager_dashboard_aggregates ———
  const dashCheck = await (supabase as any)
    .from('manager_dashboard_aggregates')
    .select('org_unit_id, low_risk_count, moderate_risk_count, high_risk_count, critical_risk_count, avg_composite_score, open_alerts_count, open_referrals_count')
    .limit(0);

  if (!dashCheck.error) {
    checks.push({ name: 'manager_dashboard_aggregates — 8 colunas', ok: true, detail: 'SELECT OK' });
  } else {
    checks.push({ name: 'manager_dashboard_aggregates — 8 colunas', ok: false, detail: dashCheck.error.message });
  }

  // ——— BLOCO 3: risk_alerts requires_human_review ———
  const alertCheck = await (supabase as any)
    .from('risk_alerts')
    .select('requires_human_review')
    .limit(0);

  if (!alertCheck.error) {
    checks.push({ name: 'risk_alerts.requires_human_review', ok: true, detail: 'SELECT OK' });
  } else {
    checks.push({ name: 'risk_alerts.requires_human_review', ok: false, detail: alertCheck.error.message });
  }

  // ——— BLOCO 4: Funções SECURITY DEFINER ———
  const { data: fnData, error: fnErr } = await (supabase as any).rpc('current_user_role');
  // current_user_role() returns null when called without auth — that's expected
  if (!fnErr || fnErr.message.includes('null') || fnErr.code === 'PGRST202') {
    if (fnErr && fnErr.code === 'PGRST202') {
      checks.push({ name: 'current_user_role() function', ok: false, detail: 'Função não encontrada — migration pode não ter sido aplicada' });
    } else {
      checks.push({ name: 'current_user_role() function', ok: true, detail: `Returns: ${fnData ?? 'null (sem auth — esperado)'}` });
    }
  } else {
    checks.push({ name: 'current_user_role() function', ok: true, detail: `Exists (result: ${fnData})` });
  }

  const { data: tenantFnData, error: tenantFnErr } = await (supabase as any).rpc('current_tenant_id');
  if (!tenantFnErr || tenantFnErr.message.includes('null')) {
    checks.push({ name: 'current_tenant_id() function', ok: true, detail: `Returns: ${tenantFnData ?? 'null (sem auth — esperado)'}` });
  } else if (tenantFnErr?.code === 'PGRST202') {
    checks.push({ name: 'current_tenant_id() function', ok: false, detail: 'Função não encontrada' });
  } else {
    checks.push({ name: 'current_tenant_id() function', ok: true, detail: 'Exists' });
  }

  // ——— Print results ———
  console.log('='.repeat(65));
  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const icon = check.ok ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (!check.ok) {
      console.log(`   └─ ${check.detail}`);
      failed++;
    } else {
      passed++;
    }
  }

  console.log('='.repeat(65));
  console.log(`\n📊 ${passed} checks OK / ${failed} falharam\n`);

  if (failed === 0) {
    console.log('✅ Migration aplicada com sucesso!');
    console.log('');
    console.log('PRÓXIMOS PASSOS:');
    console.log('1. Regenerar tipos:');
    console.log('   npx supabase gen types typescript --project-id hffdgtldtjflkozeavoi > packages/database/src/generated.types.ts');
    console.log('2. Corrigir rh.ts L88 (FK hint incorrecta)');
    console.log('3. pnpm typecheck');
  } else {
    console.log('⚠️  Alguns checks falharam — verifique os erros acima.');
    console.log('   A migration pode não ter sido aplicada completamente.');
  }
}

verify();
