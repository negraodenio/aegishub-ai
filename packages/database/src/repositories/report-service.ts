import { SupabaseClient } from "@supabase/supabase-js";
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
 * 
 * 🛡️ P0 SECURITY: Accepts authenticated Supabase client to respect RLS and caller tenant isolation.
 */
export async function generateLegalACTReport(
  client: SupabaseClient<Database>,
  tenantId: string
): Promise<ACTAnalyticReport> {
  // 1. Get Aggregates (already pre-computed or from latest)
  const { data: aggregate } = await client
    .from("manager_dashboard_aggregates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Get Departmental Breakdown (Live)
  const { data: deptData } = await client
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

  const typedAggregate = aggregate as Database["public"]["Tables"]["manager_dashboard_aggregates"]["Row"] | null;
  const totalEmployees = typedAggregate?.total_employees ?? (deptData?.length || 0);
  const assessedCount = typedAggregate?.assessed_count ?? Object.values(departmentsMap).reduce((acc, curr) => acc + curr.count, 0);

  return {
    tenantId,
    totalEmployees,
    assessedCount,
    participationRate: totalEmployees > 0 ? Math.round((assessedCount / totalEmployees) * 100) : 0,
    riskDistribution: {
      low: typedAggregate?.low_risk_count ?? 0,
      moderate: typedAggregate?.moderate_risk_count ?? 0,
      high: typedAggregate?.high_risk_count ?? 0,
      critical: typedAggregate?.critical_risk_count ?? 0,
    },
    departmentalBreakdown: Object.entries(departmentsMap).map(([dept, val]) => ({
      department: dept,
      assessed: val.count,
      avgScore: val.count > 0 ? Math.round(val.sum / val.count) : 0
    }))
  };

}
