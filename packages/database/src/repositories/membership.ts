import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  status: "active" | "invited" | "suspended";
  tenantName?: string;
  countryCode?: string;
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
      .select("id, user_id, tenant_id, role, status, tenants(name, country_code)")
      .eq("user_id", userId)
      .eq("status", "active");

    if (!error && memberships && memberships.length > 0) {
      return memberships.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        tenantId: m.tenant_id,
        role: m.role as UserRole,
        status: m.status,
        tenantName: m.tenants?.name ?? "Organização",
        countryCode: m.tenants?.country_code ?? "PT"
      }));
    }
  } catch {
    // Se a tabela ainda estiver em provisionamento, segue para o fallback seguro
  }

  // 2. Fallback de compatibilidade para profiles
  const { data: profile } = await (client
    .from("profiles") as any)
    .select("id, tenant_id, role, tenants(name, country_code)")
    .eq("id", userId)
    .single();

  if (profile && (profile as any).tenant_id) {
    return [{
      id: `profile-${(profile as any).id}`,
      userId: (profile as any).id,
      tenantId: (profile as any).tenant_id,
      role: (profile as any).role as UserRole,
      status: "active",
      tenantName: (profile as any).tenants?.name ?? "Organização",
      countryCode: (profile as any).tenants?.country_code ?? "PT"
    }];
  }

  return [];
}

