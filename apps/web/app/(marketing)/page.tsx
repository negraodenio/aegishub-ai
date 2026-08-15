"use client";

import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import Link from 'next/link';

type CountryTab = "PT" | "BR";

export default function MarketingPage() {
  const [country, setCountry] = useState<CountryTab>("PT");
  const [demoRequested, setDemoRequested] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const isPT = country === "PT";

  return (
    <div className="bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black font-sans min-h-screen relative overflow-hidden">
      
      {/* 🌐 Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              AEGIS <span className="font-light not-italic text-emerald-400">HUB AI</span>
            </span>
          </div>

          {/* 🇵🇹 / 🇧🇷 Country Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setCountry("PT")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isPT 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇵🇹</span>
              <span className="hidden sm:inline">Portugal</span>
            </button>
            <button
              onClick={() => setCountry("BR")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isPT 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇧🇷</span>
              <span className="hidden sm:inline">Brasil</span>
            </button>
          </div>

          <div className="hidden lg:flex gap-8 font-semibold text-slate-400 text-xs uppercase tracking-widest">
            <a className="hover:text-emerald-400 transition-colors" href="#pilares">Os 6 Pilares</a>
            <a className="hover:text-emerald-400 transition-colors" href="#partners">Parceiros SST</a>
            <a className="hover:text-emerald-400 transition-colors" href="/assessment">Avaliação</a>
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
        
        {/* 🚀 HERO SECTION */}
        <section className="relative px-6 md:px-12 py-20 md:py-32 overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-8">
              
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Workplace Intelligence • {isPT ? "Portugal (SST)" : "Brasil (NR-1/GRO/PGR)"}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.0] tracking-tight">
                Inteligência para <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent italic">Riscos Psicossociais</span> no Trabalho.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                Avalie, previna, acompanhe e documente os riscos psicossociais com uma plataforma de Inteligência Artificial desenvolvida para organizações e empresas de SST.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => setDemoRequested(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all active:scale-95"
                >
                  Solicitar Demonstração
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#partners"
                  className="bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Seja um Parceiro SST
                </a>
              </div>

              {/* Legal Badge Indicators */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-400 text-xs font-semibold">
                {isPT ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Lei n.º 102/2009 (SST / ACT)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Lei n.º 93/2021 (Denúncias)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Lei n.º 83/2021 & RGPD</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>NR-1 (GRO e PGR)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Worker Voice (NR-1.5.3.3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>LGPD & Lei 14.457 CIPA+A</span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Visual Glassmorphic Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[36px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 p-8 backdrop-blur-2xl shadow-[0_32px_96px_rgba(0,0,0,0.8)] space-y-6">
                
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isPT ? "🇵🇹" : "🇧🇷"}</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
                      {isPT ? "Perfil Portugal // ACT" : "Perfil Brasil // NR-1"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auditoria Ativa
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Índice Composto de Risco</span>
                      <span className="text-emerald-400">Controlado (28/100)</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[28%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isPT ? "Taxa Participação" : "Adesão Worker Voice"}
                      </div>
                      <div className="text-2xl font-black text-white mt-1">92.4%</div>
                      <div className="text-[10px] text-slate-500 mt-1">Respostas anonimizadas</div>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isPT ? "Medidas Preventivas" : "Ações do PGR"}
                      </div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">14 Ativas</div>
                      <div className="text-[10px] text-slate-500 mt-1">Com prazo e evidência</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">
                          {isPT ? "Relatório Oficial ACT (Lei 102)" : "Inventário & Plano PGR (NR-1)"}
                        </div>
                        <div className="text-[10px] text-slate-400">Exportação instantânea em PDF</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Supervisão Humana Obrigatória (EU AI Act & Ética SST)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 🏢 SEÇÃO 01 A 06: OS 6 PILARES DA PLATAFORMA */}
        <section id="pilares" className="py-24 px-6 md:px-12 bg-slate-900/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto space-y-16">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">
                Arquitetura Comercial
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Os 6 Pilares da Gestão de Riscos Psicossociais
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Funcionalidades reais desenvolvidas para atender as demandas técnicas de empresas de SST, consultorias e departamentos de recursos humanos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Pilar 01 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    01
                  </div>
                  <Compass className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Assessment & Coleta Segura</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {isPT
                      ? "Instrumentos validados como COPSOQ-II (curto e estendido), questionários ocupacionais e links com tokens descartáveis 100% anonimizados."
                      : "Módulo Worker Voice e questionários ocupacionais de escuta ativa (NR-1.5.3.3) com tokens descartáveis e garantia total de sigilo."}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Silo isolado e anônimo
                </div>
              </div>

              {/* Pilar 02 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    02
                  </div>
                  <BarChart3 className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Psychosocial Risk Intelligence</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Composição multidimensional de scores por setor, departamento e processos. Mapas de calor que identificam áreas prioritárias sem expor dados individuais.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Matriz de probabilidade e severidade
                </div>
              </div>

              {/* Pilar 03 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    03
                  </div>
                  <Brain className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">AI Intelligence & Decision Support</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Detecção de tendências e síntese de recomendações para apoio a técnicos de SST. Rastreabilidade algorítmica total com trava de validação humana obrigatória.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Alinhado ao EU AI Act Art. 14º
                </div>
              </div>

              {/* Pilar 04 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    04
                  </div>
                  <Layers className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Action Management</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {isPT
                      ? "Gestão do ciclo de prevenção do Art. 15º da Lei 102/2009: medidas preventivas com atribuição de responsável, prazos e registo de evidências."
                      : "Plano de Ação do PGR (NR-1.5.5): controle de medidas preventivas, definição de responsáveis, cronograma, evidências e reavaliação de eficácia."}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Ciclo fechado com evidências
                </div>
              </div>

              {/* Pilar 05 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    05
                  </div>
                  <Activity className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Continuous Monitoring</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Acompanhamento contínuo de indicadores de risco organizacional de desconexão, alertas de sobrecarga e canal confidencial de integridade e denúncias 24/7.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> {isPT ? "Lei 93/2021 & Lei 83/2021" : "Canal de Ética CIPA+A"}
                </div>
              </div>

              {/* Pilar 06 */}
              <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-emerald-500/40 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                    06
                  </div>
                  <FileCheck className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Evidence & Compliance</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {isPT
                      ? "Geração imediata do Relatório de Avaliação de Riscos Psicossociais (ACT) e extrato do Anexo D para auditorias e fiscalizações oficiais."
                      : "Emissão automatizada do Inventário de Riscos Ocupacionais e Plano de Ação para incorporação imediata ao PGR da empresa."}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Documentação em PDF auditável
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 🤝 SEÇÃO TECHNOLOGY PARTNER FOR SST */}
        <section id="partners" className="py-28 px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 rounded-[44px] p-10 md:p-16 backdrop-blur-3xl shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  <span>Modelo de Parceria Tecnológica</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Technology Partner for SST
                </h2>
                
                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                  "Você mantém a responsabilidade técnica. O AegisHub fornece a tecnologia."
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
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all active:scale-95 flex items-center gap-3"
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
                    <span>Empresas Prestadoras de Serviços Externos de SST</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Clínicas de Medicina e Segurança Ocupacional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Consultorias de Ergonomia e Psicologia Organizacional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Grandes Organizações com SESMT / Serviços Internos</span>
                  </li>
                </ul>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                  O software atua como ferramenta de suporte e documentação de evidências, respeitando integralmente a autonomia dos especialistas.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 🔒 DISCLAIMER REGULATÓRIO */}
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
              AI-Powered Psychosocial Risk Intelligence Platform. Desenvolvido para operações de SST em Portugal e no Brasil.
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
              className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-sm"
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
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all mt-4"
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
