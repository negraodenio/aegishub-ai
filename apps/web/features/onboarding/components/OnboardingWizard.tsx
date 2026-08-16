"use client";

import React, { useState } from "react";
import { Building2, ShieldCheck, Users, Sparkles, CheckCircle2, ArrowRight, Upload, AlertCircle } from "lucide-react";

interface OnboardingWizardProps {
  tenantName: string;
  tenantId: string;
  countryCode: "PT" | "BR";
  initialStep?: string;
}

export function OnboardingWizard({ tenantName, tenantId, countryCode, initialStep = "organization" }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<"PT" | "BR">(countryCode);
  const [taxId, setTaxId] = useState("");
  const [economicActivity, setEconomicActivity] = useState("");
  const [modules, setModules] = useState({
    sst_assessment: true,
    campaigns: true,
    interventions: true,
    compliance_reports: true,
    ai_governance: true,
    cognitive_support: false
  });
  const [csvContent, setCsvContent] = useState("");
  const [previewStats, setPreviewStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isPT = selectedJurisdiction === "PT";

  const handleSimulateCsvPreview = () => {
    if (!csvContent.trim()) return;
    const lines = csvContent.trim().split("\n");
    const count = Math.max(0, lines.length - 1);
    setPreviewStats({
      total: count,
      valid: count,
      invalid: 0
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-[#090D16] border border-white/10 rounded-2xl text-white">
      {/* Progress Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enterprise Onboarding</h1>
          <p className="text-sm text-slate-400">Configure a sua organização, módulos e colaboradores</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            {isPT ? "🇵🇹 Portugal (Lei 102/2009)" : "🇧🇷 Brasil (NR-1 / PGR)"}
          </span>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { num: 1, label: "Organização", icon: Building2 },
          { num: 2, label: "Módulos", icon: ShieldCheck },
          { num: 3, label: "Roster & Usuários", icon: Users },
          { num: 4, label: "Ativação", icon: Sparkles }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl border transition-all ${
                isActive
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                  : isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border-white/5 text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Organização */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            1. Dados Regulatórios e Fiscais da Organização
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome da Organização</label>
              <input
                type="text"
                value={tenantName}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Jurisdição Regulamentar</label>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value as "PT" | "BR")}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="PT" className="bg-slate-900">Portugal (ACT / Lei 102/2009)</option>
                <option value="BR" className="bg-slate-900">Brasil (MTE / NR-1 / PGR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {isPT ? "Identificação Fiscal (NIF/NIPC)" : "Identificação Fiscal (CNPJ)"}
              </label>
              <input
                type="text"
                placeholder={isPT ? "ex: 501234567" : "ex: 12.345.678/0001-90"}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {isPT ? "Atividade Econômica (CAE)" : "Atividade Econômica (CNAE)"}
              </label>
              <input
                type="text"
                placeholder={isPT ? "ex: 62010" : "ex: 62.01-5-01"}
                value={economicActivity}
                onChange={(e) => setEconomicActivity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
            >
              Avançar para Módulos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Módulos */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            2. Ativação de Módulos Operacionais
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "sst_assessment", title: "Avaliação Psicossocial SST", desc: "Coleta e pontuação de riscos ergonômicos coletivos" },
              { key: "campaigns", title: "Gestão de Campanhas", desc: "Lançamento e acompanhamento temporal de baterias" },
              { key: "interventions", title: "Plano de Intervenção SST", desc: "Ações corretivas com evidências e inspeção" },
              { key: "compliance_reports", title: "Laudos Regulatórios", desc: isPT ? "Emissão de relatórios ACT / Lei 102" : "Emissão de relatórios MTE / NR-1" },
              { key: "ai_governance", title: "Governança de IA (EU AI Act)", desc: "Supervisão humana e trilha imutável" },
              { key: "cognitive_support", title: "Suporte Cognitivo (B2B Benefit)", desc: "Assistência executiva para colaboradores neurodivergentes" }
            ].map((m) => (
              <div
                key={m.key}
                onClick={() => setModules((prev) => ({ ...prev, [m.key]: !prev[m.key as keyof typeof modules] }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  modules[m.key as keyof typeof modules]
                    ? "bg-indigo-600/10 border-indigo-500/40"
                    : "bg-white/5 border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{m.title}</span>
                  <input
                    type="checkbox"
                    checked={modules[m.key as keyof typeof modules]}
                    onChange={() => {}}
                    className="accent-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium"
            >
              Voltar
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
            >
              Avançar para Roster <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Roster CSV & Convites */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            3. Importação em Lote de Colaboradores (CSV Roster)
          </h2>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              <strong>Aviso de Privacidade (RGPD/LGPD):</strong> O arquivo deve conter estritamente dados administrativos (e-mail, nome, departamento, papel). Não carregue informações clínicas ou dados médicos.
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Cole o conteúdo CSV ou digite a lista de colaboradores (formato: email,name,role,department):
            </label>
            <textarea
              rows={5}
              placeholder="email,name,role,department&#10;ana.silva@empresa.com,Ana Silva,employee,Logística&#10;carlos.mendes@empresa.com,Carlos Mendes,manager,Operações"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSimulateCsvPreview}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium"
            >
              <Upload className="w-4 h-4" /> Validar Preview
            </button>
            {previewStats && (
              <div className="text-xs flex items-center gap-3 text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <span>Total: <strong>{previewStats.total}</strong></span>
                <span className="text-emerald-400">Válidos: <strong>{previewStats.valid}</strong></span>
                <span className="text-rose-400">Erros: <strong>{previewStats.invalid}</strong></span>
              </div>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium"
            >
              Voltar
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
            >
              Concluir Onboarding <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Conclusão & Handoff para Primeira Campanha */}
      {currentStep === 4 && (
        <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Organização Pronta para Operação!</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              A organização <strong>{tenantName}</strong> foi configurada com sucesso na jurisdição {isPT ? "Portuguesa (Lei 102/2009)" : "Brasileira (NR-1 / PGR)"}.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/admin/team"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold transition-all border border-white/10 w-full sm:w-auto"
            >
              Ver Colaboradores & Equipe
            </a>
            <a
              href="/rh"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/30 text-white w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Lançar Primeira Campanha SST
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
