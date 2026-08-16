import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  endCognitiveFocusSession,
  logCognitiveSupportEvent
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * ⏱️ POST /api/cognitive/focus/end
 * Encerra uma sessão de foco cognitivo
 * - Valida ownership via auth.uid() = user_id
 * - Deriva tenantId exclusivamente a partir da sessão persistida (SEC-03)
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
    const { sessionId, durationActualSeconds, completed } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "BAD_REQUEST: sessionId é obrigatório" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const session = await endCognitiveFocusSession(client as any, {
      userId: user.id,
      sessionId,
      durationActualSeconds: Math.max(0, Number(durationActualSeconds) || 0),
      completed: Boolean(completed)
    });

    if (!session) {
      return NextResponse.json(
        { error: "NOT_FOUND: Sessão não encontrada ou não pertence ao usuário" },
        { status: 404, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    // Telemetria funcional usando o tenantId persistido autoritativo da própria sessão
    const persistedTenantId = (session as any).tenant_id || (session as any).tenantId;
    if (persistedTenantId) {
      await logCognitiveSupportEvent(client as any, {
        userId: user.id,
        tenantId: persistedTenantId,
        eventType: completed ? "focus_completed" : "focus_abandoned",
        context: {
          sessionId,
          durationActualSeconds: session.duration_actual_seconds
        }
      });
    }

    return NextResponse.json(
      { success: true, session },
      { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}
