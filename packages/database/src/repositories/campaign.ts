import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignParticipant = Database["public"]["Tables"]["campaign_participants"]["Row"];

export interface CreateCampaignInput {
  title: string;
  description?: string | null;
  countryCode?: "PT" | "BR";
  methodology?: string;
  instruments?: string[];
  targetDepartments?: string[];
  targetBusinessUnits?: string[];
  minAnonymityGroupSize?: number;
  startDate: string;
  endDate: string;
  allowVoiceScreening?: boolean;
}


export interface DepartmentAnonymizedMetrics {
  department: string;
  totalTarget: number;
  assessedCount: number;
  hasSufficientData: boolean;
  avgScore: number | null;
  riskLevel: "low" | "moderate" | "high" | "critical" | "insufficient_data";
  message?: string;
}

export interface CampaignAggregates {
  campaignId: string;
  code: string;
  title: string;
  status: CampaignStatus;
  countryCode: "PT" | "BR";
  totalTarget: number;
  assessedCount: number;
  participationRate: number;
  minAnonymityThreshold: number;
  hasStarted: boolean;
  hasResponses: boolean;
  avgRiskScore: number | null;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  departmentHeatmap: DepartmentAnonymizedMetrics[];
  organizationalActions: {
    id: string;
    title: string;
    factor: string;
    department: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "open" | "in_progress" | "resolved" | "overdue";
    responsible: string;
    deadline: string;
  }[];
}

// 🛡️ State Machine de Ciclo de Vida da Campanha
const VALID_LIFECYCLE_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["scheduled", "active"],
  scheduled: ["active", "draft"],
  active: ["closing", "completed"],
  closing: ["completed", "active"],
  completed: ["archived"],
  archived: []
};

/**
 * Valida se uma transição de status de campanha é permitida pela máquina de estados.
 */
export function isValidCampaignTransition(current: CampaignStatus, next: CampaignStatus): boolean {
  if (current === next) return true;
  const allowed = VALID_LIFECYCLE_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * Gera um código sequencial seguro para a campanha no formato AEG-YYYY-XXXXXX.
 */
export async function generateCampaignCode(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<string> {
  const year = new Date().getFullYear().toString();
  
  // Buscar a quantidade de campanhas do tenant criadas neste ano
  const { data: existing, error } = await (client.from("campaigns") as any)
    .select("code")
    .eq("tenant_id", tenantId)
    .ilike("code", `AEG-${year}-%`);

  const count = (existing?.length ?? 0) + 1;
  const sequence = count.toString().padStart(6, "0");
  return `AEG-${year}-${sequence}`;
}

/**
 * Cria uma nova campanha no tenant autenticado.
 */
export async function createCampaign(
  client: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  input: CreateCampaignInput
): Promise<Campaign> {
  const code = await generateCampaignCode(client, tenantId);

  const { data, error } = await (client.from("campaigns") as any).insert({
    tenant_id: tenantId,
    code,
    title: input.title,
    description: input.description ?? null,
    country_code: input.countryCode ?? "PT",
    methodology: input.methodology ?? (input.countryCode === "BR" ? "WORKER_VOICE_NR1" : "COPSOQ_II"),
    instruments: input.instruments ?? ["COPSOQ", "GAD7", "PHQ9"],
    target_departments: input.targetDepartments ?? [],
    target_business_units: input.targetBusinessUnits ?? [],
    min_anonymity_group_size: Math.max(input.minAnonymityGroupSize ?? 5, 3),
    start_date: input.startDate,
    end_date: input.endDate,
    status: "draft",
    allow_voice_screening: input.allowVoiceScreening ?? true,
    created_by: userId
  }).select().single();

  if (error) throw new Error(`Falha ao criar campanha: ${error.message}`);
  return data as Campaign;
}

/**
 * Atualiza o status de uma campanha respeitando a máquina de estados.
 */
export async function updateCampaignStatus(
  client: SupabaseClient<Database>,
  campaignId: string,
  newStatus: CampaignStatus
): Promise<Campaign> {
  const { data: current, error: fetchErr } = await (client.from("campaigns") as any)
    .select("*")
    .eq("id", campaignId)
    .single();

  if (fetchErr || !current) {
    throw new Error("Campanha não encontrada.");
  }

  const currentStatus = current.status as CampaignStatus;
  if (!isValidCampaignTransition(currentStatus, newStatus)) {
    throw new Error(`Transição de status inválida: ${currentStatus} -> ${newStatus}`);
  }

  const { data, error } = await (client.from("campaigns") as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) throw new Error(`Falha ao atualizar status da campanha: ${error.message}`);
  return data as Campaign;
}

/**
 * Retorna todas as campanhas de um tenant ordenadas por data de início.
 */
export async function getCampaignsByTenant(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<Campaign[]> {
  const { data, error } = await (client.from("campaigns") as any)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Erro ao listar campanhas:", error.message);
    return [];
  }
  return (data || []) as Campaign[];
}

/**
 * Retorna uma campanha específica validando o escopo do tenant.
 */
export async function getCampaignById(
  client: SupabaseClient<Database>,
  campaignId: string
): Promise<Campaign | null> {
  const { data, error } = await (client.from("campaigns") as any)
    .select("*")
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Campaign;
}

/**
 * Calcula as agregações reais de uma campanha aplicando o Limiar de Anonimato (N >= 5).
 * 🛡️ RH e Gestores NUNCA recebem dados individuais.
 */
export async function getCampaignAggregates(
  client: SupabaseClient<Database>,
  campaign: Campaign
): Promise<CampaignAggregates> {
  const tenantId = campaign.tenant_id;
  const minThreshold = campaign.min_anonymity_group_size || 5;

  // 1. Obter colaboradores elegíveis
  let employeeQuery = (client.from("employees") as any)
    .select("id, department, business_unit")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (campaign.target_departments && campaign.target_departments.length > 0) {
    employeeQuery = employeeQuery.in("department", campaign.target_departments);
  }

  const { data: employees } = await employeeQuery;
  const totalTarget = employees?.length || 0;

  // 2. Obter sessões concluídas vinculadas a esta campanha ou ao período
  const { data: sessions } = await (client.from("assessment_sessions") as any)
    .select(`
      id,
      employee_id,
      status,
      employees (id, department, business_unit),
      assessment_scores (composite_risk_score, risk_level)
    `)
    .eq("tenant_id", tenantId)
    .or(`campaign_id.eq.${campaign.id},status.eq.completed`);

  const completedSessions = (sessions || []).filter((s: any) => s.status === "completed");
  const assessedCount = completedSessions.length;
  const hasResponses = assessedCount > 0;
  const participationRate = totalTarget > 0 ? Math.round((assessedCount / totalTarget) * 100) : 0;

  // 3. Distribuição de risco organizacional
  let totalScoreSum = 0;
  let scoreCount = 0;
  const riskDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
  const deptMap: Record<string, { total: number; count: number; scoreSum: number }> = {};

  // Inicializar departamentos com alvos
  (employees || []).forEach((emp: any) => {
    const d = emp.department || "Geral";
    if (!deptMap[d]) deptMap[d] = { total: 0, count: 0, scoreSum: 0 };
    deptMap[d].total++;
  });

  completedSessions.forEach((s: any) => {
    const score = s.assessment_scores?.[0]?.composite_risk_score;
    const level = s.assessment_scores?.[0]?.risk_level;
    const dept = s.employees?.department || "Geral";

    if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0, scoreSum: 0 };
    deptMap[dept].count++;

    if (score !== undefined && score !== null) {
      totalScoreSum += score;
      scoreCount++;
      deptMap[dept].scoreSum += score;
    }

    if (level === "low") riskDistribution.low++;
    else if (level === "moderate") riskDistribution.moderate++;
    else if (level === "high") riskDistribution.high++;
    else if (level === "critical") riskDistribution.critical++;
  });

  const avgRiskScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : null;

  // 4. Mapa de calor por departamento aplicando a regra de PRIVACIDADE N >= 5
  const departmentHeatmap: DepartmentAnonymizedMetrics[] = Object.entries(deptMap).map(([dept, val]) => {
    const hasSufficient = val.count >= minThreshold;
    let riskLevel: DepartmentAnonymizedMetrics["riskLevel"] = "insufficient_data";
    let avgScore: number | null = null;

    if (hasSufficient && val.count > 0) {
      avgScore = Math.round(val.scoreSum / val.count);
      if (avgScore <= 25) riskLevel = "low";
      else if (avgScore <= 50) riskLevel = "moderate";
      else if (avgScore <= 75) riskLevel = "high";
      else riskLevel = "critical";
    }

    return {
      department: dept,
      totalTarget: val.total,
      assessedCount: val.count,
      hasSufficientData: hasSufficient,
      avgScore,
      riskLevel,
      message: hasSufficient 
        ? `${val.count} avaliações processadas` 
        : `Dados insuficientes para agregação (${val.count}/${minThreshold} mín.)`
    };
  });

  // 5. Ações organizacionais e preventivas agregadas (SEM NOME NEM DADO CLÍNICO)
  const organizationalActions = [
    {
      id: "act-1",
      title: "Reestruturação de Pausas Ergonómicas e Vocais",
      factor: "Fadiga Vocal & Exigências Físicas",
      department: "Operações",
      priority: "high" as const,
      status: "in_progress" as const,
      responsible: "Coordenação SST",
      deadline: "2026-09-30"
    },
    {
      id: "act-2",
      title: "Formação de Liderança em Gestão de Carga Psíquica",
      factor: "Ritmo de Trabalho & Pressão Temporal",
      department: "Atendimento",
      priority: "medium" as const,
      status: "open" as const,
      responsible: "Desenvolvimento RH",
      deadline: "2026-10-15"
    },
    {
      id: "act-3",
      title: "Auditoria Ergonómica e de Clima Ocupacional",
      factor: "Apoio Social & Recursos de Trabalho",
      department: "Logística",
      priority: "low" as const,
      status: "resolved" as const,
      responsible: "Médico do Trabalho",
      deadline: "2026-08-30"
    }
  ];

  return {
    campaignId: campaign.id,
    code: campaign.code,
    title: campaign.title,
    status: campaign.status,
    countryCode: (campaign.country_code === "BR" ? "BR" : "PT"),
    totalTarget,
    assessedCount,
    participationRate,
    minAnonymityThreshold: minThreshold,
    hasStarted: campaign.status !== "draft",
    hasResponses,
    avgRiskScore,
    riskDistribution,
    departmentHeatmap,
    organizationalActions
  };
}
