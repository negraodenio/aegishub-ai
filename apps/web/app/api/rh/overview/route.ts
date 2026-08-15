import { NextResponse } from "next/server";
import { getRHOverview, getUserMemberships } from "@mindops/database";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const QuerySchema = z.object({
  tenantId: z.string().uuid()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  const parsed = QuerySchema.safeParse({ tenantId });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 🛡️ P0 SECURITY: 1. Autenticação Obrigatória
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🛡️ P0 SECURITY: 2. Validação de Membership & Autorização
    const memberships = await getUserMemberships(supabase as any, user.id);
    const authorizedMembership = memberships.find(m => m.tenantId === parsed.data.tenantId);

    if (!authorizedMembership) {
      console.warn(`[SECURITY] Forbidden RH overview access attempt by ${user.id} on tenant ${parsed.data.tenantId}`);
      return NextResponse.json({ error: "Forbidden: No authorized membership in this tenant" }, { status: 403 });
    }

    // 🛡️ P0 SECURITY: 3. Validação de RBAC
    const allowedRoles = ["admin", "rh", "sst_professional", "manager"];
    if (!allowedRoles.includes(authorizedMembership.role)) {
      return NextResponse.json({ error: "Forbidden: Insufficient role permissions" }, { status: 403 });
    }

    const data = await getRHOverview(supabase as any, parsed.data.tenantId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("RH Overview Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
