import { EmployeeManagement } from "../../../features/rh-dashboard/components/EmployeeManagement";
import { resolveTenantContext } from "@/lib/tenant-context";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  // 🛡️ P0/P4: Resolução estrita do contexto de tenant
  const tenantContext = await resolveTenantContext({
    requiredRoles: ["admin", "rh", "sst_professional"],
    redirectToLoginOnFail: true
  });

  return (
    <div className="p-8 md:p-12 min-h-screen bg-[#050505]">
      <div className="max-w-[1440px] mx-auto">
        <EmployeeManagement countryCode={tenantContext.countryCode} />
      </div>
    </div>
  );
}
