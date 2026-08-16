import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveCorrelationId, CORRELATION_HEADER, logger } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🚦 GET /api/ready
 * Readiness probe validando se as dependências críticas (ex: banco de dados Supabase) estão acessíveis.
 */
export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req.headers.get(CORRELATION_HEADER));
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Consulta ultraleve de checagem de integridade de conectividade
    const { error: dbError } = await (supabase
      .from("tenants")
      .select("id")
      .limit(1) as any);

    if (dbError) {
      logger.error("Readiness check falhou na conectividade com o banco", {
        correlationId,
        route: "/api/ready",
        status: 503,
        errorCode: "DATABASE_UNAVAILABLE"
      });

      return NextResponse.json(
        {
          status: "unavailable",
          checks: {
            database: "unreachable"
          },
          timestamp: new Date().toISOString(),
          correlationId
        },
        {
          status: 503,
          headers: {
            [CORRELATION_HEADER]: correlationId,
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        }
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ready",
        checks: {
          database: "ok"
        },
        latencyMs: durationMs,
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
  } catch (err: any) {
    logger.error("Exceção não tratada no readiness probe", {
      correlationId,
      route: "/api/ready",
      status: 503,
      errorCode: "INTERNAL_READY_CHECK_FAIL"
    });

    return NextResponse.json(
      {
        status: "unavailable",
        checks: {
          database: "error"
        },
        timestamp: new Date().toISOString(),
        correlationId
      },
      {
        status: 503,
        headers: {
          [CORRELATION_HEADER]: correlationId
        }
      }
    );
  }
}
