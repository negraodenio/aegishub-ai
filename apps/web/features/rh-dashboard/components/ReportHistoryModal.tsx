"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Download, ShieldCheck, Loader2, RefreshCw, Hash, ExternalLink } from "lucide-react";
import type { ComplianceReport } from "@mindops/database";
import { getComplianceReportsAction, logReportDownloadAction } from "@/app/admin/actions/reports";

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string | null | undefined;
}

export function ReportHistoryModal({
  isOpen,
  onClose,
  campaignId
}: ReportHistoryModalProps) {

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const result = await getComplianceReportsAction(campaignId || null);
    if (result.success && result.reports) {
      setReports(result.reports);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, campaignId]);

  if (!isOpen) return null;

  const handleDownloadReport = async (report: ComplianceReport) => {
    setDownloadingId(report.id);
    await logReportDownloadAction(report.id, report.campaign_id);

    // Gera um blob de download do JSON estruturado assinado para visualização e auditoria
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report.report_data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `${report.report_type}_v${report.version}_${new Date(report.created_at).toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Histórico & Dossiês Regulatórios Emitidos</h3>
              <p className="text-xs text-neutral-400">Registro imutável de relatórios, versionamento e hashes de integridade</p>
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
        <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
          {loading ? (
            <div className="py-12 flex justify-center text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <FileText className="h-8 w-8 mx-auto opacity-40 text-neutral-400" />
              <p>Nenhum relatório regulatório emitido até o momento.</p>
              <p className="text-[11px] text-neutral-600">
                Utilize o botão "Gerar Novo Dossiê" para compilar evidências da campanha.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px] border border-cyan-500/30">
                        v{rep.version}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 font-mono text-[10px]">
                        {rep.jurisdiction === "PT" ? "🇵🇹 ACT" : "🇧🇷 NR-1"}
                      </span>
                      <h4 className="font-bold text-white text-xs">{rep.title}</h4>
                    </div>

                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(rep.created_at).toLocaleDateString("pt-PT")} às{" "}
                      {new Date(rep.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono break-all">
                      <Hash className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate max-w-sm sm:max-w-md">{rep.content_hash}</span>
                    </div>

                    <button
                      onClick={() => handleDownloadReport(rep)}
                      disabled={downloadingId === rep.id}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition border border-white/10 cursor-pointer self-start sm:self-auto disabled:opacity-50"
                    >
                      {downloadingId === rep.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span>Exportar Dossiê</span>
                    </button>
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
