"use client";

import React, { useState } from "react";
import { Layers, Plus, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { CreateCampaignModal } from "./CreateCampaignModal";

interface EmptyCampaignStateProps {
  tenantName: string;
  hasCampaigns: boolean;
}

export function EmptyCampaignState({ tenantName, hasCampaigns }: EmptyCampaignStateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 my-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
      <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
        <Layers className="h-8 w-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-bold text-white">
          {hasCampaigns ? "Campanha criada — aguardando respostas" : "Esta organização ainda não possui uma campanha ativa"}
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {hasCampaigns
            ? "Os links de avaliação já foram emitidos para os colaboradores. Assim que os questionários forem submetidos, os indicadores agregados serão consolidados aqui."
            : `Inicie uma campanha estruturada para avaliar os riscos psicossociais e a saúde ocupacional dos colaboradores de ${tenantName} em total conformidade legal.`}
        </p>
      </div>

      {!hasCampaigns && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Primeira Campanha</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      )}

      {isModalOpen && <CreateCampaignModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
