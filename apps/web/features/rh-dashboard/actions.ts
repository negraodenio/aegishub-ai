"use server";

import { generateAssessmentToken } from "../../utils/assessment-token";
import { createClient } from "../../utils/supabase/server";

export async function getAssessmentInviteAction(employeeId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    // Get tenant from profile
    const { data: profile } = await (supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single() as any);

    if (!profile) throw new Error("Profile not found");

    const token = await generateAssessmentToken(employeeId, profile.tenant_id);
    
    return { success: true, token };
  } catch (err) {
    console.error("[GET_INVITE_ACTION_ERROR]", err);
    return { success: false, error: "Falha ao gerar convite assinado." };
  }
}
