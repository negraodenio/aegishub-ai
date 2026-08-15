"use client";

import React, { useState } from "react";
import { Layers, Plus, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Campaign } from "@mindops/database";
import { CreateCampaignModal } from "./CreateCampaignModal";

interface CampaignSelectorProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onSelectCampaign?: (campaignId: string) => void;
  canCreateCampaign?: boolean;
}

export function CampaignSelector({
  campaigns,
  activeCampaign,
  canCreateCampaign = true
}: CampaignSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Ativa</span>;
      case "scheduled":
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Agendada</span>;
      case "closing":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Em Encerramento</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full bg-neutral-500/20 border border-neutral-500/30 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">Concluída</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">Rascunho</span>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
      {/* Informações da Campanha Selecionada */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
              {activeCampaign ? activeCampaign.code : "SEM CAMPANHA"}
            </span>
            <h2 className="text-sm font-semibold text-white">
              {activeCampaign ? activeCampaign.title : "Nenhuma campanha selecionada"}
            </h2>
            {activeCampaign && getStatusBadge(activeCampaign.status)}
          </div>
          {activeCampaign && (
            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Período: {new Date(activeCampaign.start_date).toLocaleDateString("pt-PT")} até {new Date(activeCampaign.end_date).toLocaleDateString("pt-PT")}
              <span>•</span>
              Limiar de Anonimato: N ≥ {activeCampaign.min_anonymity_group_size || 5}
            </p>
          )}
        </div>
      </div>

      {/* Ações e Seletor */}
      <div className="flex items-center gap-2">
        {canCreateCampaign && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Campanha</span>
          </button>
        )}
      </div>

      {isModalOpen && (
        <CreateCampaignModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
