import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Iniciando Seed Estratégico ACME Corp...");

  // 1. Criar ACME Enterprise
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .upsert({ 
      name: 'ACME Corporation', 
      slug: 'acme-corp',
      vertical: 'manufacturing' 
    })
    .select()
    .single();

  if (tenantErr) {
    console.error("Falha ao criar tenant:", tenantErr);
    return;
  }
  const tenantId = tenant.id;

  // 2. Criar Departamentos e Colaboradores (Massa de Dados)
  const departments = ['Engenharia', 'Produção', 'Logística', 'Vendas', 'RH'];
  const employees = [
    { tenant_id: tenantId, full_name: 'Marcos Almeida', department: 'Engenharia', business_unit: 'P&D' },
    { tenant_id: tenantId, full_name: 'Julia Farias', department: 'Engenharia', business_unit: 'P&D' },
    { tenant_id: tenantId, full_name: 'Ricardo Gomes', department: 'Produção', business_unit: 'Linha A' },
    { tenant_id: tenantId, full_name: 'Sofia Pinho', department: 'Produção', business_unit: 'Linha A' },
    { tenant_id: tenantId, full_name: 'Tiago Melo', department: 'Produção', business_unit: 'Linha B' },
    { tenant_id: tenantId, full_name: 'Beatriz Silva', department: 'Logística', business_unit: 'Distribuição' },
    { tenant_id: tenantId, full_name: 'André Santos', department: 'Vendas', business_unit: 'Comercial PT' },
    { tenant_id: tenantId, full_name: 'Camila Rocha', department: 'Vendas', business_unit: 'Comercial PT' },
    { tenant_id: tenantId, full_name: 'Paulo Jorge', department: 'RH', business_unit: 'Gente & Gestão' },
    { tenant_id: tenantId, full_name: 'Luísa Borges', department: 'RH', business_unit: 'Gente & Gestão' },
  ];

  const { data: empData, error: empErr } = await supabase
    .from('employees')
    .upsert(employees)
    .select();

  if (empErr) {
    console.error("Falha ao criar colaboradores:", empErr);
    return;
  }
  console.log(`✅ ${empData.length} Colaboradores ACME inseridos.`);

  // 3. Criar Sessões e Scores Clínicos (Massa Crítica)
  // Alguns saudáveis, alguns com risco
  const scores = empData.map((emp, i) => {
    const isAtRisk = i % 3 === 0; // 33% de risco para demonstração
    return {
      tenant_id: tenantId,
      employee_id: emp.id,
      composite_risk_score: isAtRisk ? 65 + (i * 2) : 15 + (i * 5),
      risk_level: isAtRisk ? 'high' : 'low',
      reasons: isAtRisk ? ['high_phq9_score', 'voice_fatigue_detected'] : [],
      requires_human_review: isAtRisk,
      confidence: 0.88,
      created_at: new Date(Date.now() - 86400000 * i).toISOString()
    };
  });

  await supabase.from('assessment_scores').upsert(scores);
  console.log(`✅ ${scores.length} Scores clínicos para ACME inseridos.`);

  // 4. Criar Alertas Críticos (Action Center)
  const alerts = empData.filter((_, i) => i % 3 === 0).map(emp => ({
    tenant_id: tenantId,
    employee_id: emp.id,
    alert_type: 'burnout_risk',
    severity: 'high',
    status: 'open',
    created_at: new Date().toISOString()
  }));

  await supabase.from('risk_alerts').upsert(alerts);
  console.log(`✅ ${alerts.length} Alertas de risco gerados para o Action Center.`);

  // 5. Agregados do Dashboard
  await supabase.from('manager_dashboard_aggregates').upsert({
    tenant_id: tenantId,
    assessed_count: empData.length,
    total_employees: empData.length + 5, // Simula cobertura < 100%
    avg_composite_score: 38,
    high_risk_count: alerts.length,
    critical_risk_count: 1,
    compliance_score: 82,
    computed_at: new Date().toISOString()
  });

  console.log(`✅ Dashboard da ACME Corporation consolidado.`);
  console.log("\n✨ ACME Corp está pronta para auditoria sênior!");
  console.log(`👉 RH Dashboard: http://localhost:3006/rh?tenantId=${tenantId}`);
}

seed();
