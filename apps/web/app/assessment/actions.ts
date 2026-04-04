"use server";

import { AssessmentService, getEmployeeContext, saveConsentLog } from "@mindops/database";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";

export async function submitConsentAction(params: {
  employeeId: string;
  tenantId: string;
  consents: { type: string; granted: boolean }[];
}) {
  const supabase = await createClient();
  
  const promises = params.consents.map(c => 
    saveConsentLog(supabase, {
      employeeId: params.employeeId,
      tenantId: params.tenantId,
      consentType: c.type,
      isGranted: c.granted
    })
  );

  await Promise.all(promises);
  return { success: true };
}

export async function submitAssessmentAction(formData: {
  employeeId: string;
  answers: Record<string, number>;
  verticalPack: string;
  voicePath?: string | undefined;
}) {
  const supabase = await createClient();
  const result = await AssessmentService.submitCompleteAssessment(supabase as any, formData);

  if (result.success) {
    // Revalidar Dashboards afetados pelos novos scores
    revalidatePath("/rh");
    revalidatePath("/admin/compliance");
  }

  return result;
}

export async function getAssessmentContext(token: string) {
  const supabase = await createClient();
  // Simple POC: token is expected to be employeeId (UUID)
  const { data: employee, error } = await getEmployeeContext(supabase, token);
  if (error || !employee) return null;
  return {
    employeeName: employee.full_name,
    companyName: employee.tenants?.name || "PsicoRisco Client",
    verticalPack: employee.tenants?.vertical || "generic",
    tenantId: employee.tenant_id
  };
}
