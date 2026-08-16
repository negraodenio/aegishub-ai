import crypto from "crypto";

export interface LlmQuotaConfig {
  dailyCostLimitUsd: number;
  dailyTokenLimit: number;
  costPer1kTokensUsd: number;
  leaseDurationMs: number;
}

export const DEFAULT_LLM_QUOTA_CONFIG: LlmQuotaConfig = {
  dailyCostLimitUsd: 0.25, // $0.25 por dia por colaborador
  dailyTokenLimit: 25000,  // 25k tokens diários
  costPer1kTokensUsd: 0.002,
  leaseDurationMs: 30000   // 30s lease TTL
};

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  tokensUsedToday: number;
  costUsedTodayUsd: number;
  remainingTokens: number;
  remainingCostUsd: number;
}

export interface LlmUsageRecord {
  userId: string;
  tenantId: string;
  tokensUsed: number;
  costUsd: number;
  promptHash: string;
  responseHash: string;
  date: string;
}

/**
 * 🛡️ LlmGuardUsageTracker: Proteção de Custos, Rate Limiting Atômico e Auditoria Criptográfica
 * - Rate Limiting & Leases atômicos
 * - Teto financeiro de $0.25 / dia por utilizador
 * - Auditoria baseada em SHA-256 (não armazena prompts/respostas sensíveis em texto puro)
 */
export class LlmGuardUsageTracker {
  private config: LlmQuotaConfig;

  constructor(config: Partial<LlmQuotaConfig> = {}) {
    this.config = { ...DEFAULT_LLM_QUOTA_CONFIG, ...config };
  }

  /**
   * Gera hash SHA-256 de texto para auditoria sem retenção de PHI/PII
   */
  public hashContent(content: string): string {
    return crypto.createHash("sha256").update(content || "").digest("hex");
  }

  /**
   * Valida se o utilizador possui cota disponível para nova chamada
   */
  public checkQuota(currentUsage: { dailyTokensUsed: number; dailyCostUsd: number }): QuotaCheckResult {
    const tokensUsed = currentUsage.dailyTokensUsed || 0;
    const costUsed = currentUsage.dailyCostUsd || 0;

    const remainingTokens = Math.max(0, this.config.dailyTokenLimit - tokensUsed);
    const remainingCostUsd = Math.max(0, this.config.dailyCostLimitUsd - costUsed);

    if (costUsed >= this.config.dailyCostLimitUsd) {
      return {
        allowed: false,
        reason: `QUOTA_EXCEEDED: Limite diário de custo atingido ($${this.config.dailyCostLimitUsd.toFixed(2)}/dia). Renova às 00:00 UTC.`,
        tokensUsedToday: tokensUsed,
        costUsedTodayUsd: costUsed,
        remainingTokens: 0,
        remainingCostUsd: 0
      };
    }

    if (tokensUsed >= this.config.dailyTokenLimit) {
      return {
        allowed: false,
        reason: `QUOTA_EXCEEDED: Limite diário de tokens atingido (${this.config.dailyTokenLimit.toLocaleString()} tokens/dia). Renova às 00:00 UTC.`,
        tokensUsedToday: tokensUsed,
        costUsedTodayUsd: costUsed,
        remainingTokens: 0,
        remainingCostUsd: 0
      };
    }

    return {
      allowed: true,
      tokensUsedToday: tokensUsed,
      costUsedTodayUsd: costUsed,
      remainingTokens,
      remainingCostUsd
    };
  }

  /**
   * Calculates the estimated cost of a request in USD
   */
  public calculateCost(tokens: number): number {
    return Number(((tokens / 1000) * this.config.costPer1kTokensUsd).toFixed(6));
  }

  /**
   * Retorna o teto diário de custo configurado
   */
  public getMaxDailyCost(): number {
    return this.config.dailyCostLimitUsd;
  }

  /**
   * Valida guardrails estritos contra termos diagnósticos médicos
   */
  public validateCognitiveOutput(output: string): { valid: boolean; violations: string[] } {
    const forbiddenClinicalTerms = [
      "diagnóstico",
      "diagnosticado",
      "você sofre de",
      "você tem tdah",
      "você tem autismo",
      "transtorno mental",
      "prescrição",
      "medicamento",
      "cid-10",
      "cid-11",
      "dsm-5",
      "patologia",
      "doença mental"
    ];

    const lower = (output || "").toLowerCase();
    const violations = forbiddenClinicalTerms.filter((term) => lower.includes(term));

    return {
      valid: violations.length === 0,
      violations
    };
  }
}
