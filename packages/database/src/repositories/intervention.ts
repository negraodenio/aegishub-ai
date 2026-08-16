import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type CorrectiveAction = Database["public"]["Tables"]["corrective_actions"]["Row"];
export type ActionEvidence = Database["public"]["Tables"]["action_evidence"]["Row"];
export type ActionAuditLog = Database["public"]["Tables"]["action_audit_logs"]["Row"];

export type InterventionStatus =
  | "identified"
  | "planned"
  | "in_progress"
  | "evidence_pending"
  | "reassessment_pending"
  | "effective"
  | "ineffective"
  | "closed"
  | "overdue"
  | "cancelled";

export type EffectivenessRating =
  | "effective"
  | "partially_effective"
  | "ineffective"
  | "not_assessed";

export interface CreateInterventionInput {
  campaignId?: string | null | undefined;
  title: string;
  description?: string | null | undefined;
  hazardFactor: string;
  processActivity?: string | null | undefined;
  priority: "low" | "medium" | "high" | "critical";
  responsibleName?: string | null | undefined;
  assignedTo?: string | null | undefined;
  dueDate: string;
}


export interface AddEvidenceInput {
  evidenceType: "document" | "policy" | "procedure" | "training_record" | "meeting_minutes" | "work_schedule" | "ergonomic_assessment" | "photo" | "other";
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  fileHash?: string | null;
  campaignId?: string | null;
}

export interface RecordReassessmentInput {
  effectivenessRating: EffectivenessRating;
  effectivenessScore?: number | null;
  rationale: string;
  reassessmentCampaignId?: string | null;
}

export interface InterventionKPIMetrics {
  totalInterventions: number;
  openCount: number;
  inProgressCount: number;
  evidencePendingCount: number;
  reassessmentPendingCount: number;
  effectiveCount: number;
  ineffectiveCount: number;
  overdueCount: number;
  closedCount: number;
  completionRate: number | null;
  hasSufficientData: boolean;
}

// 🛡️ Máquina de Estados da Intervenção
const VALID_INTERVENTION_TRANSITIONS: Record<string, string[]> = {
  identified: ["planned", "in_progress", "cancelled"],
  planned: ["in_progress", "cancelled"],
  in_progress: ["evidence_pending", "reassessment_pending", "overdue", "cancelled"],
  evidence_pending: ["reassessment_pending", "in_progress", "overdue", "cancelled"],
  reassessment_pending: ["effective", "ineffective", "in_progress", "overdue"],
  effective: ["closed", "planned"],
  ineffective: ["planned", "in_progress", "closed"],
  overdue: ["in_progress", "evidence_pending", "reassessment_pending", "closed", "cancelled"],
  closed: ["planned"], // Permite reabertura planejada
  cancelled: ["planned"]
};

/**
 * Valida a transição de estado da intervenção.
 */
export function isValidInterventionTransition(currentStatus: string, nextStatus: string): boolean {
  const allowed = VALID_INTERVENTION_TRANSITIONS[currentStatus.toLowerCase()] || [];
  return allowed.includes(nextStatus.toLowerCase());
}

/**
 * Cria uma nova intervenção preventiva/corretiva vinculada a um fator de risco e organização.
 */
export async function createIntervention(
  client: SupabaseClient<Database>,
  tenantId: string,
  actorId: string,
  input: CreateInterventionInput
): Promise<CorrectiveAction> {
  const { data, error } = await (client.from("corrective_actions") as any)
    .insert({
      tenant_id: tenantId,
      campaign_id: input.campaignId || null,
      title: input.title,
      description: input.description || null,
      hazard_factor: input.hazardFactor,
      process_activity: input.processActivity || "Geral",
      priority: input.priority,
      responsible_name: input.responsibleName || "Técnico de SST",
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate,
      status: "planned",
      reassessment_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Falha ao criar intervenção: ${error?.message || "Erro desconhecido"}`);
  }

  // Gravar log imutável de auditoria
  try {
    await (client.from("action_audit_logs") as any).insert({
      tenant_id: tenantId,
      action_id: data.id,
      actor_id: actorId,
      event_type: "created",
      new_state: data,
      notes: "Intervenção criada e vinculada ao plano de ação de SST."
    });
  } catch (logErr: any) {
    console.warn("Aviso ao gravar audit log de intervenção:", logErr.message);
  }

  return data as CorrectiveAction;
}

/**
 * Atualiza o status de uma intervenção com validação estrita de máquina de estados.
 */
export async function updateInterventionStatus(
  client: SupabaseClient<Database>,
  tenantId: string,
  actorId: string,
  actionId: string,
  newStatus: InterventionStatus,
  notes?: string
): Promise<CorrectiveAction> {
  const { data: existing, error: fetchErr } = await (client.from("corrective_actions") as any)
    .select("*")
    .eq("id", actionId)
    .single();

  if (fetchErr || !existing) {
    throw new Error("Intervenção não encontrada.");
  }

  if (existing.tenant_id !== tenantId) {
    throw new Error("FORBIDDEN: Tentativa não autorizada de modificar intervenção de outro tenant.");
  }

  const currentStatus = (existing.status || "identified").toLowerCase();
  if (!isValidInterventionTransition(currentStatus, newStatus)) {
    throw new Error(`Transição ilegal de status de intervenção: de '${currentStatus}' para '${newStatus}'.`);
  }

  const { data: updated, error: updateErr } = await (client.from("corrective_actions") as any)
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", actionId)
    .select()
    .single();

  if (updateErr || !updated) {
    throw new Error(`Erro ao atualizar status da intervenção: ${updateErr?.message}`);
  }

  // Gravar log de auditoria
  try {
    await (client.from("action_audit_logs") as any).insert({
      tenant_id: tenantId,
      action_id: actionId,
      actor_id: actorId,
      event_type: newStatus === "closed" ? "closed" : "status_changed",
      previous_state: { status: currentStatus },
      new_state: { status: newStatus },
      notes: notes || `Status alterado de ${currentStatus} para ${newStatus}.`
    });
  } catch (logErr: any) {
    console.warn("Aviso ao gravar audit log:", logErr.message);
  }

  return updated as CorrectiveAction;
}

/**
 * Anexa uma evidência documental estruturada a uma intervenção.
 */
export async function addInterventionEvidence(
  client: SupabaseClient<Database>,
  tenantId: string,
  actorId: string,
  actionId: string,
  input: AddEvidenceInput
): Promise<ActionEvidence> {
  const { data: action, error: actionErr } = await (client.from("corrective_actions") as any)
    .select("id, tenant_id, status")
    .eq("id", actionId)
    .single();

  if (actionErr || !action) {
    throw new Error("Intervenção não encontrada.");
  }

  if (action.tenant_id !== tenantId) {
    throw new Error("FORBIDDEN: Tentativa não autorizada de anexar evidência a intervenção de outro tenant.");
  }

  const { data: evidence, error: evidenceErr } = await (client.from("action_evidence") as any)
    .insert({
      tenant_id: tenantId,
      action_id: actionId,
      campaign_id: input.campaignId || null,
      evidence_type: input.evidenceType,
      title: input.title,
      description: input.description || null,
      file_url: input.fileUrl || null,
      file_hash: input.fileHash || null,
      uploaded_by: actorId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (evidenceErr || !evidence) {
    throw new Error(`Falha ao registrar evidência: ${evidenceErr?.message}`);
  }

  // Atualizar status da ação pai se estava em progresso ou aguardando evidência
  if (action.status === "evidence_pending" || action.status === "in_progress") {
    await (client.from("corrective_actions") as any)
      .update({
        evidence_url: input.fileUrl || action.evidence_url,
        evidence_notes: input.title,
        updated_at: new Date().toISOString()
      })
      .eq("id", actionId);
  }

  // Gravar audit log
  try {
    await (client.from("action_audit_logs") as any).insert({
      tenant_id: tenantId,
      action_id: actionId,
      actor_id: actorId,
      event_type: "evidence_added",
      new_state: evidence,
      notes: `Evidência '${input.title}' (${input.evidenceType}) anexada com sucesso.`
    });
  } catch (logErr: any) {
    console.warn("Aviso ao gravar audit log de evidência:", logErr.message);
  }

  return evidence as ActionEvidence;
}

/**
 * Retorna as evidências de uma intervenção específica.
 */
export async function getInterventionEvidence(
  client: SupabaseClient<Database>,
  tenantId: string,
  actionId: string
): Promise<ActionEvidence[]> {
  const { data, error } = await (client.from("action_evidence") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("action_id", actionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar evidências da intervenção:", error.message);
    return [];
  }
  return (data || []) as ActionEvidence[];
}

/**
 * Registra a reavaliação técnica de eficácia da intervenção.
 */
export async function recordInterventionReassessment(
  client: SupabaseClient<Database>,
  tenantId: string,
  actorId: string,
  actionId: string,
  input: RecordReassessmentInput
): Promise<CorrectiveAction> {
  const { data: existing, error: fetchErr } = await (client.from("corrective_actions") as any)
    .select("*")
    .eq("id", actionId)
    .single();

  if (fetchErr || !existing) {
    throw new Error("Intervenção não encontrada.");
  }

  if (existing.tenant_id !== tenantId) {
    throw new Error("FORBIDDEN: Tentativa não autorizada de reavaliar intervenção de outro tenant.");
  }

  const isEffective = input.effectivenessRating === "effective";
  const newStatus = isEffective ? "effective" : (input.effectivenessRating === "ineffective" ? "ineffective" : existing.status);

  const { data: updated, error: updateErr } = await (client.from("corrective_actions") as any)
    .update({
      effectiveness_rating: input.effectivenessRating,
      effectiveness_score: input.effectivenessScore ?? (isEffective ? 90 : 40),
      effectiveness_rationale: input.rationale,
      effectiveness_evaluated_by: actorId,
      effectiveness_evaluated_at: new Date().toISOString(),
      reassessment_date: new Date().toISOString().split("T")[0],
      reassessment_status: isEffective ? "effective" : "needs_revision",
      reassessment_campaign_id: input.reassessmentCampaignId || null,
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", actionId)
    .select()
    .single();

  if (updateErr || !updated) {
    throw new Error(`Falha ao registrar reavaliação de eficácia: ${updateErr?.message}`);
  }

  // Gravar log de auditoria
  try {
    await (client.from("action_audit_logs") as any).insert({
      tenant_id: tenantId,
      action_id: actionId,
      actor_id: actorId,
      event_type: "effectiveness_evaluated",
      previous_state: {
        effectiveness_rating: existing.effectiveness_rating,
        status: existing.status
      },
      new_state: {
        effectiveness_rating: input.effectivenessRating,
        effectiveness_score: updated.effectiveness_score,
        status: updated.status
      },
      notes: `Reavaliação registrada: ${input.effectivenessRating}. Justificativa: ${input.rationale}`
    });
  } catch (logErr: any) {
    console.warn("Aviso ao gravar audit log de reavaliação:", logErr.message);
  }

  return updated as CorrectiveAction;
}

/**
 * Retorna lista de intervenções filtradas por tenant e campanha opcional.
 */
export async function getInterventionsByTenant(
  client: SupabaseClient<Database>,
  tenantId: string,
  options?: { campaignId?: string | null | undefined; status?: string | null | undefined }
): Promise<CorrectiveAction[]> {

  let query = (client.from("corrective_actions") as any)
    .select("*")
    .eq("tenant_id", tenantId);

  if (options?.campaignId) {
    query = query.eq("campaign_id", options.campaignId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar intervenções do tenant:", error.message);
    return [];
  }
  return (data || []) as CorrectiveAction[];
}

/**
 * Retorna os KPIs reais de intervenções e plano de ação do tenant.
 */
export async function getInterventionKPIMetrics(
  client: SupabaseClient<Database>,
  tenantId: string,
  campaignId?: string
): Promise<InterventionKPIMetrics> {
  const actions = await getInterventionsByTenant(client, tenantId, campaignId ? { campaignId } : undefined);
  const now = new Date();

  const totalInterventions = actions.length;
  if (totalInterventions === 0) {
    return {
      totalInterventions: 0,
      openCount: 0,
      inProgressCount: 0,
      evidencePendingCount: 0,
      reassessmentPendingCount: 0,
      effectiveCount: 0,
      ineffectiveCount: 0,
      overdueCount: 0,
      closedCount: 0,
      completionRate: null,
      hasSufficientData: false
    };
  }

  let inProgressCount = 0;
  let evidencePendingCount = 0;
  let reassessmentPendingCount = 0;
  let effectiveCount = 0;
  let ineffectiveCount = 0;
  let overdueCount = 0;
  let closedCount = 0;

  actions.forEach((a) => {
    const status = (a.status || "").toLowerCase();
    const dueDate = a.due_date ? new Date(a.due_date) : null;
    const isPastDue = dueDate && dueDate < now && status !== "closed" && status !== "effective";

    if (isPastDue) overdueCount++;
    if (status === "in_progress") inProgressCount++;
    if (status === "evidence_pending") evidencePendingCount++;
    if (status === "reassessment_pending") reassessmentPendingCount++;
    if (status === "effective" || a.effectiveness_rating === "effective") effectiveCount++;
    if (status === "ineffective" || a.effectiveness_rating === "ineffective") ineffectiveCount++;
    if (status === "closed") closedCount++;
  });

  const openCount = totalInterventions - closedCount;
  const completionRate = totalInterventions > 0 ? Math.round((closedCount / totalInterventions) * 100) : null;

  return {
    totalInterventions,
    openCount,
    inProgressCount,
    evidencePendingCount,
    reassessmentPendingCount,
    effectiveCount,
    ineffectiveCount,
    overdueCount,
    closedCount,
    completionRate,
    hasSufficientData: totalInterventions > 0
  };
}

/**
 * Retorna os logs de auditoria de uma ação específica.
 */
export async function getInterventionAuditLogs(
  client: SupabaseClient<Database>,
  tenantId: string,
  actionId: string
): Promise<ActionAuditLog[]> {
  const { data, error } = await (client.from("action_audit_logs") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("action_id", actionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar logs de auditoria da ação:", error.message);
    return [];
  }
  return (data || []) as ActionAuditLog[];
}
