"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantContext } from "@/lib/tenant-context";

export async function getEmployeesAction() {
  const supabase = await createClient();

  // 🛡️ P0 SECURITY: Resolução do tenant e validação de RBAC
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const { data, error } = await supabase
      .from("employees")
      .select("*, assessment_sessions(status)")
      .eq("tenant_id", context.tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch employees error:", error);
      return [];
    }

    return (data || []).map((emp: any) => ({
      ...emp,
      isCompleted: emp.assessment_sessions?.[0]?.status === "completed"
    }));
  } catch (err: any) {
    console.warn("[SECURITY] getEmployeesAction unauthorized attempt:", err.message);
    return [];
  }
}

export async function createEmployeeAction(formData: {
  fullName: string;
  department: string;
  businessUnit: string;
}) {
  const supabase = await createClient();

  // 🛡️ P0 SECURITY: Validação estrita de sessão, membership e RBAC
  try {
    const context = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional"],
      redirectToLoginOnFail: false
    });

    const { data, error } = await (supabase.from("employees") as any).insert({
      full_name: formData.fullName,
      department: formData.department,
      business_unit: formData.businessUnit,
      tenant_id: context.tenantId,
      status: "active"
    }).select().single();

    if (error) {
      console.error("Create employee error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/team");
    return { success: true, employeeId: data.id };
  } catch (err: any) {
    console.warn("[SECURITY] createEmployeeAction unauthorized attempt:", err.message);
    return { success: false, error: "Unauthorized: Insufficient role permissions or invalid organization context." };
  }
}
