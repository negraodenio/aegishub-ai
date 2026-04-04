import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

type AggregateRow = Database["public"]["Tables"]["manager_dashboard_aggregates"]["Row"];

export async function getRHOverview(client: SupabaseClient<Database>, tenantId: string) {
  const [
    employeesRes,
    sessionsRes,
    alertsRes,
    referralsRes,
    aggregatesRes
  ] = await Promise.all([
    client.from("employees").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active"),
    client.from("assessment_sessions").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "completed"),
    client.from("risk_alerts").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["open", "in_review"]),
    client.from("care_referrals").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["pending", "scheduled"]),
    client.from("manager_dashboard_aggregates").select("*").eq("tenant_id", tenantId).order("computed_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  const totalEmployees = employeesRes.count ?? 0;
  const assessedEmployees = sessionsRes.count ?? 0;
  // Explicitly cast to AggregateRow or null to avoid 'never' inference
  const latest = aggregatesRes.data as AggregateRow | null;

  return {
    totalEmployees,
    assessedEmployees,
    coveragePercent: totalEmployees > 0 ? Math.round((assessedEmployees / totalEmployees) * 100) : 0,
    complianceScore: Number(latest?.compliance_score ?? 0),
    openAlerts: alertsRes.count ?? 0,
    openReferrals: referralsRes.count ?? 0,
    highRiskPopulationPercent:
      latest && latest.assessed_count > 0
        ? Math.round((((latest.high_risk_count ?? 0) + (latest.critical_risk_count ?? 0)) / latest.assessed_count) * 100)
        : 0,
    avgCompositeRiskScore: Number(latest?.avg_composite_score ?? 0)
  };
}

export async function getManagerOverview(client: SupabaseClient<Database>, tenantId: string, orgUnitId?: string) {
  const query = client
    .from("manager_dashboard_aggregates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("computed_at", { ascending: false })
    .limit(1);

  if (orgUnitId) {
    query.eq("org_unit_id", orgUnitId);
  }

  const { data } = await query.maybeSingle();
  const typedData = data as AggregateRow | null;

  return {
    assessedCount: typedData?.assessed_count ?? 0,
    totalEmployees: typedData?.total_employees ?? 0,
    coveragePercent: (typedData?.total_employees ?? 0) > 0 ? Math.round(typedData!.assessed_count / typedData!.total_employees * 100) : 0,
    highRiskCount: typedData?.high_risk_count ?? 0,
    criticalRiskCount: typedData?.critical_risk_count ?? 0,
    avgCompositeScore: Number(typedData?.avg_composite_score ?? 0),
    complianceScore: Number(typedData?.compliance_score ?? 0)
  };
}

export async function getRHHeatmap(client: SupabaseClient<Database>, tenantId: string) {
  const { data } = await client
    .from("manager_dashboard_aggregates")
    .select("org_unit_id, assessed_count, avg_composite_score, high_risk_count, critical_risk_count")
    .eq("tenant_id", tenantId)
    .not("org_unit_id", "is", null)
    .order("computed_at", { ascending: false });

  return (data ?? []).map((row: any) => ({
    businessUnit: row.org_unit_id || "Geral",
    assessedCount: row.assessed_count,
    avgRiskScore: Math.round(Number(row.avg_composite_score ?? 0)),
    highRiskCount: row.high_risk_count,
    criticalRiskCount: row.critical_risk_count
  }));
}

export async function getActionQueue(client: SupabaseClient<Database>, tenantId: string) {
  const { data: alerts } = await client
    .from("risk_alerts")
    .select("*, employees(id, full_name, business_unit), assessment_scores!risk_alerts_session_id_fkey(voice_path)")
    .eq("tenant_id", tenantId)
    .in("status", ["open", "in_review"])
    .order("created_at", { ascending: false })
    .limit(10);

  return (alerts ?? []).map((alert: any) => {
    return {
      id: alert.id,
      type: alert.alert_type,
      priority: alert.severity as "critical" | "high" | "moderate" | "low",
      title: `Alerta: ${alert.alert_type}`,
      employeeId: alert.employees?.id || "",
      ownerName: alert.employees?.full_name || "N/A",
      businessUnit: alert.employees?.business_unit || "Geral",
      dueDate: new Date(new Date(alert.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      voicePath: alert.assessment_scores?.voice_path || undefined,
      status: alert.status
    };
  });
}
