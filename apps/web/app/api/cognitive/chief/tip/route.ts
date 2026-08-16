import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  CognitiveTipManager,
  resolveCorrelationId,
  CORRELATION_HEADER
} from "@mindops/ai-core";

export const dynamic = "force-dynamic";

const tipManager = new CognitiveTipManager(24);

/**
 * 💡 GET /api/cognitive/chief/tip
 * Dica diária de produtividade e apoio executivo com cache de 24h
 * - Zero PII no cache
 * - Prompts e conteúdo 100% neutros e não clínicos
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

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("lang") || "pt";
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!forceRefresh) {
      const cached = tipManager.getCachedTip(language);
      if (cached) {
        return NextResponse.json(
          {
            success: true,
            tip: cached,
            cached: true
          },
          { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
        );
      }
    }

    // Gerar nova dica através de fallback seguro e neutro
    const freshTip = tipManager.getFallbackTip(language);
    tipManager.setCachedTip(freshTip, language);

    return NextResponse.json(
      {
        success: true,
        tip: freshTip,
        cached: false
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
