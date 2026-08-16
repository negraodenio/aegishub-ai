import { resolveTenantContext } from "@/lib/tenant-context";
import { createClient } from "@/utils/supabase/server";
import { getTenantCommercialSummary } from "@mindops/database";
import { CommercialConsole } from "@/features/commercial/components/CommercialConsole";

export const dynamic = "force-dynamic";

export default async function CommercialAdminPage() {
  const context = await resolveTenantContext({
    requiredRoles: ["admin"],
    redirectToLoginOnFail: true
  });

  const supabase = await createClient();
  const summary = await getTenantCommercialSummary(supabase as any, context.tenantId);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 font-sans">
      <CommercialConsole
        summary={summary}
        countryCode={context.countryCode}
      />
    </div>
  );
}
