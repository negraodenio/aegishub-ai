import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { validateAIDecision } from "@mindops/database";
import { z } from "zod";

const ValidationSchema = z.object({
  action: z.enum(["approved", "rejected"]),
  feedback: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: decisionId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "health_professional"],
      redirectToLoginOnFail: false
    });

    const body = await request.json();
    const parsed = ValidationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action payload", details: parsed.error }, { status: 400 });
    }

    const supabase = await createClient();
    const result = await validateAIDecision(
      supabase as any,
      context.tenantId,
      context.user.id,
      decisionId,
      parsed.data
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
