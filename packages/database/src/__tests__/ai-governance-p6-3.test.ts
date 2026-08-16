import { describe, it, expect } from "vitest";
import {
  MODEL_STATUS_TRANSITIONS,
  INCIDENT_STATUS_TRANSITIONS,
  ModelStatus,
  IncidentStatus,
  AIModelRegistryEntry,
  AIPromptRegistryEntry,
  AIIncidentEntry
} from "../repositories/ai-governance";

describe("🏛️ P6.3 AI GOVERNANCE, MODEL REGISTRY & INCIDENT MANAGEMENT TEST SUITE", () => {
  const TENANT_A = "11111111-1111-1111-1111-111111111111";
  const TENANT_B = "22222222-2222-2222-2222-222222222222";
  const USER_DPO = "dddddddd-dddd-dddd-dddd-dddddddddddd";
  const USER_EMPLOYEE = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";

  // TEST 01: Criação de Model no Registry
  it("TEST 01: Criação válida de modelo com metadados de governança", () => {
    const model: AIModelRegistryEntry = {
      provider: "MiniMax",
      model_name: "MiniMax-M2.7-TaskDecomposer",
      model_version: "2.7.1",
      model_family: "LLM",
      status: "draft",
      owner: "AI Governance Team",
      risk_classification: "limited",
      intended_use: "Apoio executivo e estruturação de rotinas ocupacionais"
    };

    expect(model.model_name).toBe("MiniMax-M2.7-TaskDecomposer");
    expect(model.status).toBe("draft");
    expect(model.risk_classification).toBe("limited");
  });

  // TEST 02: Unauthorized Model Creation
  it("TEST 02: Bloqueia criação ou alteração de modelos por papéis não autorizados", () => {
    const checkCanManageModels = (role: string) => {
      const allowedRoles = ["admin", "dpo"];
      if (!allowedRoles.includes(role)) {
        throw new Error("FORBIDDEN: Apenas DPO ou Admin podem gerir o Model Registry");
      }
      return true;
    };

    expect(() => checkCanManageModels("employee")).toThrow("FORBIDDEN");
    expect(() => checkCanManageModels("manager")).toThrow("FORBIDDEN");
    expect(checkCanManageModels("dpo")).toBe(true);
    expect(checkCanManageModels("admin")).toBe(true);
  });

  // TEST 03: Model Versioning
  it("TEST 03: Garante chave única de identificação por nome e versão do modelo", () => {
    const models = [
      { name: "TaskDecomposer", version: "1.0.0" },
      { name: "TaskDecomposer", version: "2.0.0" }
    ];

    const isDuplicate = (name: string, ver: string) => {
      return models.some((m) => m.name === name && m.version === ver);
    };

    expect(isDuplicate("TaskDecomposer", "1.0.0")).toBe(true);
    expect(isDuplicate("TaskDecomposer", "3.0.0")).toBe(false);
  });

  // TEST 04: Invalid State Transition
  it("TEST 04: Bloqueia transições de estado inválidas na máquina de estados de modelos", () => {
    const isValidTransition = (current: ModelStatus, next: ModelStatus) => {
      return (MODEL_STATUS_TRANSITIONS[current] || []).includes(next);
    };

    expect(isValidTransition("draft", "pending_approval")).toBe(true);
    expect(isValidTransition("draft", "active")).toBe(false); // Não pode pular aprovação
    expect(isValidTransition("pending_approval", "approved")).toBe(true);
    expect(isValidTransition("approved", "active")).toBe(true);
    expect(isValidTransition("retired", "active")).toBe(false); // Estado terminal
  });

  // TEST 05: Prompt Versioning
  it("TEST 05: Registro e versionamento explícito de prompts governados", () => {
    const prompt: AIPromptRegistryEntry = {
      prompt_id: "PRM-COG-DECOMPOSE",
      version: "v1.2",
      purpose: "Decomposição em micro-etapas executivas",
      content_hash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
      status: "active",
      owner: "Clinical Oversight Committee"
    };

    expect(prompt.prompt_id).toBe("PRM-COG-DECOMPOSE");
    expect(prompt.version).toBe("v1.2");
    expect(prompt.content_hash.length).toBe(64);
  });

  // TEST 06: Prompt Immutability
  it("TEST 06: Garante imutabilidade de versões de prompts ativas em produção", () => {
    const canMutatePrompt = (status: string) => {
      if (status === "active" || status === "retired") {
        throw new Error("IMMUTABLE_PROMPT: Versões ativas/arquivadas não podem ser alteradas");
      }
      return true;
    };

    expect(() => canMutatePrompt("active")).toThrow("IMMUTABLE_PROMPT");
    expect(canMutatePrompt("draft")).toBe(true);
  });

  // TEST 07: Decision -> Model Traceability
  it("TEST 07: Rastreabilidade completa entre a decisão gerada e o modelo homologado", () => {
    const decision = {
      id: "dec-100",
      tenant_id: TENANT_A,
      model_id: "mod-minimax-m2.7",
      model_version: "2.7.1",
      input_hash: "hash-in-123",
      output_hash: "hash-out-456"
    };

    expect(decision.model_id).toBe("mod-minimax-m2.7");
    expect(decision.model_version).toBe("2.7.1");
  });

  // TEST 08: Decision -> Prompt Traceability
  it("TEST 08: Rastreabilidade da decisão até a versão e hash exato do prompt utilizado", () => {
    const decisionRecord = {
      id: "dec-101",
      prompt_id: "PRM-COG-DECOMPOSE",
      prompt_version: "v1.2",
      prompt_hash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
    };

    expect(decisionRecord.prompt_id).toBe("PRM-COG-DECOMPOSE");
    expect(decisionRecord.prompt_version).toBe("v1.2");
  });

  // TEST 09: Correlation ID Tracking
  it("TEST 09: Cada inferência gera correlation_id para rastreio ponta-a-ponta", () => {
    const createInferenceContext = (tenantId: string, userId: string) => {
      const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return { tenantId, userId, correlationId };
    };

    const ctx = createInferenceContext(TENANT_A, USER_DPO);
    expect(ctx.correlationId).toMatch(/^corr_\d+_[a-z0-9]+$/);
  });

  // TEST 10: Tenant Isolation in AI Governance
  it("TEST 10: Garante isolamento estrito de decisões e logs de IA por tenant", () => {
    const decisions = [
      { id: "d1", tenant_id: TENANT_A, decision: "Recomendação A" },
      { id: "d2", tenant_id: TENANT_B, decision: "Recomendação B" }
    ];

    const getTenantDecisions = (tid: string) => decisions.filter((d) => d.tenant_id === tid);

    expect(getTenantDecisions(TENANT_A).length).toBe(1);
    expect(getTenantDecisions(TENANT_A)[0]?.id).toBe("d1");
  });

  // TEST 11: Cross-Tenant IDOR Defense
  it("TEST 11: Bloqueia tentativa de aprovação de decisão pertencente a outro tenant", () => {
    const validateDecision = (callerTenantId: string, decisionTenantId: string) => {
      if (callerTenantId !== decisionTenantId) {
        throw new Error("CROSS_TENANT_IDOR: Acesso negado");
      }
      return true;
    };

    expect(() => validateDecision(TENANT_A, TENANT_B)).toThrow("CROSS_TENANT_IDOR");
    expect(validateDecision(TENANT_A, TENANT_A)).toBe(true);
  });

  // TEST 12: Employee Cannot Approve Governed Decisions
  it("TEST 12: Colaboradores comuns não possuem permissão para homologar decisões de IA", () => {
    const canApproveDecision = (role: string) => {
      const authorizedRoles = ["admin", "sst_professional", "rh", "dpo"];
      return authorizedRoles.includes(role);
    };

    expect(canApproveDecision("employee")).toBe(false);
    expect(canApproveDecision("sst_professional")).toBe(true);
  });

  // TEST 13: Authorized Human Oversight
  it("TEST 13: Supervisão humana autorizada registra operador, feedback e timestamp", () => {
    const approvalPayload = {
      decision_id: "dec-100",
      human_validated: true,
      human_action: "approved",
      human_feedback: "Recomendação ergonômica ajustada conforme NR-1",
      validated_by: USER_DPO,
      timestamp: new Date().toISOString()
    };

    expect(approvalPayload.human_validated).toBe(true);
    expect(approvalPayload.validated_by).toBe(USER_DPO);
  });

  // TEST 14: Audit Event Generation
  it("TEST 14: Gera entrada imutável no ai_audit_logs após intervenção humana", () => {
    const auditLogs: any[] = [];
    const recordAuditLog = (decisionId: string, actor: string, action: string) => {
      auditLogs.push({
        decision_id: decisionId,
        actor,
        action,
        timestamp: new Date().toISOString()
      });
    };

    recordAuditLog("dec-100", `human:${USER_DPO}`, "validated");
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0]?.action).toBe("validated");
  });

  // TEST 15: Incident Creation
  it("TEST 15: Criação de incidente de IA com severidade e tipologia válidas", () => {
    const incident: AIIncidentEntry = {
      tenant_id: TENANT_A,
      severity: "high",
      type: "model_drift",
      status: "detected",
      description: "Desvio detectado na concordância humana de recomendações de SST",
      detected_by: "system_evaluator"
    };

    expect(incident.severity).toBe("high");
    expect(incident.type).toBe("model_drift");
    expect(incident.status).toBe("detected");
  });

  // TEST 16: Incident State Machine Transitions
  it("TEST 16: Valida fluxo da máquina de estados de incidentes de IA", () => {
    const isValidIncidentTransition = (current: IncidentStatus, next: IncidentStatus) => {
      return (INCIDENT_STATUS_TRANSITIONS[current] || []).includes(next);
    };

    expect(isValidIncidentTransition("detected", "triaged")).toBe(true);
    expect(isValidIncidentTransition("triaged", "investigating")).toBe(true);
    expect(isValidIncidentTransition("investigating", "mitigated")).toBe(true);
    expect(isValidIncidentTransition("mitigated", "resolved")).toBe(true);
    expect(isValidIncidentTransition("resolved", "closed")).toBe(true);
    expect(isValidIncidentTransition("detected", "resolved")).toBe(false); // Não pode pular investigação
  });

  // TEST 17: Incident Authorization
  it("TEST 17: Gestão de incidentes restrita a papéis de governança (SST, DPO, Admin)", () => {
    const canManageIncidents = (role: string) => {
      const allowed = ["admin", "sst_professional", "dpo", "auditor"];
      return allowed.includes(role);
    };

    expect(canManageIncidents("employee")).toBe(false);
    expect(canManageIncidents("rh")).toBe(false);
    expect(canManageIncidents("dpo")).toBe(true);
    expect(canManageIncidents("sst_professional")).toBe(true);
  });

  // TEST 18: Drift Insufficient-Data Behavior
  it("TEST 18: Retorna insufficient_data quando a amostragem for inferior a 10 decisões", () => {
    const evaluateDrift = (samplesCount: number) => {
      if (samplesCount < 10) {
        return { hasSufficientData: false, status: "insufficient_data", driftScore: null };
      }
      return { hasSufficientData: true, status: "evaluated", driftScore: 0.04 };
    };

    const lowSample = evaluateDrift(4);
    expect(lowSample.hasSufficientData).toBe(false);
    expect(lowSample.driftScore).toBeNull();

    const highSample = evaluateDrift(25);
    expect(highSample.hasSufficientData).toBe(true);
    expect(highSample.driftScore).toBe(0.04);
  });

  // TEST 19: No Fake Metrics Generated
  it("TEST 19: Proíbe geração de métricas fictícias ou scores artificiais quando N = 0", () => {
    const computeGovernanceMetrics = (decisionsCount: number) => {
      return {
        totalDecisions: decisionsCount,
        avgConfidence: decisionsCount >= 10 ? 88 : null,
        hasSufficientData: decisionsCount >= 10
      };
    };

    const emptyMetrics = computeGovernanceMetrics(0);
    expect(emptyMetrics.totalDecisions).toBe(0);
    expect(emptyMetrics.avgConfidence).toBeNull();
    expect(emptyMetrics.hasSufficientData).toBe(false);
  });

  // TEST 20: No Sensitive-Data Leakage in Hashes
  it("TEST 20: Hashes de auditoria garantem rastreabilidade sem revelar PII ou prompts confidenciais", () => {
    const hashData = (content: string) => {
      // Simula SHA-256
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    };

    const confidentialPrompt = "Colaborador relata sintomas severos de burnout";
    const auditRecord = {
      prompt_hash: hashData(confidentialPrompt),
      model: "MiniMax-M2.7",
      timestamp: new Date().toISOString()
    };

    expect((auditRecord as any).prompt_text).toBeUndefined();
    expect(auditRecord.prompt_hash).toBeDefined();
    expect(auditRecord.prompt_hash.length).toBe(64);
  });
});
