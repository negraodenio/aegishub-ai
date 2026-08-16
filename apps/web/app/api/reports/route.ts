import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getComplianceReportsByTenant } from "@mindops/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const reportType = (searchParams.get("reportType") as any) || undefined;
    const requestedTenantId = searchParams.get("tenantId");

    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "dpo", "auditor", "health_professional"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const reports = await getComplianceReportsByTenant(supabase as any, context.tenantId, {
      campaignId,
      reportType
    });

    return NextResponse.json({
      success: true,
      tenantId: context.tenantId,
      reports
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
