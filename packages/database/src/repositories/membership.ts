import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface TenantMembership {
  id: string;
  user_id?: string;
  tenant_id?: string;
  role: UserRole;
  status: "active" | "invited" | "suspended";
  tenant_name?: string;
  tenant_slug?: string;
  country_code?: "PT" | "BR" | string;
  created_at?: string;
  // Aliases para compatibilidade camelCase
  userId?: string;
  tenantId?: string;
  tenantName?: string;
  countryCode?: "PT" | "BR" | string;
}



/**
 * Retorna todas as memberships ativas de um utilizador autenticado.
 * Possui fallback resiliente e seguro para a tabela profiles para garantir retrocompatibilidade.
 */
export async function getUserMemberships(
  client: SupabaseClient<Database>,
  userId: string
): Promise<TenantMembership[]> {
  try {
    // 1. Tentar buscar em tenant_memberships
    const { data: memberships, error } = await (client
      .from("tenant_memberships" as any) as any)
      .select("id, user_id, tenant_id, role, status, created_at, tenants(id, name, slug, country_code)")
      .eq("user_id", userId)
      .eq("status", "active");

    if (!error && memberships && memberships.length > 0) {
      return memberships.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        tenant_id: m.tenant_id,
        role: m.role as UserRole,
        status: m.status,
        tenant_name: m.tenants?.name ?? "Organização",
        tenant_slug: m.tenants?.slug ?? "org",
        country_code: (m.tenants?.country_code === "BR" ? "BR" : "PT") as "PT" | "BR",
        created_at: m.created_at,
        userId: m.user_id,
        tenantId: m.tenant_id,
        tenantName: m.tenants?.name ?? "Organização"
      }));
    }
  } catch {
    // Se a tabela ainda estiver em provisionamento, segue para o fallback seguro
  }

  // 2. Fallback de compatibilidade para profiles
  try {
    const query = (client.from("profiles") as any)
      .select("id, tenant_id, role, tenants(id, name, slug, country_code)")
      .eq("id", userId);

    const { data: profile } = typeof query.maybeSingle === "function"
      ? await query.maybeSingle()
      : typeof query.single === "function"
      ? await query.single()
      : { data: null };

    if (profile && (profile as any).tenant_id) {
      const p = profile as any;
      return [{
        id: `profile-${p.id}`,
        user_id: p.id,
        tenant_id: p.tenant_id,
        role: p.role as UserRole,
        status: "active",
        tenant_name: p.tenants?.name ?? "Organização",
        tenant_slug: p.tenants?.slug ?? "org",
        country_code: (p.tenants?.country_code === "BR" ? "BR" : "PT") as "PT" | "BR",
        userId: p.id,
        tenantId: p.tenant_id,
        tenantName: p.tenants?.name ?? "Organização"
      }];
    }
  } catch {
    // Retorna vazio caso não haja perfil
  }

  return [];
}
