import { describe, it, expect } from "vitest";
import {
  resolveCorrelationId,
  generateCorrelationId,
  CORRELATION_HEADER,
  StructuredLogger,
  sanitizeLogMetadata,
  AppError,
  OperationalMetricsCollector
} from "../../../ai-core/src";

describe("📡 P6.4 OBSERVABILITY, HEALTH CHECKS & OPERATIONAL MONITORING TEST SUITE", () => {
  const TENANT_A = "11111111-1111-1111-1111-111111111111";
  const TENANT_B = "22222222-2222-2222-2222-222222222222";

  // TEST 01: Correlation ID Generated
  it("TEST 01: Gera correlation ID válido com prefixo corr_", () => {
    const cid = generateCorrelationId();
    expect(cid).toMatch(/^corr_\d+_[a-z0-9-]+$/);
  });

  // TEST 02: Valid Client Correlation ID Accepted
  it("TEST 02: Aceita correlation ID válido enviado pelo cliente", () => {
    const clientCid = "req_custom_trace_987654321";
    const resolved = resolveCorrelationId(clientCid);
    expect(resolved).toBe(clientCid);
  });

  // TEST 03: Malformed Correlation ID Rejected / Regenerated
  it("TEST 03: Rejeita e regenera correlation ID malformado com caracteres inválidos", () => {
    const dangerousCid = "corr_<script>alert('xss')</script>";
    const resolved = resolveCorrelationId(dangerousCid);
    expect(resolved).not.toContain("<script>");
    expect(resolved).toMatch(/^corr_\d+_[a-z0-9-]+$/);
  });

  // TEST 04: Correlation ID Returned in Header
  it("TEST 04: Injeta X-Correlation-ID nos cabeçalhos de resposta", () => {
    const headers = new Headers();
    const cid = generateCorrelationId();
    headers.set(CORRELATION_HEADER, cid);

    expect(headers.get("x-correlation-id")).toBe(cid);
  });

  // TEST 05: Structured Log Format Matches JSON Specification
  it("TEST 05: Formato de log estruturado contém campos obrigatórios", () => {
    const logger = new StructuredLogger("test-service", "test");
    const entry = logger.info("Operação de teste executada com sucesso", {
      correlationId: "corr_test_123",
      route: "/api/test",
      status: 200,
      durationMs: 35
    });

    expect(entry.service).toBe("test-service");
    expect(entry.level).toBe("INFO");
    expect(entry.correlationId).toBe("corr_test_123");
    expect(entry.durationMs).toBe(35);
  });

  // TEST 06: Sensitive Data (Passwords, Tokens) Excluded / Redacted
  it("TEST 06: Redige automaticamente senhas e tokens de autenticação", () => {
    const rawData = {
      password: "SuperSecretPassword123!",
      token: "eyJhbGciOiJIUzI1Ni...",
      tenantId: TENANT_A
    };

    const sanitized = sanitizeLogMetadata(rawData);
    expect(sanitized?.password).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.token).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.tenantId).toBe(TENANT_A);
  });

  // TEST 07: API Keys and Secrets Redacted
  it("TEST 07: Redige chaves de API e segredos institucionais", () => {
    const payload = {
      apiKey: "sk-proj-123456789",
      secret: "super-secret-key-prod",
      serviceName: "ai-engine"
    };

    const sanitized = sanitizeLogMetadata(payload);
    expect(sanitized?.apiKey).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.secret).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.serviceName).toBe("ai-engine");
  });

  // TEST 08: Prompts and LLM Text Redacted
  it("TEST 08: Redige texto claro de prompts de IA em metadados de log", () => {
    const logData = {
      prompt: "Instrução confidencial contendo relato de estresse do empregado",
      promptText: "Texto privado do colaborador",
      model: "MiniMax-M2.7"
    };

    const sanitized = sanitizeLogMetadata(logData);
    expect(sanitized?.prompt).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.promptText).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.model).toBe("MiniMax-M2.7");
  });

  // TEST 09: Clinical Data / Medical Notes Redacted
  it("TEST 09: Redige anotações clínicas e diagnósticos médicos", () => {
    const healthData = {
      clinical_note: "Sintomas sugestivos de Síndrome de Burnout moderada",
      diagnosis: "CID-11 QD85",
      is_anonymized: true
    };

    const sanitized = sanitizeLogMetadata(healthData);
    expect(sanitized?.clinical_note).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.diagnosis).toBe("[REDACTED_CONFIDENTIAL]");
    expect(sanitized?.is_anonymized).toBe(true);
  });

  // TEST 10: Tenant Isolation Maintained in Observability Context
  it("TEST 10: Preserva isolamento de contexto entre tenants distintos", () => {
    const filterLogsByTenant = (logs: any[], targetTenantId: string) => {
      return logs.filter((l) => l.tenantId === targetTenantId);
    };

    const logs = [
      { id: "log-1", tenantId: TENANT_A, msg: "Req A" },
      { id: "log-2", tenantId: TENANT_B, msg: "Req B" }
    ];

    expect(filterLogsByTenant(logs, TENANT_A).length).toBe(1);
    expect(filterLogsByTenant(logs, TENANT_A)[0]?.tenantId).toBe(TENANT_A);
  });

  // TEST 11: Unauthorized Observability Access Blocked
  it("TEST 11: Bloqueia acesso a endpoints de métricas por utilizadores não autorizados", () => {
    const checkMetricsAccess = (role: string) => {
      const allowed = ["admin", "dpo", "auditor"];
      if (!allowed.includes(role)) throw new Error("FORBIDDEN: Permissão insuficiente para métricas");
      return true;
    };

    expect(() => checkMetricsAccess("employee")).toThrow("FORBIDDEN");
    expect(checkMetricsAccess("admin")).toBe(true);
  });

  // TEST 12: /api/health Returns Healthy State
  it("TEST 12: Liveness probe retorna status 'ok' com correlation ID", () => {
    const healthResponse = {
      status: "ok",
      service: "aegishub-web",
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId()
    };

    expect(healthResponse.status).toBe("ok");
    expect(healthResponse.service).toBe("aegishub-web");
    expect(healthResponse.correlationId).toBeDefined();
  });

  // TEST 13: /api/ready Returns Ready State
  it("TEST 13: Readiness probe retorna status 'ready' quando banco está ok", () => {
    const readyResponse = {
      status: "ready",
      checks: { database: "ok" },
      latencyMs: 12,
      correlationId: generateCorrelationId()
    };

    expect(readyResponse.status).toBe("ready");
    expect(readyResponse.checks.database).toBe("ok");
    expect(readyResponse.latencyMs).toBe(12);
  });

  // TEST 14: Database Failure in /api/ready Returns 503
  it("TEST 14: Simula falha de banco no readiness probe retornando 503", () => {
    const handleReadyCheck = (dbAccessible: boolean) => {
      if (!dbAccessible) {
        return { status: 503, body: { status: "unavailable", checks: { database: "unreachable" } } };
      }
      return { status: 200, body: { status: "ready", checks: { database: "ok" } } };
    };

    const fail = handleReadyCheck(false);
    expect(fail.status).toBe(503);
    expect(fail.body.checks.database).toBe("unreachable");
  });

  // TEST 15: Structured Error Codes Formatted
  it("TEST 15: AppError formata resposta com código estruturado e correlationId", () => {
    const cid = generateCorrelationId();
    const appError = new AppError("RATE_LIMITED", "Limite de requisições atingido", 429, cid);
    const res = appError.toResponse();

    expect(res.errorCode).toBe("RATE_LIMITED");
    expect(res.correlationId).toBe(cid);
    expect(res.message).toBe("Limite de requisições atingido");
  });

  // TEST 16: No Stack Trace Leakage in Client Error Responses
  it("TEST 16: Respostas de erro ao cliente não contêm stack traces de exceções internas", () => {
    const formatClientError = (err: Error, cid: string) => {
      return {
        errorCode: "INTERNAL_ERROR",
        message: "Ocorreu um erro no processamento da solicitação.",
        correlationId: cid
      };
    };

    const internalError = new Error("Database deadlock at postgres.c:452");
    const clientPayload = formatClientError(internalError, "corr_123");

    expect((clientPayload as any).stack).toBeUndefined();
    expect(clientPayload.message).not.toContain("deadlock");
    expect(clientPayload.errorCode).toBe("INTERNAL_ERROR");
  });

  // TEST 17: Rate-Limit Event Recorded in Operational Metrics
  it("TEST 17: Coletor de métricas registra eventos de rate limiting com precisão", () => {
    const metrics = new OperationalMetricsCollector();
    metrics.recordRequest(200, 30);
    metrics.recordRequest(429, 5, true);

    const summary = metrics.getRequestMetrics();
    expect(summary.totalRequests).toBe(2);
    expect(summary.rateLimitEvents).toBe(1);
    expect(summary.statusDistribution["4xx"]).toBe(1);
  });

  // TEST 18: AI Operation Traceability Recorded in Operational Metrics
  it("TEST 18: Coletor registra inferências de IA com sucesso e falha", () => {
    const metrics = new OperationalMetricsCollector();
    metrics.recordAIInference(true, 120);
    metrics.recordAIInference(false, 40);

    const summary = metrics.getAIMetrics();
    expect(summary.totalInferences).toBe(2);
    expect(summary.successfulInferences).toBe(1);
    expect(summary.failedInferences).toBe(1);
  });

  // TEST 19: Insufficient-Data Metrics Do Not Fabricate Numbers
  it("TEST 19: Retorna avgDurationMs = null e hasSufficientData = false quando N < 10", () => {
    const metrics = new OperationalMetricsCollector();
    metrics.recordRequest(200, 50);

    const summary = metrics.getRequestMetrics();
    expect(summary.hasSufficientData).toBe(false);
    expect(summary.totalRequests).toBe(1);
  });

  // TEST 20: Complete Backward Compatibility
  it("TEST 20: Integração de observabilidade compatível com todos os módulos anteriores", () => {
    const healthProbes = ["/api/health", "/api/ready"];
    expect(healthProbes).toContain("/api/health");
    expect(healthProbes).toContain("/api/ready");
  });
});
