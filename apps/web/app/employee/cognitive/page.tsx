import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  getTenantCognitiveSettings,
  getCognitiveUserProfile,
  getCognitiveTasks
} from "@mindops/database";
import { CognitiveExecutiveWorkspace } from "@/features/cognitive/components/CognitiveExecutiveWorkspace";

export const dynamic = "force-dynamic";

export default async function EmployeeCognitivePage() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/employee/cognitive");
  }

  // 🛡️ Resolução de contexto de tenant do colaborador
  const tenantContext = await resolveTenantContext({
    requiredRoles: ["employee", "admin", "rh", "manager", "sst_professional"],
    redirectToLoginOnFail: true
  });

  const tenantId = tenantContext.tenantId;
  const tenantSettings = await getTenantCognitiveSettings(client as any, tenantId);
  const isBenefitEnabled = tenantSettings?.is_enabled ?? false;

  const profile = await getCognitiveUserProfile(client as any, user.id);
  const tasks = await getCognitiveTasks(client as any, user.id);

  return (
    <CognitiveExecutiveWorkspace
      tenantId={tenantId}
      tenantName={tenantContext.tenantName}
      initialProfile={profile}
      initialTasks={tasks}
      isBenefitEnabled={isBenefitEnabled}
      countryCode={tenantContext.countryCode as "PT" | "BR"}
    />
  );
}
