"use client";

import React from "react";
import {
  CreditCard,
  Users,
  Layers,
  FileText,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock
} from "lucide-react";
import type { CommercialSummary } from "@mindops/database";

interface CommercialConsoleProps {
  summary: CommercialSummary;
  countryCode: "PT" | "BR";
}

export function CommercialConsole({ summary, countryCode }: CommercialConsoleProps) {
  const isPT = countryCode === "PT";
  const currency = isPT ? "EUR (€)" : "BRL (R$)";

  const getThresholdBadge = (threshold: string) => {
    switch (threshold) {
      case "WARNING":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">80% Aviso</span>;
      case "CRITICAL":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">90% Crítico</span>;
      case "EXCEEDED":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Limite Atingido</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Normal</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-[#090D16] border border-white/10 rounded-2xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Commercial Control Plane</h1>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {summary.planName}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de plano, cotas contratuais, consumo de IA e limites regulatórios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Jurisdição: <strong>{isPT ? "🇵🇹 Portugal (EUR)" : "🇧🇷 Brasil (BRL)"}</strong>
          </span>
          <span className={`text-xs uppercase font-semibold px-3 py-1.5 rounded-lg border ${
            summary.status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : summary.status === "trial"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}>
            Status: {summary.status}
          </span>
        </div>
      </div>

      {/* Resource Quotas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seats Quota */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <Users className="w-4 h-4 text-indigo-400" />
              Seats / Utilizadores
            </div>
            {getThresholdBadge(summary.quotas.seats.threshold)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary.quotas.seats.used}</span>
            <span className="text-sm text-slate-400">/ {summary.quotas.seats.limit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all ${
                summary.quotas.seats.percentage >= 90 ? "bg-rose-500" : summary.quotas.seats.percentage >= 80 ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min(100, summary.quotas.seats.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {summary.availableSeats} licenças disponíveis
          </p>
        </div>

        {/* Campaigns Quota */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <Layers className="w-4 h-4 text-emerald-400" />
              Campanhas SST
            </div>
            {getThresholdBadge(summary.quotas.campaigns.threshold)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary.quotas.campaigns.used}</span>
            <span className="text-sm text-slate-400">/ {summary.quotas.campaigns.limit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, summary.quotas.campaigns.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {summary.quotas.campaigns.limit - summary.quotas.campaigns.used} campanhas restantes
          </p>
        </div>

        {/* Reports Quota */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <FileText className="w-4 h-4 text-sky-400" />
              Laudos Regulatórios
            </div>
            {getThresholdBadge(summary.quotas.reports.threshold)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary.quotas.reports.used}</span>
            <span className="text-sm text-slate-400">/ {summary.quotas.reports.limit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${Math.min(100, summary.quotas.reports.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {summary.quotas.reports.limit - summary.quotas.reports.used} laudos restantes
          </p>
        </div>

        {/* AI Usage Quota */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <Cpu className="w-4 h-4 text-purple-400" />
              Requisições IA (Mês)
            </div>
            {getThresholdBadge(summary.quotas.aiRequestsMonthly.threshold)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary.quotas.aiRequestsMonthly.used}</span>
            <span className="text-sm text-slate-400">/ {summary.quotas.aiRequestsMonthly.limit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(100, summary.quotas.aiRequestsMonthly.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Renovação automática mensal
          </p>
        </div>
      </div>

      {/* Feature Entitlements Matrix */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Matriz de Recursos & Módulos Habilitados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(summary.entitlements).map(([key, enabled]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
                enabled
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-white/5 border-white/5 text-slate-500 opacity-60"
              }`}
            >
              <span className="truncate">{key.replace(/_/g, " ")}</span>
              {enabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zero-Mock Notice */}
      {!summary.hasSufficientData && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 text-slate-400 text-xs">
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <span>Organização em fase inicial: ainda não existem dados históricos de consumo acumulados.</span>
        </div>
      )}
    </div>
  );
}
