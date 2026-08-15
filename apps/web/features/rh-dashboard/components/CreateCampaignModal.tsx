"use client";

import React, { useState } from "react";
import { X, Layers, Shield, Calendar, Check, Loader2 } from "lucide-react";
import { createCampaignAction } from "@/app/admin/campaigns/actions";

interface CreateCampaignModalProps {
  onClose: () => void;
}

export function CreateCampaignModal({ onClose }: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    countryCode: "PT" as "PT" | "BR",
    methodology: "COPSOQ_II",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    minAnonymityGroupSize: 5,
    allowVoiceScreening: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createCampaignAction({
      title: formData.title,
      description: formData.description || null,
      countryCode: formData.countryCode,
      methodology: formData.methodology,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      minAnonymityGroupSize: Number(formData.minAnonymityGroupSize),
      allowVoiceScreening: formData.allowVoiceScreening
    });

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      setError(result.error || "Falha ao criar campanha.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0e0e11] border border-white/15 p-6 shadow-2xl space-y-6 text-white font-sans">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Criar Nova Campanha de Avaliação</h3>
              <p className="text-xs text-neutral-400">Configuração de escopo, metodologia e privacidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Título da Campanha */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-300">Título da Campanha *</label>
            <input
              type="text"
              required
              placeholder="Ex: Avaliação Anual de Riscos Psicossociais 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Jurisdição e Metodologia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Jurisdição *</label>
              <select
                value={formData.countryCode}
                onChange={(e) => {
                  const cc = e.target.value as "PT" | "BR";
                  setFormData({
                    ...formData,
                    countryCode: cc,
                    methodology: cc === "PT" ? "COPSOQ_II" : "WORKER_VOICE_NR1"
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="PT">🇵🇹 Portugal (Lei 102/2009)</option>
                <option value="BR">🇧🇷 Brasil (NR-1 / PGR)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Metodologia</label>
              <input
                type="text"
                disabled
                value={formData.countryCode === "PT" ? "COPSOQ II (Validado PT)" : "Worker Voice (NR-1)"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-neutral-400"
              />
            </div>
          </div>

          {/* Datas de Início e Término */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Data de Início *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Data de Término *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Limiar de Anonimato */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-neutral-200">Limiar Mínimo de Anonimato</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                N ≥ {formData.minAnonymityGroupSize}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Departamentos ou unidades com menos de {formData.minAnonymityGroupSize} participantes não terão resultados granulares exibidos ao RH para impedir reidentificação.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>A criar...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Lançar Campanha</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
