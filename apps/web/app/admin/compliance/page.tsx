import { OrganizationalHeatmap } from "../../../features/compliance/components/OrganizationalHeatmap";
import { createClient } from "../../../utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getCampaignsByTenant, getCampaignAggregates } from "@mindops/database";

export const dynamic = "force-dynamic";

export default async function CompliancePage({
  searchParams
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;
  const client = await createClient();

  // 🛡️ P0/P4: Resolução estrita do contexto de tenant
  const tenantContext = await resolveTenantContext({
    requiredRoles: ["admin", "dpo", "rh", "sst_professional", "auditor"],
    redirectToLoginOnFail: true
  });

  const tenantId = tenantContext.tenantId;
  const tenantName = tenantContext.tenantName;
  const countryCode = tenantContext.countryCode;

  // Obter campanhas da organização
  const campaigns = await getCampaignsByTenant(client as any, tenantId);
  const activeCampaign = campaignId
    ? campaigns.find((c) => c.id === campaignId) || campaigns[0]
    : campaigns[0];

  let aggregates = null;
  if (activeCampaign) {
    aggregates = await getCampaignAggregates(client as any, activeCampaign);
  }


  const departments = aggregates?.departmentHeatmap || [];
  const compositeRiskIndex = aggregates?.avgRiskScore || null;
  const totalAssessed = aggregates?.assessedCount || 0;
  const hasData = (aggregates?.hasResponses && totalAssessed > 0) || false;

  return (
    <div className="min-h-screen bg-slate-950">
      <OrganizationalHeatmap
        tenantName={tenantName}
        countryCode={countryCode}
        departments={departments}
        compositeRiskIndex={compositeRiskIndex}
        totalAssessed={totalAssessed}
        hasData={hasData}
      />
    </div>
  );
}
