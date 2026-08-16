import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../generated.types";


export interface TenantCognitiveSettings {
  id?: string;
  tenant_id: string;
  is_enabled: boolean;
  max_seats: number;
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveUserProfile {
  id?: string;
  user_id: string;
  tenant_id: string;
  consent_given_at?: string | null;
  consent_version?: string | null;
  is_consent_revoked: boolean;
  preferences: {
    focusBlockMinutes?: number;
    decompressionBreaks?: boolean;
    soundEnabled?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveTask {
  id?: string;
  user_id: string;
  tenant_id: string;
  title: string;
  steps: {
    id: string;
    text: string;
    completed: boolean;
    estimatedMinutes?: number;
  }[];
  status: "pending" | "in_progress" | "completed" | "archived";
  energy_level: "low" | "medium" | "high";
  estimated_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveBenefitAggregates {
  isEnabled: boolean;
  maxSeats: number;
  totalActivatedSeats: number;
  hasSufficientData: boolean;
  adoptionRatePercent: number | null;
  privacyNotice: string;
}

/**
 * Obtém as configurações de benefício cognitivo de um tenant
 */
export async function getTenantCognitiveSettings(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<TenantCognitiveSettings | null> {
  const { data, error } = await (client.from("tenant_cognitive_settings") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !data) {
    return {
      tenant_id: tenantId,
      is_enabled: false,
      max_seats: 50
    };
  }

  return data as TenantCognitiveSettings;
}

/**
 * Atualiza ou ativa/desativa as configurações do benefício cognitivo
 */
export async function upsertTenantCognitiveSettings(
  client: SupabaseClient<Database>,
  settings: { tenant_id: string; is_enabled: boolean; max_seats?: number }
): Promise<TenantCognitiveSettings | null> {
  const { data, error } = await (client.from("tenant_cognitive_settings") as any)
    .upsert(
      {
        tenant_id: settings.tenant_id,
        is_enabled: settings.is_enabled,
        max_seats: settings.max_seats ?? 50,
        updated_at: new Date().toISOString()
      },
      { onConflict: "tenant_id" }
    )
    .select()
    .single();

  if (error || !data) return null;
  return data as TenantCognitiveSettings;
}

/**
 * Obtém o perfil pessoal e consentimento do colaborador (auth.uid() = user_id)
 * 🛡️ RH e Gestores NUNCA têm acesso a este método
 */
export async function getCognitiveUserProfile(
  client: SupabaseClient<Database>,
  userId: string
): Promise<CognitiveUserProfile | null> {
  const { data, error } = await (client.from("cognitive_user_profiles") as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as CognitiveUserProfile;
}

/**
 * Grava ou atualiza consentimento informado e preferências
 */
export async function upsertCognitiveUserProfile(
  client: SupabaseClient<Database>,
  profile: Partial<CognitiveUserProfile> & { user_id: string; tenant_id: string }
): Promise<CognitiveUserProfile | null> {
  const { data, error } = await (client.from("cognitive_user_profiles") as any)
    .upsert(
      {
        user_id: profile.user_id,
        tenant_id: profile.tenant_id,
        consent_given_at: profile.consent_given_at || new Date().toISOString(),
        consent_version: profile.consent_version || "1.0-RGPD-LGPD",
        is_consent_revoked: profile.is_consent_revoked ?? false,
        preferences: profile.preferences || { focusBlockMinutes: 25, decompressionBreaks: true, soundEnabled: false },
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error || !data) return null;
  return data as CognitiveUserProfile;
}

/**
 * Revoga consentimento do colaborador
 */
export async function revokeCognitiveConsent(
  client: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { error } = await (client.from("cognitive_user_profiles") as any)
    .update({
      is_consent_revoked: true,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  return !error;
}

/**
 * Obtém tarefas pessoais do colaborador (auth.uid() = user_id)
 */
export async function getCognitiveTasks(
  client: SupabaseClient<Database>,
  userId: string
): Promise<CognitiveTask[]> {
  const { data, error } = await (client.from("cognitive_tasks") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CognitiveTask[];
}

/**
 * Cria nova tarefa ou plano de foco pessoal
 */
export async function createCognitiveTask(
  client: SupabaseClient<Database>,
  task: Omit<CognitiveTask, "id" | "created_at" | "updated_at">
): Promise<CognitiveTask | null> {
  const { data, error } = await (client.from("cognitive_tasks") as any)
    .insert({
      user_id: task.user_id,
      tenant_id: task.tenant_id,
      title: task.title,
      steps: task.steps || [],
      status: task.status || "pending",
      energy_level: task.energy_level || "medium",
      estimated_minutes: task.estimated_minutes || 25,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as CognitiveTask;
}

/**
 * Atualiza status de tarefa pessoal
 */
export async function updateCognitiveTask(
  client: SupabaseClient<Database>,
  taskId: string,
  userId: string,
  updates: Partial<CognitiveTask>
): Promise<CognitiveTask | null> {
  const { data, error } = await (client.from("cognitive_tasks") as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return null;
  return data as CognitiveTask;
}

/**
 * Remove tarefa pessoal do colaborador
 */
export async function deleteCognitiveTask(
  client: SupabaseClient<Database>,
  taskId: string,
  userId: string
): Promise<boolean> {
  const { error } = await (client.from("cognitive_tasks") as any)
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  return !error;
}

/**
 * Obtém consumo diário de tokens e custo de LLM
 */
export async function getLlmUsageToday(
  client: SupabaseClient<Database>,
  userId: string
): Promise<{ dailyTokensUsed: number; dailyCostUsd: number }> {
  const todayStr = new Date().toISOString().split("T")[0];
  const { data, error } = await (client.from("llm_usage_leases") as any)
    .select("daily_tokens_used, daily_cost_usd")
    .eq("user_id", userId)
    .eq("date", todayStr)
    .maybeSingle();

  if (error || !data) {
    return { dailyTokensUsed: 0, dailyCostUsd: 0 };
  }

  return {
    dailyTokensUsed: data.daily_tokens_used || 0,
    dailyCostUsd: Number(data.daily_cost_usd || 0)
  };
}

/**
 * Registra consumo de LLM via RPC segura
 */
export async function recordLlmUsage(
  client: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  tokens: number,
  costUsd: number
): Promise<{ success: boolean; dailyTokensUsed: number; dailyCostUsd: number }> {
  const { data, error } = await (client.rpc as any)("record_llm_usage", {
    p_user_id: userId,
    p_tenant_id: tenantId,
    p_tokens: tokens,
    p_cost: costUsd
  });

  if (error || !data) {
    return { success: false, dailyTokensUsed: tokens, dailyCostUsd: costUsd };
  }

  return {
    success: true,
    dailyTokensUsed: data.daily_tokens_used,
    dailyCostUsd: Number(data.daily_cost_usd)
  };
}

/**
 * 🛡️ Agregações B2B para o Painel de RH / Admin
 * - Apenas total de assentos ativados
 * - Métricas agregadas de adesão SOMENTE se N >= 20
 * - ZERO NOMES, ZERO TAREFAS, ZERO DADOS INDIVIDUAIS
 */
export async function getCognitiveBenefitAggregates(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<CognitiveBenefitAggregates> {
  const settings = await getTenantCognitiveSettings(client, tenantId);
  const isEnabled = settings?.is_enabled ?? false;
  const maxSeats = settings?.max_seats ?? 50;

  // Contagem de perfis ativos no tenant
  const { count, error } = await (client.from("cognitive_user_profiles") as any)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_consent_revoked", false);

  const totalActivatedSeats = count || 0;
  const hasSufficientData = totalActivatedSeats >= 20;

  let adoptionRatePercent: number | null = null;
  if (hasSufficientData && maxSeats > 0) {
    adoptionRatePercent = Math.min(100, Math.round((totalActivatedSeats / maxSeats) * 100));
  }

  return {
    isEnabled,
    maxSeats,
    totalActivatedSeats,
    hasSufficientData,
    adoptionRatePercent,
    privacyNotice:
      "Em estrita conformidade com o RGPD (Art. 9º) e LGPD (Art. 11º), dados de utilização e conteúdos individuais do programa de Suporte Cognitivo são confidenciais e inacessíveis ao empregador."
  };
}
