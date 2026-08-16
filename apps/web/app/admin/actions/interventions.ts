"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  createIntervention,
  updateInterventionStatus,
  addInterventionEvidence,
  recordInterventionReassessment,
  getInterventionsByTenant,
  getInterventionKPIMetrics,
  type CreateInterventionInput,
  type AddEvidenceInput,
  type RecordReassessmentInput,
  type InterventionStatus
} from "@mindops/database";

/**
 * Cria uma intervenção com resolução server-side de tenant e RBAC.
 */
export async function createInterventionAction(input: CreateInterventionInput) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const action = await createIntervention(
      supabase as any,
      context.tenantId,
      context.user.id,
      input
    );

    revalidatePath("/rh");
    return { success: true, action };
  } catch (error: any) {
    console.error("[INTERVENTION_ACTION_ERROR] create failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza status da intervenção com validação de máquina de estados.
 */
export async function updateInterventionStatusAction(
  actionId: string,
  newStatus: InterventionStatus,
  notes?: string
) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const action = await updateInterventionStatus(
      supabase as any,
      context.tenantId,
      context.user.id,
      actionId,
      newStatus,
      notes
    );

    revalidatePath("/rh");
    return { success: true, action };
  } catch (error: any) {
    console.error("[INTERVENTION_ACTION_ERROR] updateStatus failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Anexa evidência documental à intervenção.
 */
export async function addEvidenceAction(
  actionId: string,
  input: AddEvidenceInput
) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const evidence = await addInterventionEvidence(
      supabase as any,
      context.tenantId,
      context.user.id,
      actionId,
      input
    );

    revalidatePath("/rh");
    return { success: true, evidence };
  } catch (error: any) {
    console.error("[INTERVENTION_ACTION_ERROR] addEvidence failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Registra reavaliação de eficácia técnica.
 */
export async function recordReassessmentAction(
  actionId: string,
  input: RecordReassessmentInput
) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const action = await recordInterventionReassessment(
      supabase as any,
      context.tenantId,
      context.user.id,
      actionId,
      input
    );

    revalidatePath("/rh");
    return { success: true, action };
  } catch (error: any) {
    console.error("[INTERVENTION_ACTION_ERROR] recordReassessment failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Retorna intervenções e métricas do tenant ativo.
 */
export async function getInterventionsDataAction(campaignId?: string) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "health_professional", "dpo", "auditor"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const actions = await getInterventionsByTenant(supabase as any, context.tenantId, campaignId ? { campaignId } : undefined);
    const kpis = await getInterventionKPIMetrics(supabase as any, context.tenantId, campaignId);

    return {
      success: true,
      data: {
        actions,
        kpis,
        tenantName: context.tenantName,
        countryCode: context.countryCode,
        userRole: context.role
      }
    };
  } catch (error: any) {
    console.error("[INTERVENTION_ACTION_ERROR] getInterventionsData failed:", error.message);
    return { success: false, error: error.message };
  }
}
