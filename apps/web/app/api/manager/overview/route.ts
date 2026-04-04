import { NextResponse } from "next/server";
import { supabaseAdmin } from "@mindops/database";
import { z } from "zod";

const QuerySchema = z.object({
  tenantId: z.string().uuid(),
  orgUnitId: z.string().uuid().optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const orgUnitId = searchParams.get("orgUnitId");

  const parsed = QuerySchema.safeParse({ tenantId, orgUnitId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const query = supabaseAdmin
      .from("manager_dashboard_aggregates")
      .select("*")
      .eq("tenant_id", parsed.data.tenantId)
      .order("computed_at", { ascending: false })
      .limit(1);

    if (parsed.data.orgUnitId) {
      query.eq("org_unit_id", parsed.data.orgUnitId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ message: "No data found" }, { status: 404 });

    // Ensure manager views are aggregated only
    return NextResponse.json({
      assessedCount: data.assessed_count,
      totalEmployees: data.total_employees,
      coveragePercent: data.total_employees > 0 ? Math.round((data.assessed_count / data.total_employees) * 100) : 0,
      highRiskCount: data.high_risk_count,
      criticalRiskCount: data.critical_risk_count,
      avgCompositeScore: Number(data.avg_composite_score ?? 0),
      complianceScore: Number(data.compliance_score ?? 0)
    });
  } catch (error) {
    console.error("Manager Overview Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
