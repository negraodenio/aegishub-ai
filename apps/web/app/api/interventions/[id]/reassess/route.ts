import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { recordInterventionReassessment } from "@mindops/database";
import { z } from "zod";

const ReassessmentSchema = z.object({
  effectivenessRating: z.enum(["effective", "partially_effective", "ineffective", "not_assessed"]),
  effectivenessScore: z.number().min(0).max(100).optional().nullable(),
  rationale: z.string().min(5, "Justificativa técnica é obrigatória"),
  reassessmentCampaignId: z.string().uuid().optional().nullable()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: actionId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const body = await request.json();
    const parsed = ReassessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }

    const supabase = await createClient();
    const action = await recordInterventionReassessment(
      supabase as any,
      context.tenantId,
      context.user.id,
      actionId,
      parsed.data as any
    );

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
