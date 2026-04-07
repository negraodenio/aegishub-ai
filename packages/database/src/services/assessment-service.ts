import { SupabaseClient } from "@supabase/supabase-js";
import { 
  getEmployeeContext, 
  createSession, 
  saveAnswers, 
  completeSession 
} from "../repositories/assessment";
import { 
  composeRiskScore, 
  GAD7, 
  PHQ9, 
  COPSOQ_SHORT 
} from "@mindops/domain";
import type { Database } from "../generated.types";

export interface AssessmentSubmissionResult {
  success: boolean;
  riskLevel?: string;
  error?: string;
}

export class AssessmentService {
  /**
   * Orquestra o fluxo completo de submissão de um assessment clínico,
   * desde a validação do funcionário até o cálculo final do score de risco.
   */
  static async submitCompleteAssessment(
    client: SupabaseClient<Database>,
    params: {
      employeeId: string;
      answers: Record<string, number>;
      verticalPack: string;
      voicePath?: string;
    }
  ): Promise<AssessmentSubmissionResult> {
    try {
      // 1. Validar contexto do funcionário
      const { data: employee, error: empError } = await (getEmployeeContext(client, params.employeeId) as any);
      if (empError || !employee) {
        return { success: false, error: "Funcionário não encontrado ou acesso inválido." };
      }

      const tenantId = employee.tenant_id;

      // 2. Iniciar sessão
      const { data: session, error: sessionError } = await (createSession(client, {
        employeeId: params.employeeId,
        tenantId,
        verticalPack: params.verticalPack,
      }) as any);

      if (sessionError || !session) {
        return { success: false, error: "Falha ao iniciar sessão de avaliação." };
      }

      // 3. Mapear e Salvar Respostas
      const answersToSave = Object.entries(params.answers).map(([itemCode, value]) => {
        let instrumentCode = "UNKNOWN";
        if (COPSOQ_SHORT.questions.some(q => q.id === itemCode)) instrumentCode = "COPSOQ";
        else if (GAD7.questions.some(q => q.id === itemCode)) instrumentCode = "GAD7";
        else if (PHQ9.questions.some(q => q.id === itemCode)) instrumentCode = "PHQ9";
        
        return {
          session_id: session.id,
          instrument_code: instrumentCode,
          item_code: itemCode,
          answer_numeric: value,
        };
      });

      const { error: answersError } = await (saveAnswers(client, answersToSave) as any);
      if (answersError) {
        return { success: false, error: "Erro ao persistir respostas clínicas." };
      }

      // 4. Cálculo de Scores por Instrumento
      const getSum = (instrument: typeof GAD7) => {
        return instrument.questions.reduce((acc, q) => acc + (params.answers[q.id] || 0), 0);
      };

      const copsoqSum = getSum(COPSOQ_SHORT);
      const gad7Sum = getSum(GAD7);
      const phq9Sum = getSum(PHQ9);

      // 5. Orquestração do Score Composto (Domain Logic)
      const scoreInput = {
        verticalPack: params.verticalPack,
        phq9Score: phq9Sum,
        gad7Score: gad7Sum,
        burnoutScore: Math.round((copsoqSum / 50) * 100),
        psychosocialRiskScore: Math.round((copsoqSum / 50) * 100),
        wellbeingScore: Math.round(100 - (copsoqSum / 50) * 100),
        voiceSignalScore: 0, // Baseline zero para captura inicial
      };

      const scoringResult = composeRiskScore(scoreInput);
      
      if (!scoringResult.ok) {
        return { success: false, error: `Falha no motor de scoring: ${scoringResult.error.message}` };
      }

      const score = scoringResult.value;

      // 6. Persistir Resultado Final [PRIORIDADE 3: Atomic Transaction]
      // Chamamos o RPC 'persist_assessment_results'
      const { error: rpcError } = await client.rpc("persist_assessment_results", {
        p_session_id: session.id,
        p_score: score.compositeRiskScore,
        p_risk_level: score.riskLevel,
        p_reasons: score.reasons,
        p_requires_human_review: score.requiresHumanReview,
        p_confidence: score.confidence,
        p_voice_path: params.voicePath || null
      } as any);

      if (rpcError) {
        console.warn("[AssessmentService] RPC failed, falling back to manual insertion:", rpcError);
        
        // 6. Persist results with Fallback Resilience
        console.log("[AssessmentService] Attempting to persist results...");
        
        // Tentativa 1: Com voice_path (Padrão 2.0)
        let { error: manualError } = await (client.from("assessment_scores") as any).insert({
          session_id: session.id,
          composite_risk_score: score.compositeRiskScore,
          risk_level: score.riskLevel,
          reasons: score.reasons,
          requires_human_review: score.requiresHumanReview,
          confidence: score.confidence,
          voice_path: params.voicePath || null
        });
        
        // Fallback: Se a coluna voice_path não existir, tenta sem ela
        if (manualError && manualError.code === 'P0000' || manualError?.message?.includes('voice_path')) {
          console.warn("[AssessmentService] voice_path column missing, falling back to basic insertion.");
          const { error: fallbackError } = await (client.from("assessment_scores") as any).insert({
            session_id: session.id,
            composite_risk_score: score.compositeRiskScore,
            risk_level: score.riskLevel,
            reasons: score.reasons,
            requires_human_review: score.requiresHumanReview,
            confidence: score.confidence
          });
          manualError = fallbackError;
        }

        if (manualError) {
          console.error("[AssessmentService] Final Insertion Error:", manualError);
          return { success: false, error: "Erro ao salvar resultado final da análise." };
        }
          
        // 🎙️ Criar sessão técnica de voz para Auditoria (Silencioso para evitar bloqueio)
        if (params.voicePath) {
          try {
            await (client.from("voice_sessions") as any).insert({
              tenant_id: session.tenant_id,
              employee_id: params.employeeId,
              audio_path: params.voicePath,
              prompt_type: 'guided_reading',
              duration_ms: 15000
            });
          } catch (e) {
            console.warn("[AssessmentService] Could not create voice_session log (table missing).");
          }
        }

        await (completeSession(client, session.id) as any);
      }

      // 7. Governança IA M2.7 (Audit & Explainability)
      // Logamos a decisão da IA para conformidade com o EU AI Act
      const { data: decision, error: decisionError } = await (client.from("ai_decisions") as any).insert({
        tenant_id: tenantId,
        decision_type: "assessment_scoring",
        status: "completed",
        memory_updates: {
          risk_level: score.riskLevel,
          confidence: score.confidence,
          reasons: score.reasons,
          composite_score: score.compositeRiskScore,
          model_version: "AEGIS-M2.7-PROD"
        }
      }).select().single();

      if (decision && !decisionError) {
        await (client.from("ai_audit_logs") as any).insert({
          decision_id: decision.id,
          action: "clinical_score_generation",
          actor: "AEGIS_HUB_BRAIN",
          new_memory: decision.memory_updates,
        });
      }

      // 8. Auto-Generate Corrective Action for High Risk
      if (score.riskLevel === "high" || score.riskLevel === "critical") {
        await (client.from("corrective_actions") as any).insert({
          tenant_id: tenantId,
          title: `Intervenção Preventiva: ${employee.full_name}`,
          description: `Risco Detectado: ${score.riskLevel}. Motivos: ${score.reasons.join(", ")}. Requer revisão organizacional imediata.`,
          priority: score.riskLevel === "critical" ? "CRITICAL" : "HIGH",
          status: "PLANNED"
        });
      }

      return { success: true, riskLevel: score.riskLevel, data: score } as any;
    } catch (e: any) {
      console.error("[AssessmentService] Unexpected Error:", e);
      return { success: false, error: "Ocorreu um erro inesperado no processamento clínico." };
    }
  }
}
