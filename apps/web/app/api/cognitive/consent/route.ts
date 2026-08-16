import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getCognitiveUserProfile,
  upsertCognitiveUserProfile,
  revokeCognitiveConsent
} from "@mindops/database";

export const dynamic = "force-dynamic";

/**
 * 🛡️ POST /api/cognitive/consent
 * Registro ou revogação de consentimento informado (Art. 9º RGPD / Art. 11º LGPD)
 */
export async function POST(req: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "UNAUTHORIZED: Sessão inválida" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, consentVersion, revoke } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "BAD_REQUEST: tenantId é obrigatório" }, { status: 400 });
    }

    if (revoke) {
      await revokeCognitiveConsent(client as any, user.id);
      return NextResponse.json({ success: true, isConsentRevoked: true });
    }

    const updated = await upsertCognitiveUserProfile(client as any, {
      user_id: user.id,
      tenant_id: tenantId,
      consent_version: consentVersion || "1.0-RGPD-LGPD",
      consent_given_at: new Date().toISOString(),
      is_consent_revoked: false
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: "Consentimento registrado com sucesso."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
