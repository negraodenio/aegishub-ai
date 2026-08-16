import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { addInterventionEvidence, getInterventionEvidence } from "@mindops/database";
import { evidenceUploadRateLimiter } from "@mindops/ai-core";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AddEvidenceSchema = z.object({
  evidenceType: z.enum([
    "document", "policy", "procedure", "training_record",
    "meeting_minutes", "work_schedule", "ergonomic_assessment", "photo", "other"
  ]),
  title: z.string().min(2, "Título é obrigatório").max(200, "Título excede limite"),
  description: z.string().max(2000, "Descrição excede limite").optional().nullable(),
  fileUrl: z.string().url("URL de arquivo inválida").optional().nullable(),
  fileHash: z.string().regex(/^[a-f0-9]{64}$/i, "Hash SHA-256 inválido").optional().nullable(),
  campaignId: z.string().uuid("Campaign ID inválido").optional().nullable()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: actionId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "health_professional", "dpo", "auditor"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const evidence = await getInterventionEvidence(supabase as any, context.tenantId, actionId);

    return NextResponse.json({ success: true, evidence });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Acesso não autorizado" }, { status: 403 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: actionId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager"],
      redirectToLoginOnFail: false
    });

    // 🛡️ Rate Limiting por utilizador autenticado (20 reqs/min)
    const rateLimit = evidenceUploadRateLimiter.check(context.user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `RATE_LIMIT_EXCEEDED: Limite de uploads atingido. Tente novamente em ${rateLimit.retryAfterSeconds}s.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining)
          }
        }
      );
    }

    const body = await request.json();
    const parsed = AddEvidenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "PAYLOAD_VALIDATION_FAILED", details: parsed.error.format() }, { status: 400 });
    }

    const supabase = await createClient();
    const evidence = await addInterventionEvidence(
      supabase as any,
      context.tenantId,
      context.user.id,
      actionId,
      parsed.data as any
    );

    return NextResponse.json({ success: true, evidence }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao processar evidência" }, { status: 403 });
  }
}
