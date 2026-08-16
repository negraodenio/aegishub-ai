"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  generateAndSaveComplianceReport,
  getComplianceReportsByTenant,
  getComplianceReportById,
  logReportDownloadAudit,
  type GenerateReportInput,
  type ReportType
} from "@mindops/database";

/**
 * Gera e persiste relatório regulatório com isolamento de tenant e controle de acesso RBAC.
 */
export async function generateComplianceReportAction(input: GenerateReportInput) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "dpo", "auditor", "manager"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const report = await generateAndSaveComplianceReport(
      supabase as any,
      context.tenantId,
      context.user.id,
      input
    );

    revalidatePath("/rh");
    return { success: true, report };
  } catch (error: any) {
    console.error("[REPORT_ACTION_ERROR] generate failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém lista de relatórios gerados para o tenant ativo.
 */
export async function getComplianceReportsAction(campaignId?: string | null, reportType?: ReportType | null) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "dpo", "auditor", "health_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const reports = await getComplianceReportsByTenant(supabase as any, context.tenantId, {
      campaignId: campaignId || undefined,
      reportType: reportType || undefined
    });

    return { success: true, reports };
  } catch (error: any) {
    console.error("[REPORT_ACTION_ERROR] getReports failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Registra auditoria de download de relatório.
 */
export async function logReportDownloadAction(reportId: string, campaignId?: string | null) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "dpo", "auditor", "health_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    await logReportDownloadAudit(
      supabase as any,
      context.tenantId,
      reportId,
      context.user.id,
      campaignId
    );

    return { success: true };
  } catch (error: any) {
    console.error("[REPORT_ACTION_ERROR] logDownload failed:", error.message);
    return { success: false, error: error.message };
  }
}
