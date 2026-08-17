/**
 * 🧠 Cognitive Unstuck Session Context & FSM Engine
 * Canonical operational memory and state machine for the AegisHub AI Unstuck Chat.
 *
 * Principles:
 * 1. Session-only: Lives only in the active browser memory (zero employer visibility).
 * 2. Strictly non-clinical: Termed "identified barrier" / "functional barrier", NEVER diagnosis.
 * 3. Energy != Chronotype: energyLevel is a 1-10 subjective snapshot, NOT a permanent circadian type.
 * 4. Action-driven: Optimizes for CLARITY -> REDUCTION -> ONE NEXT ACTION -> START.
 */

export type CognitiveUnstuckFSMState =
  | "STUCK"
  | "CLARIFY"
  | "REDUCE"
  | "PRIORITIZE"
  | "MICRO_ACTION"
  | "START"
  | "ACKNOWLEDGE";

export type IdentifiedBarrier =
  | "overwhelm"
  | "distraction"
  | "low_energy"
  | "decision_fatigue"
  | "context_loss"
  | null;

export type NextActionConfidence = "low" | "medium" | "high";

export interface SelectedTaskReference {
  id?: string | undefined;
  title: string;
}

export interface UnstuckTimerState {
  presetSeconds: 300 | 600 | 1500;
  isRunning: boolean;
  linkedTaskId?: string | undefined;
}

export interface CognitiveUnstuckSessionContext {
  conversationState: CognitiveUnstuckFSMState;
  currentProblem: string | null;
  selectedTask: SelectedTaskReference | null;
  identifiedBarrier: IdentifiedBarrier;
  chosenPriority: string | null;
  nextAction: string | null;
  timer: UnstuckTimerState | null;
  energyLevel: number | null; // 1 to 10 subjective scale
  turnCount: number;
  nextActionConfidence: NextActionConfidence;
}

export interface UnstuckChatLLMStructuredOutput {
  state: CognitiveUnstuckFSMState;
  message: string;
  currentProblem?: string | null;
  identifiedBarrier?: IdentifiedBarrier;
  chosenPriority?: string | null;
  nextAction?: string | null;
  suggestedTimerSeconds?: 300 | 600 | 1500 | null;
  nextActionConfidence?: NextActionConfidence;
}

export type UnstuckQuickAction =
  | "overwhelmed"
  | "next_step"
  | "lost_context"
  | "break_down";

/**
 * Creates a clean, unpolluted initial session context
 */
export function createInitialSessionContext(
  initialValues: Partial<CognitiveUnstuckSessionContext> = {}
): CognitiveUnstuckSessionContext {
  return {
    conversationState: initialValues.conversationState || "STUCK",
    currentProblem: initialValues.currentProblem ?? null,
    selectedTask: initialValues.selectedTask ?? null,
    identifiedBarrier: initialValues.identifiedBarrier ?? null,
    chosenPriority: initialValues.chosenPriority ?? null,
    nextAction: initialValues.nextAction ?? null,
    timer: initialValues.timer ?? null,
    energyLevel: validateEnergyLevel(initialValues.energyLevel),
    turnCount: initialValues.turnCount ?? 0,
    nextActionConfidence: initialValues.nextActionConfidence || "low"
  };
}

/**
 * Validates subjective energy rating (1 to 10)
 * Note: Never infer chronotype from this value.
 */
export function validateEnergyLevel(level: any): number | null {
  if (typeof level !== "number" || isNaN(level)) return null;
  const clamped = Math.round(level);
  if (clamped < 1 || clamped > 10) return null;
  return clamped;
}

/**
 * Validates whether a state is a valid FSM state
 */
export function isValidFSMState(state: any): state is CognitiveUnstuckFSMState {
  return [
    "STUCK",
    "CLARIFY",
    "REDUCE",
    "PRIORITIZE",
    "MICRO_ACTION",
    "START",
    "ACKNOWLEDGE"
  ].includes(state);
}

/**
 * Validates identified functional barrier
 */
export function isValidBarrier(barrier: any): barrier is IdentifiedBarrier {
  if (barrier === null) return true;
  return [
    "overwhelm",
    "distraction",
    "low_energy",
    "decision_fatigue",
    "context_loss"
  ].includes(barrier);
}

/**
 * Validates that a generated nextAction meets the <= 2 minute, singular, physical criteria
 */
export function validateNextAction(action: string | null | undefined): {
  valid: boolean;
  cleanAction: string | null;
  reason?: string;
} {
  if (!action || typeof action !== "string") {
    return { valid: false, cleanAction: null, reason: "EMPTY_NEXT_ACTION" };
  }

  const trimmed = action.trim();
  if (trimmed.length < 5) {
    return { valid: false, cleanAction: null, reason: "NEXT_ACTION_TOO_SHORT" };
  }

  // Reject vague or multi-step statements
  const vaguePhrases = [
    "prepare your presentation",
    "work on your project",
    "finish the report",
    "do everything",
    "faça tudo",
    "termine o relatório",
    "prepare a apresentação"
  ];

  const lower = trimmed.toLowerCase();
  for (const phrase of vaguePhrases) {
    if (lower === phrase) {
      return {
        valid: false,
        cleanAction: null,
        reason: "NEXT_ACTION_TOO_VAGUE"
      };
    }
  }

  return { valid: true, cleanAction: trimmed };
}

/**
 * Computes deterministic FSM progression
 */
export function transitionFSM(
  context: CognitiveUnstuckSessionContext,
  suggestedState: CognitiveUnstuckFSMState,
  confidence: NextActionConfidence,
  hasValidNextAction: boolean
): CognitiveUnstuckFSMState {
  // If high confidence and has valid next action -> jump to MICRO_ACTION or START
  if (confidence === "high" && hasValidNextAction) {
    if (suggestedState === "START" || context.conversationState === "MICRO_ACTION") {
      return "START";
    }
    return "MICRO_ACTION";
  }

  // If low confidence -> clamp to CLARIFY or REDUCE to prevent hallucinated actions
  if (confidence === "low") {
    if (context.conversationState === "STUCK") return "CLARIFY";
    if (context.conversationState === "CLARIFY") return "REDUCE";
    return "CLARIFY";
  }

  // If medium confidence -> allow progression to REDUCE or PRIORITIZE
  if (confidence === "medium") {
    if (context.conversationState === "STUCK" || context.conversationState === "CLARIFY") {
      return "REDUCE";
    }
    if (context.conversationState === "REDUCE") {
      return "PRIORITIZE";
    }
    if (hasValidNextAction) {
      return "MICRO_ACTION";
    }
  }

  // Default fallback progression
  return isValidFSMState(suggestedState) ? suggestedState : context.conversationState;
}

/**
 * Maps quick actions to initialized context parameters
 */
export function getQuickActionContextSeed(
  action: UnstuckQuickAction,
  taskContext?: SelectedTaskReference | null
): Partial<CognitiveUnstuckSessionContext> {
  switch (action) {
    case "overwhelmed":
      return {
        conversationState: "CLARIFY",
        identifiedBarrier: "overwhelm",
        currentProblem: "Sensação de sobrecarga com múltiplos tópicos simultâneos.",
        selectedTask: taskContext || null,
        nextActionConfidence: "low"
      };
    case "next_step":
      return {
        conversationState: "PRIORITIZE",
        identifiedBarrier: "decision_fatigue",
        currentProblem: taskContext ? `Preciso do próximo passo para: ${taskContext.title}` : "Preciso identificar o próximo passo.",
        selectedTask: taskContext || null,
        nextActionConfidence: "medium"
      };
    case "lost_context":
      return {
        conversationState: "CLARIFY",
        identifiedBarrier: "context_loss",
        currentProblem: "Interrupção recente e perda do contexto de trabalho.",
        selectedTask: taskContext || null,
        nextActionConfidence: "low"
      };
    case "break_down":
      return {
        conversationState: "REDUCE",
        identifiedBarrier: "overwhelm",
        currentProblem: taskContext ? `Dividir a tarefa: ${taskContext.title}` : "Dividir uma tarefa grande.",
        selectedTask: taskContext || null,
        nextActionConfidence: "medium"
      };
  }
}
