"use client";

import React from "react";
import { FileText, ShieldCheck, UserCheck, Cpu, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { AIAuditLog } from "@mindops/database";

interface AIAuditTrailTableProps {
  logs: AIAuditLog[];
}

export function AIAuditTrailTable({ logs }: AIAuditTrailTableProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case "human_approved":
        return <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Aprovada por Humano</span>;
      case "human_rejected":
        return <span className="flex items-center gap-1 text-rose-400 text-xs font-semibold"><XCircle className="h-3.5 w-3.5" /> Rejeitada por Humano</span>;
      case "created":
        return <span className="flex items-center gap-1 text-cyan-400 text-xs font-semibold"><Cpu className="h-3.5 w-3.5" /> Inferência Gerada</span>;
      default:
        return <span className="flex items-center gap-1 text-neutral-400 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> {action}</span>;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span>Rastro Imutável de Auditoria (AI Audit Trail — EU AI Act)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Registo cronológico de inferências, decisões automatizadas e revisões humanas
          </p>
        </div>
      </div>

      {/* Tabela de Logs */}
      {logs.length === 0 ? (
        <div className="text-center py-8 text-xs text-neutral-500">
          Nenhum registo de auditoria de IA para esta organização.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead>
              <tr className="border-b border-white/10 text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Data / Hora</th>
                <th className="pb-3 font-semibold">Ação Registada</th>
                <th className="pb-3 font-semibold">Autor (Actor)</th>
                <th className="pb-3 font-semibold">ID da Decisão</th>
                <th className="pb-3 font-semibold">Detalhes / Justificativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => {
                const detailsText = typeof log.details === "string" 
                  ? log.details 
                  : (log.details as any)?.feedback || (log.details as any)?.action || (log.scaffold_changes as any)?.notes || "Evento processado pelo motor de governança.";

                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-neutral-400">
                      {new Date(log.created_at || (log as any).timestamp || Date.now()).toLocaleString("pt-PT")}
                    </td>
                    <td className="py-3.5">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 font-medium text-white">
                      {log.actor ? log.actor.substring(0, 18) : "system:m2.7_core"}
                    </td>
                    <td className="py-3.5 font-mono text-cyan-400">
                      {log.decision_id ? log.decision_id.substring(0, 8) : "—"}...
                    </td>
                    <td className="py-3.5 text-neutral-400 max-w-sm truncate">
                      {detailsText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
