import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { Database } from "../generated.types";

export const VALID_ROLES = [
  "admin",
  "rh",
  "manager",
  "sst_professional",
  "health_professional",
  "employee",
  "dpo",
  "auditor"
] as const;

export type ValidRole = (typeof VALID_ROLES)[number];

export interface RosterRow {
  email: string;
  name?: string | undefined;
  role: ValidRole;
  department?: string | undefined;
  employee_code?: string | undefined;
}


export type OnboardingStep =
  | "not_started"
  | "organization_created"
  | "admin_configured"
  | "users_configured"
  | "modules_configured"
  | "campaign_ready"
  | "completed";

export interface TenantOnboardingData {
  id?: string;
  tenant_id: string;
  step: OnboardingStep;
  legal_name?: string | null;
  tax_id?: string | null;
  economic_activity?: string | null;
  timezone: string;
  currency: string;
  jurisdiction: "PT" | "BR";
  regulatory_authority: string;
  enabled_modules: {
    sst_assessment: boolean;
    campaigns: boolean;
    interventions: boolean;
    compliance_reports: boolean;
    ai_governance: boolean;
    cognitive_support: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TenantInvitation {
  id: string;
  tenant_id: string;
  email: string;
  role: ValidRole;
  department?: string | null;
  token_hash: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at?: string;
}

export interface ProvisionTenantInput {
  name: string;
  slug: string;
  country_code: "PT" | "BR";
  legal_name?: string;
  tax_id?: string;
  economic_activity?: string;
  timezone?: string;
  currency?: string;
}

/**
 * 🏢 Provisiona um novo Tenant e inicializa o Admin com Isolamento Total
 */
export async function provisionNewTenant(
  client: SupabaseClient<Database>,
  userId: string,
  input: ProvisionTenantInput
): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  // 1. Criar registro na tabela tenants
  const { data: tenant, error: tenantErr } = await (client.from("tenants") as any)
    .insert({
      name: input.name,
      slug: input.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      country_code: input.country_code,
      created_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (tenantErr || !tenant) {
    return { success: false, error: tenantErr?.message || "Falha ao criar organização." };
  }

  const tenantId = tenant.id;

  // 2. Associar criador como Admin Ativo na tabela tenant_memberships
  await (client.from("tenant_memberships") as any).upsert(
    {
      user_id: userId,
      tenant_id: tenantId,
      role: "admin",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,tenant_id" }
  );

  // 3. Inicializar metadados de onboarding e jurisdição
  const isPT = input.country_code === "PT";
  await (client.from("tenant_onboarding") as any).insert({
    tenant_id: tenantId,
    step: "admin_configured",
    legal_name: input.legal_name || input.name,
    tax_id: input.tax_id || null,
    economic_activity: input.economic_activity || null,
    timezone: input.timezone || (isPT ? "Europe/Lisbon" : "America/Sao_Paulo"),
    currency: input.currency || (isPT ? "EUR" : "BRL"),
    jurisdiction: input.country_code,
    regulatory_authority: isPT ? "ACT" : "MTE",
    enabled_modules: {
      sst_assessment: true,
      campaigns: true,
      interventions: true,
      compliance_reports: true,
      ai_governance: true,
      cognitive_support: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  return { success: true, tenantId };
}

/**
 * 📊 Retorna o estado atual de onboarding do tenant
 */
export async function getTenantOnboardingState(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<TenantOnboardingData | null> {
  const { data, error } = await (client.from("tenant_onboarding") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !data) return null;
  return data as TenantOnboardingData;
}

/**
 * ⚙️ Atualiza os módulos ativados pelo tenant
 */
export async function updateTenantModules(
  client: SupabaseClient<Database>,
  tenantId: string,
  modules: Partial<TenantOnboardingData["enabled_modules"]>
): Promise<{ success: boolean; error?: string }> {
  const current = await getTenantOnboardingState(client, tenantId);
  const updatedModules = {
    ...(current?.enabled_modules || {
      sst_assessment: true,
      campaigns: true,
      interventions: true,
      compliance_reports: true,
      ai_governance: true,
      cognitive_support: false
    }),
    ...modules
  };

  const { error } = await (client.from("tenant_onboarding") as any)
    .update({
      enabled_modules: updatedModules,
      step: "modules_configured",
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", tenantId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * ✉️ Cria um convite seguro com token aleatório e expiração de 7 dias
 */
export async function createTenantInvitation(
  client: SupabaseClient<Database>,
  tenantId: string,
  invitedBy: string,
  email: string,
  role: ValidRole,
  department?: string
): Promise<{ success: boolean; invitation?: TenantInvitation; rawToken?: string; error?: string }> {
  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await (client.from("tenant_invitations") as any)
    .insert({
      tenant_id: tenantId,
      email: email.toLowerCase().trim(),
      role,
      department: department || null,
      token_hash: tokenHash,
      status: "pending",
      invited_by: invitedBy,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Falha ao gerar convite." };
  }

  return { success: true, invitation: data as TenantInvitation, rawToken };
}

/**
 * 🤝 Aceita um convite de onboarding e provisiona a membership
 */
export async function acceptTenantInvitation(
  client: SupabaseClient<Database>,
  rawToken: string,
  userId: string
): Promise<{ success: boolean; tenantId?: string; error?: string }> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const { data: invitation, error: fetchErr } = await (client.from("tenant_invitations") as any)
    .select("*")
    .eq("token_hash", tokenHash)
    .eq("status", "pending")
    .single();

  if (fetchErr || !invitation) {
    return { success: false, error: "INVITATION_INVALID: Convite não localizado ou já utilizado." };
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    await (client.from("tenant_invitations") as any)
      .update({ status: "expired" })
      .eq("id", invitation.id);
    return { success: false, error: "INVITATION_EXPIRED: Este convite expirou." };
  }

  // Provisiona membership ativa
  const { error: memberErr } = await (client.from("tenant_memberships") as any).upsert(
    {
      user_id: userId,
      tenant_id: invitation.tenant_id,
      role: invitation.role,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,tenant_id" }
  );

  if (memberErr) {
    return { success: false, error: "Falha ao registrar membro na organização." };
  }

  // Marca convite como aceito
  await (client.from("tenant_invitations") as any)
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString()
    })
    .eq("id", invitation.id);

  return { success: true, tenantId: invitation.tenant_id };
}

/**
 * 📥 Importação em lote idempotente de colaboradores via Roster CSV
 */
export async function confirmRosterImport(
  client: SupabaseClient<Database>,
  tenantId: string,
  importedBy: string,
  rows: RosterRow[]
): Promise<{
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}> {
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const res = await createTenantInvitation(
        client,
        tenantId,
        importedBy,
        row.email,
        row.role,
        row.department
      );

      if (res.success) {
        imported += 1;
      } else {
        failed += 1;
        errors.push(`${row.email}: ${res.error}`);
      }
    } catch (err: any) {
      failed += 1;
      errors.push(`${row.email}: ${err.message}`);
    }
  }

  // Atualiza progresso do onboarding para users_configured
  if (imported > 0) {
    await (client.from("tenant_onboarding") as any)
      .update({
        step: "users_configured",
        updated_at: new Date().toISOString()
      })
      .eq("tenant_id", tenantId);
  }

  return {
    total: rows.length,
    imported,
    failed,
    errors
  };
}
