import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCognitiveWeeklyStats ,  resolveAuthorizedTenantContext,
  acquireLlmLease
,
  checkFeatureEntitlement
,
  getCognitiveUserProfile
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 📈 GET /api/cognitive/stats/weekly
 * Métricas de progresso cognitivo semanal (Semana Atual vs Semana Anterior)
 * - Restrito exclusivamente aos dados do próprio colaborador
 * - RH e gestores nunca têm acesso a estes dados individuais
 */
export async function GET(req: NextRequest) {
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

    const stats = await getCognitiveWeeklyStats(client as any, user.id);

    return NextResponse.json(
      {
        success: true,
        stats
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

