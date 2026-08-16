import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { exportUserData, logPrivacyEvent } from "@mindops/database";

export const dynamic = "force-dynamic";

/**
 * 📥 GET /api/privacy/export
 * Exporta todos os dados pessoais do utilizador autenticado (Data Portability)
 * Fonte única de identidade: auth.uid()
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Sessão inválida ou expirada" }, { status: 401 });
    }

    const context = await resolveTenantContext({
      redirectToLoginOnFail: false
    });

    const exportData = await exportUserData(
      supabase as any,
      user.id,
      context.tenantId
    );

    // Registro de evento de auditoria
    await logPrivacyEvent(supabase as any, {
      tenant_id: context.tenantId,
      user_id: user.id,
      event_type: "data_export_requested",
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Não foi possível processar a exportação de dados pessoais." },
      { status: 500 }
    );
  }
}
