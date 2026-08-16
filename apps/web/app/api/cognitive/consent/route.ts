import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getCognitiveUserProfile,
  upsertCognitiveUserProfile,
  revokeCognitiveConsent,
  resolveAuthorizedTenantContext
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

/**
 * 🛡️ POST /api/cognitive/consent
 * Registro ou revogação de consentimento informado (Art. 9º RGPD / Art. 11º LGPD)
 * - Validação autoritativa de tenant no servidor (resolveAuthorizedTenantContext)
 * - Zero persistência de tenantId não autenticado
 */
export async function POST(req: NextRequest) {
  const correlationId = resolveCorrelationId(req.headers.get(CORRELATION_HEADER));
  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Sessão inválida" },
        { status: 401, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const body = await req.json();
    const { tenantId: requestedTenantId, consentVersion, revoke } = body;

    // 1. Resolução autoritativa de tenant no servidor (SEC-02)
    const authTenantContext = await resolveAuthorizedTenantContext(client as any, user.id, requestedTenantId);
    if (authTenantContext.error || !authTenantContext.tenantId) {
      return NextResponse.json(
        { error: authTenantContext.error || "UNAUTHORIZED_TENANT_CONTEXT" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }
    const tenantId = authTenantContext.tenantId;

    if (revoke) {
      await revokeCognitiveConsent(client as any, user.id);
      return NextResponse.json(
        { success: true, isConsentRevoked: true, tenantId },
        { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const updated = await upsertCognitiveUserProfile(client as any, {
      user_id: user.id,
      tenant_id: tenantId,
      consent_version: consentVersion || "1.0-RGPD-LGPD",
      consent_given_at: new Date().toISOString(),
      is_consent_revoked: false
    });

    return NextResponse.json(
      {
        success: true,
        profile: updated,
        message: "Consentimento registrado com sucesso."
      },
      { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}
