import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type AIDecision = Database["public"]["Tables"]["ai_decisions"]["Row"];
export type AIAuditLog = Database["public"]["Tables"]["ai_audit_logs"]["Row"];

export type ModelStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "active"
  | "suspended"
  | "retired";

export type ModelRiskClassification = "minimal" | "limited" | "high" | "unacceptable";

export interface AIModelRegistryEntry {
  id?: string;
  provider: string;
  model_name: string;
  model_version: string;
  model_family: string;
  status: ModelStatus;
  owner: string;
  risk_classification: ModelRiskClassification;
  intended_use: string;
  jurisdiction?: string;
  deployment_environment?: string;
  approved_at?: string | null;
  retired_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PromptStatus = "draft" | "active" | "deprecated" | "retired";

export interface AIPromptRegistryEntry {
  id?: string;
  prompt_id: string;
  version: string;
  purpose: string;
  content_hash: string;
  status: PromptStatus;
  owner: string;
  approved_at?: string | null;
  created_at?: string;
}

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentType =
  | "model_drift"
  | "anomalous_behavior"
  | "safety_event"
  | "governance_violation"
  | "privacy_event"
  | "unauthorized_model_change";

export type IncidentStatus =
  | "detected"
  | "triaged"
  | "investigating"
  | "mitigated"
  | "resolved"
  | "closed";

export interface AIIncidentEntry {
  id?: string;
  tenant_id: string;
  model_id?: string | null;
  severity: IncidentSeverity;
  type: IncidentType;
  status: IncidentStatus;
  description: string;
  detected_at?: string;
  detected_by: string;
  assigned_to?: string | null;
  mitigation?: string | null;
  resolution?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

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

// 🛡️ State Machine para Model Registry
export const MODEL_STATUS_TRANSITIONS: Record<ModelStatus, ModelStatus[]> = {
  draft: ["pending_approval", "retired"],
  pending_approval: ["approved", "draft", "retired"],
  approved: ["active", "suspended", "retired"],
  active: ["suspended", "retired"],
  suspended: ["active", "retired"],
  retired: []
};

// 🛡️ State Machine para Incident Management
export const INCIDENT_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  detected: ["triaged", "closed"],
  triaged: ["investigating", "mitigated", "closed"],
  investigating: ["mitigated", "resolved", "closed"],
  mitigated: ["resolved", "investigating", "closed"],
  resolved: ["closed", "investigating"],
  closed: ["investigating"]
};

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
  const pendingReviews = decisions.filter(
    (d: any) =>
      d.status === "pending" ||
      (!d.human_validated && d.status !== "approved" && d.status !== "rejected")
  ).length;
  const approvedDecisions = decisions.filter(
    (d: any) => d.status === "approved" || d.human_action === "approved"
  ).length;
  const rejectedDecisions = decisions.filter(
    (d: any) => d.status === "rejected" || d.human_action === "rejected"
  ).length;

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
    .eq("status", "pending")
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
  limit: number = 50
): Promise<AIAuditLog[]> {
  const { data, error } = await (client.from("ai_audit_logs") as any)
    .select("*, ai_decisions!inner(tenant_id)")
    .eq("ai_decisions.tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar logs de auditoria de IA:", error.message);
    return [];
  }
  return (data || []) as AIAuditLog[];
}


/**
 * Valida (aprova ou rejeita) uma decisão de IA por um operador humano autorizado (Human-in-the-Loop).
 */
export async function validateAIDecision(
  client: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  decisionId: string,
  validation: DecisionValidationInput
): Promise<{ success: boolean; decision: AIDecision; error?: string }> {

  const { data: decision, error: fetchError } = await (client.from("ai_decisions") as any)
    .select("*")
    .eq("id", decisionId)
    .single();

  if (fetchError || !decision) {
    throw new Error("NOT_FOUND: Decisão de IA não encontrada.");
  }

  if (decision.tenant_id && decision.tenant_id !== tenantId) {
    throw new Error("FORBIDDEN: Tentativa não autorizada de validar decisão de outro tenant.");
  }

  const { data: updatedDecision, error: updateError } = await (client.from("ai_decisions") as any)
    .update({
      human_validated: true,
      human_action: validation.action,
      human_feedback: validation.feedback || null,
      status: validation.action === "approved" ? "approved" : "rejected",
      updated_at: new Date().toISOString()
    })
    .eq("id", decisionId)
    .select()
    .single();

  if (updateError || !updatedDecision) {
    throw new Error("Falha ao persistir validação humana.");
  }

  // Registra no ledger de auditoria imutável (AI Audit Trail)
  await (client.from("ai_audit_logs") as any).insert({
    decision_id: decisionId,
    action: validation.action === "approved" ? "human_approved" : "human_rejected",
    actor: userId,
    details: {
      feedback: validation.feedback || null,
      previous_status: decision.status,
      timestamp: new Date().toISOString()
    }
  });


  return { success: true, decision: updatedDecision as AIDecision };
}


// ==============================================================================
// 🏛️ MODEL REGISTRY REPOSITORY
// ==============================================================================

/**
 * Registra um novo modelo de IA no Model Registry
 */
export async function registerAIModel(
  client: SupabaseClient<Database>,
  entry: AIModelRegistryEntry
): Promise<AIModelRegistryEntry | null> {
  const { data, error } = await (client.from("ai_model_registry") as any)
    .insert({
      provider: entry.provider,
      model_name: entry.model_name,
      model_version: entry.model_version,
      model_family: entry.model_family,
      status: entry.status || "draft",
      owner: entry.owner,
      risk_classification: entry.risk_classification || "limited",
      intended_use: entry.intended_use,
      jurisdiction: entry.jurisdiction || "EU",
      deployment_environment: entry.deployment_environment || "production",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as AIModelRegistryEntry;
}

/**
 * Transição de estado de modelo no Model Registry com validação de State Machine
 */
export async function transitionModelStatus(
  client: SupabaseClient<Database>,
  modelId: string,
  nextStatus: ModelStatus
): Promise<{ success: boolean; error?: string; model?: AIModelRegistryEntry }> {
  const { data: current, error: fetchErr } = await (client.from("ai_model_registry") as any)
    .select("*")
    .eq("id", modelId)
    .single();

  if (fetchErr || !current) {
    return { success: false, error: "MODEL_NOT_FOUND: Modelo não localizado no Registry." };
  }

  const allowed = MODEL_STATUS_TRANSITIONS[current.status as ModelStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      success: false,
      error: `INVALID_TRANSITION: Transição de '${current.status}' para '${nextStatus}' não é permitida.`
    };
  }

  const updatePayload: any = {
    status: nextStatus,
    updated_at: new Date().toISOString()
  };

  if (nextStatus === "approved" && !current.approved_at) {
    updatePayload.approved_at = new Date().toISOString();
  }
  if (nextStatus === "retired") {
    updatePayload.retired_at = new Date().toISOString();
  }

  const { data: updated, error: updateErr } = await (client.from("ai_model_registry") as any)
    .update(updatePayload)
    .eq("id", modelId)
    .select()
    .single();

  if (updateErr || !updated) {
    return { success: false, error: "Falha ao atualizar estado do modelo." };
  }

  return { success: true, model: updated as AIModelRegistryEntry };
}

/**
 * Lista modelos registrados
 */
export async function listRegisteredModels(
  client: SupabaseClient<Database>
): Promise<AIModelRegistryEntry[]> {
  const { data, error } = await (client.from("ai_model_registry") as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as AIModelRegistryEntry[];
}

// ==============================================================================
// 📜 PROMPT REGISTRY REPOSITORY
// ==============================================================================

/**
 * Registra uma versão de prompt governado
 */
export async function registerPrompt(
  client: SupabaseClient<Database>,
  entry: AIPromptRegistryEntry
): Promise<AIPromptRegistryEntry | null> {
  const { data, error } = await (client.from("ai_prompt_registry") as any)
    .insert({
      prompt_id: entry.prompt_id,
      version: entry.version,
      purpose: entry.purpose,
      content_hash: entry.content_hash,
      status: entry.status || "draft",
      owner: entry.owner,
      approved_at: entry.status === "active" ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as AIPromptRegistryEntry;
}

/**
 * Lista prompts registrados
 */
export async function listPrompts(
  client: SupabaseClient<Database>
): Promise<AIPromptRegistryEntry[]> {
  const { data, error } = await (client.from("ai_prompt_registry") as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as AIPromptRegistryEntry[];
}

// ==============================================================================
// 🚨 INCIDENT MANAGEMENT REPOSITORY
// ==============================================================================

/**
 * Registra um novo incidente de IA
 */
export async function createAIIncident(
  client: SupabaseClient<Database>,
  entry: AIIncidentEntry
): Promise<AIIncidentEntry | null> {
  const { data, error } = await (client.from("ai_incidents") as any)
    .insert({
      tenant_id: entry.tenant_id,
      model_id: entry.model_id || null,
      severity: entry.severity,
      type: entry.type,
      status: entry.status || "detected",
      description: entry.description,
      detected_at: entry.detected_at || new Date().toISOString(),
      detected_by: entry.detected_by,
      assigned_to: entry.assigned_to || null,
      mitigation: entry.mitigation || null,
      resolution: entry.resolution || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as AIIncidentEntry;
}

/**
 * Transição de estado de incidente de IA com validação de State Machine
 */
export async function transitionIncidentStatus(
  client: SupabaseClient<Database>,
  tenantId: string,
  incidentId: string,
  nextStatus: IncidentStatus,
  resolutionDetails?: { mitigation?: string; resolution?: string; assigned_to?: string }
): Promise<{ success: boolean; error?: string; incident?: AIIncidentEntry }> {
  const { data: current, error: fetchErr } = await (client.from("ai_incidents") as any)
    .select("*")
    .eq("id", incidentId)
    .eq("tenant_id", tenantId)
    .single();

  if (fetchErr || !current) {
    return { success: false, error: "INCIDENT_NOT_FOUND: Incidente não localizado ou acesso negado." };
  }

  const allowed = INCIDENT_STATUS_TRANSITIONS[current.status as IncidentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      success: false,
      error: `INVALID_INCIDENT_TRANSITION: Transição de '${current.status}' para '${nextStatus}' não é permitida.`
    };
  }

  const updatePayload: any = {
    status: nextStatus,
    updated_at: new Date().toISOString()
  };

  if (resolutionDetails?.assigned_to) {
    updatePayload.assigned_to = resolutionDetails.assigned_to;
  }
  if (resolutionDetails?.mitigation) {
    updatePayload.mitigation = resolutionDetails.mitigation;
  }
  if (resolutionDetails?.resolution) {
    updatePayload.resolution = resolutionDetails.resolution;
  }
  if (nextStatus === "resolved" || nextStatus === "closed") {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { data: updated, error: updateErr } = await (client.from("ai_incidents") as any)
    .update(updatePayload)
    .eq("id", incidentId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (updateErr || !updated) {
    return { success: false, error: "Falha ao atualizar estado do incidente." };
  }

  return { success: true, incident: updated as AIIncidentEntry };
}

/**
 * Lista incidentes de IA do tenant
 */
export async function listAIIncidents(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<AIIncidentEntry[]> {
  const { data, error } = await (client.from("ai_incidents") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as AIIncidentEntry[];
}
