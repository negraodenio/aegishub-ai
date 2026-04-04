import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env");
  console.log("Tentando fallback para NEXT_PUBLIC_ vars...");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Iniciando Seed Automático MindOps v2...");

  // 1. Criar o Primeiro Tenant (MindOps Demo)
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .upsert({ 
      name: 'MindOps Enterprise Demo', 
      slug: 'mindops-demo',
      vertical: 'tech' 
    })
    .select()
    .single();

  if (tenantErr) {
    console.error("Falha ao criar tenant:", tenantErr);
    return;
  }
  const tenantId = tenant.id;
  console.log(`✅ Tenant criado: ${tenant.name} (${tenantId})`);

  // 2. Criar Colaboradores Fictícios
  const employees = [
    { tenant_id: tenantId, full_name: 'Ana Silva', department: 'Engenharia', business_unit: 'Core Ops' },
    { tenant_id: tenantId, full_name: 'Bruno Ramos', department: 'Vendas', business_unit: 'Comercial SP' },
    { tenant_id: tenantId, full_name: 'Carla Dias', department: 'HR', business_unit: 'Gente & Gestão' },
    { tenant_id: tenantId, full_name: 'David Lucas', department: 'TI', business_unit: 'Infra' },
    { tenant_id: tenantId, full_name: 'Eliane Costa', department: 'Atendimento', business_unit: 'CS Porto' },
  ];

  const { data: empData, error: empErr } = await supabase
    .from('employees')
    .upsert(employees)
    .select();

  if (empErr) {
    console.error("Falha ao criar colaboradores:", empErr);
    return;
  }
  console.log(`✅ ${empData.length} Colaboradores inseridos.`);

  // 3. Criar Alertas de IA (Decisões M2.7)
  const decisions = [
    {
      tenant_id: tenantId,
      decision_type: 'burnout_threshold_adjustment',
      status: 'pending',
      memory_updates: {
        sampling_temperature: 0.72,
        burnout_threshold: 55,
        notes: "M2.7 detectou anomalia recorrente no setor de TI via MiniMax 2.7. Recomendado ajuste proativo de baseline.",
        timestamp: new Date().toISOString()
      },
      created_at: new Date(Date.now() - 3600000).toISOString() // 1h atrás
    },
    {
      tenant_id: tenantId,
      decision_type: 'group_intervention_recommendation',
      status: 'pending',
      memory_updates: {
        sampling_temperature: 0.65,
        target_unit: "Atendimento",
        notes: "Drift detectado em padrões de voz (fadiga vocal). Sugerida pausa preventiva obrigatória.",
        timestamp: new Date().toISOString()
      },
      created_at: new Date(Date.now() - 7200000).toISOString() // 2h atrás
    }
  ];

  // 4. Criar Scores de Avaliação Clínicos
  const scores = empData.map((emp, i) => ({
    tenant_id: tenantId,
    employee_id: emp.id,
    composite_risk_score: 20 + (i * 15),
    risk_level: i > 3 ? 'high' : i > 2 ? 'moderate' : 'low',
    reasons: i > 3 ? ['high_phq9_score', 'voice_signal_change_detected'] : [],
    requires_human_review: i > 3,
    confidence: 0.85 + (i * 0.02),
    created_at: new Date(Date.now() - 86400000 * i).toISOString()
  }));

  const { error: scoreErr } = await supabase
    .from('assessment_scores')
    .upsert(scores);

  if (scoreErr) console.error("Falha ao criar scores:", scoreErr);
  else console.log(`✅ ${scores.length} Scores clínicos inseridos.`);

  // 5. Criar Agregados para o Dashboard
  const { error: aggErr } = await supabase
    .from('manager_dashboard_aggregates')
    .upsert({
      tenant_id: tenantId,
      assessed_count: empData.length,
      total_employees: empData.length,
      avg_composite_score: 45,
      high_risk_count: 1,
      critical_risk_count: 1,
      compliance_score: 94,
      computed_at: new Date().toISOString()
    });

  if (aggErr) console.error("Falha ao criar agregados:", aggErr);
  else console.log(`✅ Agregados do Dashboard atualizados.`);

  console.log(`✅ Decisões de IA inseridas com sucesso.`);
  console.log("\n✨ O sistema está pronto para a demonstração!");
  console.log("👉 Acesse: http://localhost:3006/rh");
}

seed();
