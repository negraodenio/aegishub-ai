"use client";

import React from "react";
import { Cpu, Scale, CheckCircle2, XCircle, Activity, ShieldCheck } from "lucide-react";
import type { AIGovernanceMetrics } from "@mindops/database";

interface AIGovernanceKPIGridProps {
  metrics: AIGovernanceMetrics;
}

export function AIGovernanceKPIGrid({ metrics }: AIGovernanceKPIGridProps) {
  const {
    totalDecisions,
    pendingReviews,
    approvedDecisions,
    rejectedDecisions,
    avgConfidence,
    hasSufficientData,
    monitoredModels
  } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Modelos Monitorados */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Modelos em Produção</span>
          <Cpu className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{monitoredModels.length}</div>
          <p className="text-[11px] text-neutral-400 mt-1 truncate">
            {monitoredModels.join(", ")}
          </p>
        </div>
      </div>

      {/* 2. Total de Decisões de IA */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Inferências do Tenant</span>
          <Activity className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{totalDecisions}</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {totalDecisions > 0 ? "Registos auditáveis" : "Sem inferências registadas"}
          </p>
        </div>
      </div>

      {/* 3. Supervisão Humana Pendente */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Revisão Pendente</span>
          <Scale className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-amber-400">{pendingReviews}</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {pendingReviews > 0 ? "Aguardando autoridade SST" : "Fila de revisão zerada"}
          </p>
        </div>
      </div>

      {/* 4. Decisões Validadas / Aprovadas */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Validações Humanas</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            <span className="text-emerald-400">{approvedDecisions}</span>
            <span className="text-neutral-500 text-sm font-normal mx-1.5">/</span>
            <span className="text-rose-400 text-lg font-bold">{rejectedDecisions}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {approvedDecisions} aprovadas • {rejectedDecisions} rejeitadas
          </p>
        </div>
      </div>

      {/* 5. Calibração & Confiança Média */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Calibração Média</span>
          <ShieldCheck className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            {hasSufficientData && avgConfidence !== null ? `${avgConfidence}%` : "—"}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {hasSufficientData ? "Amostra consolidada" : "Amostra insuficiente (N < 10)"}
          </p>
        </div>
      </div>
    </div>
  );
}
