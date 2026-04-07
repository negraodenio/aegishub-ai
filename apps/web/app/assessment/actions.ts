"use server";

import { AssessmentService, getEmployeeContext, saveConsentLog } from "@mindops/database";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { sendCriticalAlert } from "../../lib/notifications";

export async function submitConsentAction(params: {
  employeeId: string;
  tenantId: string;
  consents: { type: string; granted: boolean }[];
}) {
  const supabase = await createClient();
  
  const promises = params.consents.map(c => 
    saveConsentLog(supabase as any, {
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
  const result = await AssessmentService.submitCompleteAssessment(supabase as any, formData as any);

  if (result.success) {
    // 1. Enviar Alerta Crítico (Email/Slack) se o risco for severo
    const scoreData = (result as any).data;
    if (scoreData?.risk_level === "critical") {
      await sendCriticalAlert({
        employeeId: formData.employeeId,
        employeeName: "Colaborador Anonimizado", // Para conformidade Lei 102/2009
        companyName: "SafeHorizon Hub", // Idealmente vindo do context
        riskLevel: scoreData.risk_level,
        reasons: scoreData.reasons || ["Alerta Preditivo de Burnout/Fadiga"],
        score: scoreData.composite_risk_score
      });
    }

    // 2. Revalidar Dashboards afetados pelos novos scores
    revalidatePath("/rh");
    revalidatePath("/admin/compliance");
  }

  return result;
}

export async function getAssessmentContext(token: string) {
  const supabase = await createClient();
  // Simple POC: token is expected to be employeeId (UUID)
  const { data: rawEmployee, error } = await getEmployeeContext(supabase as any, token);
  const employee = rawEmployee as any;
  if (error || !employee) return null;
  return {
    employeeName: employee.full_name,
    companyName: employee.tenants?.name || "AEGIS HUB Client",
    verticalPack: employee.tenants?.vertical || "generic",
    tenantId: employee.tenant_id
  };
}
