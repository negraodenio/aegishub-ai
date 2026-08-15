"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  createCampaign,
  updateCampaignStatus,
  getCampaignsByTenant,
  getCampaignById,
  getCampaignAggregates,
  type CreateCampaignInput,
  type CampaignStatus
} from "@mindops/database";

/**
 * Cria uma nova campanha para a organização ativa do utilizador autenticado.
 */
export async function createCampaignAction(input: CreateCampaignInput) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const campaign = await createCampaign(
      supabase as any,
      context.tenantId,
      context.user.id,
      input
    );

    revalidatePath("/rh");
    revalidatePath("/admin/campaigns");
    return { success: true, campaign };
  } catch (error: any) {
    console.error("[CAMPAIGN ERROR] createCampaignAction failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Atualiza o status do ciclo de vida da campanha.
 */
export async function updateCampaignStatusAction(campaignId: string, newStatus: CampaignStatus) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const existing = await getCampaignById(supabase as any, campaignId);
    
    if (!existing || existing.tenant_id !== context.tenantId) {
      return { success: false, error: "Campanha não encontrada ou não autorizada para este tenant." };
    }

    const updated = await updateCampaignStatus(supabase as any, campaignId, newStatus);
    revalidatePath("/rh");
    revalidatePath("/admin/campaigns");
    return { success: true, campaign: updated };
  } catch (error: any) {
    console.error("[CAMPAIGN ERROR] updateCampaignStatusAction failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Lista as campanhas da organização do utilizador.
 */
export async function getCampaignsAction() {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional", "manager"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const campaigns = await getCampaignsByTenant(supabase as any, context.tenantId);
    return { success: true, campaigns };
  } catch (error: any) {
    console.error("[CAMPAIGN ERROR] getCampaignsAction failed:", error.message);
    return { success: false, campaigns: [], error: error.message };
  }
}
