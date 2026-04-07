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
      token: string;
      answers: Record<string, number>;
      verticalPack: string;
      voicePath?: string;
    }
  ): Promise<AssessmentSubmissionResult> {
    try {
      // 1. Validar e Consumir Token (Airlock Layer)
      const { data: tokenData, error: tokenError } = await client
        .from("assessment_tokens")
        .select("*, tenants(id)")
        .eq("id", params.token)
        .is("used_at", null)
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: "Token inválido, expirado ou já utilizado." };
      }

      const tenantId = ((tokenData as any).tenants as any).id;
      const tokenHash = (tokenData as any).token_hash;

      const { data: assessment, error: assessmentError } = await (client as any)
        .from("assessments")
        .insert({
          token_hash: tokenHash,
          tenant_id: tenantId,
          protocol_version: "AEGIS-V1"
        })
        .select()
        .single();

      if (assessmentError || !assessment) {
        return { success: false, error: "Falha ao inicializar silo clínico isolado." };
      }

      // 2. Iniciar sessão
      const { data: session, error: sessionError } = await (createSession(client, {
        employeeId: "00000000-0000-0000-0000-000000000000", // Airlock: Anonymous Silo
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
          assessment_id: assessment.id,
          instrument_code: instrumentCode,
          item_code: itemCode,
          answer_numeric: value,
        };
      });

      const { error: answersError } = await client.from("assessment_answers").insert(answersToSave as any);
      if (answersError) {
        return { success: false, error: "Erro ao persistir respostas no silo clínico." };
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

      // 6. Persistir Score no Silo Clínico (Audit Ready)
      const { error: scoreError } = await client.from("clinical_risk_scores").insert({
        assessment_id: assessment.id,
        composite_risk_score: score.compositeRiskScore,
        risk_level: score.riskLevel,
        reasons: score.reasons,
        confidence: score.confidence,
        metadata: { voice_path: params.voicePath || null }
      } as any);

      if (scoreError) {
        console.error("[AssessmentService] Insertion Error:", scoreError);
        return { success: false, error: "Erro ao salvar resultado no silo clínico." };
      }

      // 7. Invalidar Token (Atomic Completion)
      // 7. Invalidar Token (Atomic Completion)
      await (client as any)
        .from("assessment_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", params.token);

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
          title: `Intervenção Preventiva Acionada (Modo Anónimo)`,
          description: `Risco Detectado: ${score.riskLevel}. Motivos: ${score.reasons.join(", ")}. Requer revisão estrutural da equipa (Tokens Blindados).`,
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
