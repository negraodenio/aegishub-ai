import { ErrorCode } from "./errors";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  correlationId: string;
  requestId?: string | undefined;
  operation?: string | undefined;
  route?: string | undefined;
  method?: string | undefined;
  status?: number | undefined;
  durationMs?: number | undefined;
  tenantId?: string | undefined;
  userId?: string | undefined;
  errorCode?: ErrorCode | string | undefined;
  message?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

// Chaves e campos proibidos em logs para garantir privacidade absoluta (RGPD/LGPD)
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "access_token",
  "refresh_token",
  "apikey",
  "api_key",
  "secret",
  "prompt",
  "prompt_text",
  "prompttext",
  "response_text",
  "clinical_note",
  "diagnosis",
  "medical_record",
  "nif",
  "cpf",
  "cnpj",
  "credit_card",
  "audio_data",
  "audiodata"
]);

/**
 * 🛡️ Sanitizador de objetos para logs estruturados
 * Remove recursivamente campos sensíveis e PII
 */
export function sanitizeLogMetadata(data?: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!data || typeof data !== "object") return undefined;

  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[key] = "[REDACTED_CONFIDENTIAL]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      clean[key] = sanitizeLogMetadata(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export class StructuredLogger {
  private service: string;
  private environment: string;

  constructor(service: string = "aegishub-api", environment: string = process.env.NODE_ENV || "production") {
    this.service = service;
    this.environment = environment;
  }

  public log(entry: Omit<LogEntry, "timestamp" | "service" | "environment">): LogEntry {
    const formatted: LogEntry = {
      timestamp: new Date().toISOString(),
      service: this.service,
      environment: this.environment,
      ...entry,
      metadata: sanitizeLogMetadata(entry.metadata)
    };

    // Em produção, logs estruturados são emitidos como JSON em stdout
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify(formatted));
    }

    return formatted;
  }

  public info(message: string, context?: Partial<LogEntry>): LogEntry {
    return this.log({
      level: "INFO",
      correlationId: context?.correlationId || "unknown",
      message,
      ...context
    });
  }

  public warn(message: string, context?: Partial<LogEntry>): LogEntry {
    return this.log({
      level: "WARN",
      correlationId: context?.correlationId || "unknown",
      message,
      ...context
    });
  }

  public error(message: string, context?: Partial<LogEntry>): LogEntry {
    return this.log({
      level: "ERROR",
      correlationId: context?.correlationId || "unknown",
      message,
      ...context
    });
  }
}

export const logger = new StructuredLogger("aegishub-core");
