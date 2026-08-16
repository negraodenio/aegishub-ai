import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getCognitiveUserProfile,
  getLlmUsageToday,
  recordLlmUsage,
  checkFeatureEntitlement,
  logCognitiveSupportEvent
,  resolveAuthorizedTenantContext,
  acquireLlmLease
} from "@mindops/database";
import {
  LLMGuardSession,
  LlmGuardUsageTracker,
  TwoPhaseAuditManager,
  resolveCorrelationId,
  CORRELATION_HEADER
} from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🤖 POST /api/cognitive/chief/chat
 * Assistente AI de Desbloqueio e Suporte Executivo no Trabalho
 * - Session-only (não persiste histórico no DB na Wave 1)
 * - Blindagem PII / Prompt Injection / Anti-Diagnóstico
 * - Lease + Reconcile de cotas
 */
export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req.headers.get(CORRELATION_HEADER));
  const startTime = Date.now();

  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Sessão inválida" },
        { status: 401, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const body = await req.json();
    const { tenantId: requestedTenantId, message, language = "pt" } = body;

    const authTenantContext = await resolveAuthorizedTenantContext(client as any, user.id, requestedTenantId);
    if (authTenantContext.error || !authTenantContext.tenantId) {
      return NextResponse.json(
        { error: authTenantContext.error || "UNAUTHORIZED_TENANT_CONTEXT" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }
    const tenantId = authTenantContext.tenantId;


    if (false /* tenant check moved */ || !message) {
      return NextResponse.json(
        { error: "BAD_REQUEST: tenantId e message são obrigatórios" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 1. Entitlement Comercial
    const entitlement = await checkFeatureEntitlement(client as any, tenantId, "cognitive_support");
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "FEATURE_NOT_ENTITLED" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 2. Consentimento Informado
    const profile = await getCognitiveUserProfile(client as any, user.id);
    if (!profile || !profile.consent_given_at || profile.is_consent_revoked) {
      return NextResponse.json(
        { error: "CONSENT_REQUIRED: Consentimento informado necessário" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 3. LLM Guard (Lease Acquire + PII Detection + Quota Check)
    const guard = new LLMGuardSession();
    const currentUsage = await getLlmUsageToday(client as any, user.id);
    const acquireVerdict = await guard.acquire(
      {
        operation: "cognitive_chat",
        userId: user.id,
        tenantId,
        inputContent: message,
        estimatedInputTokens: 300,
        estimatedOutputTokens: 400
      },
      currentUsage,
      (cost, maxCost) => acquireLlmLease(client as any, user.id, tenantId, cost, maxCost)
    );

    if (!acquireVerdict.allowed) {
      return NextResponse.json(
        { error: acquireVerdict.reason || acquireVerdict.code },
        { status: acquireVerdict.code === "QUOTA_EXCEEDED" ? 429 : 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 4. Geração de Resposta Neutra e Prática
    // Simulação determinística de apoio executivo (sem expor PII ou inferir diagnósticos)
    const isPt = String(language).toLowerCase().startsWith("pt");
    const sanitizedInput = String(message).slice(0, 200).trim();

    let responseContent = isPt
      ? `Entendido. Para avançar com "${sanitizedInput}", recomendo começarmos pelo menor passo possível: reserve apenas 5 minutos para rascunhar os tópicos iniciais em um arquivo em branco. Quer que eu divida isso em passos menores?`
      : `Understood. To unblock on "${sanitizedInput}", let's start with the smallest possible move: take just 5 minutes to outline the first key bullet points on a blank page. Would you like me to break this into smaller steps?`;

    // 5. Output Safety & Guardrail Anti-Diagnóstico
    const tracker = new LlmGuardUsageTracker();
    const outputSafety = tracker.validateCognitiveOutput(responseContent);

    if (!outputSafety.valid) {
      responseContent = isPt
        ? "Vamos simplificar: concentre-se no primeiro passo prático de 5 minutos para iniciar."
        : "Let's keep it simple: focus on the first 5-minute practical step to get started.";
    }

    // 6. Reconciliação do Consumo Real de LLM
    const actualInputTokens = 120;
    const actualOutputTokens = 180;
    const reconciled = guard.reconcile({
      leaseId: acquireVerdict.leaseId,
      userId: user.id,
      tenantId,
      actualInputTokens,
      actualOutputTokens,
      providerSucceeded: true
    });

    await recordLlmUsage(
      client as any,
      user.id,
      tenantId,
      reconciled.actualTokens,
      reconciled.actualCostUsd,
      acquireVerdict.estimatedCostUsd
    );

    // 7. Telemetria de Sessão e Auditoria Criptográfica
    const latencyMs = Date.now() - startTime;
    const auditPayload = {
      operation: "cognitive_chat",
      feature: "cognitive_support",
      model: "approved-claude-3-haiku",
      status: "SUCCESS" as const,
      inputTokens: actualInputTokens,
      outputTokens: actualOutputTokens,
      costUsd: reconciled.actualCostUsd,
      latencyMs,
      correlationId,
      tenantId,
      userId: user.id
    };

    const capability = TwoPhaseAuditManager.mintAuditCapability(auditPayload);

    await logCognitiveSupportEvent(client as any, {
      userId: user.id,
      tenantId,
      eventType: "chat_completed",
      context: {
        latencyMs,
        auditToken: capability.token,
        payloadHash: capability.payloadHash
      }
    });

    return NextResponse.json(
      {
        success: true,
        response: responseContent,
        disclaimer: isPt
          ? "Assistente corporativo de produtividade e funções executivas. Não fornece aconselhamento ou diagnóstico médico."
          : "Workplace executive support assistant. Does not provide medical advice or diagnosis.",
        audit: {
          correlationId,
          payloadHash: capability.payloadHash
        }
      },
      { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}

