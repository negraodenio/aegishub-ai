import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  startCognitiveFocusSession,
  getCognitiveUserProfile,
  checkFeatureEntitlement
,  resolveAuthorizedTenantContext,
  acquireLlmLease
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * ⏱️ POST /api/cognitive/focus/start
 * Inicia uma sessão de foco cognitivo
 * - auth.uid() enforced server-side
 * - Valida consentimento e plano comercial
 */
export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req.headers.get(CORRELATION_HEADER));
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
    const { tenantId: requestedTenantId, goal, durationPresetSeconds, energyLevelBefore } = body;

    const authTenantContext = await resolveAuthorizedTenantContext(client as any, user.id, requestedTenantId);
    if (authTenantContext.error || !authTenantContext.tenantId) {
      return NextResponse.json(
        { error: authTenantContext.error || "UNAUTHORIZED_TENANT_CONTEXT" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }
    const tenantId = authTenantContext.tenantId;


    if (false /* tenant check moved */) {
      return NextResponse.json(
        { error: "BAD_REQUEST: tenantId é obrigatório" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 1. Verificar entitlement comercial
    const entitlement = await checkFeatureEntitlement(client as any, tenantId, "cognitive_support");
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "FEATURE_NOT_ENTITLED" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 2. Verificar consentimento informado
    const profile = await getCognitiveUserProfile(client as any, user.id);
    if (!profile || !profile.consent_given_at || profile.is_consent_revoked) {
      return NextResponse.json(
        { error: "CONSENT_REQUIRED: Consentimento informado necessário" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 3. Iniciar sessão
    const session = await startCognitiveFocusSession(client as any, {
      userId: user.id,
      tenantId,
      goal: goal ? String(goal).slice(0, 200) : undefined,
      durationPresetSeconds: Number(durationPresetSeconds) || 1500,
      energyLevelBefore: energyLevelBefore ? Math.min(10, Math.max(1, Number(energyLevelBefore))) : undefined
    });

    if (!session) {
      return NextResponse.json(
        { error: "INTERNAL_ERROR: Falha ao iniciar sessão de foco" },
        { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    return NextResponse.json(
      { success: true, session },
      { status: 201, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}

