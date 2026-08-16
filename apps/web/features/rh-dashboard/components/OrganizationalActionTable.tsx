"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Plus,
  FileCheck2,
  Scale,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { CreateInterventionModal } from "./CreateInterventionModal";
import { EvidenceManagerModal } from "./EvidenceManagerModal";
import { ReassessmentModal } from "./ReassessmentModal";
import { updateInterventionStatusAction } from "@/app/admin/actions/interventions";

interface OrganizationalActionTableProps {
  actions: Array<{
    id: string;
    title: string;
    factor: string;
    department: string;
    priority: "critical" | "high" | "medium" | "low";
    responsible: string;
    deadline: string;
    status: string;
    hasEvidence?: boolean;
    effectivenessRating?: string | null;
  }>;
  campaignId?: string | null;
  onRefresh?: () => void;
}

export function OrganizationalActionTable({
  actions,
  campaignId,
  onRefresh
}: OrganizationalActionTableProps) {
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "evidence" | "reassessment" | "closed">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<{ id: string; title: string } | null>(null);
  const [activeReassessmentModal, setActiveReassessmentModal] = useState<{ id: string; title: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      case "closed":
      case "resolved":
        return <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5" /> Concluída</span>;
      case "effective":
        return <span className="flex items-center gap-1 text-purple-400 text-xs font-semibold"><CheckSquare className="h-3.5 w-3.5" /> Eficaz</span>;
      case "in_progress":
        return <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Em Execução</span>;
      case "evidence_pending":
        return <span className="flex items-center gap-1 text-cyan-400 text-xs font-semibold"><FileCheck2 className="h-3.5 w-3.5" /> Aguarda Evidência</span>;
      case "reassessment_pending":
        return <span className="flex items-center gap-1 text-indigo-400 text-xs font-semibold"><Scale className="h-3.5 w-3.5" /> Aguarda Reavaliação</span>;
      case "overdue":
        return <span className="flex items-center gap-1 text-rose-400 text-xs font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> Atrasada</span>;
      default:
        return <span className="flex items-center gap-1 text-neutral-400 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Planeada</span>;
    }
  };

  const filteredActions = actions.filter((act) => {
    if (filter === "open") return act.status !== "closed" && act.status !== "resolved";
    if (filter === "in_progress") return act.status === "in_progress";
    if (filter === "evidence") return act.status === "evidence_pending";
    if (filter === "reassessment") return act.status === "reassessment_pending";
    if (filter === "closed") return act.status === "closed" || act.status === "resolved" || act.status === "effective";
    return true;
  });

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    let nextStatus: any = "in_progress";
    if (currentStatus === "planned" || currentStatus === "identified") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "evidence_pending";
    else if (currentStatus === "evidence_pending") nextStatus = "reassessment_pending";
    else if (currentStatus === "effective") nextStatus = "closed";

    await updateInterventionStatusAction(id, nextStatus);
    if (onRefresh) onRefresh();
    setUpdatingId(null);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📋 Action Center V2 — Plano de Intervenção & Evidências</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
              SST / PGR / NR-1
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestão de medidas organizacionais, rastro de evidências documentais e reavaliações técnicas
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Medida Preventiva</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "all" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Todas ({actions.length})
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "open" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Em Aberto
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "in_progress" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Em Execução
        </button>
        <button
          onClick={() => setFilter("evidence")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "evidence" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Aguarda Evidência
        </button>
        <button
          onClick={() => setFilter("reassessment")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "reassessment" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Aguarda Reavaliação
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            filter === "closed" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* Tabela de Ações */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-10 text-xs text-neutral-500">
          Nenhuma medida preventiva encontrada para o filtro selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead>
              <tr className="border-b border-white/10 text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Medida Preventiva</th>
                <th className="pb-3 font-semibold">Fator de Risco</th>
                <th className="pb-3 font-semibold">Setor / Processo</th>
                <th className="pb-3 font-semibold">Prioridade</th>
                <th className="pb-3 font-semibold">Responsável</th>
                <th className="pb-3 font-semibold">Prazo</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Ações Operacionais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredActions.map((act) => (
                <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-medium text-white max-w-xs">{act.title}</td>
                  <td className="py-3.5 text-neutral-400">{act.factor}</td>
                  <td className="py-3.5 text-neutral-300 font-semibold">{act.department}</td>
                  <td className="py-3.5">{getPriorityBadge(act.priority)}</td>
                  <td className="py-3.5 text-neutral-400">{act.responsible}</td>
                  <td className="py-3.5 font-mono text-neutral-300">{act.deadline}</td>
                  <td className="py-3.5">{getStatusBadge(act.status)}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveEvidenceModal({ id: act.id, title: act.title })}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-400 border border-white/10 transition-colors cursor-pointer"
                        title="Gerenciar Evidências"
                      >
                        <FileCheck2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setActiveReassessmentModal({ id: act.id, title: act.title })}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-neutral-300 hover:text-purple-400 border border-white/10 transition-colors cursor-pointer"
                        title="Reavaliar Eficácia"
                      >
                        <Scale className="h-4 w-4" />
                      </button>

                      {act.status !== "closed" && act.status !== "resolved" && (
                        <button
                          onClick={() => handleAdvanceStatus(act.id, act.status)}
                          disabled={updatingId === act.id}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-400 border border-white/10 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {updatingId === act.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Avançar"
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      <CreateInterventionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        campaignId={campaignId}
        onSuccess={onRefresh}
      />

      {activeEvidenceModal && (
        <EvidenceManagerModal
          isOpen={true}
          onClose={() => setActiveEvidenceModal(null)}
          actionId={activeEvidenceModal.id}
          actionTitle={activeEvidenceModal.title}
          onSuccess={onRefresh}
        />
      )}

      {activeReassessmentModal && (
        <ReassessmentModal
          isOpen={true}
          onClose={() => setActiveReassessmentModal(null)}
          actionId={activeReassessmentModal.id}
          actionTitle={activeReassessmentModal.title}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
