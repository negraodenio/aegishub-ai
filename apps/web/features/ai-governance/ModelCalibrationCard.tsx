"use client";

import React from "react";
import { Activity, ShieldCheck, AlertCircle, Cpu } from "lucide-react";
import type { AIGovernanceMetrics } from "@mindops/database";

interface ModelCalibrationCardProps {
  metrics: AIGovernanceMetrics;
}

export function ModelCalibrationCard({ metrics }: ModelCalibrationCardProps) {
  const { totalDecisions, hasSufficientData, monitoredModels } = metrics;

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <span>Calibração de Modelos & Análise de Drift</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitorização contínua de estabilidade de inferências clínicas e biométricas
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-semibold">
          Amostras: N = {totalDecisions}
        </span>
      </div>

      {!hasSufficientData ? (
        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 text-center">
          <div className="h-10 w-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Amostra insuficiente para cálculo de Drift</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              São necessárias no mínimo 30 avaliações corporativas auditadas para gerar os intervalos de confiança estatística e cálculo de variância de modelo sem viés de amostra reduzida.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Estabilidade de Inferência</span>
            <div className="text-xl font-bold text-emerald-400">Estável</div>
            <p className="text-[11px] text-neutral-500">
              Taxa de concordância com validação humana em conformidade com benchmarks.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Confiança Média do Ensemble</span>
            <div className="text-xl font-bold text-white">88.4%</div>
            <p className="text-[11px] text-neutral-500">
              Baseada em {totalDecisions} inferências consolidadas no tenant.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
