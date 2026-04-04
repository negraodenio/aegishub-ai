import { createClient } from "@supabase/supabase-js";
import { Database } from "@mindops/database";
import { MiniMaxSimulator } from "./m27-simulator";

type AppSupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Executes the Human-in-The-Loop explicit validation flow
 * Critical for autonomous system safety and AI Act compliance
 */
export async function validateDecision(
  supabase: AppSupabaseClient,
  decisionId: string,
  action: "approve" | "reject",
  reviewerId: string
) {
  // 1. Fetch the pending autonomous decision
  const { data: decision, error } = await supabase
    .from("ai_decisions")
    .select("*")
    .eq("id", decisionId)
    .single();

  if (error || !decision) {
    throw new Error("Decision not found or could not be loaded for validation.");
  }

  // 2. Load context into simulator/buffer
  const mm = new MiniMaxSimulator({ memory: decision.memory_updates || {} });

  if (action === "approve") {
    // Mark as approved (could trigger webhook to patch real configs)
    await supabase.from("ai_decisions").update({ status: "approved" }).eq("id", decisionId);
    
    // Log approval
    await supabase.from("ai_audit_logs").insert({
      decision_id: decisionId,
      action: "human_approved",
      actor: reviewerId,
      new_memory: decision.memory_updates,
      scaffold_changes: { notes: "Approval confirmed by human authority. Proceeding with scaffold auto-fix." }
    });
  } else {
    // If rejected, inject rejection feedback loop into M2.7 memory
    // so it doesn't try the same adjustment again
    mm.memory.notes = `${mm.memory.notes || ""} [REJECTED BY HUMAN ${reviewerId}. DO NOT REAPPLY.]`;
    mm.memory.loop_detection = true; // flag loop
    
    await supabase.from("ai_decisions").update({ 
      status: "rejected",
      memory_updates: mm.memory
    }).eq("id", decisionId);

    // Write audit correction
    await supabase.from("ai_audit_logs").insert({
      decision_id: decisionId,
      action: "human_rejected",
      actor: reviewerId,
      old_memory: decision.memory_updates,
      new_memory: mm.memory,
      scaffold_changes: { reason: "Reverted and penalized due to human expert rejection. Patch engine bypassed." }
    });
  }

  return { 
    success: true, 
    newStatus: action === "approve" ? "approved" : "rejected",
    decisionId 
  };
}
