"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Loader2, Scale } from "lucide-react";
import type { EffectivenessRating } from "@mindops/database";
import { recordReassessmentAction } from "@/app/admin/actions/interventions";

interface ReassessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionId: string;
  actionTitle: string;
  onSuccess?: (() => void) | undefined;
}


export function ReassessmentModal({
  isOpen,
  onClose,
  actionId,
  actionTitle,
  onSuccess
}: ReassessmentModalProps) {
  const [rating, setRating] = useState<EffectivenessRating>("effective");
  const [score, setScore] = useState<number>(90);
  const [rationale, setRationale] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await recordReassessmentAction(actionId, {
      effectivenessRating: rating,
      effectivenessScore: Number(score),
      rationale
    });

    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(result.error || "Falha ao registrar reavaliação.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reavaliação de Eficácia da Medida</h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs">Ação: {actionTitle}</p>
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
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-2">Classificação Técnica de Eficácia *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setRating("effective"); setScore(90); }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  rating === "effective"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-white/[0.02] border-white/10 text-neutral-400 hover:bg-white/5"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
                <span className="font-bold block">Eficaz</span>
                <span className="text-[10px] opacity-70">Risco Reduzido</span>
              </button>

              <button
                type="button"
                onClick={() => { setRating("partially_effective"); setScore(60); }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  rating === "partially_effective"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-white/[0.02] border-white/10 text-neutral-400 hover:bg-white/5"
                }`}
              >
                <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                <span className="font-bold block">Parcial</span>
                <span className="text-[10px] opacity-70">Ajustes Necessários</span>
              </button>

              <button
                type="button"
                onClick={() => { setRating("ineffective"); setScore(25); }}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  rating === "ineffective"
                    ? "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-white/[0.02] border-white/10 text-neutral-400 hover:bg-white/5"
                }`}
              >
                <XCircle className="h-5 w-5 mx-auto mb-1" />
                <span className="font-bold block">Ineficaz</span>
                <span className="text-[10px] opacity-70">Replanejar Ação</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Score Estimado de Mitigação (0 - 100%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Parecer Técnico / Justificativa da Reavaliação *</label>
            <textarea
              required
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Descreva as evidências observadas e o impacto na redução do fator de risco psicossocial..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold transition shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Gravar Reavaliação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
