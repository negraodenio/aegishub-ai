"use client";

import React from "react";
import { CheckSquare, Clock, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import type { CampaignAggregates } from "@mindops/database";

interface OrganizationalActionTableProps {
  actions: CampaignAggregates["organizationalActions"];
}

export function OrganizationalActionTable({ actions }: OrganizationalActionTableProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">Crítica</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Alta</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-neutral-500/20 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">Baixa</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5" /> Concluída</span>;
      case "in_progress":
        return <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Em Execução</span>;
      case "overdue":
        return <span className="flex items-center gap-1 text-rose-400 text-xs font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> Atrasada</span>;
      default:
        return <span className="flex items-center gap-1 text-neutral-400 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Pendente</span>;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📋 Plano de Ação Preventiva & Evidências (SST / PGR)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Medidas organizacionais de mitigação de riscos sem exposição de dados individuais
          </p>
        </div>
      </div>

      {/* Tabela de Ações */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead>
            <tr className="border-b border-white/10 text-neutral-500 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Medida Preventiva</th>
              <th className="pb-3 font-semibold">Fator de Risco</th>
              <th className="pb-3 font-semibold">Departamento</th>
              <th className="pb-3 font-semibold">Prioridade</th>
              <th className="pb-3 font-semibold">Responsável</th>
              <th className="pb-3 font-semibold">Prazo</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {actions.map((act) => (
              <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 font-medium text-white max-w-xs">{act.title}</td>
                <td className="py-3.5 text-neutral-400">{act.factor}</td>
                <td className="py-3.5 text-neutral-300 font-semibold">{act.department}</td>
                <td className="py-3.5">{getPriorityBadge(act.priority)}</td>
                <td className="py-3.5 text-neutral-400">{act.responsible}</td>
                <td className="py-3.5 font-mono text-neutral-300">{act.deadline}</td>
                <td className="py-3.5">{getStatusBadge(act.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
