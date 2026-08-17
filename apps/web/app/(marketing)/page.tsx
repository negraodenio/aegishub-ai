"use client";

import React, { useState } from "react";
import {
  Shield,
  Lock,
  BarChart3,
  Users,
  Zap,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Activity,
  UserCheck,
  Brain,
  Globe2,
  Layers,
  Compass,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  PhoneCall,
  Check,
  Mic,
  MessageSquare,
  Play,
  RotateCcw,
  Sliders,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

type CountryTab = "PT" | "BR";

export default function MarketingPage() {
  const [country, setCountry] = useState<CountryTab>("PT");
  const [demoRequested, setDemoRequested] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [activeUnstuckStep, setActiveUnstuckStep] = useState<number>(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);

  const isPT = country === "PT";

  // Dynamic localization content
  const copy = {
    heroBadge: isPT
      ? "AI-Powered Workplace Cognitive Intelligence • Portugal (SST / ACT)"
      : "AI-Powered Workplace Cognitive Intelligence • Brasil (NR-1 / GRO / PGR / NR-17)",
    heroTitlePrefix: "Inteligência para ",
    heroTitleHighlight: "Riscos Psicossociais",
    heroTitleSuffix: " e Produtividade Cognitiva.",
    heroSubtitle: isPT
      ? "Avalie, previna, apoie os trabalhadores e documente evidências auditáveis para a ACT (Lei 102/2009) com uma plataforma corporativa de Inteligência Artificial e Ergonomia Cognitiva."
      : "Faça a gestão contínua de fatores psicossociais no PGR (NR-1), apoie os colaboradores no fluxo de trabalho e cumpra a NR-17 e CIPA+A com governança e sigilo garantido por algoritmo (N ≥ 5).",
    ctaPrimary: isPT ? "Agendar Demonstração" : "Solicitar Demonstração",
    ctaSecondary: isPT ? "Programa Parceiros SST" : "Parceiros & Clínicas SST",
    badge1: isPT ? "Lei n.º 102/2009 (SST / ACT)" : "NR-1 (GRO e PGR Contínuo)",
    badge2: isPT ? "COPSOQ-II Validação Oficial" : "Worker Voice (NR-1.5.3.3)",
    badge3: isPT ? "RGPD & EU AI Act Governance" : "LGPD, NR-17 & CIPA+A (Lei 14.457)",
    
    // Step 1
    step1Title: isPT ? "AVALIAÇÃO INTEGRAL" : "AVALIAÇÃO INTEGRAL",
    step1Subtitle: isPT ? "Coleta Segura & COPSOQ-II" : "Escuta Ativa & Worker Voice",
    step1Desc: isPT
      ? "Instrumentos psicossociais validados (COPSOQ-II curto e médio) distribuídos via links seguros com tokens descartáveis 100% anonimizados."
      : "Diagnóstico ocupacional contínuo conforme NR-1.5.3.3. Questionários dinâmicos com preservação de sigilo e adesão espontânea.",
    step1Item1: isPT ? "Silo de dados isolado e anónimo" : "Garantia de sigilo absoluto ao trabalhador",
    step1Item2: isPT ? "Mapeamento COPSOQ-II validado" : "Adesão às diretrizes do GRO/PGR",

    // Step 2
    step2Title: "INTELIGÊNCIA PREVENTIVA",
    step2Subtitle: isPT ? "Matriz de Risco & Alertas" : "Matriz de Severidade & Tendências",
    step2Desc: isPT
      ? "Composição multidimensional de scores por departamento e estabelecimento. Mapas de calor que identificam áreas prioritárias sem expor indivíduos."
      : "Cruzamento inteligente de probabilidade e severidade. Detecção precoce de setores sob sobrecarga para tomada de decisão fundamentada.",
    step2Item1: isPT ? "Matriz de probabilidade e severidade" : "Priorização automática de setores críticos",
    step2Item2: isPT ? "Limiar de anonimato N ≥ 5 ativo" : "Trava matemática anti-reidentificação",

    // Step 3
    step3Title: "AÇÃO & CONFORMIDADE",
    step3Subtitle: isPT ? "Medidas Preventivas & ACT" : "Plano de Ação do PGR & MTE",
    step3Desc: isPT
      ? "Gestão do ciclo de prevenção (Art. 15º Lei 102/2009). Atribuição de responsáveis, prazos, evidências e exportação de relatórios para a ACT."
      : "Controle e acompanhamento de medidas preventivas do PGR (NR-1.5.5). Rastreabilidade de ações, evidências anexadas e histórico auditável.",
    step3Item1: isPT ? "Relatório Oficial ACT em PDF" : "Inventário de Riscos & Ações do PGR",
    step3Item2: isPT ? "Registo contínuo de evidências" : "Documentação pronta para fiscalização",

    // Partner Box
    partnerTitle: isPT ? "Technology Partner para Empresas de SST" : "Parceiro Tecnológico para Clínicas e Consultorias de SST",
    partnerQuote: isPT
      ? "«A sua empresa mantém a responsabilidade técnica médica/ergonómica. O AegisHub fornece a infraestrutura de inteligência.»"
      : "«Sua consultoria lidera a estratégia ocupacional. O AegisHub entrega a tecnologia e automação de ponta a ponta.»"
  };

  return (
    <div className="bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black font-sans min-h-screen relative overflow-hidden">
      
      {/* 🌐 Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/85 backdrop-blur-2xl border-b border-white/10">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              AEGIS <span className="font-light not-italic text-emerald-400">HUB AI</span>
            </span>
          </div>

          {/* 🇵🇹 / 🇧🇷 Country Toggle Switch */}
          <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setCountry("PT")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                isPT 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-[1.02]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇵🇹</span>
              <span className="hidden sm:inline">Portugal</span>
            </button>
            <button
              onClick={() => setCountry("BR")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                !isPT 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-[1.02]" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇧🇷</span>
              <span className="hidden sm:inline">Brasil</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-8 font-bold text-slate-400 text-xs uppercase tracking-widest">
            <a className="hover:text-emerald-400 transition-colors" href="#workflow">Workflow</a>
            <a className="hover:text-emerald-400 transition-colors" href="#cognitive-ai">Apoio Cognitivo</a>
            <a className="hover:text-emerald-400 transition-colors" href="#voice">Ergonomia Vocal</a>
            <a className="hover:text-emerald-400 transition-colors" href="#partners">Parceiros SST</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/rh?country=${country}`}>
              <button className="hidden sm:inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                Ver Dashboard
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95">
                Entrar
              </button>
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="pt-24">
        
        {/* 🚀 1. HERO SECTION (High Impact + Live Futuristic HUD) */}
        <section className="relative px-6 md:px-12 py-16 md:py-28 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{copy.heroBadge}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
                {copy.heroTitlePrefix}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">
                  {copy.heroTitleHighlight}
                </span>
                {copy.heroTitleSuffix}
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
                {copy.heroSubtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => setDemoRequested(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all active:scale-95 cursor-pointer"
                >
                  {copy.ctaPrimary}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a 
                  href="#partners"
                  className="bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {copy.ctaSecondary}
                </a>
              </div>

              {/* Trust & Legal Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{copy.badge1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{copy.badge2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{copy.badge3}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Live Enterprise HUD Dashboard Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[36px] bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-emerald-500/25 p-7 backdrop-blur-2xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] space-y-6">
                
                {/* HUD Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{isPT ? "🇵🇹" : "🇧🇷"}</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                      {isPT ? "AegisHub Core // Portugal" : "AegisHub Core // Brasil"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Auditoria Ativa
                  </span>
                </div>

                {/* Score Widget */}
                <div className="bg-black/50 rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span>Índice Composto de Risco</span>
                    <span className="text-emerald-400 font-black">Controlado (28/100)</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[28%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Faixa Baixo Risco (0–33)</span>
                    <span>Setor: Tecnologia & Operações</span>
                  </div>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isPT ? "Taxa Participação" : "Adesão Worker Voice"}
                    </div>
                    <div className="text-2xl font-black text-white">92.4%</div>
                    <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Limiar N ≥ 5 ativo
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isPT ? "Medidas Preventivas" : "Plano de Ação PGR"}
                    </div>
                    <div className="text-2xl font-black text-emerald-400">14 Ativas</div>
                    <div className="text-[10px] text-slate-400">Com prazo e evidência</div>
                  </div>
                </div>

                {/* PDF Output Banner */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">
                        {isPT ? "Relatório Oficial ACT (Lei 102/2009)" : "Inventário & Plano PGR (NR-1)"}
                      </div>
                      <div className="text-[10px] text-slate-400">Exportação instantânea auditável em PDF</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </div>

                {/* EU AI Act Footer */}
                <div className="text-center pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Supervisão Humana Obrigatória (EU AI Act Art. 14º)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 📊 2. THE 3-STEP VALUE PIPELINE (Workflow Conectado com Previews Reais) */}
        <section id="workflow" className="py-24 px-6 md:px-12 bg-slate-900/60 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">
                Arquitetura Integrada
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Uma Plataforma Integrada de Saúde e Inteligência Preventiva
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-normal">
                {isPT
                  ? "Da recolha confidencial com os trabalhadores à emissão de relatórios oficiais para auditorias da ACT e RGPD."
                  : "Da escuta ativa no fluxo de trabalho ao controle rigoroso de medidas preventivas para o PGR e CIPA+A."}
              </p>
            </div>

            {/* 3 Pipeline Cards */}
            <div className="grid lg:grid-cols-3 gap-8 relative items-stretch">
              
              {/* Card 1: AVALIAÇÃO INTEGRAL */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-4 pb-5 border-b border-white/10 mb-5">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Etapa 01</span>
                      <h3 className="text-lg font-black text-white uppercase tracking-wide">{copy.step1Title}</h3>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-2">{copy.step1Subtitle}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5">
                    {copy.step1Desc}
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{copy.step1Item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{copy.step1Item2}</span>
                    </li>
                  </ul>
                </div>

                {/* Visual Preview Box */}
                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-2.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>Coleta com Tokens Descartáveis</span>
                    <span className="text-emerald-400">100% Anônimo</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-slate-400">COPSOQ-II</div>
                      <div className="text-emerald-400 font-bold">Ativo</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-slate-400">Tempo Médio</div>
                      <div className="text-white font-bold">4 min</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-slate-400">Privacidade</div>
                      <div className="text-cyan-400 font-bold">N ≥ 5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: INTELIGÊNCIA PREVENTIVA */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-4 pb-5 border-b border-white/10 mb-5">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Etapa 02</span>
                      <h3 className="text-lg font-black text-white uppercase tracking-wide">{copy.step2Title}</h3>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-2">{copy.step2Subtitle}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5">
                    {copy.step2Desc}
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{copy.step2Item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{copy.step2Item2}</span>
                    </li>
                  </ul>
                </div>

                {/* Visual Preview Box: Heatmap */}
                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>Mapa de Calor por Setor</span>
                    <span className="text-cyan-400">IA M2.7</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Operações & Logística</span>
                      <span className="text-rose-400 font-bold">Risco Moderado (62)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-[62%]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                      <span>Tecnologia & Produto</span>
                      <span className="text-emerald-400 font-bold">Controlado (24)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[24%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: AÇÃO & CONFORMIDADE */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-4 pb-5 border-b border-white/10 mb-5">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Etapa 03</span>
                      <h3 className="text-lg font-black text-white uppercase tracking-wide">{copy.step3Title}</h3>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-2">{copy.step3Subtitle}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5">
                    {copy.step3Desc}
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{copy.step3Item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{copy.step3Item2}</span>
                    </li>
                  </ul>
                </div>

                {/* Visual Preview Box: Action Center */}
                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>Action Center V2</span>
                    <span className="text-emerald-400">Rastreável</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-300 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>Ação #07: Reestruturação de Pausas</span>
                      <span className="text-emerald-400">Concluída</span>
                    </div>
                    <div className="text-slate-400 text-[9px]">Evidência documental anexada • Resp: Dra. Sofia M.</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ⚡ 3. WORKPLACE COGNITIVE AI SHOWCASE (Unstuck Chat + Gemini 3 Flash + Focus Timer) */}
        <section id="cognitive-ai" className="py-24 px-6 md:px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">
                Apoio Operacional ao Trabalhador
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Assistente de Desbloqueio Cognitivo & Foco
              </h2>
              <p className="text-slate-400 text-sm md:text-base">
                O trabalhador nunca fica sozinho na sobrecarga. Nossa IA alimentada pelo Google Gemini 3 Flash e RAG desmembra paralisias em micro-ações físicas de menos de 2 minutos.
              </p>
            </div>

            {/* Interactive Demo Showcase */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/25 rounded-[36px] p-8 md:p-12 shadow-2xl backdrop-blur-2xl grid lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Side: The 4 Step Cognitive Flow */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Algoritmo de Desbloqueio FSM (7 Estados)
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white">
                    Como funciona a saída da paralisia:
                  </h3>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => setActiveUnstuckStep(1)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeUnstuckStep === 1 
                        ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg" 
                        : "bg-black/30 border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 font-bold text-xs">
                      <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                      <span>Identificação do Bloqueio (Sobrecarga / Indecisão)</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveUnstuckStep(2)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeUnstuckStep === 2 
                        ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg" 
                        : "bg-black/30 border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 font-bold text-xs">
                      <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                      <span>RAG Curado: Aplicação da «Regra dos 2 Minutos»</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveUnstuckStep(3)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeUnstuckStep === 3 
                        ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg" 
                        : "bg-black/30 border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 font-bold text-xs">
                      <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                      <span>Next Action Singular & Micro-Janela de Foco (300s)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Privacidade Absoluta:</strong> As conversas do assistente cognitivo operam no modo <em>session-only</em>. Nem o RH nem a chefia têm acesso ao conteúdo individual.
                  </p>
                </div>
              </div>

              {/* Right Side: Mockup of the Unstuck Chat with Focus Timer */}
              <div className="lg:col-span-6 bg-black/60 border border-white/15 rounded-3xl p-6 space-y-4 shadow-inner">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Unstuck Assistant</div>
                      <div className="text-[9px] text-emerald-400 font-mono">Gemini 3 Flash • Conectado</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                    FSM: MICRO_ACTION
                  </span>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-slate-300 max-w-[88%]">
                    «Estou travado com uma apresentação de 5 slides que preciso entregar amanhã. Muitos tópicos soltos e não sei como começar.»
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-3.5 text-cyan-100 ml-auto max-w-[92%] space-y-2">
                    <p className="leading-relaxed">
                      Entendo. Quando temos muitos tópicos soltos, o cérebro trava tentando organizar tudo de uma vez. Vamos baixar a pressão: esqueça a estrutura final por agora.
                    </p>
                    <div className="p-3 bg-black/40 rounded-xl border border-cyan-500/20 text-[11px] font-bold text-white">
                      🎯 <span className="text-cyan-300">Próxima Ação Imediata:</span> Abra o software de apresentação e digite apenas o título provisório no primeiro slide.
                    </div>
                  </div>
                </div>

                {/* Built-in Focus Timer Widget */}
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Micro-Janela Sugerida</div>
                      <div className="text-xl font-black text-white font-mono">
                        {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {timerRunning ? "Pausar" : "Iniciar Foco"}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* 🎙️ 4. VOICE ERGONOMICS SECTION (P5.3 DSP Real sem Invasão) */}
        <section id="voice" className="py-20 px-6 md:px-12 bg-slate-900/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <Mic className="w-3.5 h-3.5" />
                <span>P5.3 Ergonomia Vocal Objetiva</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Análise Acústica e Sobrecarga Vocal no Trabalho
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Desenvolvido para operadores de call center, professores e profissionais de atendimento. Medição de parâmetros físicos da voz para prevenção de fadiga vocal (NR-17), sem inferência de emoções ou invasão de privacidade.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <div className="font-bold text-white">Frequência Fundamental (F0)</div>
                  <div className="text-[10px] text-slate-400">Autocorrelação temporal real</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                  <div className="font-bold text-white">Jitter & Shimmer (PPQ/APQ)</div>
                  <div className="text-[10px] text-slate-400">Instabilidade e micro-perturbações</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                * Em estrita conformidade com o Art. 5º do EU AI Act: Zero inferência de estado emocional, humor ou diagnóstico médico.
              </div>
            </div>

            <div className="lg:col-span-6 bg-black/60 border border-white/10 rounded-3xl p-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Engine DSP Acústica</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Status: ANALYZED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-slate-400">F0 Média</div>
                  <div className="text-lg font-black text-white font-mono">142 Hz</div>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Jitter Local</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">0.82%</div>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-slate-400">Shimmer Local</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">2.15%</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
                Os ficheiros de áudio ficam armazenados em bucket privado e são acessíveis exclusivamente pelo próprio trabalhador. O RH recebe apenas indicadores ergonómicos agregados.
              </div>
            </div>

          </div>
        </section>

        {/* 🤝 5. TECHNOLOGY PARTNER FOR SST */}
        <section id="partners" className="py-24 px-6 md:px-12 relative overflow-hidden">
          <div className="max-w-6xl mx-auto bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 rounded-[44px] p-10 md:p-16 backdrop-blur-3xl shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  <span>Modelo de Parceria Tecnológica</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {copy.partnerTitle}
                </h2>
                
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                  {copy.partnerQuote}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Empodere seus técnicos e médicos do trabalho com coletas digitais e relatórios instantâneos.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Monetize novos contratos de gestão contínua de risco psicossocial para sua carteira de clientes.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Conformidade e geração de evidências para auditorias {isPT ? "da ACT e RGPD" : "do MTE e LGPD"}.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setPartnerModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
                  >
                    Solicitar Partner Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-black/50 border border-white/10 rounded-3xl p-8 space-y-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4">
                  Público-Alvo Comercial
                </h4>
                <ul className="space-y-4 text-xs font-medium text-slate-300">
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Empresas Prestadoras de Serviços de SST</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Clínicas de Medicina e Segurança Ocupacional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Consultorias de Ergonomia e Psicologia do Trabalho</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Grandes Organizações com SESMT / Serviços Internos</span>
                  </li>
                </ul>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                  O software atua como ferramenta de suporte e documentação de evidências, respeitando integralmente a autonomia dos especialistas credenciados.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 🔒 6. DISCLAIMER REGULATÓRIO */}
        <section className="py-12 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mx-auto font-medium">
            <strong>Aviso Legal de Conformidade:</strong> O AegisHub AI é uma plataforma de inteligência de dados ocupacionais e apoio à decisão de gestão de SST. A plataforma não realiza diagnóstico clínico médico/psicológico individual e não substitui a atuação de médicos do trabalho, psicólogos, engenheiros ou técnicos credenciados de Segurança e Saúde no Trabalho.
          </p>
        </section>

      </main>

      {/* 🧭 FOOTER */}
      <footer className="py-16 bg-black border-t border-white/10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-6 space-y-4">
            <div className="text-xl font-black text-white tracking-tighter flex items-center gap-2 italic">
              <Shield className="w-6 h-6 text-emerald-400 not-italic" />
              AEGIS <span className="text-emerald-400 font-light not-italic">HUB AI</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              AI-Powered Workplace Cognitive Intelligence Platform. Desenvolvido para operações de SST em Portugal e no Brasil.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-wrap md:justify-end gap-8 font-bold text-xs uppercase tracking-widest text-slate-400">
            <a href="/privacidade" className="hover:text-emerald-400 transition-colors">Privacidade ({isPT ? "RGPD" : "LGPD"})</a>
            <a href="/ai-act" className="hover:text-emerald-400 transition-colors">Governança de IA</a>
            <a href="/suporte" className="hover:text-emerald-400 transition-colors">Suporte Técnico</a>
          </div>

        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between text-[11px] text-slate-600 font-mono">
          <span>© 2026 AegisHub AI. Todos os direitos reservados.</span>
          <span>Sistemas de Gestão e Inteligência Ocupacional PT/BR</span>
        </div>
      </footer>

      {/* 📩 MODAL DE SOLICITAÇÃO DE DEMONSTRAÇÃO / PARCERIA */}
      {(demoRequested || partnerModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => { setDemoRequested(false); setPartnerModalOpen(false); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {partnerModalOpen ? "Programa de Parceiros SST" : "Solicitar Demonstração"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conheça a plataforma na prática com dados da sua jurisdição ({country === "PT" ? "Portugal" : "Brasil"}).
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert("Solicitação recebida com sucesso! Nossa equipe técnica entrará em contato em breve.");
              setDemoRequested(false);
              setPartnerModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input required type="text" placeholder="Dr. João Silva / Eng. Roberto" className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail Corporativo</label>
                <input required type="email" placeholder="contato@empresa-sst.com" className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Organização</label>
                <select className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400">
                  <option>Empresa / Consultoria de SST</option>
                  <option>Clínica de Medicina Ocupacional</option>
                  <option>Empresa Privada (RH / SESMT)</option>
                  <option>Profissional Autônomo de SST</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all mt-4 cursor-pointer"
              >
                Confirmar Solicitação
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
