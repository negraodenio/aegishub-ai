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
  AlertTriangle,
  HardHat,
  Scale,
  User,
  TrendingUp,
  EyeOff,
  Database,
  Search
} from "lucide-react";
import Link from "next/link";

type CountryTab = "PT" | "BR";

export default function MarketingPage() {
  const [country, setCountry] = useState<CountryTab>("PT");
  const [demoRequested, setDemoRequested] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

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
    step1Title: "AVALIAÇÃO INTEGRAL",
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
    <div className="bg-[#0f172a] text-slate-100 selection:bg-[#1FC6A5] selection:text-black font-sans min-h-screen relative overflow-x-hidden">
      
      {/* Background Mesh Network Overlay */}
      <div className="absolute inset-0 opacity-20 z-0 pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="80" id="net-pattern" patternUnits="userSpaceOnUse" width="80">
              <path d="M80 0 L0 80 M0 0 L80 80" fill="none" opacity="0.4" stroke="#1FC6A5" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect fill="url(#net-pattern)" height="100%" width="100%" />
        </svg>
      </div>

      {/* Radial Atmospheric Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#1FC6A5]/15 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#14b8a6]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* 🌐 Top Navigation Bar */}
      <header className="w-full bg-[#111827]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1FC6A5] to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(31,198,165,0.4)]">
              <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <span className="text-white font-black text-xl tracking-wide uppercase italic">
              AEGIS <span className="font-light not-italic text-[#1FC6A5]">HUB AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex space-x-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a className="text-[#1FC6A5] hover:text-white transition-colors" href="#workflow">AVALIAÇÃO</a>
            <a className="hover:text-[#1FC6A5] transition-colors" href="#workflow">INTELIGÊNCIA</a>
            <a className="hover:text-[#1FC6A5] transition-colors" href="#workflow">PROTOCOLOS DE AÇÃO</a>
            <a className="hover:text-[#1FC6A5] transition-colors" href="#privacidade">COMPLIANCE</a>
          </nav>

          {/* Country Switcher + Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Country Selector */}
            <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setCountry("PT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isPT 
                    ? "bg-[#1FC6A5] text-black shadow-lg shadow-[#1FC6A5]/25 scale-[1.02]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🇵🇹</span>
                <span className="hidden sm:inline">PT</span>
              </button>
              <button
                onClick={() => setCountry("BR")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  !isPT 
                    ? "bg-[#1FC6A5] text-black shadow-lg shadow-[#1FC6A5]/25 scale-[1.02]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🇧🇷</span>
                <span className="hidden sm:inline">BR</span>
              </button>
            </div>

            <Link href={`/rh?country=${country}`}>
              <button className="hidden sm:inline-flex px-5 py-2 text-xs font-bold text-gray-300 border border-gray-600 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wider">
                VER DASHBOARD
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-6 py-2 text-xs font-black text-[#0f172a] bg-[#1FC6A5] rounded-full hover:bg-[#19b092] transition-all shadow-[0_0_20px_rgba(31,198,165,0.45)] uppercase tracking-wider active:scale-95">
                ENTRAR
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-12">
        
        {/* 🚀 1. HERO SECTION (Com Headline Poderosa e Mockup Integrado) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1FC6A5]/10 border border-[#1FC6A5]/20 text-[#1FC6A5] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>{copy.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight">
              Uma Plataforma Integrada de Saúde e Inteligência Preventiva
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {copy.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={() => setDemoRequested(true)}
                className="bg-[#1FC6A5] hover:bg-[#19b092] text-[#0f172a] px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(31,198,165,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                {copy.ctaPrimary}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#partners"
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                {copy.ctaSecondary}
              </a>
            </div>

            <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-semibold border-t border-white/10 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1FC6A5]" />
                <span>{copy.badge1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1FC6A5]" />
                <span>{copy.badge2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1FC6A5]" />
                <span>{copy.badge3}</span>
              </div>
            </div>

          </div>
        </section>

        {/* 📊 2. THE 3-STEP VALUE PIPELINE (Glass Cards + SVG Dashed Curved Connectors) */}
        <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full relative">
            
            {/* Arrow Connectors (Visible on Desktop) */}
            <div className="hidden lg:block absolute top-[10%] left-[30%] w-[8%] h-[50px] z-0 pointer-events-none">
              <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 100 50" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,25 C30,0 70,50 95,25" stroke="#1FC6A5" strokeDasharray="4 4" strokeWidth="2" />
                <path d="M88,15 L98,25 L88,35" fill="none" stroke="#1FC6A5" strokeWidth="2" />
              </svg>
            </div>
            <div className="hidden lg:block absolute top-[10%] left-[63%] w-[8%] h-[50px] z-0 pointer-events-none">
              <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 100 50" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,25 C30,0 70,50 95,25" stroke="#1FC6A5" strokeDasharray="4 4" strokeWidth="2" />
                <path d="M88,15 L98,25 L88,35" fill="none" stroke="#1FC6A5" strokeWidth="2" />
              </svg>
            </div>

            {/* Card 1: Avaliação Integral */}
            <article className="rounded-3xl p-7 flex flex-col h-full relative z-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-[#1FC6A5]/50 transition-all justify-between space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                  <div className="p-3 bg-[#1FC6A5]/10 rounded-2xl">
                    <Compass className="w-10 h-10 text-[#1FC6A5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#1FC6A5] font-black uppercase tracking-widest">Etapa 01</span>
                    <h2 className="text-2xl font-serif text-white uppercase leading-tight font-bold">AVALIAÇÃO<br/>INTEGRAL</h2>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-base text-white font-bold mb-2">{copy.step1Subtitle}</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    {copy.step1Desc}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#1FC6A5] shrink-0 mt-0.5" />
                      <span>{copy.step1Item1}</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#1FC6A5] shrink-0 mt-0.5" />
                      <span>{copy.step1Item2}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* UI Mockup Bottom Box */}
              <div className="mt-auto bg-black/60 rounded-2xl p-4 border border-white/10 space-y-2.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Coleta Segura COPSOQ-II</span>
                  <span className="text-[#1FC6A5] font-mono">100% Anônimo</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-slate-400">Tokens</div>
                    <div className="text-[#1FC6A5] font-bold">Ativos</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-slate-400">Tempo</div>
                    <div className="text-white font-bold">4 min</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-slate-400">Limiar</div>
                    <div className="text-cyan-400 font-bold">N ≥ 5</div>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2: Inteligência Preventiva */}
            <article className="rounded-3xl p-7 flex flex-col h-full relative z-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-cyan-400/50 transition-all justify-between space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl">
                    <Brain className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest">Etapa 02</span>
                    <h2 className="text-2xl font-serif text-white uppercase leading-tight font-bold">INTELIGÊNCIA<br/>PREVENTIVA</h2>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-base text-white font-bold mb-2">{copy.step2Subtitle}</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    {copy.step2Desc}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{copy.step2Item1}</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{copy.step2Item2}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* UI Mockup Bottom Box (Heatmap / Severity) */}
              <div className="mt-auto bg-black/60 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Matriz de Risco Setorial</span>
                  <span className="text-cyan-400 font-mono">IA M2.7</span>
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
                    <span className="text-[#1FC6A5] font-bold">Controlado (24)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1FC6A5] w-[24%]" />
                  </div>
                </div>
              </div>
            </article>

            {/* Card 3: Ação & Conformidade */}
            <article className="rounded-3xl p-7 flex flex-col h-full relative z-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-[#1FC6A5]/50 transition-all justify-between space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                  <div className="p-3 bg-[#1FC6A5]/10 rounded-2xl">
                    <ShieldCheck className="w-10 h-10 text-[#1FC6A5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#1FC6A5] font-black uppercase tracking-widest">Etapa 03</span>
                    <h2 className="text-2xl font-serif text-white uppercase leading-tight font-bold">AÇÃO &amp;<br/>CONFORMIDADE</h2>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-base text-white font-bold mb-2">{copy.step3Subtitle}</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    {copy.step3Desc}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#1FC6A5] shrink-0 mt-0.5" />
                      <span>{copy.step3Item1}</span>
                    </li>
                    <li className="flex items-start gap-3 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#1FC6A5] shrink-0 mt-0.5" />
                      <span>{copy.step3Item2}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* UI Mockup Bottom Box (Action Center V2) */}
              <div className="mt-auto bg-black/60 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Action Center V2</span>
                  <span className="text-[#1FC6A5] font-mono">Auditável</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Ação #07: Reestruturação de Pausas</span>
                    <span className="text-[#1FC6A5]">Concluída</span>
                  </div>
                  <div className="text-slate-400 text-[9px]">Evidência anexada • Resp: Dra. Sofia M.</div>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* 🏢 3. OS 4 PILARES DO AEGISHUB AI */}
        <section id="pilares" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Os 4 Pilares do AegisHub AI
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Plataforma Enterprise para inteligência preventiva no ambiente de trabalho.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1: ASSESS */}
            <div className="bg-slate-900/80 border border-[#1FC6A5]/30 rounded-3xl p-6 space-y-5 hover:border-[#1FC6A5] transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1FC6A5]/10 rounded-xl text-[#1FC6A5]">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm text-[#1FC6A5] tracking-wider">ASSESS</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  Avaliar — Sinais Organizacionais
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPT 
                    ? "Questionários psicossociais validados (COPSOQ-II) com tokens anônimos descartáveis."
                    : "Escuta ativa e Worker Voice (NR-1.5.3.3) sem identificação do colaborador."}
                </p>
              </div>

              <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 space-y-2 text-[10px]">
                <div className="text-slate-400 font-bold">Progresso da Avaliação</div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1FC6A5] w-[75%]" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Sigilo Garantido</span>
                  <span>75% Concluído</span>
                </div>
              </div>
            </div>

            {/* Pilar 2: PREVENT */}
            <div className="bg-slate-900/80 border border-[#1FC6A5]/30 rounded-3xl p-6 space-y-5 hover:border-[#1FC6A5] transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1FC6A5]/10 rounded-xl text-[#1FC6A5]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm text-[#1FC6A5] tracking-wider">PREVENT</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  Prevenir — Gestão de Riscos
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matriz dinâmica de severidade e mapas de calor para tomada de decisão antecipada.
                </p>
              </div>

              <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 space-y-2 text-[10px]">
                <div className="text-slate-300 font-bold">Matriz de Risco Setorial</div>
                <div className="grid grid-cols-3 gap-1 text-[8px] text-center font-bold">
                  <div className="bg-yellow-500/20 text-yellow-400 p-1 rounded">Vendas</div>
                  <div className="bg-rose-500/20 text-rose-400 p-1 rounded">TI</div>
                  <div className="bg-rose-500/20 text-rose-400 p-1 rounded">RH</div>
                </div>
              </div>
            </div>

            {/* Pilar 3: SUPPORT */}
            <div className="bg-slate-900/80 border border-cyan-500/40 rounded-3xl p-6 space-y-5 hover:border-cyan-400 transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm text-cyan-400 tracking-wider">SUPPORT</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  Apoiar — Unstuck AI & Foco
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Desbloqueio de tarefas complexas via Gemini 3 Flash e micro-janelas de foco de 5 min.
                </p>
              </div>

              <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 space-y-2 text-[10px]">
                <div className="text-cyan-300 font-bold flex items-center justify-between">
                  <span>Unstuck Assistant</span>
                  <span className="text-[8px] bg-cyan-500/20 px-1.5 py-0.5 rounded">Ativo</span>
                </div>
                <p className="text-[9px] text-slate-400">"Vamos usar a regra dos 2 minutos e iniciar foco."</p>
              </div>
            </div>

            {/* Pilar 4: INSIGHT */}
            <div className="bg-slate-900/80 border border-[#1FC6A5]/30 rounded-3xl p-6 space-y-5 hover:border-[#1FC6A5] transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1FC6A5]/10 rounded-xl text-[#1FC6A5]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm text-[#1FC6A5] tracking-wider">INSIGHT</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  Transformar — Inteligência de Dados
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPT
                    ? "Geração de evidências documentais auditáveis para a ACT e plano de melhoria contínua."
                    : "Geração de relatórios para o PGR e conformidade documental com o MTE."}
                </p>
              </div>

              <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 space-y-2 text-[10px]">
                <div className="text-[#1FC6A5] font-bold flex justify-between">
                  <span>Relatório Trimestral</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <p className="text-[9px] text-slate-400">Evidências e recomendações consolidadas</p>
              </div>
            </div>

          </div>
        </section>

        {/* 👥 4. PARA QUEM É O AEGISHUB (5 Persona Cards) */}
        <section id="personas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Para quem é o AegisHub
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Uma solução pensada para atender todas as lideranças corporativas e o colaborador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            
            {/* Persona 1: RH */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 space-y-5 text-center flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">RH</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">(Entenda os riscos)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitoramento preventivo do clima, retenção de talentos e decisões baseadas em dados agregados.
                </p>
              </div>
              <button 
                onClick={() => setDemoRequested(true)}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ver mais para RH
              </button>
            </div>

            {/* Persona 2: SST */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 space-y-5 text-center flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">SST</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">(Evidências & Ação)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPT 
                    ? "Relatórios técnicos de riscos psicossociais para a Lei 102/2009 e fiscalizações da ACT."
                    : "Alimentação do PGR, gestão de ergonomia (NR-17) e acompanhamento de medidas preventivas."}
                </p>
              </div>
              <button 
                onClick={() => setPartnerModalOpen(true)}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Explorar para SST
              </button>
            </div>

            {/* Persona 3: JURÍDICO / DPO */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 space-y-5 text-center flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">JURÍDICO / DPO</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">(LGPD / RGPD / AI Act)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conformidade com travas matemáticas de anonimato (N ≥ 5), RLS e registros criptográficos auditáveis.
                </p>
              </div>
              <Link href="/ai-act" className="w-full">
                <button className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  Acessar Governança
                </button>
              </Link>
            </div>

            {/* Persona 4: COLABORADOR */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 space-y-5 text-center flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">COLABORADOR</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">(Apoio Real)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ferramentas de foco, desbloqueio de tarefas e micro-janelas de produtividade com sigilo total.
                </p>
              </div>
              <Link href="/employee/cognitive" className="w-full">
                <button className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  Recursos Colaborador
                </button>
              </Link>
            </div>

            {/* Persona 5: DIREÇÃO */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 space-y-5 text-center flex flex-col justify-between hover:border-cyan-400 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">DIREÇÃO / C-LEVEL</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">(Decisão & ROI)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visão executiva e estratégica para alocação de investimentos e redução de passivos trabalhistas.
                </p>
              </div>
              <button 
                onClick={() => setDemoRequested(true)}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ver Painel Executivo
              </button>
            </div>

          </div>
        </section>

        {/* 🔒 5. PRIVACY BY DESIGN BANNER */}
        <section id="privacidade" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/10">
          <div className="bg-slate-900/80 border border-[#1FC6A5]/30 rounded-[40px] p-8 md:p-14 shadow-2xl backdrop-blur-xl">
            
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FC6A5]/10 text-[#1FC6A5] text-xs font-mono font-bold">
                  Privacy by Design
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  A IA ajuda o colaborador. <br />
                  <span className="text-[#1FC6A5]">Não vigia o colaborador.</span>
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  O AegisHub foi arquitetado do zero para garantir que nenhuma conversa individual ou gravação de voz seja acessível pelo empregador.
                </p>

                {/* Visual Data Flow */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 text-center text-xs">
                  <div className="space-y-1">
                    <User className="w-6 h-6 mx-auto text-cyan-400" />
                    <div className="text-[10px] text-slate-300 font-bold">Colaborador</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                  <div className="space-y-1 p-2 bg-[#1FC6A5]/10 rounded-xl border border-[#1FC6A5]/20">
                    <Lock className="w-6 h-6 mx-auto text-[#1FC6A5]" />
                    <div className="text-[9px] text-[#1FC6A5] font-bold">Protected Data</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                  <div className="space-y-1">
                    <BarChart3 className="w-6 h-6 mx-auto text-cyan-400" />
                    <div className="text-[10px] text-slate-300 font-bold">Aggregated (N ≥ 5)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                  <div className="space-y-1">
                    <Users className="w-6 h-6 mx-auto text-[#1FC6A5]" />
                    <div className="text-[10px] text-slate-300 font-bold">RH / SST</div>
                  </div>
                </div>
              </div>

              {/* Right Col: DPO Checklist */}
              <div className="lg:col-span-5 bg-black/50 border border-white/10 rounded-3xl p-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FC6A5] text-black font-black text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DPO & CISO Ready</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                    <span>Privacy by Design & Defesa Anti-IDOR</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                    <span>Row Level Security (RLS) & Storage Privado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileCheck className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                    <span>Audit Trail com HMAC Criptográfico</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                    <span>Limiar Estatístico Obrigatório (N ≥ 5)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <EyeOff className="w-4 h-4 text-[#1FC6A5] shrink-0" />
                    <span>No Individual Surveillance (EU AI Act Art. 5º)</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* 🤝 6. TECHNOLOGY PARTNER FOR SST */}
        <section id="partners" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/10">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 rounded-[44px] p-8 md:p-14 shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FC6A5]/10 border border-[#1FC6A5]/20 text-[#1FC6A5] text-xs font-black uppercase tracking-widest">
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
                    <CheckCircle2 className="w-5 h-5 text-[#1FC6A5] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Empodere seus técnicos e médicos do trabalho com coletas digitais e relatórios instantâneos.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1FC6A5] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Monetize novos contratos de gestão contínua de risco psicossocial para sua carteira de clientes.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1FC6A5] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">Conformidade e geração de evidências para auditorias {isPT ? "da ACT e RGPD" : "do MTE e LGPD"}.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setPartnerModalOpen(true)}
                    className="bg-[#1FC6A5] hover:bg-[#19b092] text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(31,198,165,0.4)] transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
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
                    <div className="h-2 w-2 rounded-full bg-[#1FC6A5]" />
                    <span>Empresas Prestadoras de Serviços de SST</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#1FC6A5]" />
                    <span>Clínicas de Medicina e Segurança Ocupacional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#1FC6A5]" />
                    <span>Consultorias de Ergonomia e Psicologia do Trabalho</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#1FC6A5]" />
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

        {/* 🔒 7. DISCLAIMER REGULATÓRIO */}
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
              <Shield className="w-6 h-6 text-[#1FC6A5] not-italic" />
              AEGIS <span className="text-[#1FC6A5] font-light not-italic">HUB AI</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              AI-Powered Workplace Cognitive Intelligence Platform. Desenvolvido para operações de SST em Portugal e no Brasil.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-wrap md:justify-end gap-8 font-bold text-xs uppercase tracking-widest text-slate-400">
            <a href="/privacidade" className="hover:text-[#1FC6A5] transition-colors">Privacidade ({isPT ? "RGPD" : "LGPD"})</a>
            <a href="/ai-act" className="hover:text-[#1FC6A5] transition-colors">Governança de IA</a>
            <a href="/suporte" className="hover:text-[#1FC6A5] transition-colors">Suporte Técnico</a>
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
              <div className="h-10 w-10 rounded-xl bg-[#1FC6A5]/10 flex items-center justify-center text-[#1FC6A5] mb-2">
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
                <input required type="text" placeholder="Dr. João Silva / Eng. Roberto" className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1FC6A5]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail Corporativo</label>
                <input required type="email" placeholder="contato@empresa-sst.com" className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1FC6A5]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Organização</label>
                <select className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#1FC6A5]">
                  <option>Empresa / Consultoria de SST</option>
                  <option>Clínica de Medicina Ocupacional</option>
                  <option>Empresa Privada (RH / SESMT)</option>
                  <option>Profissional Autônomo de SST</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1FC6A5] hover:bg-[#19b092] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all mt-4 cursor-pointer"
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
