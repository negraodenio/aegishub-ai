"use client";

import React, { useState } from "react";
import { ShieldCheck, FileText, History, Plus, BrainCircuit, ExternalLink } from "lucide-react";
import { ReportGenerationModal } from "./ReportGenerationModal";
import { ReportHistoryModal } from "./ReportHistoryModal";
import Link from "next/link";

interface RegulatoryReportCenterProps {
  tenantName: string;
  countryCode: "PT" | "BR";
  campaigns: Array<{ id: string; title: string; code: string }>;
  activeCampaignId?: string | null;
}

export function RegulatoryReportCenter({
  tenantName,
  countryCode,
  campaigns,
  activeCampaignId
}: RegulatoryReportCenterProps) {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <footer className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-xs">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Dossiês Regulatórios & Evidências Estatutárias</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 font-mono">
              {countryCode === "PT" ? "Lei 102/2009 (ACT)" : "NR-1 / GRO (MTE)"}
            </span>
          </h4>
          <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xl leading-relaxed">
            Compilação auditável de evidências, planos de ação preventiva e taxas de participação com integridade criptográfica SHA-256 e anonimato garantido ($N \ge 5$).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-all border border-white/10 cursor-pointer"
        >
          <History className="h-4 w-4 text-cyan-400" />
          <span>Histórico de Emissões</span>
        </button>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Gerar Novo Dossiê</span>
        </button>

        <Link
          href={"/rh/intelligence" as any}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-all border border-white/10"
          title="Aceder ao AI Governance Log"
        >
          <BrainCircuit className="h-4 w-4 text-purple-400" />
          <span>AI Governance</span>
        </Link>
      </div>

      {/* Modais */}
      <ReportGenerationModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        countryCode={countryCode}
      />

      <ReportHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        campaignId={activeCampaignId}
      />
    </footer>
  );
}
