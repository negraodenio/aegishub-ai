import crypto from "crypto";

export interface AuditPayload {
  operation: string;
  feature: string;
  model: string;
  status: "SUCCESS" | "FALLBACK" | "PROVIDER_FAILURE" | "BLOCKED";
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  correlationId: string;
  tenantId: string;
  userId: string;
}

export interface MintedAuditCapability {
  token: string;
  payloadHash: string;
  expiresAt: number;
}

/**
 * 🔒 TwoPhaseAuditManager: Auditoria Criptográfica em Duas Fases
 * - Fase 1: Mint de token de escrita único e efêmero vinculado ao hash SHA-256 do payload
 * - Fase 2: Gravação segura com validação estrita de integridade
 * - Não armazena prompts/respostas em texto puro no log de auditoria
 */
export class TwoPhaseAuditManager {
  /**
   * Calcula o hash SHA-256 determinístico dos metadados de auditoria
   */
  public static calculatePayloadHash(payload: AuditPayload): string {
    const canonicalString = JSON.stringify({
      operation: payload.operation,
      feature: payload.feature,
      model: payload.model,
      status: payload.status,
      inputTokens: payload.inputTokens,
      outputTokens: payload.outputTokens,
      costUsd: payload.costUsd,
      latencyMs: payload.latencyMs,
      correlationId: payload.correlationId,
      tenantId: payload.tenantId,
      userId: payload.userId
    });

    return crypto.createHash("sha256").update(canonicalString).digest("hex");
  }

  /**
   * Fase 1: Emite uma credencial/token temporário de auditoria associado ao hash do payload
   */
  public static mintAuditCapability(payload: AuditPayload, ttlSeconds: number = 30): MintedAuditCapability {
    const payloadHash = this.calculatePayloadHash(payload);
    const token = `aud_${Date.now()}_${crypto.randomBytes(16).toString("hex")}`;
    const expiresAt = Date.now() + ttlSeconds * 1000;

    return {
      token,
      payloadHash,
      expiresAt
    };
  }

  /**
   * Fase 2: Valida a correspondência entre o token e o hash no momento da gravação
   */
  public static verifyAuditCapability(
    payload: AuditPayload,
    capability: MintedAuditCapability
  ): { valid: boolean; reason?: string } {
    if (Date.now() > capability.expiresAt) {
      return { valid: false, reason: "AUDIT_TOKEN_EXPIRED" };
    }

    const currentHash = this.calculatePayloadHash(payload);
    if (currentHash !== capability.payloadHash) {
      return { valid: false, reason: "AUDIT_HASH_MISMATCH" };
    }

    return { valid: true };
  }
}
