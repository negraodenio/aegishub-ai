import crypto from "crypto";
import { containsSensitiveData } from "./sensitive-data";
import { LlmGuardUsageTracker } from "./llm-guard";

export type LLMGuardOperation =
  | "cognitive_chat"
  | "cognitive_breakdown"
  | "cognitive_tip"
  | "cognitive_stuck";

export interface LLMGuardAcquireParams {
  operation: LLMGuardOperation;
  userId: string;
  tenantId: string;
  inputContent: string;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
}

export interface LLMGuardAcquireVerdict {
  allowed: boolean;
  code: "ALLOWED" | "SENSITIVE_DATA_DETECTED" | "QUOTA_EXCEEDED" | "INPUT_TOO_LONG" | "SERVICE_UNAVAILABLE";
  reason?: string | undefined;
  leaseId: string;
  estimatedCostUsd: number;
}

export interface LLMGuardReconcileParams {
  leaseId: string;
  userId: string;
  tenantId: string;
  actualInputTokens: number;
  actualOutputTokens: number;
  providerSucceeded: boolean;
}

export const MAX_COGNITIVE_INPUT_CHARS = 4000;
export const DEFAULT_INPUT_TOKENS_ESTIMATE = 500;
export const DEFAULT_OUTPUT_TOKENS_ESTIMATE = 800;

/**
 * 🛡️ LLMGuardSession: Sistema de Gestão de Concorrência, Leases & Reconciliação
 * - Previne sobrecarga e custos excessivos
 * - Fail-closed: se o provider falha, preserva a reserva de segurança
 * - Valida PII e tamanho do input antes da concessão do lease
 */
export class LLMGuardSession {
  private tracker: LlmGuardUsageTracker;

  constructor(tracker?: LlmGuardUsageTracker) {
    this.tracker = tracker || new LlmGuardUsageTracker();
  }

  /**
   * Adquire um lease para execução de chamada LLM
   */
  public acquire(params: LLMGuardAcquireParams, currentUsage: { dailyTokensUsed: number; dailyCostUsd: number }): LLMGuardAcquireVerdict {
    const leaseId = `lease_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

    // 1. Validação de tamanho máximo
    if (!params.inputContent || params.inputContent.length > MAX_COGNITIVE_INPUT_CHARS) {
      return {
        allowed: false,
        code: "INPUT_TOO_LONG",
        reason: `Input excede o limite máximo permitido de ${MAX_COGNITIVE_INPUT_CHARS} caracteres.`,
        leaseId,
        estimatedCostUsd: 0
      };
    }

    // 2. Prevenção de vazamento de dados sensíveis (PII / Secrets)
    if (containsSensitiveData(params.inputContent)) {
      return {
        allowed: false,
        code: "SENSITIVE_DATA_DETECTED",
        reason: "Dados sensíveis (e-mails, tokens ou credenciais) foram detectados no conteúdo.",
        leaseId,
        estimatedCostUsd: 0
      };
    }

    // 3. Verificação de cota diária
    const quotaResult = this.tracker.checkQuota(currentUsage);
    if (!quotaResult.allowed) {
      return {
        allowed: false,
        code: "QUOTA_EXCEEDED",
        reason: quotaResult.reason,
        leaseId,
        estimatedCostUsd: 0
      };
    }

    const estTokens = (params.estimatedInputTokens ?? DEFAULT_INPUT_TOKENS_ESTIMATE) + (params.estimatedOutputTokens ?? DEFAULT_OUTPUT_TOKENS_ESTIMATE);
    const estimatedCostUsd = this.tracker.calculateCost(estTokens);

    return {
      allowed: true,
      code: "ALLOWED",
      leaseId,
      estimatedCostUsd
    };
  }

  /**
   * Reconcilia o consumo real após a chamada do provider
   * - Se o provider falhou, preserva um custo mínimo de proteção (fail-closed)
   */
  public reconcile(params: LLMGuardReconcileParams): { actualTokens: number; actualCostUsd: number } {
    if (!params.providerSucceeded) {
      // Fail-closed: reserva conservadora de 100 tokens para prevenir abuso/loops
      const conservativeTokens = 100;
      const conservativeCost = this.tracker.calculateCost(conservativeTokens);
      return {
        actualTokens: conservativeTokens,
        actualCostUsd: conservativeCost
      };
    }

    const actualTokens = Math.max(0, params.actualInputTokens + params.actualOutputTokens);
    const actualCostUsd = this.tracker.calculateCost(actualTokens);

    return {
      actualTokens,
      actualCostUsd
    };
  }
}
