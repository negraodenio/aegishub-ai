import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { Database } from "../generated.types";


export const DEMO_TENANT_PT = {
  id: "dddddddd-1111-4444-8888-000000000001",
  name: "Lusitana Logística & Serviços, Lda. (DEMO)",
  slug: "demo-lusitana-logistica",
  country_code: "PT" as const,
  legal_name: "Lusitana Logística & Serviços, Lda. — Demonstração",
  tax_id: "DEMO-NIF-509999999",
  economic_activity: "CAE 52291",
  timezone: "Europe/Lisbon",
  currency: "EUR",
  jurisdiction: "PT" as const,
  regulatory_authority: "ACT",
  plan_key: "professional"
};

export const DEMO_TENANT_BR = {
  id: "dddddddd-2222-4444-8888-000000000002",
  name: "Paulista Indústria & Tecnologia S/A (DEMO)",
  slug: "demo-paulista-industria",
  country_code: "BR" as const,
  legal_name: "Paulista Indústria & Tecnologia S/A — Demonstração",
  tax_id: "DEMO-CNPJ-00000000000100",
  economic_activity: "CNAE 29.49-2-99",
  timezone: "America/Sao_Paulo",
  currency: "BRL",
  jurisdiction: "BR" as const,
  regulatory_authority: "MTE",
  plan_key: "enterprise"
};

export interface DemoSeedOptions {
  force?: boolean;
  correlationId?: string;
}

/**
 * 🛡️ Guard de Proteção contra Execução Acidental em Produção
 */
export function assertDemoEnvironmentAllowed(): void {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_SEED_ENABLED !== "true") {
    throw new Error(
      "DEMO_GUARD_VIOLATION: O provisionamento de dados sintéticos de demonstração está bloqueado em ambiente de produção sem DEMO_SEED_ENABLED=true."
    );
  }
}

/**
 * 🇵🇹 Seed Determinístico do Tenant Demo de Portugal (Lusitana Logística)
 */
export async function seedDemoPortugal(
  client: SupabaseClient<Database>,
  options: DemoSeedOptions = {}
): Promise<{ success: boolean; tenantId: string; summary: any }> {
  assertDemoEnvironmentAllowed();

  const tid = DEMO_TENANT_PT.id;

  // 1. Criar/Atualizar Tenant Demo
  await (client.from("tenants") as any).upsert(
    {
      id: tid,
      name: DEMO_TENANT_PT.name,
      slug: DEMO_TENANT_PT.slug,
      country_code: DEMO_TENANT_PT.country_code,
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 2. Onboarding Profile
  await (client.from("tenant_onboarding") as any).upsert(
    {
      tenant_id: tid,
      step: "completed",
      legal_name: DEMO_TENANT_PT.legal_name,
      tax_id: DEMO_TENANT_PT.tax_id,
      economic_activity: DEMO_TENANT_PT.economic_activity,
      timezone: DEMO_TENANT_PT.timezone,
      currency: DEMO_TENANT_PT.currency,
      jurisdiction: DEMO_TENANT_PT.jurisdiction,
      regulatory_authority: DEMO_TENANT_PT.regulatory_authority,
      enabled_modules: {
        sst_assessment: true,
        campaigns: true,
        interventions: true,
        compliance_reports: true,
        ai_governance: true,
        cognitive_support: true
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "tenant_id" }
  );

  // 3. Subscription Comercial (Professional)
  await (client.from("tenant_subscriptions") as any).upsert(
    {
      tenant_id: tid,
      plan_key: DEMO_TENANT_PT.plan_key,
      status: "active",
      contracted_seats: 100,
      starts_at: new Date().toISOString(),
      auto_renew: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "tenant_id" }
  );

  // 4. Utilizadores Sintéticos (Domain: @demo.invalid)
  const users = [
    { id: "dddddddd-0000-0000-0001-000000000001", email: "admin.pt@demo.invalid", role: "admin", name: "Dra. Inês Ferreira (DEMO)" },
    { id: "dddddddd-0000-0000-0001-000000000002", email: "rh.pt@demo.invalid", role: "rh", name: "Rui Santos (DEMO)" },
    { id: "dddddddd-0000-0000-0001-000000000003", email: "sst.pt@demo.invalid", role: "sst_professional", name: "Eng. Pedro Alentejo (DEMO)" },
    { id: "dddddddd-0000-0000-0001-000000000004", email: "manager.pt@demo.invalid", role: "manager", name: "Mariana Costa (DEMO)" },
    { id: "dddddddd-0000-0000-0001-000000000005", email: "auditor.pt@demo.invalid", role: "auditor", name: "Dr. Duarte Mendes (DEMO)" }
  ];

  // Adiciona 20 colaboradores sintéticos para garantir N >= 20
  for (let i = 1; i <= 20; i++) {
    const pad = String(i).padStart(2, "0");
    users.push({
      id: `dddddddd-0000-0000-0001-0000000000${pad}`,
      email: `colaborador.${pad}.pt@demo.invalid`,
      role: "employee",
      name: `Colaborador Sintético ${pad} (DEMO)`
    });
  }

  for (const u of users) {
    await (client.from("tenant_memberships") as any).upsert(
      {
        user_id: u.id,
        tenant_id: tid,
        role: u.role,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,tenant_id" }
    );
  }

  // 5. Campanha Demo de Portugal
  const campaignId = "dddddddd-c001-4444-8888-000000000001";
  await (client.from("campaigns") as any).upsert(
    {
      id: campaignId,
      tenant_id: tid,
      title: "Avaliação Psicossocial 2026 — Lisboa (DEMO)",
      description: "Bateria de avaliação ergonômica e psicossocial coletiva conforme Lei 102/2009 e ACT.",
      status: "active",
      sample_size: 25,
      completed_count: 22,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 6. Ação Corretiva / Intervenção Demo
  const interventionId = "dddddddd-i001-4444-8888-000000000001";
  await (client.from("interventions") as any).upsert(
    {
      id: interventionId,
      tenant_id: tid,
      title: "Otimização de Escalas e Redução de Sobrecarga Noturna (DEMO)",
      risk_factor: "Sobrecarga Psicossocial e Fadiga de Turno",
      status: "effective",
      priority: "high",
      target_department: "Operações & Logística",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 7. Evidência Criptográfica da Intervenção
  const evidenceDoc = "DEMO — RELATÓRIO DE AJUSTE DE TURNOS E PAUSAS ATIVAS — SINTÉTICO";
  const evidenceHash = crypto.createHash("sha256").update(evidenceDoc).digest("hex");
  await (client.from("intervention_evidence") as any).upsert(
    {
      id: "dddddddd-e001-4444-8888-000000000001",
      intervention_id: interventionId,
      tenant_id: tid,
      type: "procedure",
      file_hash: evidenceHash,
      notes: "Procedimento operacional padrão de revezamento de motoristas aprovado pela CIPA/Comissão Paritária.",
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 8. Relatório Regulatório ACT
  await (client.from("compliance_reports") as any).upsert(
    {
      id: "dddddddd-r001-4444-8888-000000000001",
      tenant_id: tid,
      jurisdiction: "PT",
      legal_framework: "Lei 102/2009 / ACT",
      status: "published",
      title: "Laudo Regulatório de Avaliação Psicossocial — ACT 2026 (DEMO)",
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  return {
    success: true,
    tenantId: tid,
    summary: {
      tenant: DEMO_TENANT_PT.name,
      jurisdiction: "PT (Lei 102/2009 / ACT)",
      usersCreated: users.length,
      sampleSize: 25,
      complianceStandard: "ACT"
    }
  };
}

/**
 * 🇧🇷 Seed Determinístico do Tenant Demo do Brasil (Paulista Indústria)
 */
export async function seedDemoBrazil(
  client: SupabaseClient<Database>,
  options: DemoSeedOptions = {}
): Promise<{ success: boolean; tenantId: string; summary: any }> {
  assertDemoEnvironmentAllowed();

  const tid = DEMO_TENANT_BR.id;

  // 1. Criar/Atualizar Tenant Demo
  await (client.from("tenants") as any).upsert(
    {
      id: tid,
      name: DEMO_TENANT_BR.name,
      slug: DEMO_TENANT_BR.slug,
      country_code: DEMO_TENANT_BR.country_code,
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 2. Onboarding Profile
  await (client.from("tenant_onboarding") as any).upsert(
    {
      tenant_id: tid,
      step: "completed",
      legal_name: DEMO_TENANT_BR.legal_name,
      tax_id: DEMO_TENANT_BR.tax_id,
      economic_activity: DEMO_TENANT_BR.economic_activity,
      timezone: DEMO_TENANT_BR.timezone,
      currency: DEMO_TENANT_BR.currency,
      jurisdiction: DEMO_TENANT_BR.jurisdiction,
      regulatory_authority: DEMO_TENANT_BR.regulatory_authority,
      enabled_modules: {
        sst_assessment: true,
        campaigns: true,
        interventions: true,
        compliance_reports: true,
        ai_governance: true,
        cognitive_support: true
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "tenant_id" }
  );

  // 3. Subscription Comercial (Enterprise)
  await (client.from("tenant_subscriptions") as any).upsert(
    {
      tenant_id: tid,
      plan_key: DEMO_TENANT_BR.plan_key,
      status: "active",
      contracted_seats: 1000,
      starts_at: new Date().toISOString(),
      auto_renew: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "tenant_id" }
  );

  // 4. Utilizadores Sintéticos (Domain: @demo.invalid)
  const users = [
    { id: "dddddddd-0000-0000-0002-000000000001", email: "admin.br@demo.invalid", role: "admin", name: "Carlos Eduardo Silva (DEMO)" },
    { id: "dddddddd-0000-0000-0002-000000000002", email: "rh.br@demo.invalid", role: "rh", name: "Juliana Albuquerque (DEMO)" },
    { id: "dddddddd-0000-0000-0002-000000000003", email: "sst.br@demo.invalid", role: "sst_professional", name: "Dr. Marcelo Fagundes (DEMO)" },
    { id: "dddddddd-0000-0000-0002-000000000004", email: "manager.br@demo.invalid", role: "manager", name: "Fernanda Toledo (DEMO)" },
    { id: "dddddddd-0000-0000-0002-000000000005", email: "dpo.br@demo.invalid", role: "dpo", name: "Lucas Prado (DEMO)" }
  ];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(2, "0");
    users.push({
      id: `dddddddd-0000-0000-0002-0000000000${pad}`,
      email: `operador.${pad}.br@demo.invalid`,
      role: "employee",
      name: `Operador Industrial Sintético ${pad} (DEMO)`
    });
  }

  for (const u of users) {
    await (client.from("tenant_memberships") as any).upsert(
      {
        user_id: u.id,
        tenant_id: tid,
        role: u.role,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,tenant_id" }
    );
  }

  // 5. Campanha Demo do Brasil
  const campaignId = "dddddddd-c002-4444-8888-000000000002";
  await (client.from("campaigns") as any).upsert(
    {
      id: campaignId,
      tenant_id: tid,
      title: "Avaliação GRO/PGR 2026 — São Paulo (DEMO)",
      description: "Inventário de riscos ocupacionais e fatores ergonômicos psicossociais conforme NR-1 e MTE.",
      status: "active",
      sample_size: 30,
      completed_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 6. Ação Corretiva / Intervenção Demo
  const interventionId = "dddddddd-i002-4444-8888-000000000002";
  await (client.from("interventions") as any).upsert(
    {
      id: interventionId,
      tenant_id: tid,
      title: "Programa de Redução de Ruído e Carga de Trabalho em Linha de Montagem (DEMO)",
      risk_factor: "Pressão de Prazo e Exigências Organizacionais",
      status: "effective",
      priority: "high",
      target_department: "Manufatura e Engenharia",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 7. Evidência Criptográfica
  const evidenceDoc = "DEMO — PLANO DE AÇÃO NR-1 GRO/PGR — SINTÉTICO";
  const evidenceHash = crypto.createHash("sha256").update(evidenceDoc).digest("hex");
  await (client.from("intervention_evidence") as any).upsert(
    {
      id: "dddddddd-e002-4444-8888-000000000002",
      intervention_id: interventionId,
      tenant_id: tid,
      type: "procedure",
      file_hash: evidenceHash,
      notes: "Plano de ação integrado ao PGR da unidade Fabril 01 assinado por Engenheiro de Segurança.",
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  // 8. Relatório Regulatório NR-1 / PGR
  await (client.from("compliance_reports") as any).upsert(
    {
      id: "dddddddd-r002-4444-8888-000000000002",
      tenant_id: tid,
      jurisdiction: "BR",
      legal_framework: "NR-1 / GRO / PGR",
      status: "published",
      title: "Laudo Regulatório de Riscos Psicossociais — NR-1 / GRO / PGR 2026 (DEMO)",
      created_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  return {
    success: true,
    tenantId: tid,
    summary: {
      tenant: DEMO_TENANT_BR.name,
      jurisdiction: "BR (NR-1 / GRO / PGR)",
      usersCreated: users.length,
      sampleSize: 30,
      complianceStandard: "MTE"
    }
  };
}

/**
 * 🧹 Reset Seguro de Dados Sintéticos de Demonstração
 * ATENÇÃO: Executa limpeza estrita SOMENTE em tenants identificados como demo-*
 */
export async function resetDemoTenant(
  client: SupabaseClient<Database>,
  tenantSlug: string
): Promise<{ success: boolean; message: string }> {
  assertDemoEnvironmentAllowed();

  if (!tenantSlug || !tenantSlug.startsWith("demo-")) {
    throw new Error(
      `RESET_REJECTED: O slug '${tenantSlug}' não é um tenant de demonstração (deve iniciar com 'demo-'). Operação abortada para segurança dos dados de produção.`
    );
  }

  const { data: tenant } = await (client.from("tenants") as any)
    .select("id, slug")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) {
    return { success: true, message: `Tenant '${tenantSlug}' não encontrado ou já limpo.` };
  }

  // Deleta o tenant demo (cascateando via FK)
  await (client.from("tenants") as any).delete().eq("id", tenant.id);

  return { success: true, message: `Dados sintéticos da organização '${tenantSlug}' foram removidos com sucesso.` };
}
