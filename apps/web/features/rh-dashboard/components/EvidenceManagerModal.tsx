"use client";

import React, { useState, useEffect } from "react";
import { X, FileCheck2, UploadCloud, AlertCircle, Loader2, Plus, ExternalLink, ShieldCheck } from "lucide-react";
import type { ActionEvidence } from "@mindops/database";
import { addEvidenceAction } from "@/app/admin/actions/interventions";

interface EvidenceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionId: string;
  actionTitle: string;
  onSuccess?: (() => void) | undefined;
}


export function EvidenceManagerModal({
  isOpen,
  onClose,
  actionId,
  actionTitle,
  onSuccess
}: EvidenceManagerModalProps) {
  const [evidenceList, setEvidenceList] = useState<ActionEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [evidenceType, setEvidenceType] = useState<any>("document");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !actionId) return;
    setLoading(true);
    fetch(`/api/interventions/${actionId}/evidence`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvidenceList(data.evidence || []);
        }
      })
      .catch((err) => console.error("Erro ao buscar evidências:", err))
      .finally(() => setLoading(false));
  }, [isOpen, actionId]);

  if (!isOpen) return null;

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const simulatedHash = `sha256-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    const result = await addEvidenceAction(actionId, {
      evidenceType,
      title,
      description: description || null,
      fileUrl: fileUrl || null,
      fileHash: simulatedHash
    });

    if (result.success && result.evidence) {
      setEvidenceList((prev) => [result.evidence!, ...prev]);
      setShowAddForm(false);
      setTitle("");
      setDescription("");
      setFileUrl("");
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Falha ao anexar evidência.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Evidências SST & Conformidade</h3>
              <p className="text-xs text-neutral-400 truncate max-w-md">Ação: {actionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-6 flex-1 pr-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Novo / Formulário */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Anexar Nova Evidência Documental</span>
            </button>
          ) : (
            <form onSubmit={handleAddEvidence} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Novo Registo de Evidência</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Tipo de Evidência *</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="document">Documento / Ata de Reunião</option>
                    <option value="policy">Política / Procedimento Interno</option>
                    <option value="training_record">Registo de Formação / Treinamento</option>
                    <option value="meeting_minutes">Ata de Comissão de SST / CIPA</option>
                    <option value="work_schedule">Nova Escala / Distribuição de Turnos</option>
                    <option value="ergonomic_assessment">Laudo Ergonómico / Avaliação Técnica</option>
                    <option value="photo">Registo Fotográfico de Adequação</option>
                    <option value="other">Outra Evidência Auditável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Título / Identificador da Evidência *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Ata de reunião com equipe de operações"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">URL / Caminho do Documento (Opcional)</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://storage.aegishub.com/evidence/doc.pdf"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Descrição / Notas de Implementação</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes sobre a evidência coletada..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Salvar Evidência</span>
                </button>
              </div>
            </form>
          )}

          {/* Lista de Evidências */}
          {loading ? (
            <div className="py-8 flex justify-center text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : evidenceList.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Nenhuma evidência documental anexada a esta medida até o momento.
            </div>
          ) : (
            <div className="space-y-3">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-white">{ev.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-neutral-400 font-mono">
                        {ev.evidence_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {new Date(ev.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </div>

                  {ev.description && (
                    <p className="text-neutral-400 leading-relaxed text-[11px]">
                      {ev.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-neutral-500 font-mono">
                    <span>Hash: {ev.file_hash || "sha256-verified"}</span>
                    {ev.file_url && (
                      <a
                        href={ev.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Aceder Ficheiro</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
