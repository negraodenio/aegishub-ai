"use client";

import React from "react";
import { Users, Activity, CheckSquare, ShieldCheck, CalendarClock, AlertCircle } from "lucide-react";
import type { CampaignAggregates } from "@mindops/database";

interface EnterpriseKPIGridProps {
  aggregates: CampaignAggregates | null;
}

export function EnterpriseKPIGrid({ aggregates }: EnterpriseKPIGridProps) {
  if (!aggregates || !aggregates.hasResponses) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Taxa de Participação", value: "0%", desc: "Aguardando respostas", icon: Users },
          { label: "Índice de Risco", value: "—", desc: "Sem dados suficientes", icon: Activity },
          { label: "Medidas Preventivas", value: "0 Ações", desc: "Plano em elaboração", icon: CheckSquare },
          { label: "Cobertura de Evidências", value: "—", desc: "Aguardando consolidação", icon: ShieldCheck },
          { label: "Ciclo de Reavaliação", value: "Agendado", desc: "Conforme cronograma", icon: CalendarClock },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">{kpi.label}</span>
              <kpi.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold text-neutral-400">{kpi.value}</div>
            <p className="text-[11px] text-neutral-500">{kpi.desc}</p>
          </div>
        ))}
      </div>
    );
  }

  const {
    totalTarget,
    assessedCount,
    participationRate,
    avgRiskScore,
    organizationalActions
  } = aggregates;

  const activeActionsCount = organizationalActions.filter(a => a.status !== "resolved").length;
  const criticalActionsCount = organizationalActions.filter(a => a.priority === "high" || a.priority === "critical").length;

  const getRiskLabel = (score: number | null) => {
    if (score === null) return { label: "Sem dados", color: "text-neutral-400" };
    if (score <= 25) return { label: "Baixo", color: "text-emerald-400" };
    if (score <= 50) return { label: "Moderado", color: "text-blue-400" };
    if (score <= 75) return { label: "Elevado", color: "text-amber-400" };
    return { label: "Crítico", color: "text-rose-400" };
  };

  const riskInfo = getRiskLabel(avgRiskScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Taxa de Participação */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Participação</span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{participationRate}%</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            <strong className="text-white">{assessedCount}</strong> de {totalTarget} colaboradores
          </p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${Math.min(participationRate, 100)}%` }} />
        </div>
      </div>

      {/* 2. Índice de Risco Organizacional */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Índice de Risco</span>
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            {avgRiskScore !== null ? avgRiskScore : "—"}
            <span className="text-xs text-neutral-500 font-normal">/ 100</span>
          </div>
          <p className={`text-[11px] font-semibold mt-1 ${riskInfo.color}`}>
            Nível: {riskInfo.label}
          </p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: `${Math.min(avgRiskScore || 0, 100)}%` }} />
        </div>
      </div>

      {/* 3. Medidas Preventivas Ativas */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Medidas Ativas</span>
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{activeActionsCount} Ações</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            <strong className="text-amber-400">{criticalActionsCount}</strong> prioritárias em execução
          </p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `75%` }} />
        </div>
      </div>

      {/* 4. Cobertura de Evidências */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Evidências SST</span>
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">92.0%</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Documentação formal auditável
          </p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-purple-400 h-full rounded-full transition-all" style={{ width: `92%` }} />
        </div>
      </div>

      {/* 5. Ciclo de Reavaliação */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Reavaliação</span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CalendarClock className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-400">Em dia</div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Próx. ciclo previsto em 45 dias
          </p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `100%` }} />
        </div>
      </div>
    </div>
  );
}
