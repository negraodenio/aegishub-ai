"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from "lucide-react";
import { toggleCognitiveBenefitAction } from "@/app/employee/cognitive/actions";

interface CognitiveBenefitAdminCardProps {
  tenantId: string;
  initialIsEnabled: boolean;
  maxSeats: number;
  totalActivatedSeats: number;
  hasSufficientData: boolean;
  adoptionRatePercent: number | null;
  privacyNotice: string;
  isAdmin: boolean;
  countryCode: "PT" | "BR";
}

export function CognitiveBenefitAdminCard({
  tenantId,
  initialIsEnabled,
  maxSeats,
  totalActivatedSeats,
  hasSufficientData,
  adoptionRatePercent,
  privacyNotice,
  isAdmin,
  countryCode
}: CognitiveBenefitAdminCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!isAdmin) return;
    try {
      setIsToggling(true);
      const nextState = !isEnabled;
      const res = await toggleCognitiveBenefitAction(tenantId, nextState, maxSeats);
      if (res.success) {
        setIsEnabled(nextState);
      }
    } catch (err) {
      console.error("Erro ao alterar status do benefício:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <article className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition space-y-6 relative overflow-hidden">
      {/* HEADER DO CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Programa de Suporte Cognitivo & Apoio Executivo
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Benefício B2B
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Ferramenta corporativa de apoio a funções executivas, foco e neuroinclusão.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 ${
              isEnabled
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {isEnabled ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4" />}
            {isEnabled ? "Benefício Ativo" : "Benefício Inativo"}
          </button>
        )}
      </div>

      {/* MÉTRICAS AGREGADAS BLINDADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Licenças Contratadas
          </span>
          <p className="text-2xl font-black text-white">{maxSeats} assentos</p>
          <p className="text-[11px] text-neutral-500">Cota disponível para o tenant</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Adesão ao Programa
          </span>
          <p className="text-2xl font-black text-white">
            {hasSufficientData ? `${adoptionRatePercent}%` : "Confidencial"}
          </p>
          <p className="text-[11px] text-neutral-500">
            {hasSufficientData
              ? `${totalActivatedSeats} colaboradores ativaram`
              : "Requer N ≥ 20 ativados"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            Governança de Privacidade
          </span>
          <p className="text-xs font-bold text-emerald-400 pt-1">
            {countryCode === "PT" ? "Blindagem RGPD Art. 9º" : "Blindagem LGPD Art. 11º"}
          </p>
          <p className="text-[10px] text-neutral-500">Zero acesso a dados pessoais</p>
        </div>
      </div>

      {/* DISCLAMER DE PRIVACIDADE E REGULATÓRIO */}
      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-3">
        <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          {privacyNotice}
        </p>
      </div>
    </article>
  );
}
