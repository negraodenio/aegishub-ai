import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../generated.types";

export interface CognitiveFocusSession {
  id?: string;
  tenant_id: string;
  user_id: string;
  goal?: string | null;
  duration_preset_seconds: number;
  started_at?: string;
  ended_at?: string | null;
  duration_actual_seconds: number;
  completed: boolean;
  energy_level_before?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CognitiveSupportEvent {
  id?: string;
  tenant_id: string;
  user_id: string;
  event_type: string;
  context: Record<string, any>;
  created_at?: string;
}

export interface CognitiveWeeklyStats {
  focusWins: {
    current: number;
    last: number;
  };
  focusTimeHours: {
    current: number;
    last: number;
  };
  completedSessions: {
    current: number;
    last: number;
  };
  stuckResets: {
    current: number;
    last: number;
  };
  microWins: {
    current: number;
    last: number;
  };
}

/**
 * ⏱️ Inicia uma nova sessão de foco cognitivo
 * - auth.uid() enforced server-side
 */
export async function startCognitiveFocusSession(
  client: SupabaseClient<Database>,
  params: {
    userId: string;
    tenantId: string;
    goal?: string | undefined;
    durationPresetSeconds?: number | undefined;
    energyLevelBefore?: number | undefined;
  }
): Promise<CognitiveFocusSession | null> {
  const { data, error } = await (client.from("cognitive_focus_sessions") as any)
    .insert({
      user_id: params.userId,
      tenant_id: params.tenantId,
      goal: params.goal || null,
      duration_preset_seconds: params.durationPresetSeconds ?? 1500,
      started_at: new Date().toISOString(),
      duration_actual_seconds: 0,
      completed: false,
      energy_level_before: params.energyLevelBefore ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as CognitiveFocusSession;
}

/**
 * ⏱️ Encerra ou completa uma sessão de foco cognitivo
 * - Valida ownership através de user_id
 */
export async function endCognitiveFocusSession(
  client: SupabaseClient<Database>,
  params: {
    userId: string;
    sessionId: string;
    durationActualSeconds: number;
    completed: boolean;
  }
): Promise<CognitiveFocusSession | null> {
  const { data, error } = await (client.from("cognitive_focus_sessions") as any)
    .update({
      ended_at: new Date().toISOString(),
      duration_actual_seconds: Math.max(0, params.durationActualSeconds),
      completed: params.completed,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.sessionId)
    .eq("user_id", params.userId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as CognitiveFocusSession;
}

/**
 * ⏱️ Atualiza o contador de tempo em execução (keep-alive/ping)
 */
export async function pingCognitiveFocusSession(
  client: SupabaseClient<Database>,
  params: {
    userId: string;
    sessionId: string;
    durationActualSeconds: number;
  }
): Promise<boolean> {
  const { error } = await (client.from("cognitive_focus_sessions") as any)
    .update({
      duration_actual_seconds: Math.max(0, params.durationActualSeconds),
      updated_at: new Date().toISOString()
    })
    .eq("id", params.sessionId)
    .eq("user_id", params.userId);

  return !error;
}

/**
 * 📋 Lista sessões de foco do próprio colaborador
 */
export async function getCognitiveFocusSessions(
  client: SupabaseClient<Database>,
  userId: string,
  limit: number = 20
): Promise<CognitiveFocusSession[]> {
  const { data, error } = await (client.from("cognitive_focus_sessions") as any)
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as CognitiveFocusSession[];
}

/**
 * 📊 Registra evento de suporte cognitivo / telemetria funcional (sem PII)
 */
export async function logCognitiveSupportEvent(
  client: SupabaseClient<Database>,
  params: {
    userId: string;
    tenantId: string;
    eventType: string;
    context?: Record<string, any> | undefined;
  }
): Promise<CognitiveSupportEvent | null> {
  const { data, error } = await (client.from("cognitive_support_events") as any)
    .insert({
      user_id: params.userId,
      tenant_id: params.tenantId,
      event_type: params.eventType,
      context: params.context || {},
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as CognitiveSupportEvent;
}

/**
 * 📋 Recupera eventos de suporte do próprio colaborador
 */
export async function getCognitiveSupportEvents(
  client: SupabaseClient<Database>,
  userId: string,
  limit: number = 50
): Promise<CognitiveSupportEvent[]> {
  const { data, error } = await (client.from("cognitive_support_events") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as CognitiveSupportEvent[];
}

/**
 * 📈 Calcula métricas semanais comparativas (Semana Atual vs Semana Anterior)
 * - Restrito ao próprio colaborador
 */
export async function getCognitiveWeeklyStats(
  client: SupabaseClient<Database>,
  userId: string
): Promise<CognitiveWeeklyStats> {
  const now = new Date();
  
  // Datas da semana atual (últimos 7 dias)
  const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  // Datas da semana anterior (de 14 a 7 dias atrás)
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Buscar sessões dos últimos 14 dias
  const { data: sessions } = await (client.from("cognitive_focus_sessions") as any)
    .select("duration_actual_seconds, completed, started_at")
    .eq("user_id", userId)
    .gte("started_at", lastWeekStart);

  // Buscar eventos dos últimos 14 dias
  const { data: events } = await (client.from("cognitive_support_events") as any)
    .select("event_type, created_at")
    .eq("user_id", userId)
    .gte("created_at", lastWeekStart);

  const sessionList = (sessions || []) as Array<{
    duration_actual_seconds: number;
    completed: boolean;
    started_at: string;
  }>;

  const eventList = (events || []) as Array<{
    event_type: string;
    created_at: string;
  }>;

  // Filtrar sessões semana atual vs anterior
  const currentSessions = sessionList.filter(s => s.started_at >= currentWeekStart);
  const lastSessions = sessionList.filter(s => s.started_at < currentWeekStart);

  // Focus wins = sessões completadas OU com duração >= 5 min (300s)
  const focusWinsCurrent = currentSessions.filter(s => s.completed || s.duration_actual_seconds >= 300).length;
  const focusWinsLast = lastSessions.filter(s => s.completed || s.duration_actual_seconds >= 300).length;

  const completedCurrent = currentSessions.filter(s => s.completed).length;
  const completedLast = lastSessions.filter(s => s.completed).length;

  const totalSecondsCurrent = currentSessions.reduce((acc, s) => acc + (s.duration_actual_seconds || 0), 0);
  const totalSecondsLast = lastSessions.reduce((acc, s) => acc + (s.duration_actual_seconds || 0), 0);

  // Filtrar eventos semana atual vs anterior
  const currentEvents = eventList.filter(e => e.created_at >= currentWeekStart);
  const lastEvents = eventList.filter(e => e.created_at < currentWeekStart);

  const stuckResetsCurrent = currentEvents.filter(e => e.event_type === "stuck_triggered" || e.event_type === "stuck_completed").length;
  const stuckResetsLast = lastEvents.filter(e => e.event_type === "stuck_triggered" || e.event_type === "stuck_completed").length;

  const microWinsCurrent = currentEvents.filter(e => e.event_type === "micro_action_completed").length;
  const microWinsLast = lastEvents.filter(e => e.event_type === "micro_action_completed").length;

  return {
    focusWins: {
      current: focusWinsCurrent,
      last: focusWinsLast
    },
    focusTimeHours: {
      current: Number((totalSecondsCurrent / 3600).toFixed(1)),
      last: Number((totalSecondsLast / 3600).toFixed(1))
    },
    completedSessions: {
      current: completedCurrent,
      last: completedLast
    },
    stuckResets: {
      current: stuckResetsCurrent,
      last: stuckResetsLast
    },
    microWins: {
      current: microWinsCurrent,
      last: microWinsLast
    }
  };
}
