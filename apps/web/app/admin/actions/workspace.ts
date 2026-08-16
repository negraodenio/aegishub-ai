"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getUserMemberships, type TenantMembership } from "@mindops/database";

/**
 * Alterna a organização ativa da sessão de forma segura e autenticada.
 * Valida estritamente se o utilizador possui associação ativa em `tenant_memberships`.
 */
export async function switchOrganizationAction(targetTenantId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("UNAUTHORIZED: Sessão expirada ou não autenticada.");
    }

    // 1. Obter todas as memberships ativas do usuário
    const memberships = await getUserMemberships(supabase as any, user.id);
    const targetMembership = memberships.find(
      (m) => m.tenant_id === targetTenantId && m.status === "active"
    );

    if (!targetMembership) {
      throw new Error(
        "FORBIDDEN: Você não possui permissão ativa para aceder a esta organização."
      );
    }

    // 2. Gravar cookie de sessão seguro HTTP-only com o tenant ativo
    const cookieStore = await cookies();
    cookieStore.set("current_tenant_id", targetTenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 dias
    });

    // 3. Revalidar rotas protegidas do dashboard
    revalidatePath("/rh");
    revalidatePath("/clinical");
    revalidatePath("/manager");
    revalidatePath("/admin");

    return {
      success: true,
      tenantId: targetTenantId,
      tenantName: targetMembership.tenant_name,
      countryCode: targetMembership.country_code,
      role: targetMembership.role
    };
  } catch (error: any) {
    console.error("[WORKSPACE_SWITCH_ERROR] failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Retorna todas as organizações onde o usuário autenticado possui vínculo ativo.
 */
export async function getUserOrganizationsAction() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Não autenticado." };
    }

    const memberships = await getUserMemberships(supabase as any, user.id);
    return { success: true, memberships };
  } catch (error: any) {
    console.error("[WORKSPACE_GET_ORGS_ERROR] failed:", error.message);
    return { success: false, error: error.message };
  }
}
