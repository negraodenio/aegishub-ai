import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { executeRightToErasure } from "@mindops/database";

export const dynamic = "force-dynamic";

/**
 * 🗑️ DELETE /api/privacy/me
 * Executa o Direito ao Esquecimento (Right to Erasure) para o utilizador autenticado
 * Fonte única de identidade: auth.uid()
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Sessão inválida ou expirada" }, { status: 401 });
    }

    const context = await resolveTenantContext({
      redirectToLoginOnFail: false
    });

    const erasureResult = await executeRightToErasure(
      supabase as any,
      user.id,
      context.tenantId
    );

    return NextResponse.json({
      success: true,
      message: "Dados pessoais e cognitivos eliminados com sucesso. Registros legais anonimizados.",
      erasure: erasureResult
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Não foi possível processar a solicitação de eliminação de dados." },
      { status: 500 }
    );
  }
}
