"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CriticalAlertParams {
  employeeId: string;
  employeeName: string;
  companyName: string;
  riskLevel: string;
  reasons: string[];
  score: number;
}

export async function sendCriticalAlert(params: CriticalAlertParams) {
  const { employeeId, employeeName, companyName, riskLevel, reasons, score } = params;
  
  if (riskLevel !== "critical") return;

  const recipient = process.env.ALERT_RECIPIENT_EMAIL || "dpo@aegis-hub.pt";
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  // 1. Enviar Email via Resend
  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Alerta AEGIS <alerts@aegis-hub.pt>",
        to: recipient,
        subject: `🚨 ALERTA CRÍTICO: Risco Detetado em ${companyName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px;">
            <h2 style="color: #dc2626;">Alerta de Risco Clínico Crítico</h2>
            <p>O sistema AEGIS HUB detetou um nível de risco <strong>CRÍTICO</strong> numa avaliação recente.</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><strong>Empresa:</strong> ${companyName}</p>
            <p><strong>ID do Colaborador:</strong> ${employeeId.substring(0, 8)}...</p>
            <p><strong>Fatores de Risco:</strong> ${reasons.join(", ")}</p>
            <p><strong>Score Composto:</strong> ${score.toFixed(1)}/100</p>
            <br />
            <a href="https://aegis-hub.pt/admin/compliance" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Aceder ao Dashboard de Auditoria
            </a>
            <p style="font-size: 10px; color: #666; margin-top: 20px;">
              Este alerta é automático e cumpre o Duty of Care (Art. 15º Lei 102/2009).
            </p>
          </div>
        `
      });
    }
  } catch (err) {
    console.error("Resend Email Error:", err);
  }

  // 2. Enviar Webhook via Slack
  try {
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *ALERTA CRÍTICO AEGIS HUB*\n*Empresa:* ${companyName}\n*Risco:* ${reasons.join(", ")}\n*Score:* ${score.toFixed(1)}\n<https://aegis-hub.pt/admin/compliance|Visualizar no Dashboard>`
        })
      });
    }
  } catch (err) {
    console.error("Slack Webhook Error:", err);
  }
}
