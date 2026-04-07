"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEmployeesAction() {
  const supabase = await createClient();
  
  // No mundo real, filtraríamos pelo tenant_id da sessão do admin.
  // Como estamos em POC, trazemos os mais recentes.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return [];

  const { data, error } = await supabase
    .from("employees")
    .select("*, assessment_sessions(status)")
    .eq("tenant_id", (profile as any).tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch employees error:", error);
    return [];
  }

  return (data || []).map((emp: any) => ({
    ...emp,
    isCompleted: emp.assessment_sessions?.[0]?.status === "completed"
  }));
}

export async function createEmployeeAction(formData: {
  fullName: string;
  department: string;
  businessUnit: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "No organization found" };

  const { data, error } = await (supabase.from("employees") as any).insert({
    full_name: formData.fullName,
    department: formData.department,
    business_unit: formData.businessUnit,
    tenant_id: (profile as any).tenant_id,
    status: "active"
  }).select().single();

  if (error) {
    console.error("Create employee error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/team");
  return { success: true, employeeId: data.id };
}
