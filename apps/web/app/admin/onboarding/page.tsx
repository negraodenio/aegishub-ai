import { resolveTenantContext } from "@/lib/tenant-context";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const context = await resolveTenantContext({
    requiredRoles: ["admin"],
    redirectToLoginOnFail: true
  });

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 font-sans">
      <OnboardingWizard
        tenantId={context.tenantId}
        tenantName={context.tenantName}
        countryCode={context.countryCode}
      />
    </div>
  );
}
