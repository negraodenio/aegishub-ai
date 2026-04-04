import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyAssessmentToken } from "@/utils/assessment-token";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing core token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { success, employeeId, tenantId } = await verifyAssessmentToken(token);

    if (!success || !employeeId || !tenantId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, audioData } = body;

    if (!sessionId || !audioData) {
      return NextResponse.json({ error: "Session ID and audio data are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Validate session ownership via RLS-enabled client
    const { data: session, error: sessionError } = await (supabase
      .from("assessment_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("employee_id", employeeId)
      .single() as any);

    if (sessionError || !session) {
       console.warn("[VOICE_PROCESS] Security rejection: Session does not belong to authorized worker", { sessionId, employeeId });
       return NextResponse.json({ error: "Access denied to this session" }, { status: 403 });
    }

    // 2. Simulated Clinical Processing (MindOps v1.2)
    const mockAnalyticResult = {
      prosody: "moderate_stress",
      latency: "normal",
      score: 0.65,
      metrics: {
        jitter: 0.015 + Math.random() * 0.01,
        shimmer: 0.25 + Math.random() * 0.1
      }
    };

    return NextResponse.json({
      success: true,
      analysis: mockAnalyticResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[VOICE_PROCESS_INTERNAL_ERROR]", error.message);
    return NextResponse.json({ 
      error: "Ocorreu um erro no processamento biométrico. O sistema continuará em modo de texto.",
      code: "VOICE_MIND_ERR_01" 
    }, { status: 500 });
  }
}
