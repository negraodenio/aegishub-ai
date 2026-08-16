import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logCognitiveSupportEvent ,  resolveAuthorizedTenantContext,
  acquireLlmLease
,
  checkFeatureEntitlement
,
  getCognitiveUserProfile
} from "@mindops/database";
import { resolveCorrelationId, CORRELATION_HEADER } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

const ALLOWED_STUCK_CATEGORIES = ["overwhelm", "distraction", "low_energy"];
const ALLOWED_STUCK_EVENTS = [
  "stuck_triggered",
  "stuck_category_selected",
  "micro_action_started",
  "micro_action_completed"
];

/**
 * 🧘 POST /api/cognitive/stuck
 * Registro de etapas do fluxo de recuperação de foco e bloqueios operacionais
 * - 4-step: Breathe -> Identify -> Micro Win 10s -> Done
 * - 100% não clínico e funcional
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
    const { tenantId: requestedTenantId, eventType, category, step, context = {} } = body;

    const authTenantContext = await resolveAuthorizedTenantContext(client as any, user.id, requestedTenantId);
    if (authTenantContext.error || !authTenantContext.tenantId) {
      return NextResponse.json(
        { error: authTenantContext.error || "UNAUTHORIZED_TENANT_CONTEXT" },
        { status: 403, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }
    const tenantId = authTenantContext.tenantId;


    if (false /* tenant check moved */ || !eventType) {
      return NextResponse.json(
        { error: "BAD_REQUEST: tenantId e eventType são obrigatórios" },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    if (!ALLOWED_STUCK_EVENTS.includes(eventType)) {
      return NextResponse.json(
        { error: `BAD_REQUEST: eventType inválido (${eventType})` },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    if (category && !ALLOWED_STUCK_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `BAD_REQUEST: Categoria inválida (${category})` },
        { status: 400, headers: { [CORRELATION_HEADER]: correlationId } }
      );
    }

    const event = await logCognitiveSupportEvent(client as any, {
      userId: user.id,
      tenantId,
      eventType,
      context: {
        ...context,
        category: category || null,
        step: step || null,
        correlationId
      }
    });

    return NextResponse.json(
      { success: true, eventId: event?.id },
      { status: 200, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: { [CORRELATION_HEADER]: correlationId } }
    );
  }
}

