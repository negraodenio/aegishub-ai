import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  createIntervention,
  getInterventionsByTenant,
  getInterventionKPIMetrics
} from "@mindops/database";
import { z } from "zod";

const CreateInterventionSchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional().nullable(),
  hazardFactor: z.string().min(2, "Fator de risco é obrigatório"),
  processActivity: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  responsibleName: z.string().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)")
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const status = searchParams.get("status") || undefined;
    const requestedTenantId = searchParams.get("tenantId");

    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh", "manager", "health_professional", "dpo", "auditor"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const interventions = await getInterventionsByTenant(supabase as any, context.tenantId, { campaignId, status });
    const kpis = await getInterventionKPIMetrics(supabase as any, context.tenantId, campaignId);

    return NextResponse.json({
      success: true,
      tenantId: context.tenantId,
      interventions,
      kpis
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "rh"],
      redirectToLoginOnFail: false
    });

    const body = await request.json();
    const parsed = CreateInterventionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }

    const supabase = await createClient();
    const intervention = await createIntervention(
      supabase as any,
      context.tenantId,
      context.user.id,
      parsed.data as any
    );

    return NextResponse.json({ success: true, intervention }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
