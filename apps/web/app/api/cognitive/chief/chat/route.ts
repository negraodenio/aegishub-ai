import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getCognitiveUserProfile,
  getLlmUsageToday,
  recordLlmUsage,
  checkFeatureEntitlement,
  logCognitiveSupportEvent,
  resolveAuthorizedTenantContext,
  acquireLlmLease,
  searchCognitiveKnowledge
} from "@mindops/database";
import {
  LLMGuardSession,
  TwoPhaseAuditManager,
  resolveCorrelationId,
  CORRELATION_HEADER,
  CognitiveUnstuckEngine,
  createInitialSessionContext,
  OpenRouterProvider,
  EmbeddingProvider,
  DEFAULT_COGNITIVE_MODEL
} from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🤖 POST /api/cognitive/chief/chat
 * Assistente AI de Desbloqueio e Suporte Executivo no Trabalho (P5.2 Wave 2)
 * - Integração Real OpenRouter / Google Gemini 3 Flash (`google/gemini-3-flash-preview`)
 * - Integração Real RAG pgvector (`match_cognitive_knowledge_chunks`)
 * - Session-only (zero persistência de dados de pensamento para RH/Gestor)
 * - Blindagem PII / Prompt Injection / Anti-Diagnóstico / Cota Atômica
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
    const { tenantId: requestedTenantId, message, language = "pt", context: incomingContext } = body;

    // 1. Resolução Autoritativa de Tenant (Anti-IDOR)
    const authTenantContext = await resolveAuthorizedTenantContext(client as any, user.id, requestedTenantId);
    if (authTenantContext.error || !authTenantContext.tenantId) {
      return NextResponse.json(
        { error: authTenantContext.error || "UNAUTHORIZED_TENANT_CONTEXT" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }
    const tenantId = authTenantContext.tenantId;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "BAD_REQUEST: message é obrigatório" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 2. Entitlement Comercial ("cognitive_support")
    const entitlement = await checkFeatureEntitlement(client as any, tenantId, "cognitive_support");
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "FEATURE_NOT_ENTITLED" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 3. Consentimento Informado (RGPD / LGPD)
    const profile = await getCognitiveUserProfile(client as any, user.id);
    if (!profile || !profile.consent_given_at || profile.is_consent_revoked) {
      return NextResponse.json(
        { error: "CONSENT_REQUIRED: Consentimento informado necessário" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 4. LLM Guard (Lease Acquire + Detecção de PII + Cota de $0.25/dia)
    const guard = new LLMGuardSession();
    const currentUsage = await getLlmUsageToday(client as any, user.id);
    const acquireVerdict = await guard.acquire(
      {
        operation: "cognitive_chat",
        userId: user.id,
        tenantId,
        inputContent: message,
        estimatedInputTokens: 350,
        estimatedOutputTokens: 450
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

    // 5. RAG Real com pgvector: Geração de Embedding + Busca Semântica
    const embeddingProvider = new EmbeddingProvider();
    const embeddingRes = await embeddingProvider.generateEmbedding(message);
    const retrievedChunks = await searchCognitiveKnowledge(
      client as any,
      embeddingRes.embedding,
      {
        tenantId,
        barrier: incomingContext?.identifiedBarrier ?? null,
        language: String(language),
        limit: 3
      }
    );

    // 6. Integração Real OpenRouter / Google Gemini 3 Flash Preview
    const openrouter = new OpenRouterProvider({ defaultModel: DEFAULT_COGNITIVE_MODEL });
    const sessionContext = createInitialSessionContext(incomingContext || {});
    const unstuckEngine = new CognitiveUnstuckEngine();

    let actualInputTokens = 200;
    let actualOutputTokens = 250;
    let providerSuccess = true;

    const engineResult = await unstuckEngine.processTurn({
      userMessage: message,
      context: sessionContext,
      language: String(language),
      retrievedChunks,
      llmGenerator: async (systemPrompt: string, userPrompt: string) => {
        const response = await openrouter.generateChatCompletion({
          systemPrompt,
          userPrompt,
          model: DEFAULT_COGNITIVE_MODEL,
          maxTokens: 600,
          timeoutMs: 10000
        });

        if (response.success && response.content) {
          if (response.usage) {
            actualInputTokens = response.usage.promptTokens || actualInputTokens;
            actualOutputTokens = response.usage.completionTokens || actualOutputTokens;
          }
          providerSuccess = true;
          return response.content;
        }

        providerSuccess = false;
        throw new Error(response.error || "OPENROUTER_GENERATION_FAILED");
      }
    });

    const responseContent = engineResult.message;

    // 7. Reconciliação do Consumo Real de LLM
    const reconciled = guard.reconcile({
      leaseId: acquireVerdict.leaseId,
      userId: user.id,
      tenantId,
      actualInputTokens,
      actualOutputTokens,
      providerSucceeded: providerSuccess
    });

    await recordLlmUsage(
      client as any,
      user.id,
      tenantId,
      reconciled.actualTokens,
      reconciled.actualCostUsd,
      acquireVerdict.estimatedCostUsd
    );

    // 8. Telemetria e Auditoria Criptográfica com Model ID Real
    const latencyMs = Date.now() - startTime;
    const auditPayload = {
      operation: "cognitive_chat",
      feature: "cognitive_support",
      model: DEFAULT_COGNITIVE_MODEL, // google/gemini-3-flash-preview
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
        payloadHash: capability.payloadHash,
        fsmState: engineResult.updatedContext.conversationState,
        barrier: engineResult.updatedContext.identifiedBarrier,
        ragCount: retrievedChunks.length,
        model: DEFAULT_COGNITIVE_MODEL
      }
    });

    return NextResponse.json(
      {
        success: true,
        response: responseContent,
        context: engineResult.updatedContext,
        nextAction: engineResult.nextAction,
        suggestedTimerSeconds: engineResult.suggestedTimerSeconds,
        retrievedChunks: engineResult.retrievedChunkIds,
        disclaimer: engineResult.disclaimer,
        audit: {
          correlationId,
          payloadHash: capability.payloadHash,
          model: DEFAULT_COGNITIVE_MODEL
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
