import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserMemberships, type TenantMembership, type UserRole } from "@mindops/database";
import type { User } from "@supabase/supabase-js";

export interface AuthorizedTenantContext {
  user: User;
  tenantId: string;
  tenantName: string;
  countryCode: "PT" | "BR";
  role: UserRole;
  membership: TenantMembership;
  availableMemberships: TenantMembership[];
}

export interface ResolveTenantOptions {
  requiredRoles?: UserRole[];
  requestedTenantId?: string | null;
  redirectToLoginOnFail?: boolean;
}

/**
 * Resolve e valida estritamente o contexto de tenant server-side.
 * 
 * Regras:
 * 1. Verifica se existe sessão de utilizador ativa (auth.getUser()). Se não -> Redireciona para /auth/login ou lança 401.
 * 2. Busca todas as memberships ativas do utilizador. Se nenhuma ativa -> Redireciona para /auth/login?error=no_membership.
 * 3. Se um tenantId for solicitado via parâmetro:
 *    - Valida se o utilizador TEM membership ativa nesse tenant específico.
 *    - Se NÃO tiver -> Rejeita imediatamente (IDOR Protection / 403 Forbidden).
 * 4. Se nenhum tenantId for solicitado:
 *    - Seleciona o primeiro tenant ativo da lista de memberships autorizadas.
 * 5. Se requiredRoles for especificado:
 *    - Valida se a role do utilizador no tenant ativo satisfaz a permissão.
 *    - Se NÃO satisfizer -> Redireciona para /unauthorized ou lança erro de autorização.
 */
export async function resolveTenantContext(
  options: ResolveTenantOptions = {}
): Promise<AuthorizedTenantContext> {
  const {
    requiredRoles,
    requestedTenantId,
    redirectToLoginOnFail = true
  } = options;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    if (redirectToLoginOnFail) {
      redirect("/auth/login");
    }
    throw new Error("UNAUTHORIZED: Sessão não encontrada ou expirada.");
  }

  // 2. Obter memberships ativas do utilizador no banco
  const memberships = await getUserMemberships(supabase as any, user.id);

  if (!memberships || memberships.length === 0) {
    if (redirectToLoginOnFail) {
      redirect("/auth/login?error=no_active_membership");
    }
    throw new Error("FORBIDDEN: O utilizador não possui nenhuma organização associada.");
  }

  // 3. Resolver tenant ativo
  let activeMembership: TenantMembership | undefined;

  if (requestedTenantId) {
    // 🛡️ ANTI-IDOR / ANTI-SPOOFING: O tenant solicitado DEVE pertencer às memberships ativas do utilizador
    activeMembership = memberships.find(m => m.tenantId === requestedTenantId);
    
    if (!activeMembership) {
      // Tentativa de acessar tenant não autorizado!
      console.warn(`[SECURITY ALERT] Cross-tenant access attempt blocked for user ${user.id} -> tenant ${requestedTenantId}`);
      if (redirectToLoginOnFail) {
        // Redireciona para o tenant padrão do próprio utilizador
        activeMembership = memberships[0];
      } else {
        throw new Error("FORBIDDEN: Acesso negado a este tenant.");
      }
    }
  } else {
    // Usa o primeiro tenant ativo
    activeMembership = memberships[0];
  }

  if (!activeMembership) {
    if (redirectToLoginOnFail) {
      redirect("/auth/login?error=no_active_membership");
    }
    throw new Error("FORBIDDEN: Nenhuma organização ativa encontrada.");
  }

  const resolvedMemb: TenantMembership = activeMembership;

  // 4. Validar RBAC se requiredRoles foi especificado
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(resolvedMemb.role);
    if (!hasRole) {
      console.warn(`[SECURITY ALERT] Insufficient role permissions for user ${user.id}. Required: [${requiredRoles.join(",")}], Current: ${resolvedMemb.role}`);
      if (redirectToLoginOnFail) {
        redirect("/auth/login?error=insufficient_permissions");
      }
      throw new Error(`FORBIDDEN: Permissão insuficiente (${resolvedMemb.role}). Requer: [${requiredRoles.join(", ")}]`);
    }
  }

  return {
    user,
    tenantId: resolvedMemb.tenantId,
    tenantName: resolvedMemb.tenantName ?? "Organização",
    countryCode: (resolvedMemb.countryCode === "BR" ? "BR" : "PT"),
    role: resolvedMemb.role,
    membership: resolvedMemb,
    availableMemberships: memberships
  };
}

