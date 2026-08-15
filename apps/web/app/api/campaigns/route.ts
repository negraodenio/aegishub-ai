import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getCampaignsByTenant, createCampaign } from "@mindops/database";
import { z } from "zod";

const CreateCampaignSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  countryCode: z.enum(["PT", "BR"]).optional(),
  methodology: z.string().optional(),
  instruments: z.array(z.string()).optional(),
  targetDepartments: z.array(z.string()).optional(),
  targetBusinessUnits: z.array(z.string()).optional(),
  minAnonymityGroupSize: z.number().min(3).optional(),
  startDate: z.string(),
  endDate: z.string(),
  allowVoiceScreening: z.boolean().optional()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedTenantId = searchParams.get("tenantId");

    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional", "manager"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const campaigns = await getCampaignsByTenant(supabase as any, context.tenantId);

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const body = await request.json();
    const parsed = CreateCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }

    const supabase = await createClient();
    const campaign = await createCampaign(
      supabase as any,
      context.tenantId,
      context.user.id,
      parsed.data as any
    );


    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
