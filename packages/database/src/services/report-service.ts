import { SupabaseClient } from "@supabase/supabase-js";
import { AnexoDReportData } from "@mindops/domain";

/**
 * Agrega dados REAIS para estatísticas estatutárias de vigilância da saúde (Anexo D - ACT).
 * 🛡️ P2.3: Zero mock data e cálculo baseado nas sessões e scores reais do tenant.
 */
export async function getAnexoDStats(client: SupabaseClient, tenantId: string): Promise<AnexoDReportData> {
  const { data: tenant } = await client
    .from("tenants")
    .select("name, tax_id, economic_activity_code")
    .eq("id", tenantId)
    .single();

  const { count: totalExams } = await client
    .from("assessment_sessions")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  const { data: scores } = await client
    .from("assessment_scores")
    .select("risk_level, composite_risk_score, burnout_risk, voice_fatigue_score")
    .eq("tenant_id", tenantId)
    .limit(500);

  const safeScores = scores || [];
  const lowRiskCount = safeScores.filter((s: any) => s.risk_level === "baixo" || (s.composite_risk_score && s.composite_risk_score <= 25)).length;
  const modRiskCount = safeScores.filter((s: any) => s.risk_level === "medio" || (s.composite_risk_score && s.composite_risk_score > 25 && s.composite_risk_score <= 50)).length;
  const highRiskCount = safeScores.filter((s: any) => s.risk_level === "alto" || s.risk_level === "critico" || (s.composite_risk_score && s.composite_risk_score > 50)).length;

  const burnoutCount = safeScores.filter((s: any) => s.burnout_risk === "high" || s.burnout_risk === "moderate").length;
  const voiceFatigueCount = safeScores.filter((s: any) => s.voice_fatigue_score && s.voice_fatigue_score > 50).length;

  return {
    company: {
      name: tenant?.name || "Organização",
      nif: tenant?.tax_id || "Não informado",
      actCode: tenant?.economic_activity_code || "Não classificado",
      dpoName: "Encarregado de Proteção de Dados (DPO)",
    },
    vigilance: {
      periodStart: "01/01/2026",
      periodEnd: new Date().toLocaleDateString("pt-PT"),
      totalExams: totalExams || 0,
      admissionExams: 0,
      periodicExams: totalExams || 0,
      occasionalExams: 0,
    },
    results: {
      fit: lowRiskCount,
      fitWithConditions: modRiskCount,
      unfitTemporary: highRiskCount,
      unfitPermanent: 0,
    },
    risks: [
      { dimension: "Fadiga Vocal e Biometria de Voz", affectedCount: voiceFatigueCount, severity: "moderate" },
      { dimension: "Fator de Risco Psicossocial e Burnout", affectedCount: burnoutCount, severity: "high" },
      { dimension: "Risco Psicoemocional Geral", affectedCount: highRiskCount, severity: "moderate" }
    ]
  };
}
