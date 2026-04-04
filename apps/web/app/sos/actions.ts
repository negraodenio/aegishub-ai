"use server";

import { createClient } from "../../utils/supabase/server";
import { SOSRiskEngine } from "@mindops/domain";

export async function sendSOSMessage(sessionId: string, message: string, employeeId: string) {
  try {
    const supabase = await createClient();
    const riskEngine = new SOSRiskEngine();

    // 1. Semantic Triage (M2.7 Risk Analysis)
    // We can pass context here in the future for better multi-turn support
    const analysis = await riskEngine.analyzeMessage(message);

    // 2. Persist User Message (High Accuracy)
    await (supabase.from("sos_messages") as any).insert({
      session_id: sessionId,
      sender_role: 'employee',
      content: message,
      risk_score: analysis.risk_score,
      intent_label: analysis.intent
    });

    let escalated = false;

    // 3. Decision Logic & Human Escalation (SLA Driven)
    if (analysis.requires_human || analysis.risk_score > 0.7) {
      escalated = true;
      
      // Calculate SLA Deadline (15 minutes for High Risk events)
      const slaDeadline = new Date(Date.now() + 15 * 60000).toISOString();

      await (supabase.from("care_referrals") as any).insert({
        employee_id: employeeId !== "anonymous" ? employeeId : null,
        session_id: sessionId,
        referral_type: 'sos_emergency_t1',
        urgency: 'high',
        status: 'pending',
        sla_deadline: slaDeadline
      });

      await (supabase.from("sos_sessions") as any).update({ 
        status: 'escalated',
        risk_level: analysis.intent,
        summary: analysis.summary
      }).eq("id", sessionId);

      // Audit Log for AI Act Compliance (Audit Fix #5)
      await (supabase.from("ai_audit_logs") as any).insert({
        action: 'emergency_escalation_triggered',
        actor: 'm2.7_triage_engine',
        status: 'success',
        details: JSON.stringify({ analysis, sla: "15min" })
      });
    }

    // 4. Final Response (Warm & Secure)
    let reply = analysis.recommended_action;
    if (analysis.intent === 'crisis') {
      reply = "🚨 Compreendo a gravidade. Já notifiquei um profissional de saúde da sua empresa. Por favor, tente respirar fundo, estamos consigo.";
    } else if (analysis.intent === 'distress') {
      reply = "Sinto o seu cansaço. Queria falar com um profissional agora ou prefere continuar a desabafar comigo?";
    }

    // 5. Persist AI Response
    await (supabase.from("sos_messages") as any).insert({
      session_id: sessionId,
      sender_role: 'ai',
      content: reply,
      metadata: { escalated }
    });

    return { success: true, response: reply, escalated };
  } catch (error) {
    console.error("[SOS_ENTERPRISE_ACTION_ERROR]", error);
    return { success: false, error: "Falha na triagem de emergência sênior." };
  }
}

export async function createSOSSession(employeeId?: string, tenantId?: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("sos_sessions") as any).insert({
    employee_id: employeeId || null,
    tenant_id: tenantId || null,
    status: 'open'
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, sessionId: (data as any).id };
}
