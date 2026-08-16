"use client";

import React from "react";
import { BrainCircuit, Shield, Globe2, Cpu, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@mindops/database";

interface AIGovernanceHeaderProps {
  tenantName: string;
  countryCode: "PT" | "BR";
  userRole: UserRole;
  monitoredModels: string[];
}

export function AIGovernanceHeader({
  tenantName,
  countryCode,
  userRole,
  monitoredModels
}: AIGovernanceHeaderProps) {
  const isPT = countryCode === "PT";

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
      <div className="flex items-center gap-4">
        <Link
          href="/rh"
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Voltar ao Dashboard RH"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">AegisHub AI Governance Center</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
              EU AI ACT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Supervisão humana de modelos, rastreabilidade de decisões e conformidade com {isPT ? "Lei 102/2009 & RGPD" : "NR-1 & LGPD"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-neutral-200">
          <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>{tenantName}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Modelos Ativos: {monitoredModels.length}</span>
        </div>
      </div>
    </header>
  );
}
