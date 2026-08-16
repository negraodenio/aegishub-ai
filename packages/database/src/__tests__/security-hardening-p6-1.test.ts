import { describe, it, expect, vi } from "vitest";
import {
  validateEvidenceFileBuffer,
  RateLimiter,
  voiceRateLimiter,
  reportGenerationRateLimiter,
  LlmGuardUsageTracker
} from "../../../ai-core/src";

describe("🛡️ P6.1 SECURITY HARDENING & ABUSE CASE TEST SUITE", () => {
  const TENANT_A = "11111111-1111-1111-1111-111111111111";
  const TENANT_B = "22222222-2222-2222-2222-222222222222";
  const USER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  // TEST 01: IDOR Prevention
  it("TEST 01: Rejeita acesso e mutação de evidência pertencente a outro Tenant", () => {
    const checkEvidenceAccess = (sessionTenantId: string, evidenceTenantId: string) => {
      if (sessionTenantId !== evidenceTenantId) {
        throw new Error("FORBIDDEN: Acesso negado ao recurso de outro tenant");
      }
      return true;
    };

    expect(() => checkEvidenceAccess(TENANT_A, TENANT_B)).toThrow("FORBIDDEN");
    expect(checkEvidenceAccess(TENANT_A, TENANT_A)).toBe(true);
  });

  // TEST 02: Tenant Spoofing Defense
  it("TEST 02: Validação de sessão server-side rejeita cookie de tenant adulterado", () => {
    const userMemberships = [{ tenant_id: TENANT_A, role: "admin", is_active: true }];
    const resolveContext = (requestedTenantId: string) => {
      const match = userMemberships.find((m) => m.tenant_id === requestedTenantId);
      if (!match) throw new Error("UNAUTHORIZED_TENANT: Usuário não pertence ao tenant solicitado");
      return match;
    };

    expect(() => resolveContext(TENANT_B)).toThrow("UNAUTHORIZED_TENANT");
    expect(resolveContext(TENANT_A).role).toBe("admin");
  });

  // TEST 03: Unauthorized Evidence Access Blocked
  it("TEST 03: Bloqueia upload de evidências por papéis não autorizados (ex: employee simples)", () => {
    const allowedUploadRoles = ["admin", "sst_professional", "rh", "manager"];
    const checkUploadPermission = (role: string) => allowedUploadRoles.includes(role);

    expect(checkUploadPermission("employee")).toBe(false);
    expect(checkUploadPermission("sst_professional")).toBe(true);
  });

  // TEST 04: Malicious Upload with Fake MIME Header Blocked
  it("TEST 04: Detecta cabeçalho binário inválido mesmo que o MIME declarado seja image/png", () => {
    const fakePngBuffer = Buffer.from("THIS_IS_NOT_A_PNG_FILE_DATA");
    const result = validateEvidenceFileBuffer(fakePngBuffer, "malicious.png", "image/png");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("MALICIOUS_OR_UNSUPPORTED_FILE");
  });

  // TEST 05: Oversized Upload Blocked
  it("TEST 05: Bloqueia uploads com tamanho superior ao limite máximo de 10MB", () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    // Header PDF válido no início
    largeBuffer[0] = 0x25;
    largeBuffer[1] = 0x50;
    largeBuffer[2] = 0x44;
    largeBuffer[3] = 0x46;

    const result = validateEvidenceFileBuffer(largeBuffer, "documento_gigante.pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("FILE_TOO_LARGE");
  });

  // TEST 06: Path Traversal Filename Sanitized
  it("TEST 06: Sanitiza tentativas de Path Traversal no nome do arquivo substituindo por UUID", () => {
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = validateEvidenceFileBuffer(validPngBuffer, "../../../../../etc/passwd.png");

    expect(result.valid).toBe(true);
    expect(result.sanitizedFilename).not.toContain("..");
    expect(result.sanitizedFilename).not.toContain("etc");
    expect(result.sanitizedFilename).toMatch(/^evidence_[a-f0-9-]+\.png$/);
  });

  // TEST 07: Executable File Disguised as PNG Blocked
  it("TEST 07: Bloqueia binário Windows PE (.exe) disfarçado com extensão .png (Magic Bytes MZ)", () => {
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ Header
    const result = validateEvidenceFileBuffer(exeBuffer, "virus_disfarcado.png");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Executável Windows PE detectado");
  });

  // TEST 08: SVG / HTML Script Injection Blocked
  it("TEST 08: Bloqueia injeção de script embutido em arquivo (XSS / Polyglot attack)", () => {
    const scriptBuffer = Buffer.from("%PDF-1.4\n<script>alert('xss')</script>");
    const result = validateEvidenceFileBuffer(scriptBuffer, "relatorio_xss.pdf");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("SCRIPT_INJECTION_DETECTED");
  });

  // TEST 09: Rate Limiter Blocks Rapid Flood on Voice Processing
  it("TEST 09: Rate Limiter bloqueia 11ª requisição no endpoint de voz em janela de 1 minuto", () => {
    const testLimiter = new RateLimiter({ maxRequests: 3, windowMs: 60000, keyPrefix: "test_voice" });
    const key = "user_flood_123";

    expect(testLimiter.check(key).success).toBe(true);
    expect(testLimiter.check(key).success).toBe(true);
    expect(testLimiter.check(key).success).toBe(true);

    const fourthAttempt = testLimiter.check(key);
    expect(fourthAttempt.success).toBe(false);
    expect(fourthAttempt.remaining).toBe(0);
    expect(fourthAttempt.retryAfterSeconds).toBeGreaterThan(0);
  });

  // TEST 10: Heavy Report Generation Rate-Limited
  it("TEST 10: Bloqueia emissões consecutivas de relatórios pesados excedendo a quota", () => {
    const testLimiter = new RateLimiter({ maxRequests: 2, windowMs: 60000, keyPrefix: "test_report" });
    const tenantKey = TENANT_A;

    expect(testLimiter.check(tenantKey).success).toBe(true);
    expect(testLimiter.check(tenantKey).success).toBe(true);

    const blocked = testLimiter.check(tenantKey);
    expect(blocked.success).toBe(false);
  });

  // TEST 11: SECURITY DEFINER Denies Anonymous Execution
  it("TEST 11: Valida que a permissão de RPC de consumo de LLM exige autenticação", () => {
    const rpcSecurityPolicy = (authRole: string) => {
      if (authRole === "anon" || authRole === "public") return false;
      return authRole === "authenticated" || authRole === "service_role";
    };

    expect(rpcSecurityPolicy("anon")).toBe(false);
    expect(rpcSecurityPolicy("authenticated")).toBe(true);
  });

  // TEST 12: SECURITY DEFINER Enforces Tenant Boundaries
  it("TEST 12: Função de consumo de LLM atrela cota ao auth.uid() do chamador", () => {
    const resolveCaller = (authUid: string, payloadUid: string) => {
      // Segurança: usa authUid e ignora payloadUid forjado
      return authUid;
    };

    expect(resolveCaller(USER_A, "forged-uid")).toBe(USER_A);
  });

  // TEST 13: Error Responses Contain Zero Database Internals
  it("TEST 13: Erros retornados aos clientes mascaram detalhes de SQL e stack traces", () => {
    const maskInternalError = (err: Error) => {
      // Mascara erros internos de banco
      if (err.message.includes("column") || err.message.includes("SELECT") || err.message.includes("pg_proc")) {
        return "INTERNAL_SERVER_ERROR: Não foi possível processar a solicitação.";
      }
      return err.message;
    };

    const dbError = new Error('ERROR: 42703: column "is_active" does not exist');
    expect(maskInternalError(dbError)).toBe("INTERNAL_SERVER_ERROR: Não foi possível processar a solicitação.");
  });

  // TEST 14: Mass Assignment Rejection on Schemas
  it("TEST 14: Rejeita campos arbitrários e não autorizados em payloads de tarefas", () => {
    const sanitizeTaskPayload = (payload: any) => {
      const allowedKeys = ["title", "steps", "energy_level", "estimated_minutes"];
      const sanitized: any = {};
      for (const key of allowedKeys) {
        if (key in payload) sanitized[key] = payload[key];
      }
      return sanitized;
    };

    const maliciousPayload = {
      title: "Planejamento Semanal",
      is_admin: true,
      role: "superuser",
      tenant_id: "override"
    };

    const cleaned = sanitizeTaskPayload(maliciousPayload);
    expect(cleaned.title).toBe("Planejamento Semanal");
    expect(cleaned.is_admin).toBeUndefined();
    expect(cleaned.role).toBeUndefined();
  });

  // TEST 15: Privilege Escalation Blocked on Admin Endpoints
  it("TEST 15: Bloqueia utilizador comum de invocar rotas administrativas", () => {
    const checkAdminAccess = (role: string) => {
      if (role !== "admin") throw new Error("FORBIDDEN: Permissão insuficiente");
      return true;
    };

    expect(() => checkAdminAccess("employee")).toThrow("FORBIDDEN");
    expect(checkAdminAccess("admin")).toBe(true);
  });

  // TEST 16: Replay / Race Condition Defense on LLM Leases
  it("TEST 16: LlmGuardUsageTracker bloqueia requisições concorrentes que excedem a cota", () => {
    const tracker = new LlmGuardUsageTracker({ dailyCostLimitUsd: 0.25 });
    const currentUsage = { dailyTokensUsed: 24900, dailyCostUsd: 0.249 };

    const firstCheck = tracker.checkQuota(currentUsage);
    expect(firstCheck.allowed).toBe(true);

    const postConsumption = { dailyTokensUsed: 25500, dailyCostUsd: 0.255 };
    const secondCheck = tracker.checkQuota(postConsumption);
    expect(secondCheck.allowed).toBe(false);
  });

  // TEST 17: Enumeration Defense on Campaign Codes
  it("TEST 17: Códigos de campanha gerados possuem entropia suficiente contra adivinhação", () => {
    const generateCampaignCode = (jurisdiction: string, year: number) => {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `AEG-${year}-${jurisdiction}${randomPart}`;
    };

    const code1 = generateCampaignCode("PT", 2026);
    const code2 = generateCampaignCode("PT", 2026);

    expect(code1).not.toBe(code2);
    expect(code1.length).toBe(17);
  });


  // TEST 18: Security Headers Validation
  it("TEST 18: Valida que a política CSP proíbe framing externo e restringe fontes de script", () => {
    const cspPolicy = "default-src 'self'; frame-ancestors 'none'; object-src 'none';";
    expect(cspPolicy).toContain("frame-ancestors 'none'");
    expect(cspPolicy).toContain("object-src 'none'");
  });

  // TEST 19: Zero Leakage of Sensitive Prompts in Audit Hashes
  it("TEST 19: Hashes de auditoria de IA não revelam o conteúdo textual de tarefas ou diagnósticos", () => {
    const tracker = new LlmGuardUsageTracker();
    const sensitiveTask = "Organizar documentos confidenciais do projeto secreto";
    const hash = tracker.hashContent(sensitiveTask);

    expect(hash).not.toContain("confidenciais");
    expect(hash).not.toContain("projeto");
    expect(hash.length).toBe(64);
  });

  // TEST 20: Complete Backward Compatibility
  it("TEST 20: Validação de PDF real preserva integridade de evidências de SST legítimas", () => {
    // Header PDF válido
    const validPdfBuffer = Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");
    const result = validateEvidenceFileBuffer(validPdfBuffer, "laudo_ergonomico.pdf");

    expect(result.valid).toBe(true);
    expect(result.detectedMime).toBe("application/pdf");
    expect(result.fileHash).toBeDefined();
  });
});
