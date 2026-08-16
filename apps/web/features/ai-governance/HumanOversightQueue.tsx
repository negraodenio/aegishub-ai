"use client";

import React, { useState } from "react";
import { Scale, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import type { AIDecision } from "@mindops/database";
import { validateAIDecisionAction } from "@/app/admin/ai-governance/actions";

interface HumanOversightQueueProps {
  decisions: AIDecision[];
}

export function HumanOversightQueue({ decisions: initialDecisions }: HumanOversightQueueProps) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  const handleValidate = async (id: string, action: "approved" | "rejected") => {
    setProcessingId(id);
    setFeedbackMessage(null);

    const result = await validateAIDecisionAction(id, action);
    if (result.success) {
      setDecisions(prev => prev.filter(d => d.id !== id));
      setFeedbackMessage({
        id,
        text: action === "approved" ? "Decisão de IA aprovada e registrada no log imutável." : "Decisão de IA rejeitada e intervenção vetada.",
        type: "success"
      });
    } else {
      setFeedbackMessage({
        id,
        text: result.error || "Falha ao processar validação.",
        type: "error"
      });
    }
    setProcessingId(null);
  };

  const getRiskBadge = (level?: string | null) => {
    switch (level) {
      case "critical":

        return <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider">Risco Crítico</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Risco Alto</span>;
      case "moderate":
      case "medium":
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Risco Moderado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Risco Baixo</span>;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-400" />
            <span>Fila de Supervisão Humana Obrigatória (Human-in-the-Loop)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Decisões e recomendações automatizadas de alto risco aguardando autorização de autoridade qualificada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            {decisions.length} aguardando validação
          </span>
        </div>
      </div>

      {/* Lista de Decisões */}
      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Nenhuma decisão pendente de supervisão</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Todas as inferências de alto risco geradas pelos modelos foram validadas ou não há alertas pendentes no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((item) => {
            const reasons = Array.isArray(item.reasons) ? item.reasons : [];
            const recommendationText = typeof item.recommendation === "string" 
              ? item.recommendation 
              : (item.recommendation as any)?.description || (item.recommendation as any)?.title || "Recomendação preventiva gerada pelo modelo.";

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
                      AI
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {item.decision_type || "Intervenção Preventiva de Risco Ocupacional"}
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Modelo: <strong className="text-neutral-300">{item.model_used || "MiniMax M2.7"}</strong> ({item.model_version || "v2.1"})
                        <span className="mx-2">•</span>
                        Criado em: {new Date(item.created_at || Date.now()).toLocaleString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  {getRiskBadge(item.risk_level)}
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <span className="font-semibold text-neutral-300">Recomendação Estruturada:</span>
                  <p className="text-neutral-200 leading-relaxed font-sans">
                    {recommendationText}
                  </p>
                  {reasons.length > 0 && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                      <strong>Evidências Clínicas/Fatores:</strong> {reasons.join(" • ")}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-mono text-neutral-500 truncate max-w-xs">
                    Hash: {item.input_hash ? item.input_hash.substring(0, 16) : item.id.substring(0, 8)}...
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleValidate(item.id, "rejected")}
                      disabled={processingId === item.id}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Rejeitar Decisão
                    </button>
                    <button
                      onClick={() => handleValidate(item.id, "approved")}
                      disabled={processingId === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Aprovar Intervenção</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
