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

export interface PlanDefinition {
  planKey: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  quotas: PlanQuotas;
  entitlements: PlanEntitlements;
}

/**
 * 📦 Catálogo Central de Planos Comerciais Versionados
 */
export const PLAN_CATALOG: Record<SubscriptionTier, PlanDefinition> = {
  starter: {
    planKey: "starter",
    name: "Aegis Starter",
    description: "Conformidade SST essencial para PMEs (Lei 102/2009 e NR-1/PGR).",
    tier: "starter",
    quotas: {
      seats: 25,
      campaigns: 3,
      reports: 10,
      ai_requests_monthly: 100,
      storage_mb: 500
    },
    entitlements: {
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
    }
  },
  professional: {
    planKey: "professional",
    name: "Aegis Professional",
    description: "Plano corporativo completo com IA Governance e Suporte Cognitivo Neurodivergente.",
    tier: "professional",
    quotas: {
      seats: 100,
      campaigns: 20,
      reports: 50,
      ai_requests_monthly: 1000,
      storage_mb: 5000
    },
    entitlements: {
      campaign_management: true,
      regulatory_reports: true,
      ai_governance: true,
      interventions: true,
      evidence: true,
      cognitive_support: true,
      advanced_analytics: true,
      csv_import: true,
      multi_tenant: true,
      api_access: false
    }
  },
  enterprise: {
    planKey: "enterprise",
    name: "Aegis Enterprise",
    description: "Operação em larga escala com acesso direto à API de auditoria e SLAs customizados.",
    tier: "enterprise",
    quotas: {
      seats: 1000,
      campaigns: 100,
      reports: 500,
      ai_requests_monthly: 10000,
      storage_mb: 50000
    },
    entitlements: {
      campaign_management: true,
      regulatory_reports: true,
      ai_governance: true,
      interventions: true,
      evidence: true,
      cognitive_support: true,
      advanced_analytics: true,
      csv_import: true,
      multi_tenant: true,
      api_access: true
    }
  }
};

/**
 * 🔄 Transições Permitidas na Máquina de Estados de Subscrição
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  trial: ["active", "cancelled", "suspended"],
  active: ["past_due", "cancelled", "suspended"],
  past_due: ["active", "suspended", "cancelled"],
  suspended: ["active", "cancelled"],
  cancelled: [] // Estado terminal
};

export function isValidSubscriptionTransition(
  currentStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus
): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * ⚠️ Avaliador de Limites de Uso (Normal, Warning 80%, Critical 90%, Exceeded 100%)
 */
export function getUsageWarningStatus(used: number, limit: number): {
  status: UsageThreshold;
  percentage: number;
} {
  if (limit <= 0) {
    return { status: "EXCEEDED", percentage: 100 };
  }

  const percentage = Math.round((used / limit) * 100);

  if (percentage >= 100) {
    return { status: "EXCEEDED", percentage };
  }
  if (percentage >= 90) {
    return { status: "CRITICAL", percentage };
  }
  if (percentage >= 80) {
    return { status: "WARNING", percentage };
  }
  return { status: "NORMAL", percentage };
}
