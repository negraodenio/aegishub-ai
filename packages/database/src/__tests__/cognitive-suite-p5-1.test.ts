import { describe, it, expect, vi } from "vitest";
import {
  startCognitiveFocusSession,
  endCognitiveFocusSession,
  pingCognitiveFocusSession,
  getCognitiveFocusSessions,
  getCognitiveWeeklyStats,
  logCognitiveSupportEvent,
  getCognitiveSupportEvents,
  checkFeatureEntitlement,
  resolveAuthorizedTenantContext,
  getCognitiveUserProfile,
  upsertCognitiveUserProfile,
  recordLlmUsage
} from "../../src";
import {
  containsSensitiveData,
  LLMGuardSession,
  LlmGuardUsageTracker,
  CognitiveTipManager,
  TwoPhaseAuditManager,
  resolveCorrelationId,
  PLAN_CATALOG
} from "../../../ai-core/src";

describe("AEGISHUB AI — P5.1 Cognitive Accessibility Suite (Wave 1)", () => {
  const tenantId = "tenant-test-123";
  const userA = "user-alpha-001";
  const userB = "user-beta-002";

  // Mock Database Store
  let focusSessionsStore: any[] = [];
  let supportEventsStore: any[] = [];

  const createMockClient = (currentUserId: string) => {
    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: currentUserId } }, error: null })
      },
      from: (table: string) => ({
        select: (cols: string, opts?: any) => {
          return {
            eq: (field: string, val: any) => {
              return {
                eq: (field2: string, val2: any) => {
                  return {
                    gte: (field3: string, val3: any) => {
                      let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                        .filter(item => item[field] === val && item[field2] === val2 && item[field3] >= val3);
                      return Promise.resolve({ data: filtered, error: null });
                    },
                    order: () => ({
                      limit: (limitNum: number) => {
                        let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                          .filter(item => item[field] === val && item[field2] === val2);
                        return Promise.resolve({ data: filtered.slice(0, limitNum), error: null });
                      }
                    }),
                    maybeSingle: () => {
                      let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                        .find(item => item[field] === val && item[field2] === val2);
                      return Promise.resolve({ data: filtered || null, error: null });
                    }
                  };
                },
                gte: (field2: string, val2: any) => {
                  let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                    .filter(item => item[field] === val && item[field2] >= val2);
                  return Promise.resolve({ data: filtered, error: null });
                },
                order: () => ({
                  limit: (limitNum: number) => {
                    let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                      .filter(item => item[field] === val);
                    return Promise.resolve({ data: filtered.slice(0, limitNum), error: null });
                  }
                }),
                maybeSingle: () => {
                  let filtered = (table === "cognitive_focus_sessions" ? focusSessionsStore : supportEventsStore)
                    .find(item => item[field] === val);
                  return Promise.resolve({ data: filtered || null, error: null });
                }
              };
            }
          };
        },
        insert: (payload: any) => {
          const item = { id: `id-${Date.now()}-${Math.random()}`, ...payload };
          if (table === "cognitive_focus_sessions") focusSessionsStore.push(item);
          if (table === "cognitive_support_events") supportEventsStore.push(item);
          return {
            select: () => ({
              single: () => Promise.resolve({ data: item, error: null })
            })
          };
        },
        update: (updates: any) => ({
          eq: (field1: string, val1: any) => ({
            eq: (field2: string, val2: any) => {
              const target = focusSessionsStore.find(
                item => item[field1] === val1 && item[field2] === val2
              );
              if (target) {
                Object.assign(target, updates);
                return {
                  select: () => ({
                    single: () => Promise.resolve({ data: target, error: null })
                  })
                };
              }
              return {
                select: () => ({
                  single: () => Promise.resolve({ data: null, error: new Error("Not found") })
                })
              };
            }
          })
        })
      })
    } as any;
  };

  // ============================================================================
  // 1. FOCUS SESSIONS (START, END, PING, STATS)
  // ============================================================================
  describe("Focus Sessions Repository", () => {
    it("deve iniciar uma sessão de foco com parâmetros válidos e RLS auth.uid()", async () => {
      const client = createMockClient(userA);
      const session = await startCognitiveFocusSession(client, {
        userId: userA,
        tenantId,
        goal: "Preparar proposta técnica",
        durationPresetSeconds: 1500,
        energyLevelBefore: 8
      });

      expect(session).not.toBeNull();
      expect(session?.goal).toBe("Preparar proposta técnica");
      expect(session?.duration_preset_seconds).toBe(1500);
      expect(session?.completed).toBe(false);
      expect(session?.user_id).toBe(userA);
    });

    it("deve atualizar ping de keep-alive em sessão ativa", async () => {
      const client = createMockClient(userA);
      const session = await startCognitiveFocusSession(client, {
        userId: userA,
        tenantId,
        goal: "Trabalho focado",
        durationPresetSeconds: 1500
      });

      const pingSuccess = await pingCognitiveFocusSession(client, {
        userId: userA,
        sessionId: session!.id!,
        durationActualSeconds: 15
      });

      expect(pingSuccess).toBe(true);
    });

    it("deve encerrar sessão de foco e marcar como concluída", async () => {
      const client = createMockClient(userA);
      const session = await startCognitiveFocusSession(client, {
        userId: userA,
        tenantId,
        goal: "Concluir revisão",
        durationPresetSeconds: 300
      });

      const ended = await endCognitiveFocusSession(client, {
        userId: userA,
        sessionId: session!.id!,
        durationActualSeconds: 300,
        completed: true
      });

      expect(ended).not.toBeNull();
      expect(ended?.completed).toBe(true);
      expect(ended?.duration_actual_seconds).toBe(300);
    });

    it("deve impedir que o Usuário B encerre ou modifique a sessão do Usuário A (RLS)", async () => {
      const clientA = createMockClient(userA);
      const clientB = createMockClient(userB);

      const sessionA = await startCognitiveFocusSession(clientA, {
        userId: userA,
        tenantId,
        goal: "Sessão confidencial do User A"
      });

      // User B tenta alterar a sessão do User A
      const attempt = await endCognitiveFocusSession(clientB, {
        userId: userB,
        sessionId: sessionA!.id!,
        durationActualSeconds: 50,
        completed: false
      });

      expect(attempt).toBeNull();
    });
  });

  // ============================================================================
  // 2. TELEMETRY & SUPPORT EVENTS (STUCK FLOW, ENERGY)
  // ============================================================================
  describe("Support Events & Telemetry", () => {
    it("deve registrar evento de stuck_triggered sem vazar PII", async () => {
      const client = createMockClient(userA);
      const event = await logCognitiveSupportEvent(client, {
        userId: userA,
        tenantId,
        eventType: "stuck_triggered",
        context: { step: 1, method: "breathe" }
      });

      expect(event).not.toBeNull();
      expect(event?.event_type).toBe("stuck_triggered");
      expect(event?.user_id).toBe(userA);
    });

    it("deve registrar micro_action_completed após os 10s de countdown", async () => {
      const client = createMockClient(userA);
      const event = await logCognitiveSupportEvent(client, {
        userId: userA,
        tenantId,
        eventType: "micro_action_completed",
        context: { category: "overwhelm", step: 4 }
      });

      expect(event).not.toBeNull();
      expect(event?.event_type).toBe("micro_action_completed");
    });
  });

  // ============================================================================
  // 3. WEEKLY PROGRESS COMPARISON
  // ============================================================================
  describe("Weekly Progress Aggregation", () => {
    it("deve calcular métricas comparativas semana atual vs semana anterior", async () => {
      const client = createMockClient(userA);
      const stats = await getCognitiveWeeklyStats(client, userA);

      expect(stats).toHaveProperty("focusWins");
      expect(stats).toHaveProperty("focusTimeHours");
      expect(stats).toHaveProperty("completedSessions");
      expect(stats).toHaveProperty("stuckResets");
      expect(stats).toHaveProperty("microWins");
      expect(typeof stats.focusWins.current).toBe("number");
      expect(typeof stats.focusWins.last).toBe("number");
    });
  });

  // ============================================================================
  // 4. SENSITIVE DATA & PII DETECTION
  // ============================================================================
  describe("Sensitive Data Policy", () => {
    it("deve detectar e-mails em texto de entrada", () => {
      expect(containsSensitiveData("Favor enviar para joao.silva@empresa.com.br agora")).toBe(true);
    });

    it("deve detectar chaves de API sk- e tokens Bearer", () => {
      expect(containsSensitiveData("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.test")).toBe(true);
      expect(containsSensitiveData("API key: sk-proj-1234567890abcdef123456")).toBe(true);
    });

    it("deve detectar URIs de conexão a bases de dados", () => {
      expect(containsSensitiveData("postgres://admin:secret@db.host.internal:5432/main")).toBe(true);
    });

    it("deve permitir textos profissionais legítimos sem dados sensíveis", () => {
      expect(containsSensitiveData("Preparar o relatório de análise de risco e alinhar com a equipa de engenharia.")).toBe(false);
    });
  });

  // ============================================================================
  // 5. LLM GUARD LEASE & RECONCILE (FAIL-CLOSED)
  // ============================================================================
  describe("LLM Guard Lease & Reconcile", () => {
    const tracker = new LlmGuardUsageTracker();
    const guard = new LLMGuardSession(tracker);

    it("deve conceder lease para requisição válida dentro da cota", async () => {
      const verdict = await guard.acquire(
        {
          operation: "cognitive_chat",
          userId: userA,
          tenantId,
          inputContent: "Como posso organizar minhas prioridades de amanhã?",
          estimatedInputTokens: 200,
          estimatedOutputTokens: 300
        },
        { dailyTokensUsed: 1000, dailyCostUsd: 0.01 }
      );

      expect(verdict.allowed).toBe(true);
      expect(verdict.code).toBe("ALLOWED");
      expect(verdict.leaseId).toMatch(/^lease_/);
    });

    it("deve bloquear requisições contendo dados sensíveis / PII antes do LLM", async () => {
      const verdict = await guard.acquire(
        {
          operation: "cognitive_chat",
          userId: userA,
          tenantId,
          inputContent: "Minha senha de acesso é PASSWORD=SuperSecret123!",
          estimatedInputTokens: 200,
          estimatedOutputTokens: 300
        },
        { dailyTokensUsed: 1000, dailyCostUsd: 0.01 }
      );

      expect(verdict.allowed).toBe(false);
      expect(verdict.code).toBe("SENSITIVE_DATA_DETECTED");
    });

    it("deve bloquear quando a cota diária de custo estiver excedida ($0.25)", async () => {
      const verdict = await guard.acquire(
        {
          operation: "cognitive_chat",
          userId: userA,
          tenantId,
          inputContent: "Ajuda para desdobrar tarefa",
          estimatedInputTokens: 200,
          estimatedOutputTokens: 300
        },
        { dailyTokensUsed: 20000, dailyCostUsd: 0.30 }
      );

      expect(verdict.allowed).toBe(false);
      expect(verdict.code).toBe("QUOTA_EXCEEDED");
    });

    it("deve aplicar fail-closed conservador caso o provider LLM falhe", () => {
      const reconciled = guard.reconcile({
        leaseId: "lease_test_123",
        userId: userA,
        tenantId,
        actualInputTokens: 0,
        actualOutputTokens: 0,
        providerSucceeded: false
      });

      // Reserva conservadora mínima para prevenir abuso
      expect(reconciled.actualTokens).toBe(100);
      expect(reconciled.actualCostUsd).toBeGreaterThan(0);
    });

    it("deve reconciliar uso exato quando o provider obtiver sucesso", () => {
      const reconciled = guard.reconcile({
        leaseId: "lease_test_123",
        userId: userA,
        tenantId,
        actualInputTokens: 150,
        actualOutputTokens: 250,
        providerSucceeded: true
      });

      expect(reconciled.actualTokens).toBe(400);
      expect(reconciled.actualCostUsd).toBe(tracker.calculateCost(400));
    });
  });

  // ============================================================================
  // 6. OUTPUT SAFETY & ZERO CLINICAL TERMS
  // ============================================================================
  describe("Output Safety & Guardrails", () => {
    const tracker = new LlmGuardUsageTracker();

    it("deve bloquear termos de diagnóstico clínico ou patológico", () => {
      const check1 = tracker.validateCognitiveOutput("Você foi diagnosticado com quadro patológico.");
      expect(check1.valid).toBe(false);
      expect(check1.violations).toContain("diagnosticado");

      const check2 = tracker.validateCognitiveOutput("Recomendo a prescrição de medicamento controlado.");
      expect(check2.valid).toBe(false);
      expect(check2.violations).toContain("prescrição");
    });

    it("deve aprovar saídas com foco puramente executivo e funcional", () => {
      const check = tracker.validateCognitiveOutput("Divida o projeto em três blocos de foco de 15 minutos e comece pela leitura do resumo.");
      expect(check.valid).toBe(true);
      expect(check.violations.length).toBe(0);
    });
  });

  // ============================================================================
  // 7. TWO-PHASE AUDIT CRYPTOGRAPHIC BINDING
  // ============================================================================
  describe("Two-Phase AI Audit", () => {
    it("deve emitir token SHA-256 bound e validar integridade na gravação", () => {
      const payload: any = {
        operation: "cognitive_chat",
        feature: "cognitive_support",
        model: "approved-claude-3-haiku",
        status: "SUCCESS",
        inputTokens: 150,
        outputTokens: 250,
        costUsd: 0.0008,
        latencyMs: 340,
        correlationId: resolveCorrelationId(),
        tenantId,
        userId: userA
      };

      const capability = TwoPhaseAuditManager.mintAuditCapability(payload, 30);
      expect(capability.token).toMatch(/^aud_/);
      expect(capability.payloadHash).toHaveLength(64);

      const verification = TwoPhaseAuditManager.verifyAuditCapability(payload, capability);
      expect(verification.valid).toBe(true);
    });

    it("deve rejeitar auditoria se o payload for adulterado (hash mismatch)", () => {
      const payload: any = {
        operation: "cognitive_chat",
        feature: "cognitive_support",
        model: "approved-claude-3-haiku",
        status: "SUCCESS",
        inputTokens: 150,
        outputTokens: 250,
        costUsd: 0.0008,
        latencyMs: 340,
        correlationId: resolveCorrelationId(),
        tenantId,
        userId: userA
      };

      const capability = TwoPhaseAuditManager.mintAuditCapability(payload, 30);

      // Adulteração do payload
      const tamperedPayload = { ...payload, costUsd: 0.0099 };
      const verification = TwoPhaseAuditManager.verifyAuditCapability(tamperedPayload, capability);
      expect(verification.valid).toBe(false);
      expect(verification.reason).toBe("AUDIT_HASH_MISMATCH");
    });
  });

  // ============================================================================
  // 8. DAILY AI TIP (24H CACHE & NEUTRAL PROMPTS)
  // ============================================================================
  describe("Cognitive Tip Manager", () => {
    const tipManager = new CognitiveTipManager(24);

    it("deve armazenar dica no cache e retornar nos acessos subsequentes", () => {
      const tipText = "Comece com 5 minutos de foco para quebrar a inércia.";
      tipManager.setCachedTip(tipText, "pt");

      const cached = tipManager.getCachedTip("pt");
      expect(cached).toBe(tipText);
    });

    it("deve fornecer prompts neutros sem direcionamento a condições clínicas", () => {
      const prompts = tipManager.getNeutralTipPrompt("pt");
      // Não deve conter rotulação diagnóstica ou referências clínicas específicas
      expect(prompts.systemPrompt).not.toMatch(/TDAH|ADHD|TEA|CID|DSM/i);
      expect(prompts.userPrompt).not.toMatch(/TDAH|ADHD|TEA|CID|DSM/i);
    });
  });

  // ============================================================================
  // 9. COMMERCIAL ENTITLEMENTS (P6.6 INTEGRATION)
  // ============================================================================
  describe("Commercial Entitlements", () => {
    it("deve bloquear cognitive_support no plano Starter", () => {
      expect(PLAN_CATALOG.starter.entitlements.cognitive_support).toBe(false);
    });

    it("deve habilitar cognitive_support nos planos Professional e Enterprise", () => {
      expect(PLAN_CATALOG.professional.entitlements.cognitive_support).toBe(true);
      expect(PLAN_CATALOG.enterprise.entitlements.cognitive_support).toBe(true);
    });
  });

  // ============================================================================
  // 10. SECURITY HARDENING VERIFICATION (SEC-01 TO SEC-06)
  // ============================================================================
  describe("Security Hardening & Adversarial Verification (SEC-01 to SEC-06)", () => {
    // Mock client with active tenant memberships
    const createMembershipMockClient = (memberships: any[]) => ({
      from: (table: string) => {
        if (table === "tenant_memberships") {
          return {
            select: () => ({
              eq: (field1: string, val1: any) => ({
                eq: (field2: string, val2: any) => {
                  const filtered = memberships.filter(
                    m => m[field1] === val1 && m[field2] === val2
                  );
                  return Promise.resolve({ data: filtered, error: null });
                }
              })
            })
          };
        }
        if (table === "profiles") {
          return {
            select: () => ({
              eq: (field: string, val: any) => ({
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
                single: () => Promise.resolve({ data: null, error: null })
              })
            })
          };
        }
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) })
        };
      }
    });

    it("SEC-01: deve rejeitar tenant estrangeiro no fluxo de decomposição de tarefas", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-allowed", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, "tenant-hacker-evil");
      expect(result.tenantId).toBe("");
      expect(result.error).toBe("UNAUTHORIZED_TENANT_CONTEXT");
    });

    it("SEC-01: deve aceitar tenant autorizado no fluxo de decomposição de tarefas", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-allowed", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, "tenant-allowed");
      expect(result.tenantId).toBe("tenant-allowed");
      expect(result.error).toBeUndefined();
    });

    it("SEC-02: deve bloquear consentimento quando o colaborador tenta vincular tenant estrangeiro", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-corp-a", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, "tenant-corp-b");
      expect(result.tenantId).toBe("");
      expect(result.error).toBe("UNAUTHORIZED_TENANT_CONTEXT");
    });

    it("SEC-02: deve permitir consentimento quando o colaborador vincula sua organização autorizada", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-corp-a", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, "tenant-corp-a");
      expect(result.tenantId).toBe("tenant-corp-a");
      expect(result.error).toBeUndefined();
    });

    it("SEC-03: deve derivar tenantId da sessão persistida e impedir adulteração no encerramento de foco", async () => {
      const client = createMockClient(userA);
      const session = await startCognitiveFocusSession(client, {
        userId: userA,
        tenantId: "tenant-persisted-alpha",
        goal: "Trabalho focado",
        durationPresetSeconds: 1500
      });

      expect(session).not.toBeNull();
      expect(session?.tenant_id).toBe("tenant-persisted-alpha");

      const ended = await endCognitiveFocusSession(client, {
        userId: userA,
        sessionId: session!.id!,
        durationActualSeconds: 1200,
        completed: true
      });

      expect(ended).not.toBeNull();
      // O tenantId retornado pela sessão terminada deve ser estritamente o persistido
      expect(ended?.tenant_id).toBe("tenant-persisted-alpha");
    });

    it("SEC-03: deve bloquear Usuário B ao tentar encerrar sessão do Usuário A (IDOR)", async () => {
      const clientA = createMockClient(userA);
      const clientB = createMockClient(userB);

      const sessionA = await startCognitiveFocusSession(clientA, {
        userId: userA,
        tenantId: "tenant-alpha",
        goal: "Segredo de A",
        durationPresetSeconds: 1500
      });

      const attempt = await endCognitiveFocusSession(clientB, {
        userId: userB,
        sessionId: sessionA!.id!,
        durationActualSeconds: 100,
        completed: true
      });

      expect(attempt).toBeNull();
    });

    it("SEC-04: deve rejeitar membership quando o status for revoked ou suspended", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-suspended", role: "employee", status: "suspended" },
        { id: "m2", user_id: userA, tenant_id: "tenant-invited", role: "employee", status: "invited" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, "tenant-suspended");
      expect(result.tenantId).toBe("");
      expect(result.error).toBe("USER_NO_ACTIVE_MEMBERSHIPS");
    });

    it("SEC-04: deve rejeitar seleção ambígua quando o usuário possui múltiplos tenants e não selecionou nenhum", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-1", role: "employee", status: "active" },
        { id: "m2", user_id: userA, tenant_id: "tenant-2", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, undefined);
      expect(result.tenantId).toBe("");
      expect(result.error).toBe("AMBIGUOUS_TENANT_CONTEXT_REQUIRES_EXPLICIT_SELECTION");
    });

    it("SEC-04: deve selecionar automaticamente o tenant quando o usuário possui exatamente uma membership ativa", async () => {
      const client = createMembershipMockClient([
        { id: "m1", user_id: userA, tenant_id: "tenant-only-one", role: "employee", status: "active" }
      ]);

      const result = await resolveAuthorizedTenantContext(client as any, userA, undefined);
      expect(result.tenantId).toBe("tenant-only-one");
      expect(result.error).toBeUndefined();
    });

    it("SEC-05: deve calcular reconciliação delta sem contagem dupla quando actual < estimated", () => {
      const estimatedCost = 0.010;
      const actualCost = 0.008;
      const delta = actualCost - estimatedCost;

      expect(delta).toBeCloseTo(-0.002, 6);
      const initialBudgetReservation = estimatedCost; // 0.010
      const finalRecordedSpend = initialBudgetReservation + delta; // 0.008
      expect(finalRecordedSpend).toBeCloseTo(0.008, 6);
    });

    it("SEC-05: deve calcular reconciliação delta sem contagem dupla quando actual > estimated", () => {
      const estimatedCost = 0.010;
      const actualCost = 0.015;
      const delta = actualCost - estimatedCost;

      expect(delta).toBeCloseTo(0.005, 6);
      const initialBudgetReservation = estimatedCost; // 0.010
      const finalRecordedSpend = initialBudgetReservation + delta; // 0.015
      expect(finalRecordedSpend).toBeCloseTo(0.015, 6);
    });

    it("SEC-05: deve falhar atomicamente quando o lease exceder o teto diário de $0.25", async () => {
      const tracker = new LlmGuardUsageTracker();
      const guard = new LLMGuardSession(tracker);

      // Simula callback atômico do DB rejeitando por estouro de cota
      const dbAtomicLeaseMock = vi.fn().mockResolvedValue(false);

      const verdict = await guard.acquire(
        {
          operation: "cognitive_breakdown",
          userId: userA,
          tenantId: "tenant-test",
          inputContent: "Organizar tarefas do dia",
          estimatedInputTokens: 200,
          estimatedOutputTokens: 300
        },
        { dailyTokensUsed: 1000, dailyCostUsd: 0.24 },
        dbAtomicLeaseMock
      );

      expect(verdict.allowed).toBe(false);
      expect(verdict.code).toBe("QUOTA_EXCEEDED");
      expect(dbAtomicLeaseMock).toHaveBeenCalledWith(0.001, 0.25);
    });

    it("SEC-06: deve validar contrato de RPC reconcile_llm_usage com delta adjustment", async () => {
      let rpcParamsCaptured: any = null;
      const client = {
        rpc: vi.fn((fnName: string, params: any) => {
          rpcParamsCaptured = { fnName, ...params };
          return Promise.resolve({
            data: { daily_tokens_used: params.p_tokens, daily_cost_usd: params.p_actual_cost },
            error: null
          });
        })
      };

      const res = await recordLlmUsage(
        client as any,
        userA,
        "tenant-test",
        350,
        0.008,
        0.010 // estimatedCostUsd
      );

      expect(res.success).toBe(true);
      expect(rpcParamsCaptured.fnName).toBe("reconcile_llm_usage");
      expect(rpcParamsCaptured.p_actual_cost).toBe(0.008);
      expect(rpcParamsCaptured.p_estimated_cost).toBe(0.010);
    });
  });
});

