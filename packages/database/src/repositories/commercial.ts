import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type SubscriptionTier = "starter" | "professional" | "enterprise";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

export type FeatureKey =
  | "campaign_management"
  | "regulatory_reports"
  | "ai_governance"
  | "interventions"
  | "evidence"
  | "cognitive_support"
  | "advanced_analytics"
  | "csv_import"
  | "multi_tenant"
  | "api_access";

export type QuotaMetric =
  | "seats"
  | "campaigns"
  | "reports"
  | "ai_requests_monthly"
  | "storage_mb";

export type UsageThreshold = "NORMAL" | "WARNING" | "CRITICAL" | "EXCEEDED";

export interface PlanQuotas {
  seats: number;
  campaigns: number;
  reports: number;
  ai_requests_monthly: number;
  storage_mb: number;
}

export type PlanEntitlements = Record<FeatureKey, boolean>;

export interface TenantSubscriptionRecord {
  id: string;
  tenant_id: string;
  plan_key: string;
  status: SubscriptionStatus;
  contracted_seats: number;
  starts_at: string;
  ends_at?: string | null;
  auto_renew: boolean;
  custom_quotas?: Partial<PlanQuotas> | null;
  custom_entitlements?: Partial<PlanEntitlements> | null;
  created_at: string;
  updated_at: string;
}

export interface CommercialSummary {
  tenantId: string;
  planKey: string;
  planName: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  contractedSeats: number;
  usedSeats: number;
  availableSeats: number;
  quotas: {
    seats: { used: number; limit: number; percentage: number; threshold: UsageThreshold };
    campaigns: { used: number; limit: number; percentage: number; threshold: UsageThreshold };
    reports: { used: number; limit: number; percentage: number; threshold: UsageThreshold };
    aiRequestsMonthly: { used: number; limit: number; percentage: number; threshold: UsageThreshold };
    storageMb: { used: number; limit: number; percentage: number; threshold: UsageThreshold };
  };
  entitlements: PlanEntitlements;
  hasSufficientData: boolean;
}

const DEFAULT_STARTER_QUOTAS: PlanQuotas = {
  seats: 25,
  campaigns: 3,
  reports: 10,
  ai_requests_monthly: 100,
  storage_mb: 500
};

const DEFAULT_STARTER_ENTITLEMENTS: PlanEntitlements = {
  campaign_management: true,
  regulatory_reports: true,
  ai_governance: false,
  interventions: true,
  evidence: true,
  cognitive_support: false,
  advanced_analytics: false,
  csv_import: true,
  multi_tenant: false,
  api_access: false
};

/**
 * 📦 Busca a subscrição ativa ou trial do tenant com fallback seguro
 */
export async function getTenantSubscription(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<TenantSubscriptionRecord | null> {
  const { data, error } = await (client.from("tenant_subscriptions") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as TenantSubscriptionRecord;
}

/**
 * 📊 Valida autorização de feature entitlement server-side
 */
export async function checkFeatureEntitlement(
  client: SupabaseClient<Database>,
  tenantId: string,
  featureKey: FeatureKey
): Promise<{ allowed: boolean; reason?: string | undefined }> {
  const sub = await getTenantSubscription(client, tenantId);

  // Se o tenant está suspenso ou cancelado, bloqueia acesso a features pagas
  if (sub && (sub.status === "suspended" || sub.status === "cancelled")) {
    return {
      allowed: false,
      reason: `SUBSCRIPTION_${sub.status.toUpperCase()}: A subscrição da sua organização está ${sub.status}.`
    };
  }

  // Verifica custom override
  if (sub?.custom_entitlements && sub.custom_entitlements[featureKey] !== undefined) {
    const customAllowed = sub.custom_entitlements[featureKey]!;
    return {
      allowed: customAllowed,
      reason: customAllowed ? undefined : `FEATURE_NOT_ENTITLED: Módulo '${featureKey}' não incluído no seu plano.`
    };
  }

  // Verifica plano
  const planKey = sub?.plan_key || "starter";
  const { data: plan } = await (client.from("subscription_plans") as any)
    .select("entitlements")
    .eq("plan_key", planKey)
    .maybeSingle();

  const entitlements: PlanEntitlements = plan?.entitlements || DEFAULT_STARTER_ENTITLEMENTS;
  const isAllowed = Boolean(entitlements[featureKey]);

  return {
    allowed: isAllowed,
    reason: isAllowed ? undefined : `FEATURE_NOT_ENTITLED: O recurso '${featureKey}' requer upgrade de plano.`
  };
}


/**
 * 🛡️ Helper de Gating Server-Side para Rotas e Ações
 */
export async function requireFeatureAccess(
  client: SupabaseClient<Database>,
  tenantId: string,
  featureKey: FeatureKey
): Promise<void> {
  const result = await checkFeatureEntitlement(client, tenantId, featureKey);
  if (!result.allowed) {
    const error = new Error(result.reason || "FEATURE_NOT_ENTITLED");
    (error as any).code = "FEATURE_NOT_ENTITLED";
    (error as any).status = 403;
    throw error;
  }
}

/**
 * 📈 Retorna o contador de uso de uma métrica no período
 */
export async function getTenantUsage(
  client: SupabaseClient<Database>,
  tenantId: string,
  metricKey: string,
  periodKey: string = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
): Promise<number> {
  const { data } = await (client.from("tenant_usage_counters") as any)
    .select("current_value")
    .eq("tenant_id", tenantId)
    .eq("metric_key", metricKey)
    .eq("period_key", periodKey)
    .maybeSingle();

  return data ? Number(data.current_value) : 0;
}

/**
 * ⚡ Incrementa consumo de quota de forma atômica
 */
export async function consumeQuota(
  client: SupabaseClient<Database>,
  tenantId: string,
  metricKey: string,
  amount: number = 1,
  periodKey: string = new Date().toISOString().slice(0, 7)
): Promise<{ success: boolean; currentValue: number; error?: string }> {
  try {
    const current = await getTenantUsage(client, tenantId, metricKey, periodKey);
    const newValue = current + amount;

    await (client.from("tenant_usage_counters") as any).upsert(
      {
        tenant_id: tenantId,
        metric_key: metricKey,
        period_key: periodKey,
        current_value: newValue,
        updated_at: new Date().toISOString()
      },
      { onConflict: "tenant_id,metric_key,period_key" }
    );

    return { success: true, currentValue: newValue };
  } catch (err: any) {
    return { success: false, currentValue: 0, error: err.message };
  }
}

/**
 * 🔒 Verifica cota server-side antes de permitir operação
 */
export async function checkQuota(
  client: SupabaseClient<Database>,
  tenantId: string,
  metricKey: QuotaMetric,
  requestedAmount: number = 1
): Promise<{
  allowed: boolean;
  currentUsed: number;
  limit: number;
  reason?: string | undefined;
}> {

  const sub = await getTenantSubscription(client, tenantId);
  const planKey = sub?.plan_key || "starter";

  const { data: plan } = await (client.from("subscription_plans") as any)
    .select("quotas")
    .eq("plan_key", planKey)
    .maybeSingle();

  const baseQuotas: PlanQuotas = plan?.quotas || DEFAULT_STARTER_QUOTAS;
  const limit = sub?.custom_quotas?.[metricKey] ?? (metricKey === "seats" ? (sub?.contracted_seats || baseQuotas.seats) : baseQuotas[metricKey]);

  let currentUsed = 0;
  if (metricKey === "seats") {
    // Contagem real de membros ativos
    const { count } = await (client.from("tenant_memberships") as any)
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active");
    currentUsed = count || 0;
  } else {
    currentUsed = await getTenantUsage(client, tenantId, metricKey);
  }

  if (currentUsed + requestedAmount > limit) {
    return {
      allowed: false,
      currentUsed,
      limit,
      reason: `QUOTA_EXCEEDED: Limite de '${metricKey}' (${limit}) excedido. Atual: ${currentUsed}.`
    };
  }

  return {
    allowed: true,
    currentUsed,
    limit
  };
}

/**
 * 📑 Gera o resumo comercial completo do tenant (Zero-mock, dados auditáveis)
 */
export async function getTenantCommercialSummary(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<CommercialSummary> {
  const sub = await getTenantSubscription(client, tenantId);
  const planKey = sub?.plan_key || "starter";

  const { data: plan } = await (client.from("subscription_plans") as any)
    .select("*")
    .eq("plan_key", planKey)
    .maybeSingle();

  const baseQuotas: PlanQuotas = plan?.quotas || DEFAULT_STARTER_QUOTAS;
  const contractedSeats = sub?.contracted_seats || baseQuotas.seats;

  // 1. Seats reais
  const { count: memberCount } = await (client.from("tenant_memberships") as any)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "active");
  const usedSeats = memberCount || 0;

  // 2. Campanhas reais
  const { count: campaignCount } = await (client.from("campaigns") as any)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  const usedCampaigns = campaignCount || 0;

  // 3. Relatórios reais
  const { count: reportCount } = await (client.from("compliance_reports") as any)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  const usedReports = reportCount || 0;

  // 4. IA Requests do mês
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const usedAi = await getTenantUsage(client, tenantId, "ai_requests_monthly", currentPeriod);

  const calcThreshold = (used: number, limit: number): { percentage: number; threshold: UsageThreshold } => {
    if (limit <= 0) return { percentage: 100, threshold: "EXCEEDED" };
    const pct = Math.round((used / limit) * 100);
    if (pct >= 100) return { percentage: pct, threshold: "EXCEEDED" };
    if (pct >= 90) return { percentage: pct, threshold: "CRITICAL" };
    if (pct >= 80) return { percentage: pct, threshold: "WARNING" };
    return { percentage: pct, threshold: "NORMAL" };
  };

  const seatsT = calcThreshold(usedSeats, contractedSeats);
  const campaignsT = calcThreshold(usedCampaigns, baseQuotas.campaigns);
  const reportsT = calcThreshold(usedReports, baseQuotas.reports);
  const aiT = calcThreshold(usedAi, baseQuotas.ai_requests_monthly);
  const storageT = calcThreshold(0, baseQuotas.storage_mb);

  const hasSufficientData = usedSeats > 0 || usedCampaigns > 0 || usedReports > 0 || usedAi > 0;

  const entitlements: PlanEntitlements = {
    ...(plan?.entitlements || DEFAULT_STARTER_ENTITLEMENTS),
    ...(sub?.custom_entitlements || {})
  };

  return {
    tenantId,
    planKey,
    planName: plan?.name || "Aegis Starter",
    tier: (plan?.tier || "starter") as SubscriptionTier,
    status: sub?.status || "trial",
    contractedSeats,
    usedSeats,
    availableSeats: Math.max(0, contractedSeats - usedSeats),
    quotas: {
      seats: { used: usedSeats, limit: contractedSeats, percentage: seatsT.percentage, threshold: seatsT.threshold },
      campaigns: { used: usedCampaigns, limit: baseQuotas.campaigns, percentage: campaignsT.percentage, threshold: campaignsT.threshold },
      reports: { used: usedReports, limit: baseQuotas.reports, percentage: reportsT.percentage, threshold: reportsT.threshold },
      aiRequestsMonthly: { used: usedAi, limit: baseQuotas.ai_requests_monthly, percentage: aiT.percentage, threshold: aiT.threshold },
      storageMb: { used: 0, limit: baseQuotas.storage_mb, percentage: storageT.percentage, threshold: storageT.threshold }
    },
    entitlements,
    hasSufficientData
  };
}

/**
 * 📝 Registra evento de auditoria comercial imutável
 */
export async function logCommercialAuditEvent(
  client: SupabaseClient<Database>,
  data: {
    tenantId: string;
    actorId: string;
    eventType: string;
    oldValue?: any;
    newValue?: any;
    correlationId?: string;
  }
): Promise<void> {
  await (client.from("commercial_audit_logs") as any).insert({
    tenant_id: data.tenantId,
    actor_id: data.actorId,
    event_type: data.eventType,
    old_value: data.oldValue || null,
    new_value: data.newValue || null,
    correlation_id: data.correlationId || null,
    created_at: new Date().toISOString()
  });
}
