import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../generated.types";

export type RiskAlert = Database["public"]["Tables"]["risk_alerts"]["Row"];
export type CareReferral = Database["public"]["Tables"]["care_referrals"]["Row"];

export async function getClinicalReviewQueue(client: SupabaseClient<Database>, tenantId: string) {
  return (client
    .from("risk_alerts") as any)
    .select(`
      *,
      employees (*)
    `)
    .eq("tenant_id", tenantId)
    .in("status", ["open", "in_review"])
    .order("created_at", { ascending: false });
}

export async function getCaseDetails(client: SupabaseClient<Database>, alertId: string) {
  return (client
    .from("risk_alerts") as any)
    .select(`
      *,
      employees (*),
      assessment_sessions (*, assessment_scores (*))
    `)
    .eq("id", alertId)
    .single();
}

export async function updateAlertStatus(
  client: SupabaseClient<Database>, 
  alertId: string, 
  status: "open" | "in_review" | "reviewed" | "closed"
) {
  return (client
    .from("risk_alerts") as any)
    .update({ status })
    .eq("id", alertId);
}

export async function getReferrals(client: SupabaseClient<Database>, tenantId: string) {
  return (client
    .from("care_referrals") as any)
    .select("*, employees(*)")
    .eq("tenant_id", tenantId);
}

export async function createReferral(
  client: SupabaseClient<Database>,
  params: {
    employeeId: string;
    tenant_id: string; // Adjusted to match DB snake_case for consistency
    sessionId?: string;
    referralType: string;
    urgency: "routine" | "high" | "urgent";
  }
) {
  return (client.from("care_referrals") as any).insert({
    employee_id: params.employeeId,
    tenant_id: params.tenant_id,
    session_id: params.sessionId,
    referral_type: params.referralType,
    urgency: params.urgency,
    status: "pending"
  });
}

export async function updateReferralStatus(
  client: SupabaseClient<Database>,
  referralId: string,
  status: CareReferral["status"]
) {
  return (client
    .from("care_referrals") as any)
    .update({ status })
    .eq("id", referralId);
}
