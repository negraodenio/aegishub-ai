import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserMemberships } from "@mindops/database";
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 🛡️ P0 SECURITY: 1. Autenticação Obrigatória
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🛡️ P0 SECURITY: 2. Validação de Membership & Autorização
    const memberships = await getUserMemberships(supabase as any, user.id);
    const authorizedMembership = memberships.find(m => m.tenantId === parsed.data.tenantId);

    if (!authorizedMembership) {
      console.warn(`[SECURITY] Forbidden manager overview access attempt by ${user.id} on tenant ${parsed.data.tenantId}`);
      return NextResponse.json({ error: "Forbidden: No authorized membership in this tenant" }, { status: 403 });
    }

    // 🛡️ P0 SECURITY: 3. Validação de RBAC
    const allowedRoles = ["admin", "manager", "rh", "sst_professional"];
    if (!allowedRoles.includes(authorizedMembership.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient role permissions" }, { status: 403 });
    }

    // 🛡️ P0 SECURITY: 4. Query protegida com cliente de sessão (RLS)
    const query = supabase
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

    const agg = data as any;

    // Ensure manager views are aggregated only
    return NextResponse.json({
      assessedCount: agg.assessed_count,
      totalEmployees: agg.total_employees,
      coveragePercent: agg.total_employees > 0 ? Math.round((agg.assessed_count / agg.total_employees) * 100) : 0,
      highRiskCount: agg.high_risk_count,
      criticalRiskCount: agg.critical_risk_count,
      avgCompositeScore: Number(agg.avg_composite_score ?? 0),
      complianceScore: Number(agg.compliance_score ?? 0)
    });

  } catch (error) {
    console.error("Manager Overview Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
