/**
 * ⚙️ Cognitive Unstuck Engine
 * Orchestrates the Cognitive Unstuck Session Context, FSM transitions, RAG retrieval,
 * prompt injection defense, and non-clinical guardrails.
 */

import {
  CognitiveUnstuckSessionContext,
  CognitiveUnstuckFSMState,
  IdentifiedBarrier,
  NextActionConfidence,
  UnstuckChatLLMStructuredOutput,
  createInitialSessionContext,
  transitionFSM,
  validateNextAction,
  validateEnergyLevel
} from "./unstuck-context";
import {
  selectRelevantKnowledgeChunks,
  buildSandboxedUnstuckPrompt,
  CognitiveKnowledgeChunk
} from "./unstuck-rag";
import { checkClinicalGuardrails } from "../guardrails";

export interface UnstuckEngineResult {
  success: boolean;
  message: string;
  updatedContext: CognitiveUnstuckSessionContext;
  nextAction: string | null;
  suggestedTimerSeconds: 300 | 600 | 1500 | null;
  retrievedChunkIds: string[];
  disclaimer: string;
  isClinicalRedirect?: boolean;
}

export type LLMGenerateFn = (
  systemPrompt: string,
  userPrompt: string
) => Promise<string>;

/**
 * Deterministic safe clinical redirection
 */
function handleClinicalQueryRedirect(
  language: string,
  context: CognitiveUnstuckSessionContext
): UnstuckEngineResult {
  const isPt = String(language).toLowerCase().startsWith("pt");
  const message = isPt
    ? "Compreendo que possa estar a passar por um momento desafiador. Como assistente de foco e apoio executivo, não realizo diagnósticos clínicos, avaliações médicas ou prescrições. Recomendo consultar um profissional de saúde qualificado. Posso ajudar a organizar o seu trabalho de hoje: qual é a tarefa mais urgente que precisa movimentar agora?"
    : "I understand this might be a challenging moment. As a workplace executive support assistant, I do not provide clinical diagnoses, medical assessments, or treatment recommendations. I encourage you to consult a qualified healthcare professional. I can assist with organizing your work today: what is the most immediate task you need to move forward?";

  const updatedContext: CognitiveUnstuckSessionContext = {
    ...context,
    conversationState: "CLARIFY",
    identifiedBarrier: "overwhelm",
    turnCount: context.turnCount + 1,
    nextActionConfidence: "low"
  };

  return {
    success: true,
    message,
    updatedContext,
    nextAction: null,
    suggestedTimerSeconds: null,
    retrievedChunkIds: [],
    disclaimer: isPt
      ? "Assistente corporativo de apoio executivo. Não fornece diagnósticos médicos."
      : "Workplace executive support assistant. Does not provide medical diagnosis.",
    isClinicalRedirect: true
  };
}

/**
 * Checks whether user input is explicitly seeking clinical diagnosis or medication
 */
function isClinicalQuery(input: string): boolean {
  const lower = input.toLowerCase();
  const clinicalTriggers = [
    "você acha que tenho tdah",
    "eu tenho tdah",
    "tenho autismo",
    "qual remédio",
    "me receite",
    "ritalina",
    "venvanse",
    "do i have adhd",
    "diagnose me",
    "what medication",
    "prescribe",
    "qual é o meu diagnóstico"
  ];
  return clinicalTriggers.some((trigger) => lower.includes(trigger));
}

/**
 * Fallback generator for deterministic simulation and tests
 */
export function defaultDeterministicGenerator(
  userMessage: string,
  context: CognitiveUnstuckSessionContext,
  language: string
): UnstuckChatLLMStructuredOutput {
  const isPt = String(language).toLowerCase().startsWith("pt");
  const lower = userMessage.toLowerCase();

  // 1. If user indicates overwhelm or too many items -> REDUCE state
  if (lower.includes("muita coisa") || lower.includes("overwhelmed") || lower.includes("20 coisas") || lower.includes("sobrecarregado")) {
    return {
      state: "REDUCE",
      message: isPt
        ? "Vamos tornar isto mais leve. De todas essas pendências, quais são as 2 coisas que realmente precisam de um movimento hoje?"
        : "Let's make this lighter. Of all those items, what are the 2 things that actually need movement today?",
      currentProblem: "Sobrecarga com múltiplos itens.",
      identifiedBarrier: "overwhelm",
      nextActionConfidence: "low"
    };
  }

  // 2. If user indicates loss of context or interruption -> CLARIFY / RECOVER
  if (lower.includes("perdi o contexto") || lower.includes("reunião") || lower.includes("lost context") || lower.includes("interrompido")) {
    return {
      state: "CLARIFY",
      message: isPt
        ? "Respire fundo. Qual era a última tarefa em que estava focado antes da interrupção?"
        : "Take a deep breath. What was the last task you were working on before the interruption?",
      currentProblem: "Perda de contexto pós-interrupção.",
      identifiedBarrier: "context_loss",
      nextActionConfidence: "low"
    };
  }

  // 3. If user indicates low energy -> MICRO_ACTION with low energy heuristic
  if (lower.includes("pouca energia") || lower.includes("cansado") || lower.includes("low energy") || (context.energyLevel && context.energyLevel <= 4)) {
    return {
      state: "MICRO_ACTION",
      message: isPt
        ? "Com energia reduzida, o segredo é não forçar planejamento pesado. Escolha um micro-passo simples de 5 minutos."
        : "With low energy, avoid heavy planning. Focus on a simple 5-minute low-friction move.",
      currentProblem: "Energia subjetiva reduzida.",
      identifiedBarrier: "low_energy",
      chosenPriority: "Ação de baixo atrito",
      nextAction: isPt
        ? "Abra apenas a lista de pendências e marque uma tarefa simples para depois."
        : "Open your inbox and file a single pending message.",
      suggestedTimerSeconds: 300,
      nextActionConfidence: "high"
    };
  }

  // 4. Default progress to concrete next action
  const cleanTopic = context.selectedTask?.title || userMessage.slice(0, 50).trim();
  return {
    state: "MICRO_ACTION",
    message: isPt
      ? `Para avançar com "${cleanTopic}", comece apenas pelo primeiro passo visível de 2 minutos.`
      : `To move forward on "${cleanTopic}", let's start with a single 2-minute physical action.`,
    currentProblem: cleanTopic,
    identifiedBarrier: context.identifiedBarrier || "decision_fatigue",
    chosenPriority: cleanTopic,
    nextAction: isPt
      ? `Abra o documento de "${cleanTopic}" e escreva apenas a primeira frase.`
      : `Open the file for "${cleanTopic}" and write only the first sentence.`,
    suggestedTimerSeconds: 300,
    nextActionConfidence: "high"
  };
}

/**
 * Main Cognitive Unstuck Engine Class
 */
export class CognitiveUnstuckEngine {
  /**
   * Processes a turn in the Unstuck Chat session
   */
  public async processTurn(params: {
    userMessage: string;
    context: CognitiveUnstuckSessionContext;
    language?: string;
    llmGenerator?: LLMGenerateFn;
    retrievedChunks?: CognitiveKnowledgeChunk[];
  }): Promise<UnstuckEngineResult> {
    const language = params.language || "pt";
    const isPt = String(language).toLowerCase().startsWith("pt");
    const safeContext = createInitialSessionContext(params.context);

    // 1. Clinical safety intercept
    if (isClinicalQuery(params.userMessage)) {
      return handleClinicalQueryRedirect(language, safeContext);
    }

    // 2. Select supporting RAG knowledge chunks (pgvector pre-retrieved or memory fallback)
    const retrievedChunks = params.retrievedChunks && params.retrievedChunks.length > 0
      ? params.retrievedChunks.slice(0, 3)
      : selectRelevantKnowledgeChunks(
          safeContext.identifiedBarrier,
          language,
          2
        );
    const retrievedChunkIds = retrievedChunks.map((c) => c.id);

    // 3. Build sandboxed prompt
    const { systemPrompt, userEnvelope } = buildSandboxedUnstuckPrompt(
      params.userMessage,
      safeContext,
      retrievedChunks,
      language
    );

    // 4. Execute LLM generation or deterministic fallback
    let structuredOutput: UnstuckChatLLMStructuredOutput;

    if (params.llmGenerator) {
      try {
        const rawResponse = await params.llmGenerator(systemPrompt, userEnvelope);
        // Robust JSON extraction (handles markdown json blocks)
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredOutput = JSON.parse(jsonMatch[0]);
        } else {
          structuredOutput = defaultDeterministicGenerator(params.userMessage, safeContext, language);
        }
      } catch {
        structuredOutput = defaultDeterministicGenerator(params.userMessage, safeContext, language);
      }
    } else {
      structuredOutput = defaultDeterministicGenerator(params.userMessage, safeContext, language);
    }

    // 5. Output Guardrails Validation (Ensure zero clinical terms leak into response)
    const guardrailCheck = checkClinicalGuardrails(structuredOutput.message || "");
    let safeMessage = structuredOutput.message;
    if (!guardrailCheck.passed) {
      safeMessage = isPt
        ? "Vamos simplificar: concentre-se apenas no próximo passo prático de 2 minutos."
        : "Let's keep it simple: focus only on the next 2-minute practical step.";
    }

    // 6. Validate Next Action
    const actionValidation = validateNextAction(structuredOutput.nextAction);
    const validNextAction = actionValidation.valid ? actionValidation.cleanAction : null;

    // 7. Deterministic FSM Transition
    const targetState = transitionFSM(
      safeContext,
      structuredOutput.state || "CLARIFY",
      structuredOutput.nextActionConfidence || "low",
      validNextAction !== null
    );

    // 8. Construct Updated Session Context (Session-only, unpolluted)
    const updatedContext: CognitiveUnstuckSessionContext = {
      conversationState: targetState,
      currentProblem: structuredOutput.currentProblem || safeContext.currentProblem,
      selectedTask: safeContext.selectedTask,
      identifiedBarrier: structuredOutput.identifiedBarrier || safeContext.identifiedBarrier,
      chosenPriority: structuredOutput.chosenPriority || safeContext.chosenPriority,
      nextAction: validNextAction,
      timer: structuredOutput.suggestedTimerSeconds
        ? {
            presetSeconds: structuredOutput.suggestedTimerSeconds,
            isRunning: false,
            linkedTaskId: safeContext.selectedTask?.id
          }
        : safeContext.timer,
      energyLevel: safeContext.energyLevel,
      turnCount: safeContext.turnCount + 1,
      nextActionConfidence: structuredOutput.nextActionConfidence || (validNextAction ? "high" : "low")
    };

    return {
      success: true,
      message: safeMessage,
      updatedContext,
      nextAction: validNextAction,
      suggestedTimerSeconds: structuredOutput.suggestedTimerSeconds || null,
      retrievedChunkIds,
      disclaimer: isPt
        ? "Apoio executivo e de foco no trabalho. Não substitui orientação médica ou clínica."
        : "Workplace executive and focus assistance. Does not replace clinical evaluation."
    };
  }
}
