import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MiniMaxSimulator, runSelfOptimization } from "@mindops/domain";

/**
 * RH Pilot (MiniMax M2.7 Auto-Optimization)
 * Route: GET /api/rh-pilot
 * Acionado por cron jobs (ou cliente manual no Dashboard)
 */
export async function GET(request: Request) {
  try {
    // 🛡️ SECURITY: Authorization Check (Audit Fix #1)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || request.headers.get("Authorization")?.replace("Bearer ", "");
    const secret = process.env.CRON_SECRET || "fallback_debug_secret_dont_use_in_prod";

    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized access detected." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Infrastructure Configuration Failure." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1️⃣ Buscar últimas avaliações que não têm recomendação estruturada
    const { data: decisions, error } = await supabase
      .from("ai_decisions")
      .select("*")
      .is("recommendation", null)
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) throw error;

    if (!decisions || decisions.length === 0) {
      // Mesmo sem dados novos, vamos otimizar os antigos para não secar o Pilot.
      await runSelfOptimization(supabase);
      return NextResponse.json({ status: "No pending decisions to process. Optimized loops." });
    }

    // 2️⃣ Processar as decisões nuas com o Simulador M2.7
    for (const d of decisions) {
      const mm = new MiniMaxSimulator({
        context: d.reasons,
        memory: d.memory_updates || {},
      });

      const recommendation = await mm.runTask("generateRecommendation", { riskLevel: d.risk_level });

      // 3️⃣ Atualizar e injetar AI Act Protocol Logs
      await supabase.from("ai_decisions").update({ recommendation }).eq("id", d.id);
      
      await supabase.from("ai_audit_logs").insert({
        decision_id: d.id,
        action: "recommendation_generated",
        actor: "m2.7_loop",
        old_memory: d.memory_updates,
        new_memory: mm.memory,
        scaffold_changes: {}, // Na recomendação não há 'drift' nativo, é apenas no self-optimize.
      });
    }

    // 4️⃣ Terminar a limpeza rodando o `selfOptimize` propriamente dito sobre histórico
    await runSelfOptimization(supabase);

    return NextResponse.json({ status: "Pilot RH executed.", count: decisions.length });

  } catch (err: any) {
    console.error("[RH_PILOT ERROR]", err);
    // 🛡️ SECURITY: Sanitize error (Audit Fix #2)
    return NextResponse.json({ error: "Internal Process Optimization Failure" }, { status: 500 });
  }
}
