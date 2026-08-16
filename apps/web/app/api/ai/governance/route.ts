import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getAIGovernanceMetrics, getPendingAIDecisions, getAIAuditLogs } from "@mindops/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedTenantId = searchParams.get("tenantId");

    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "health_professional", "manager", "rh"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const metrics = await getAIGovernanceMetrics(supabase as any, context.tenantId);
    const pendingDecisions = await getPendingAIDecisions(supabase as any, context.tenantId);
    const auditLogs = await getAIAuditLogs(supabase as any, context.tenantId, 30);

    return NextResponse.json({
      success: true,
      tenantId: context.tenantId,
      metrics,
      pendingDecisions,
      auditLogs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
