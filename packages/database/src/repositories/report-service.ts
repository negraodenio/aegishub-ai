import { supabaseAdmin } from "../client";
import { Database } from "../generated.types";

export type ACTAnalyticReport = {
  tenantId: string;
  totalEmployees: number;
  assessedCount: number;
  participationRate: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  departmentalBreakdown: {
    department: string;
    assessed: number;
    avgScore: number;
  }[];
};

/**
 * Aggregates REAL clinical data for Portuguese ACT (Autoridade para as Condições do Trabalho)
 * conformant to Lei 102/2009 requirements for psychosocial risk monitoring.
 */
export async function generateLegalACTReport(tenantId: string): Promise<ACTAnalyticReport> {
  // 1. Get Aggregates (already pre-computed or from latest)
  const { data: aggregate } = await supabaseAdmin
    .from("manager_dashboard_aggregates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .single();

  // 2. Get Departmental Breakdown (Live)
  const { data: deptData } = await supabaseAdmin
    .from("employees")
    .select(`
      department,
      assessment_sessions (
        id,
        assessment_scores (composite_risk_score)
      )
    `)
    .eq("tenant_id", tenantId);

  const departmentsMap: Record<string, { count: number; sum: number }> = {};
  
  (deptData ?? []).forEach((emp: any) => {
    const dept = emp.department || "Geral";
    if (!departmentsMap[dept]) departmentsMap[dept] = { count: 0, sum: 0 };
    
    const latestSession = emp.assessment_sessions?.[0];
    const score = (latestSession as { id: string; assessment_scores: { composite_risk_score: number }[] })?.assessment_scores?.[0]?.composite_risk_score;
    
    if (score !== undefined) {
      departmentsMap[dept].count++;
      departmentsMap[dept].sum += score;
    }
  });

  const departmentalBreakdown = Object.entries(departmentsMap).map(([name, stats]) => ({
    department: name,
    assessed: stats.count,
    avgScore: stats.count > 0 ? Math.round(stats.sum / stats.count) : 0
  }));

  return {
    tenantId,
    totalEmployees: aggregate?.total_employees ?? 0,
    assessedCount: aggregate?.assessed_count ?? 0,
    participationRate: aggregate?.total_employees 
      ? Number(((aggregate.assessed_count / aggregate.total_employees) * 100).toFixed(1)) 
      : 0,
    riskDistribution: {
      low: aggregate?.low_risk_count ?? 0,
      moderate: aggregate?.moderate_risk_count ?? 0,
      high: aggregate?.high_risk_count ?? 0,
      critical: aggregate?.critical_risk_count ?? 0,
    },
    departmentalBreakdown
  };
}
