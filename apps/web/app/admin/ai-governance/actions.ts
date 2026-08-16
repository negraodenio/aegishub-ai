"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  validateAIDecision,
  getAIGovernanceMetrics,
  getPendingAIDecisions,
  getAIAuditLogs
} from "@mindops/database";

/**
 * Valida ou Rejeita uma decisão da IA com persistência real em ai_decisions e log imutável.
 */
export async function validateAIDecisionAction(
  decisionId: string,
  action: "approved" | "rejected",
  feedback?: string
) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "health_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const result = await validateAIDecision(
      supabase as any,
      context.tenantId,
      context.user.id,
      decisionId,
      { action, feedback }
    );

    revalidatePath("/rh/intelligence");
    return { success: true, decision: result.decision };
  } catch (error: any) {
    console.error("[AI GOVERNANCE ERROR] validateAIDecisionAction failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Retorna os dados consolidados do centro de governança para a organização ativa.
 */
export async function getAIGovernanceDataAction() {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "health_professional", "manager", "rh"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const metrics = await getAIGovernanceMetrics(supabase as any, context.tenantId);
    const pendingDecisions = await getPendingAIDecisions(supabase as any, context.tenantId);
    const auditLogs = await getAIAuditLogs(supabase as any, context.tenantId, 25);

    return {
      success: true,
      data: {
        tenantName: context.tenantName,
        countryCode: context.countryCode,
        metrics,
        pendingDecisions,
        auditLogs
      }
    };
  } catch (error: any) {
    console.error("[AI GOVERNANCE ERROR] getAIGovernanceDataAction failed:", error.message);
    return { success: false, error: error.message };
  }
}
