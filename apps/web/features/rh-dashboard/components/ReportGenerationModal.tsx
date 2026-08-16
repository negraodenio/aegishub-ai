"use client";

import React, { useState } from "react";
import { X, FileText, ShieldAlert, Loader2, CheckCircle2, ShieldCheck, FileCheck, Layers } from "lucide-react";
import { generateComplianceReportAction } from "@/app/admin/actions/reports";
import type { ReportType } from "@mindops/database";

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Array<{ id: string; title: string; code: string }>;
  activeCampaignId?: string | null | undefined;
  countryCode: "PT" | "BR";
  onSuccess?: (() => void) | undefined;
}

export function ReportGenerationModal({
  isOpen,
  onClose,
  campaigns,
  activeCampaignId,
  countryCode,
  onSuccess
}: ReportGenerationModalProps) {

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    activeCampaignId || campaigns[0]?.id || ""
  );
  const [reportType, setReportType] = useState<ReportType>(
    countryCode === "PT" ? "act_evidence_pt" : "nr1_pgr_evidence_br"
  );
  const [periodStart, setPeriodStart] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await generateComplianceReportAction({
      campaignId: selectedCampaignId || null,
      reportType,
      jurisdiction: countryCode,
      title: title || undefined,
      periodStart,
      periodEnd
    });

    if (result.success && result.report) {
      setGeneratedReport(result.report);
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Falha ao gerar relatório de conformidade.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central de Relatórios Regulatórios</h3>
              <p className="text-xs text-neutral-400">
                {countryCode === "PT" ? "Portugal • ACT / Lei 102/2009" : "Brasil • NR-1 / GRO / PGR"}
              </p>
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
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {generatedReport ? (
          <div className="space-y-5 text-xs animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Relatório Gerado com Sucesso!</span>
              </div>
              <p className="text-neutral-300">
                O documento foi compilado, versionado (Versão {generatedReport.version}) e registrado no livro de auditoria da organização.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-neutral-400 break-all space-y-1">
                <div><strong>Hash SHA-256:</strong> {generatedReport.content_hash}</div>
                <div><strong>ID do Documento:</strong> {generatedReport.id}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setGeneratedReport(null);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Seleção de Campanha */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Campanha de Origem *</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Relatório */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Tipo de Dossiê Regulatório *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {countryCode === "PT" ? (
                  <>
                    <option value="act_evidence_pt">Dossiê de Avaliação de Riscos Psicossociais (ACT / Lei 102/2009)</option>
                    <option value="sst_action_plan">Plano de Medidas Preventivas de SST (Art. 15º)</option>
                    <option value="campaign_executive">Relatório Executivo da Campanha (Agregado)</option>
                    <option value="intervention_effectiveness">Relatório Técnico de Eficácia de Intervenções</option>
                    <option value="ai_governance_audit">Dossiê de Governança de IA (EU AI Act)</option>
                  </>
                ) : (
                  <>
                    <option value="nr1_pgr_evidence_br">Inventário de Riscos & PGR (NR-1 / GRO)</option>
                    <option value="sst_action_plan">Plano de Ação do PGR (NR-1.5.5)</option>
                    <option value="campaign_executive">Relatório Executivo da Campanha (Agregado)</option>
                    <option value="intervention_effectiveness">Relatório de Reavaliação e Eficácia das Medidas</option>
                    <option value="ai_governance_audit">Dossiê de Auditoria e Governança de IA</option>
                  </>
                )}
              </select>
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Data Final</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Disclaimer Regulatório */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-[11px] text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Declaração de Integridade e Mascaramento de Privacidade</span>
              </div>
              <p className="leading-relaxed">
                Este relatório aplica proteção de anonimato estatístico ($N \ge 5$), omite dados de saúde individuais (PHI) e compila evidências documentais auditáveis.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Compilar & Salvar Dossiê</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
