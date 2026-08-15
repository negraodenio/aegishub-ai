"use client";

import React from "react";
import { Shield, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import type { DepartmentAnonymizedMetrics } from "@mindops/database";

interface AnonymizedHeatmapProps {
  departments: DepartmentAnonymizedMetrics[];
  minAnonymityThreshold: number;
}

export function AnonymizedHeatmap({
  departments,
  minAnonymityThreshold = 5
}: AnonymizedHeatmapProps) {
  const getBadge = (dept: DepartmentAnonymizedMetrics) => {
    if (!dept.hasSufficientData) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-semibold">
          <Lock className="h-3 w-3" />
          Protegido (N &lt; {minAnonymityThreshold})
        </span>
      );
    }
    if (dept.riskLevel === "low") {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Risco Baixo</span>;
    }
    if (dept.riskLevel === "moderate") {
      return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">Risco Moderado</span>;
    }
    if (dept.riskLevel === "high") {
      return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">Risco Elevado</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">Risco Crítico</span>;
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      {/* Cabeçalho do Heatmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️ Mapa de Calor de Riscos Organizacionais</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Distribuição por departamento e unidade operacional
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Anonimato Ativo (N ≥ {minAnonymityThreshold})</span>
        </div>
      </div>

      {/* Grid de Células de Departamentos */}
      {departments.length === 0 ? (
        <div className="text-center py-8 text-xs text-neutral-500">
          Nenhum departamento registrado nesta campanha.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                dept.hasSufficientData
                  ? "bg-white/[0.02] border-white/10 hover:border-white/20"
                  : "bg-white/[0.01] border-white/5 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">{dept.department}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {dept.assessedCount} de {dept.totalTarget} respondentes
                  </p>
                </div>
                {getBadge(dept)}
              </div>

              {dept.hasSufficientData ? (
                <div className="space-y-2 mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">Score Médio Composto</span>
                    <span className="text-lg font-black text-white">{dept.avgScore} / 100</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.riskLevel === "low"
                          ? "bg-emerald-400"
                          : dept.riskLevel === "moderate"
                          ? "bg-blue-400"
                          : dept.riskLevel === "high"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${dept.avgScore}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 mt-3 rounded-xl bg-neutral-900/60 border border-white/5 flex items-center gap-2.5 text-neutral-400 text-[11px]">
                  <Lock className="h-4 w-4 text-amber-500/80 shrink-0" />
                  <span>Dados insuficientes para agregação segura.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
