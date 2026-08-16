import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { generateAndSaveComplianceReport } from "@mindops/database";
import { z } from "zod";

const GenerateReportSchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  reportType: z.enum([
    "campaign_executive",
    "sst_action_plan",
    "act_evidence_pt",
    "nr1_pgr_evidence_br",
    "intervention_effectiveness",
    "ai_governance_audit"
  ]),
  jurisdiction: z.enum(["PT", "BR"]).optional(),
  title: z.string().optional(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(request: Request) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "dpo", "auditor", "manager"],
      redirectToLoginOnFail: false
    });

    const body = await request.json();
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }

    const supabase = await createClient();
    const report = await generateAndSaveComplianceReport(
      supabase as any,
      context.tenantId,
      context.user.id,
      parsed.data as any
    );

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
