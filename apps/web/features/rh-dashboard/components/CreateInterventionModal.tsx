"use client";

import React, { useState } from "react";
import { X, Plus, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { createInterventionAction } from "@/app/admin/actions/interventions";
import type { CreateInterventionInput } from "@mindops/database";


interface CreateInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string | null | undefined;
  onSuccess?: (() => void) | undefined;
}

const COMMON_HAZARD_FACTORS = [
  "Ritmo e Intensidade de Trabalho Excessivos",
  "Sobrecarga e Turnos Noturnos Consecutivos",
  "Conflitos e Ambiguidade de Papel",
  "Exigências Emocionais e Atendimento ao Público",
  "Falta de Autonomia e Controlo sobre a Tarefa",
  "Isolamento Social e Falta de Apoio da Liderança",
  "Ergonomia e Fadiga Vocal / Postural",
  "Insegurança Contratual e Mudança Organizacional"
];

export function CreateInterventionModal({
  isOpen,
  onClose,
  campaignId,
  onSuccess
}: CreateInterventionModalProps) {
  const [title, setTitle] = useState("");
  const [hazardFactor, setHazardFactor] = useState(COMMON_HAZARD_FACTORS[0] || "Ritmo e Intensidade de Trabalho Excessivos");
  const [processActivity, setProcessActivity] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("high");
  const [responsibleName, setResponsibleName] = useState("Técnico de SST");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: CreateInterventionInput = {
      campaignId: campaignId || null,
      title: title.trim(),
      description: description.trim() || null,
      hazardFactor: hazardFactor || COMMON_HAZARD_FACTORS[0] || "Ritmo e Intensidade de Trabalho Excessivos",
      processActivity: processActivity.trim() || "Geral",
      priority,
      responsibleName: responsibleName.trim() || "Técnico de SST",
      dueDate: dueDate || new Date().toISOString().slice(0, 10)
    };


    const result = await createInterventionAction(payload);





    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(result.error || "Falha ao registrar intervenção.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Criar Medida Preventiva / Corretiva</h3>
              <p className="text-xs text-neutral-400">Plano de Ação de SST / PGR (Sem dados individuais)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Título da Medida Preventiva *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reestruturação da escala de pausas e pausas ativas"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Fator de Risco Associado *</label>
              <select
                value={hazardFactor}
                onChange={(e) => setHazardFactor(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                {COMMON_HAZARD_FACTORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Prioridade SST *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">Crítica (Intervenção Imediata)</option>
                <option value="high">Alta (Prazo 15 dias)</option>
                <option value="medium">Média (Prazo 30 dias)</option>
                <option value="low">Baixa (Monitorização)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Setor / Processo Afetado</label>
              <input
                type="text"
                value={processActivity}
                onChange={(e) => setProcessActivity(e.target.value)}
                placeholder="Ex: Contact Center / Operações"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Responsável / Função</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Ex: Engenharia de SST / Gestão de RH"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Prazo de Conclusão (Due Date) *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Descrição Detalhada / Plano de Execução</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as medidas organizacionais a serem implementadas..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-semibold hover:bg-white/10 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Registar Medida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
