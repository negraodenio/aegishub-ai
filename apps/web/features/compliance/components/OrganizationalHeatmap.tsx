"use client";

import React from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  TrendingUp,
  Users,
  Lock,
  ArrowUpRight,
  FileCheck,
  Building2,
  Globe2,
  Sparkles
} from "lucide-react";
import type { DepartmentAnonymizedMetrics } from "@mindops/database";
import Link from "next/link";

interface OrganizationalHeatmapProps {
  tenantName: string;
  countryCode: "PT" | "BR";
  departments: DepartmentAnonymizedMetrics[];
  compositeRiskIndex: number | null;
  totalAssessed: number;
  hasData: boolean;
}

export function OrganizationalHeatmap({
  tenantName,
  countryCode,
  departments,
  compositeRiskIndex,
  totalAssessed,
  hasData
}: OrganizationalHeatmapProps) {
  const isPT = countryCode === "PT";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 font-sans p-6 md:p-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <Lock className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
              Conformidade & Governança Ativa
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Mapa de Risco Organizacional</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400">
              {tenantName}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold">
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            {isPT ? (
              <span className="text-neutral-200">
                🇵🇹 <strong>Portugal</strong> (Lei 102/2009 / ACT)
              </span>
            ) : (
              <span className="text-neutral-200">
                🇧🇷 <strong>Brasil</strong> (NR-1 / GRO / PGR)
              </span>
            )}
          </div>

          <Link
            href="/rh"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isPT ? "Emitir Dossiê ACT" : "Emitir Inventário NR-1"}</span>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: "Índice de Sobrecarga Psicossocial",
            value: compositeRiskIndex !== null ? `${compositeRiskIndex}/100` : "—",
            sub: hasData ? "Média ponderada da organização" : "Aguardando avaliações",
            color: compositeRiskIndex !== null && compositeRiskIndex >= 50 ? "text-amber-400" : "text-emerald-400",
            icon: Activity
          },
          {
            label: "Enquadramento Legal",
            value: isPT ? "Lei 102/2009" : "NR-1 / GRO",
            sub: isPT ? "Fiscalização ACT / RGPD" : "Fiscalização MTE / LGPD",
            color: "text-cyan-400",
            icon: Shield
          },
          {
            label: "Unidades / Departamentos",
            value: departments.length > 0 ? `${departments.length}` : "0",
            sub: "Mapeamento ocupacional",
            color: "text-emerald-400",
            icon: Building2
          },
          {
            label: "Trabalhadores Avaliados",
            value: `${totalAssessed}`,
            sub: "Proteção de anonimato (N ≥ 5)",
            color: "text-blue-400",
            icon: Users
          }
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {kpi.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</span>
                <kpi.icon className={`w-5 h-5 ${kpi.color} opacity-40`} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{kpi.sub}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Heatmap Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 border border-white/5 p-6 md:p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Mapeamento por Unidade Organizacional</span>
              </h3>
              <span className="text-[11px] text-neutral-400">
                Anonimato garantido para N ≥ 5
              </span>
            </div>

            {!hasData || departments.length === 0 ? (
              <div className="py-12 px-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Nenhum dado departamental consolidado
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                    Lance uma campanha de avaliação psicossocial para gerar o mapa de calor de risco ocupacional da organização.
                  </p>
                </div>
                <Link
                  href="/rh"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition cursor-pointer"
                >
                  <span>Gerenciar Campanhas</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {departments.map((dept, idx) => {
                  const isMasked = !dept.hasSufficientData || dept.assessedCount < 5;
                  const score = dept.avgScore ?? 0;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-slate-800/30 transition-all"
                    >
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg border ${
                          isMasked
                            ? "bg-white/5 border-white/10 text-neutral-500 text-xs text-center px-1"
                            : score >= 60
                            ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                            : score >= 40
                            ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                            : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {isMasked ? "N < 5" : score}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{dept.department}</span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isMasked
                                ? "text-neutral-400"
                                : dept.riskLevel === "critical"
                                ? "text-rose-400"
                                : dept.riskLevel === "high"
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {isMasked ? "DADOS INSUFICIENTES" : dept.riskLevel}
                          </span>
                        </div>

                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${
                              isMasked
                                ? "bg-neutral-700 w-full opacity-30"
                                : score >= 60
                                ? "bg-rose-500"
                                : score >= 40
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: isMasked ? "100%" : `${score}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span>{dept.assessedCount} respondentes</span>
                          <span>{isMasked ? "Protegido por anonimato" : dept.message || "Avaliados"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Governança & Conformidade */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl space-y-5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Governança & Auditoria
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Isolamento Multi-Tenant</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Políticas RLS ativas por organização. Zero vazamento entre entidades.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isPT ? "Conformidade RGPD" : "Conformidade LGPD"}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Agregações com limiar de privacidade $N \ge 5$. Zero dados nominais em telas de RH.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isPT ? "Normas ACT / Lei 102/2009" : "Normas MTE / NR-1 PGR"}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Dossiês estatutários versionados e com integridade criptográfica SHA-256.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/rh"
                className="w-full block text-center py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs transition"
              >
                Voltar ao Painel Executivo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
