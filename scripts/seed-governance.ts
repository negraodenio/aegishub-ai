import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Carregar .env da raiz
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Precisamos de service_role para o seed inicial

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedGovernance() {
  console.log('🛡️ Iniciando Seed de Governança de IA (M2.7)...');

  // 1. Garantir que o Tenant ACME existe (Criar se necessário)
  let { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'acme-corp')
    .single();

  if (!tenant) {
    console.log('🏗️ Criando Tenant ACME Corp...');
    const { data: newTenant, error: tError } = await supabase
      .from('tenants')
      .insert({ name: 'ACME Corp', slug: 'acme-corp', vertical: 'industry' })
      .select('id')
      .single();
    
    if (tError) throw tError;
    tenant = newTenant;
  }

  const tenantId = tenant!.id;

  // 2. Criar Funcionário de Teste para o Fluxo Clínico
  const { data: employee, error: eError } = await supabase
    .from('employees')
    .insert({
      tenant_id: tenantId,
      full_name: 'João Silva (Teste)',
      department: 'Infraestrutura',
      status: 'active'
    })
    .select('id')
    .single();

  if (eError) throw eError;

  console.log(`👤 Funcionário de Teste Criado: ID ${employee.id}`);
  console.log(`🔗 Link de Avaliação: http://localhost:3006/assessment/${employee.id}`);

  // 3. Injetar Decisões de IA com Descrições de Controle
  const decisions = [
    {
      tenant_id: tenantId,
      decision_type: 'clinical_bias_mitigation',
      status: 'completed',
      control_description: 'Ajuste proativo da temperatura de amostragem para 0.1 em avaliações de risco crítico, garantindo determinismo clínico e eliminando alucinações de sintomas (EU AI Act Art. 14).',
      automated_action_taken: 'Lockdown de Parâmetro (T=0.1)',
      memory_updates: {
        sampling_temperature: 0.1,
        scaffold_version: '2.0.1',
        clinical_gate_enabled: true
      }
    },
    {
      tenant_id: tenantId,
      decision_type: 'data_privacy_scrubbing',
      status: 'completed',
      control_description: 'Anonimização de biometria vocal antes da inferência de estresse agudo, removendo camadas de identidade conforme diretrizes da RGPD e Lei 102/2009.',
      automated_action_taken: 'Sanitização de PII em VDI',
      memory_updates: {
        pii_masking: 'enabled',
        anonymizer_node: 'node-pt-01',
        retention_days: 0
      }
    },
    {
      tenant_id: tenantId,
      decision_type: 'predictive_risk_calibration',
      status: 'completed',
      control_description: 'Recalibração do Score Composto de Risco (SCR) baseada em dados históricos do setor Industrial, reduzindo falsos positivos em 12% sob supervisão humana.',
      automated_action_taken: 'Update de Modelo em Produção',
      memory_updates: {
        composite_weight_phq9: 0.45,
        composite_weight_gad7: 0.35,
        calibration_offset: -0.02
      }
    }
  ];

  const { error } = await supabase.from('ai_decisions').insert(decisions);

  if (error) {
    console.error('❌ Erro no Seed:', error);
  } else {
    console.log('✅ Governança populada com sucesso! O Dashboard de Controle está agora operacional.');
  }
}

seedGovernance();
