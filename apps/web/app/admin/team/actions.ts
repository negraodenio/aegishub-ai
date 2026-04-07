"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEmployeesAction() {
  const supabase = await createClient();
  
  // No mundo real, filtraríamos pelo tenant_id da sessão do admin.
  // Como estamos em POC, trazemos os mais recentes.
  const { data, error } = await supabase
    .from("employees")
    .select("*, assessment_sessions(status)")
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

  // Mock Tenant ID (SafeHorizon)
  // Reais: const { data: { user } } = await supabase.auth.getUser();
  const TENANT_ID = "00000000-0000-0000-0000-000000000001"; // Placeholder SafeHorizon

  const { data, error } = await (supabase.from("employees") as any).insert({
    full_name: formData.fullName,
    department: formData.department,
    business_unit: formData.businessUnit,
    tenant_id: TENANT_ID,
    status: "active"
  }).select().single();

  if (error) {
    console.error("Create employee error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/team");
  return { success: true, employeeId: data.id };
}
