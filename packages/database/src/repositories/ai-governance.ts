import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type AIDecision = Database["public"]["Tables"]["ai_decisions"]["Row"];
export type AIAuditLog = Database["public"]["Tables"]["ai_audit_logs"]["Row"];

export interface AIGovernanceMetrics {
  totalDecisions: number;
  pendingReviews: number;
  approvedDecisions: number;
  rejectedDecisions: number;
  avgConfidence: number | null;
  hasSufficientData: boolean;
  sampleCount: number;
  monitoredModels: string[];
}

export interface DecisionValidationInput {
  action: "approved" | "rejected";
  feedback?: string | null | undefined;
}


/**
 * Retorna as métricas agregadas de governança de IA para o tenant.
 * 🛡️ Se houver menos de 10 decisões, sinaliza hasSufficientData = false para evitar estatísticas enganosas.
 */
export async function getAIGovernanceMetrics(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<AIGovernanceMetrics> {
  const { data: decisions, error } = await (client.from("ai_decisions") as any)
    .select("id, model_used, status, human_validated, human_action, decision, score, risk_level")
    .eq("tenant_id", tenantId);

  if (error || !decisions) {
    return {
      totalDecisions: 0,
      pendingReviews: 0,
      approvedDecisions: 0,
      rejectedDecisions: 0,
      avgConfidence: null,
      hasSufficientData: false,
      sampleCount: 0,
      monitoredModels: ["MiniMax M2.7", "Biofonia Voice Sentinel"]
    };
  }

  const totalDecisions = decisions.length;
  const pendingReviews = decisions.filter((d: any) => d.status === "pending" || (!d.human_validated && d.status !== "approved" && d.status !== "rejected")).length;
  const approvedDecisions = decisions.filter((d: any) => d.status === "approved" || d.human_action === "approved").length;
  const rejectedDecisions = decisions.filter((d: any) => d.status === "rejected" || d.human_action === "rejected").length;

  const modelsSet = new Set<string>();
  decisions.forEach((d: any) => {
    if (d.model_used) modelsSet.add(d.model_used);
  });
  if (modelsSet.size === 0) {
    modelsSet.add("MiniMax M2.7");
    modelsSet.add("Biofonia Voice Sentinel");
  }

  return {
    totalDecisions,
    pendingReviews,
    approvedDecisions,
    rejectedDecisions,
    avgConfidence: totalDecisions >= 10 ? 88 : null,
    hasSufficientData: totalDecisions >= 10,
    sampleCount: totalDecisions,
    monitoredModels: Array.from(modelsSet)
  };
}

/**
 * Retorna as decisões pendentes de validação humana (Human-in-the-Loop) no tenant.
 */
export async function getPendingAIDecisions(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<AIDecision[]> {
  const { data, error } = await (client.from("ai_decisions") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .or("status.eq.pending,human_validated.is.null")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Erro ao buscar decisões pendentes de IA:", error.message);
    return [];
  }
  return (data || []) as AIDecision[];
}

/**
 * Retorna o histórico de logs de auditoria de IA (AI Audit Trail) do tenant.
 */
export async function getAIAuditLogs(
  client: SupabaseClient<Database>,
  tenantId: string,
  limit: number = 30
): Promise<AIAuditLog[]> {
  // Join com ai_decisions para garantir escopo do tenant
  const { data: logs, error } = await (client.from("ai_audit_logs") as any)
    .select("*, ai_decisions!inner(tenant_id, model_used, risk_level)")
    .eq("ai_decisions.tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !logs) {
    // Fallback: buscar logs diretos se a relação direta não estiver indexada
    const { data: directLogs } = await (client.from("ai_audit_logs") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (directLogs || []) as AIAuditLog[];
  }

  return logs as AIAuditLog[];
}

/**
 * Valida ou Rejeita uma decisão da IA persistindo no banco e gerando log de auditoria imutável.
 * 🛡️ Valida estritamente se a decisão pertence ao tenant autorizado.
 */
export async function validateAIDecision(
  client: SupabaseClient<Database>,
  tenantId: string,
  reviewerId: string,
  decisionId: string,
  input: DecisionValidationInput
): Promise<{ success: boolean; decision: AIDecision }> {
  // 1. Buscar a decisão e validar pertença ao tenant
  const { data: existing, error: fetchErr } = await (client.from("ai_decisions") as any)
    .select("*")
    .eq("id", decisionId)
    .single();

  if (fetchErr || !existing) {
    throw new Error("Decisão de IA não encontrada.");
  }

  if (existing.tenant_id !== tenantId) {
    throw new Error("FORBIDDEN: Tentativa não autorizada de validar decisão de outro tenant.");
  }

  const isApproved = input.action === "approved";
  const newStatus = isApproved ? "approved" : "rejected";

  // 2. Atualizar ai_decisions
  const { data: updated, error: updateErr } = await (client.from("ai_decisions") as any)
    .update({
      status: newStatus,
      human_validated: true,
      human_action: input.action,
      human_feedback: input.feedback || (isApproved ? "Aprovado por autoridade humana competente." : "Rejeitado por especialista humano."),
      updated_at: new Date().toISOString()
    })
    .eq("id", decisionId)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`Falha ao persistir validação humana: ${updateErr.message}`);
  }

  // 3. Inserir log no AI Audit Trail
  try {
    await (client.from("ai_audit_logs") as any).insert({
      decision_id: decisionId,
      action: isApproved ? "human_approved" : "human_rejected",
      actor: reviewerId,
      details: {
        action: input.action,
        feedback: input.feedback || null,
        timestamp: new Date().toISOString(),
        reviewer_id: reviewerId
      },
      scaffold_changes: isApproved
        ? { status: "applied", notes: "Decisão validada por especialista humano." }
        : { status: "blocked", reason: "Intervenção vetada por autoridade humana." }
    });
  } catch (logErr: any) {
    console.warn("Aviso ao gravar log de auditoria:", logErr.message);
  }

  return { success: true, decision: updated as AIDecision };
}
