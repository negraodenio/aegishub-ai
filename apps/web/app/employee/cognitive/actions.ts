"use server";

import { createClient } from "@/utils/supabase/server";
import {
  getCognitiveUserProfile,
  upsertCognitiveUserProfile,
  revokeCognitiveConsent,
  getCognitiveTasks,
  createCognitiveTask,
  updateCognitiveTask,
  deleteCognitiveTask,
  getTenantCognitiveSettings,
  upsertTenantCognitiveSettings
} from "@mindops/database";
import { revalidatePath } from "next/cache";

/**
 * Registra o consentimento do colaborador
 */
export async function submitCognitiveConsentAction(formData: { tenantId: string; version?: string }) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Inicie sessão para continuar");
  }

  const result = await upsertCognitiveUserProfile(client as any, {
    user_id: user.id,
    tenant_id: formData.tenantId,
    consent_version: formData.version || "1.0-RGPD-LGPD",
    consent_given_at: new Date().toISOString(),
    is_consent_revoked: false
  });

  revalidatePath("/employee/cognitive");
  return { success: true, profile: result };
}

/**
 * Revoga o consentimento do colaborador
 */
export async function revokeCognitiveConsentAction() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  await revokeCognitiveConsent(client as any, user.id);
  revalidatePath("/employee/cognitive");
  return { success: true };
}

/**
 * Salva uma nova tarefa cognitiva com micro-etapas
 */
export async function saveCognitiveTaskAction(taskData: {
  tenantId: string;
  title: string;
  steps: any[];
  energyLevel?: "low" | "medium" | "high";
  estimatedMinutes?: number;
}) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const created = await createCognitiveTask(client as any, {
    user_id: user.id,
    tenant_id: taskData.tenantId,
    title: taskData.title,
    steps: taskData.steps || [],
    status: "pending",
    energy_level: taskData.energyLevel || "medium",
    estimated_minutes: taskData.estimatedMinutes || 25
  });

  revalidatePath("/employee/cognitive");
  return { success: true, task: created };
}

/**
 * Atualiza status de tarefa ou conclusão de etapa
 */
export async function updateCognitiveTaskAction(taskId: string, updates: any) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const updated = await updateCognitiveTask(client as any, taskId, user.id, updates);
  revalidatePath("/employee/cognitive");
  return { success: true, task: updated };
}

/**
 * Remove uma tarefa
 */
export async function deleteCognitiveTaskAction(taskId: string) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  await deleteCognitiveTask(client as any, taskId, user.id);
  revalidatePath("/employee/cognitive");
  return { success: true };
}

/**
 * Alterna ativação do benefício corporativo (Apenas Admin/RH)
 */
export async function toggleCognitiveBenefitAction(tenantId: string, isEnabled: boolean, maxSeats?: number) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const updated = await upsertTenantCognitiveSettings(client as any, {
    tenant_id: tenantId,
    is_enabled: isEnabled,
    max_seats: maxSeats ?? 50
  });

  revalidatePath("/rh");
  revalidatePath("/admin/compliance");
  return { success: true, settings: updated };
}
