"use client";

import React from "react";
import { BrainCircuit, ShieldCheck, Lock, Sparkles } from "lucide-react";

export function DecisionExplainabilityCard() {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-cyan-400" />
            <span>Explicabilidade de Decisão & Memória Organizacional</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Arquitetura de explicabilidade de inferências e recomendações (EU AI Act - Artigo 13)
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          High-Risk AI Oversight
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <span className="font-bold text-neutral-300">1. Extração de Fatores</span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            As respostas psicossociais e os sinais vocais são processados em hashes pseudonimizados sem exposição direta de dados identificáveis.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <span className="font-bold text-neutral-300">2. Raciocínio Estruturado</span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Cada alerta emite um array de razões codificadas com grau de severidade e nível de confiança estatística mensurável.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <span className="font-bold text-neutral-300">3. Veto Humano Obrigatório</span>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            Nenhuma intervenção médica ou estrutural é aplicada sem que um profissional SST ou médico do trabalho autorize explicitamente a recomendação.
          </p>
        </div>
      </div>
    </div>
  );
}
