import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { pingCognitiveFocusSession } from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * ⏱️ POST /api/cognitive/focus/ping
 * Keep-alive e atualização de progresso de sessão em execução
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
    const { sessionId, durationActualSeconds } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "BAD_REQUEST: sessionId é obrigatório" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const success = await pingCognitiveFocusSession(client as any, {
      userId: user.id,
      sessionId,
      durationActualSeconds: Math.max(0, Number(durationActualSeconds) || 0)
    });

    return NextResponse.json(
      { success },
      { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}
