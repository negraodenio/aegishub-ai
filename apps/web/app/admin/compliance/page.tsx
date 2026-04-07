import { OrganizationalHeatmap } from "../../../features/compliance/components/OrganizationalHeatmap";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verificar se o utilizador tem perfil de Admin ou DPO
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as any;

  if (profile?.role === "hr") {
    // HR can only see aggregate data, which the heatmap already is.
    // However, we should restrict full access to the Governance tab if not Admin/DPO.
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <OrganizationalHeatmap />
    </div>
  );
}
