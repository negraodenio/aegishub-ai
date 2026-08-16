import crypto from "crypto";

export const CORRELATION_HEADER = "X-Correlation-ID";

/**
 * 🆔 Validador e gerador de Correlation ID global
 * - Aceita UUID ou string alfanumérica segura com hífens/underscores até 64 caracteres
 * - Rejeita e regenera strings malformadas, vazias ou com caracteres perigosos
 */
export function resolveCorrelationId(clientHeader?: string | null): string {
  if (!clientHeader || typeof clientHeader !== "string") {
    return generateCorrelationId();
  }

  const trimmed = clientHeader.trim();

  // Validação estrita: 8 a 64 chars, apenas [a-zA-Z0-9_-]
  const isValidFormat = /^[a-zA-Z0-9_-]{8,64}$/.test(trimmed);

  if (!isValidFormat) {
    return generateCorrelationId();
  }

  return trimmed;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${crypto.randomUUID().substring(0, 13)}`;
}
