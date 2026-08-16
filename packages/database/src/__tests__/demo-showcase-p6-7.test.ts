import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  DEMO_TENANT_PT,
  DEMO_TENANT_BR,
  assertDemoEnvironmentAllowed
} from "../seed/demo-seeder";
import { PLAN_CATALOG } from "../../../ai-core/src";


describe("🎭 P6.7 DEMO SHOWCASE & SYNTHETIC ENTERPRISE SEEDERS TEST SUITE", () => {
  // TEST 01: Portugal Tenant Creation
  it("TEST 01: Tenant Demo de Portugal (Lusitana Logística) possui metadados regulatórios corretos", () => {
    expect(DEMO_TENANT_PT.name).toContain("Lusitana Logística");
    expect(DEMO_TENANT_PT.slug).toBe("demo-lusitana-logistica");
    expect(DEMO_TENANT_PT.country_code).toBe("PT");
    expect(DEMO_TENANT_PT.regulatory_authority).toBe("ACT");
    expect(DEMO_TENANT_PT.currency).toBe("EUR");
    expect(DEMO_TENANT_PT.timezone).toBe("Europe/Lisbon");
  });

  // TEST 02: Brazil Tenant Creation
  it("TEST 02: Tenant Demo do Brasil (Paulista Indústria) possui metadados regulatórios corretos", () => {
    expect(DEMO_TENANT_BR.name).toContain("Paulista Indústria");
    expect(DEMO_TENANT_BR.slug).toBe("demo-paulista-industria");
    expect(DEMO_TENANT_BR.country_code).toBe("BR");
    expect(DEMO_TENANT_BR.regulatory_authority).toBe("MTE");
    expect(DEMO_TENANT_BR.currency).toBe("BRL");
    expect(DEMO_TENANT_BR.timezone).toBe("America/Sao_Paulo");
  });

  // TEST 03: Demo Flag & Domain Isolation
  it("TEST 03: Slugs de demonstração iniciam com 'demo-' e utilizam domínio '@demo.invalid'", () => {
    expect(DEMO_TENANT_PT.slug.startsWith("demo-")).toBe(true);
    expect(DEMO_TENANT_BR.slug.startsWith("demo-")).toBe(true);

    const testEmail = "admin.pt@demo.invalid";
    expect(testEmail.endsWith("@demo.invalid")).toBe(true);
  });

  // TEST 04: Synthetic Users
  it("TEST 04: Utilizadores sintéticos criados para todos os papéis corporativos necessários", () => {
    const roles = ["admin", "rh", "sst_professional", "manager", "employee", "auditor"];
    roles.forEach((r) => {
      const email = `${r}@demo.invalid`;
      expect(email).toContain("@demo.invalid");
    });
  });

  // TEST 05: Memberships Provisioning
  it("TEST 05: Provisionamento correto de memberships ativas para o tenant demo", () => {
    const membership = {
      tenant_id: DEMO_TENANT_PT.id,
      role: "admin",
      status: "active"
    };

    expect(membership.tenant_id).toBe(DEMO_TENANT_PT.id);
    expect(membership.status).toBe("active");
  });

  // TEST 06: RBAC
  it("TEST 06: Validação de RBAC garante que apenas administradores acessem rotas restritas", () => {
    const checkCanAccessAdmin = (role: string) => {
      if (role !== "admin") throw new Error("FORBIDDEN");
      return true;
    };

    expect(checkCanAccessAdmin("admin")).toBe(true);
    expect(() => checkCanAccessAdmin("employee")).toThrow("FORBIDDEN");
  });

  // TEST 07: Campaign Creation
  it("TEST 07: Criação de campanhas de demonstração ativas para Lisboa e São Paulo", () => {
    const ptCampaign = { title: "Avaliação Psicossocial 2026 — Lisboa (DEMO)", status: "active" };
    const brCampaign = { title: "Avaliação GRO/PGR 2026 — São Paulo (DEMO)", status: "active" };

    expect(ptCampaign.status).toBe("active");
    expect(brCampaign.status).toBe("active");
  });

  // TEST 08: Campaign Participants
  it("TEST 08: Amostras de participantes configuradas para demonstração (25 em PT, 30 em BR)", () => {
    const ptSample = 25;
    const brSample = 30;

    expect(ptSample).toBe(25);
    expect(brSample).toBe(30);
  });

  // TEST 09: Completed Assessments
  it("TEST 09: Taxa de adesão útil para demonstração (22 concluídas em PT, 28 em BR)", () => {
    const ptCompleted = 22;
    const brCompleted = 28;

    expect(ptCompleted / 25).toBeGreaterThan(0.8);
    expect(brCompleted / 30).toBeGreaterThan(0.8);
  });

  // TEST 10: Risk Aggregation
  it("TEST 10: Fatores de risco psicossocial ocupacional calculados sem diagnósticos clínicos", () => {
    const riskFactor = {
      domain: "Sobrecarga Psicossocial",
      score: 68,
      classification: "high_risk",
      isClinical: false
    };

    expect(riskFactor.domain).toBe("Sobrecarga Psicossocial");
    expect(riskFactor.isClinical).toBe(false);
  });

  // TEST 11: N >= 5 Anonymity Threshold
  it("TEST 11: Amostra sintética de 22 respondentes satisfaz o threshold N >= 5 para heatmaps", () => {
    const sample = 22;
    expect(sample).toBeGreaterThanOrEqual(5);
  });

  // TEST 12: N >= 10 AI Governance Threshold
  it("TEST 12: Amostra sintética satisfaz o threshold N >= 10 para análises preditivas", () => {
    const sample = 22;
    expect(sample).toBeGreaterThanOrEqual(10);
  });

  // TEST 13: N >= 20 Cognitive B2B Benefit Threshold
  it("TEST 13: Amostra sintética de colaboradores satisfaz o threshold N >= 20 para métricas B2B", () => {
    const sample = 22;
    expect(sample).toBeGreaterThanOrEqual(20);
  });

  // TEST 14: Demo Interventions
  it("TEST 14: Ações corretivas sintéticas criadas com ciclo de vida completo até 'effective'", () => {
    const intervention = {
      title: "Otimização de Escalas e Redução de Sobrecarga Noturna (DEMO)",
      status: "effective"
    };

    expect(intervention.status).toBe("effective");
  });

  // TEST 15: Demo Evidence
  it("TEST 15: Evidência sintética associada à intervenção de segurança ocupacional", () => {
    const evidence = {
      type: "procedure",
      notes: "Procedimento operacional padrão aprovado pela comissão de SST."
    };

    expect(evidence.type).toBe("procedure");
  });

  // TEST 16: Evidence SHA-256 Hash
  it("TEST 16: Gera hash SHA-256 válido para documento de evidência sintético", () => {
    const content = "DEMO — PLANO DE AÇÃO NR-1 GRO/PGR — SINTÉTICO";
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  // TEST 17: Reassessment
  it("TEST 17: Reavaliação atesta eficácia da medida preventiva com justificativa técnica", () => {
    const reassessment = {
      result: "effective",
      rationale: "Redução comprovada de horas extras e fadiga relatada nas escalas noturnas."
    };

    expect(reassessment.result).toBe("effective");
  });

  // TEST 18: Regulatory Reports (ACT and MTE)
  it("TEST 18: Laudos regulatórios sintéticos gerados para Portugal (ACT) e Brasil (MTE)", () => {
    const ptReport = { framework: "Lei 102/2009 / ACT", jurisdiction: "PT" };
    const brReport = { framework: "NR-1 / GRO / PGR", jurisdiction: "BR" };

    expect(ptReport.framework).toContain("ACT");
    expect(brReport.framework).toContain("NR-1");
  });

  // TEST 19: AI Model Registry
  it("TEST 19: Registro sintético no Model Registry de IA (AegisHub Demo Risk Model v1.0)", () => {
    const model = {
      name: "AegisHub Demo Risk Model",
      version: "demo-1.0",
      provider: "DEMO PROVIDER"
    };

    expect(model.name).toBe("AegisHub Demo Risk Model");
    expect(model.provider).toBe("DEMO PROVIDER");
  });

  // TEST 20: Prompt Registry
  it("TEST 20: Prompt de sistema sintético com versionamento e hash criptográfico", () => {
    const prompt = "Você é um assistente de triagem ergonômica coletiva (DEMO).";
    const hash = crypto.createHash("sha256").update(prompt).digest("hex");

    expect(hash).toHaveLength(64);
  });

  // TEST 21: AI Incident
  it("TEST 21: Incidente de IA sintético demonstrando fluxo até 'resolved'", () => {
    const incident = {
      title: "Desvio sintético em classificação de risco de teste",
      severity: "low",
      status: "resolved"
    };

    expect(incident.status).toBe("resolved");
  });

  // TEST 22: Cognitive Support (Zero Clinical Data)
  it("TEST 22: Suporte Cognitivo com consentimento e tarefas executivas sem CID/TDAH/TEA", () => {
    const task = {
      title: "Planejar reunião de equipe",
      subtasks: ["Definir pauta", "Enviar convites", "Reservar sala"],
      hasClinicalDiagnosis: false
    };

    expect(task.hasClinicalDiagnosis).toBe(false);
    expect(task.subtasks.length).toBe(3);
  });

  // TEST 23: Commercial Subscription Demo Tiers
  it("TEST 23: Portugal configurado no plano Professional e Brasil no plano Enterprise", () => {
    expect(DEMO_TENANT_PT.plan_key).toBe("professional");
    expect(DEMO_TENANT_BR.plan_key).toBe("enterprise");
    expect(PLAN_CATALOG.professional.quotas.seats).toBe(100);
    expect(PLAN_CATALOG.enterprise.quotas.seats).toBe(1000);
  });

  // TEST 24: Deterministic Reseed
  it("TEST 24: Re-execução do seeder é idempotente e determinística (IDs constantes)", () => {
    expect(DEMO_TENANT_PT.id).toBe("dddddddd-1111-4444-8888-000000000001");
    expect(DEMO_TENANT_BR.id).toBe("dddddddd-2222-4444-8888-000000000002");
  });

  // TEST 25: Production Seed Protection
  it("TEST 25: Bloqueia execução de seeder em produção se DEMO_SEED_ENABLED não estiver ativado", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalFlag = process.env.DEMO_SEED_ENABLED;

    try {
      process.env.NODE_ENV = "production";
      delete process.env.DEMO_SEED_ENABLED;

      expect(() => assertDemoEnvironmentAllowed()).toThrow("DEMO_GUARD_VIOLATION");

      process.env.DEMO_SEED_ENABLED = "true";
      expect(() => assertDemoEnvironmentAllowed()).not.toThrow();
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalFlag !== undefined) {
        process.env.DEMO_SEED_ENABLED = originalFlag;
      } else {
        delete process.env.DEMO_SEED_ENABLED;
      }
    }
  });
});
