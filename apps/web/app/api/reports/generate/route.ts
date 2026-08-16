import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { generateAndSaveComplianceReport } from "@mindops/database";
import { reportGenerationRateLimiter } from "@mindops/ai-core";
import { z } from "zod";

export const dynamic = "force-dynamic";

const GenerateReportSchema = z.object({
  campaignId: z.string().uuid("Campaign ID inválido").optional().nullable(),
  reportType: z.enum([
    "campaign_executive",
    "sst_action_plan",
    "act_evidence_pt",
    "nr1_pgr_evidence_br",
    "intervention_effectiveness",
    "ai_governance_audit"
  ]),
  jurisdiction: z.enum(["PT", "BR"]).optional(),
  title: z.string().max(200).optional(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(request: Request) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "dpo", "auditor", "manager"],
      redirectToLoginOnFail: false
    });

    // 🛡️ Rate Limiting por tenant (máx 5 relatórios pesados / minuto)
    const rateLimit = reportGenerationRateLimiter.check(context.tenantId);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `RATE_LIMIT_EXCEEDED: Limite de geração de relatórios atingido. Aguarde ${rateLimit.retryAfterSeconds}s.` },
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
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "PAYLOAD_VALIDATION_FAILED", details: parsed.error.format() }, { status: 400 });
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
    return NextResponse.json({ error: error.message || "Erro ao gerar relatório" }, { status: 403 });
  }
}
