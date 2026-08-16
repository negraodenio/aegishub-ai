import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { addInterventionEvidence, getInterventionEvidence } from "@mindops/database";
import { z } from "zod";

const AddEvidenceSchema = z.object({
  evidenceType: z.enum([
    "document", "policy", "procedure", "training_record",
    "meeting_minutes", "work_schedule", "ergonomic_assessment", "photo", "other"
  ]),
  title: z.string().min(2, "Título é obrigatório"),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  fileHash: z.string().optional().nullable(),
  campaignId: z.string().uuid().optional().nullable()
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
    return NextResponse.json({ error: error.message }, { status: 403 });
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

    const body = await request.json();
    const parsed = AddEvidenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
