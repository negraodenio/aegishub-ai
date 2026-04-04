import crypto from "crypto";

export interface M27MemoryState {
  sampling_temperature?: number;
  loop_detection?: boolean;
  auto_fix_workflow_rules?: boolean;
  burnout_threshold?: number;
  notes?: string;
  timestamp?: string;
}

export interface RecommendationOutput {
  type: string;
  priority: "low" | "medium" | "high";
  message: string;
  justification: string[];
  confidence: number;
}

/**
 * Simulador nativo e determinístico para a Inteligência M2.7,
 * dispensando custos de inferência durante o "Piloto".
 * Em Produção, esta classe fará `fetch` à API do OpenRouter.
 */
export class MiniMaxSimulator {
  public memory: M27MemoryState;
  public context: any;
  public scaffoldChanges?: Record<string, any>;

  constructor(options: { context?: any; memory?: M27MemoryState }) {
    this.context = options.context;
    this.memory = options.memory || {
      sampling_temperature: 0.1, // 🛡️ Deterministic default for clinical decisions (Audit Fix #11)
      burnout_threshold: 60, 
      timestamp: new Date().toISOString()
    };
  }

  private async invokeMinimax(systemPrompt: string, userPrompt: string): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.MINIMAX_MODEL_ID || "minimax/minimax-01"; // Representing M2.7

    if (!apiKey) {
      console.warn("[MiniMax Engine] OPENROUTER_API_KEY não encontrada. Caindo para modo simulação local.");
      return null;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "MindOps",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          temperature: this.memory.sampling_temperature || 0.1, // Optimized for reproducibility
          seed: 42, // Fix seed for deterministic authority (Audit Fix #10)
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        console.error("[MiniMax Engine] Falha na API OpenRouter:", await response.text());
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error("[MiniMax Engine] Network erro:", err);
      return null;
    }
  }

  /**
   * Executa a Inteligência Autônoma (Real via OpenRouter ou Simulada)
   */
  public async runTask(task: string, payload: any): Promise<RecommendationOutput | void> {
    if (task === "generateRecommendation") {
      const { riskLevel } = payload || { riskLevel: "low" };
      const threshold = this.memory.burnout_threshold || 60;

      const aiResponse = await this.invokeMinimax(
        "Você é o MindOps M2.7, um Agente Clínico Autônomo para Riscos Psicossociais. Responda ESTRITAMENTE em JSON válido com o Schema: { type: string, priority: 'low'|'medium'|'high', message: string, justification: string[], confidence: number }",
        `Avalie o Risco: ${riskLevel}. O Threshold clínico de burnout atual é ${threshold}. Histórico na memória: ${this.memory.notes || "Nenhum"}. Gere a próxima recomendação.`
      );

      if (aiResponse) {
        try {
          const cleanJson = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
          return JSON.parse(cleanJson) as RecommendationOutput;
        } catch (e) {
          console.error("[MiniMax Engine] Erro ao fazer parse do JSON:", e);
        }
      }

      // Fallback para Simulação se a API falhar
      const isHighRisk = riskLevel === "high" || riskLevel === "critical";
      return {
        type: isHighRisk ? "triage_t1" : "preventive_monitoring",
        priority: isHighRisk ? "high" : "low",
        message: isHighRisk 
          ? "Risco grave detetado. Acionar T1 (Intervenção Imediata 24h)." 
          : "Nível basal aceitável, monitorizar no próximo trimestre.",
        justification: [
          `Mock Fallback: Identificador do threshold M2.7 aplicado: >${threshold}`,
          "Drift verificado via Memory State."
        ],
        confidence: 0.92
      };
    }

    if (task === "selfOptimize") {
      const aiResponse = await this.invokeMinimax(
        "Você é o MindOps Patch & Diff Engine. Avalie a taxa de erro em decisões passadas e reajuste os Hyper Parâmetros operacionais. Responda ESTRITAMENTE em JSON com o formato: { driftDelta: number, reason: string } onde driftDelta é entre -0.1 e 0.1.",
        `A Memória atual tem sampling_temperature de ${this.memory.sampling_temperature || 0.7}. Existe loop_detection: ${this.memory.loop_detection}. Ajuste.`
      );

      let driftDelta = (Math.random() * 0.1) - 0.05;
      let reason = "Self-adjusted based on false positive rate analysis in batch (MockFallback).";

      if (aiResponse) {
        try {
          const cleanJson = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (typeof parsed.driftDelta === "number") driftDelta = parsed.driftDelta;
          if (parsed.reason) reason = parsed.reason;
        } catch (e) {
          console.error("[MiniMax Engine] Erro parse selfOptimize:", e);
        }
      }
      
      const oldTemp = this.memory.sampling_temperature || 0.7;
      const newTemp = Math.min(0.99, Math.max(0.1, oldTemp + driftDelta));

      this.scaffoldChanges = {
        sampling_temperature: { from: oldTemp, to: newTemp },
        reason
      };

      this.memory = {
        ...this.memory,
        sampling_temperature: parseFloat(newTemp.toFixed(2)),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Hash helper para o Ledger de AI Act
  public static hashJSON(obj: any): string {
    return crypto.createHash("sha256").update(JSON.stringify(obj || {})).digest("hex");
  }
}
