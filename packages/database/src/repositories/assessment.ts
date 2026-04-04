import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type AssessmentSession = Database["public"]["Tables"]["assessment_sessions"]["Row"];
export type AssessmentAnswer = Database["public"]["Tables"]["assessment_answers"]["Insert"];
export type AssessmentScore = Database["public"]["Tables"]["assessment_scores"]["Insert"];

export async function getEmployeeContext(client: SupabaseClient<Database>, employeeId: string) {
  if (!client || typeof client.from !== 'function') {
    throw new Error("Supabase client is required and must be valid in getEmployeeContext");
  }
  return client
    .from("employees")
    .select("*, tenants!inner(*)")
    .eq("id", employeeId)
    .single();
}

export async function createSession(client: SupabaseClient<Database>, params: {
  employeeId: string;
  tenantId: string;
  verticalPack: string;
}) {
  return (client
    .from("assessment_sessions") as any)
    .insert({
      employee_id: params.employeeId,
      tenant_id: params.tenantId,
      vertical_pack: params.verticalPack,
      status: "draft",
      started_at: new Date().toISOString()
    })
    .select()
    .single();
}

export async function saveAnswers(client: SupabaseClient<Database>, answers: AssessmentAnswer[]) {
  // Explicitly cast the query to avoid 'never' inference
  return (client.from("assessment_answers") as any).upsert(answers);
}

export async function getSessionWithAnswers(client: SupabaseClient<Database>, sessionId: string) {
  return client
    .from("assessment_sessions")
    .select(`
      *,
      assessment_answers (*),
      assessment_scores (*)
    `)
    .eq("id", sessionId)
    .single();
}

export async function completeSession(client: SupabaseClient<Database>, sessionId: string) {
  return (client
    .from("assessment_sessions") as any)
    .update({
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("id", sessionId);
}

export async function saveConsentLog(client: SupabaseClient<Database>, params: {
  employeeId: string;
  tenantId: string;
  consentType: string;
  isGranted: boolean;
  userAgent?: string;
  ipAddress?: string;
}) {
  return (client
    .from("consent_logs") as any)
    .insert({
      employee_id: params.employeeId,
      tenant_id: params.tenantId,
      consent_type: params.consentType,
      is_granted: params.isGranted,
      user_agent: params.userAgent,
      ip_address: params.ipAddress
    });
}
