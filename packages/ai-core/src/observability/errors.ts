export type ErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "TENANT_ACCESS_DENIED"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "AI_GOVERNANCE_ERROR"
  | "PRIVACY_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface AppErrorResponse {
  errorCode: ErrorCode;
  message: string;
  correlationId: string;
  timestamp: string;
}

export class AppError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;
  public readonly correlationId?: string | undefined;

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: number = 400,
    correlationId?: string | undefined
  ) {
    super(message);
    this.name = "AppError";
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    if (correlationId !== undefined) {
      this.correlationId = correlationId;
    }
  }

  public toResponse(correlationId?: string): AppErrorResponse {
    return {
      errorCode: this.errorCode,
      message: this.message,
      correlationId: correlationId || this.correlationId || "unknown",
      timestamp: new Date().toISOString()
    };
  }
}
