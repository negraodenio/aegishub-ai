const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { resolve } = require('path');

// Load .env from root
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Iniciando Seed Automático MindOps v2 (Node Edition)...");

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
      }
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
      }
    }
  ];

  const { error: decErr } = await supabase
    .from('ai_decisions')
    .upsert(decisions);

  if (decErr) {
    console.error("Falha ao criar decisões de IA:", decErr);
    return;
  }
  console.log(`✅ Decisões de IA inseridas com sucesso.`);
  console.log("\n✨ O sistema está pronto para a demonstração!");
  console.log("👉 Acesse (Porta 3001): http://localhost:3001/rh/intelligence");
}

seed();
