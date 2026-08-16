import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getComplianceReportById, logReportDownloadAudit } from "@mindops/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "dpo", "auditor", "health_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const report = await getComplianceReportById(supabase as any, context.tenantId, reportId);

    if (!report) {
      return NextResponse.json({ error: "Report not found or access denied" }, { status: 404 });
    }

    // Registra visualização/acesso
    await logReportDownloadAudit(supabase as any, context.tenantId, reportId, context.user.id, report.campaign_id);

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
