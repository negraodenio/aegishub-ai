import { NextRequest, NextResponse } from "next/server";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🩺 GET /api/health
 * Liveness probe indicando se a instância da aplicação está viva e respondendo.
 */
export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req.headers.get(CORRELATION_HEADER));

  return NextResponse.json(
    {
      status: "ok",
      service: "aegishub-web",
      timestamp: new Date().toISOString(),
      correlationId
    },
    {
      status: 200,
      headers: {
        [CORRELATION_HEADER]: correlationId,
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    }
  );
}
