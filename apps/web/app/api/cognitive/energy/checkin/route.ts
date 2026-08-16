import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  logCognitiveSupportEvent,
  getCognitiveUserProfile,
  upsertCognitiveUserProfile
,  resolveAuthorizedTenantContext,
  acquireLlmLease
,
  checkFeatureEntitlement
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🔋 POST /api/cognitive/energy/checkin
 * Registro do check-in de nível de energia funcional (escala 1 a 10)
 * - Restrito a valores de 1 a 10
 * - Não diagnóstico / auto-avaliação pessoal
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
    const { tenantId: requestedTenantId, energyLevel } = body;

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

    const parsedLevel = Number(energyLevel);
    if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 10) {
      return NextResponse.json(
        { error: "BAD_REQUEST: energyLevel deve ser um número inteiro entre 1 e 10" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // 1. Gravar evento de telemetria funcional
    await logCognitiveSupportEvent(client as any, {
      userId: user.id,
      tenantId,
      eventType: "energy_checkin",
      context: {
        energyLevel: parsedLevel,
        correlationId
      }
    });

    // 2. Atualizar perfil com o último nível de energia registrado
    const profile = await getCognitiveUserProfile(client as any, user.id);
    if (profile) {
      await upsertCognitiveUserProfile(client as any, {
        user_id: user.id,
        tenant_id: tenantId,
        preferences: {
          ...profile.preferences,
          lastEnergyLevel: parsedLevel,
          lastEnergyCheckinAt: new Date().toISOString()
        } as any
      });
    }

    return NextResponse.json(
      {
        success: true,
        energyLevel: parsedLevel,
        recordedAt: new Date().toISOString()
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

