import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getCampaignById, getCampaignAggregates } from "@mindops/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional", "manager"],
      redirectToLoginOnFail: false
    });

    const supabase = await createClient();
    const campaign = await getCampaignById(supabase as any, campaignId);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // 🛡️ ANTI-IDOR / ANTI-CROSS-TENANT: A campanha DEVE pertencer ao tenant da sessão ativa
    if (campaign.tenant_id !== context.tenantId) {
      console.warn(`[SECURITY ALERT] Cross-tenant campaign aggregate attempt by ${context.user.id} on campaign ${campaignId}`);
      return NextResponse.json({ error: "Forbidden: Cross-tenant access denied" }, { status: 403 });
    }

    const aggregates = await getCampaignAggregates(supabase as any, campaign);
    return NextResponse.json({ success: true, aggregates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
