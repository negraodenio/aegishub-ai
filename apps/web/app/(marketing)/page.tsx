import React from 'react';
import { Shield, Lock, Gavel, BarChart3, Users, Zap, FileCheck, CheckCircle2, AlertTriangle, ArrowRight, HeartPulse, Activity, UserCheck, MessageSquare, TrendingUp, Brain } from 'lucide-react';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 font-sans min-h-screen">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-7xl mx-auto">
          <div className="text-2xl font-black text-emerald-950 tracking-tighter flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            AEGIS HUB
          </div>
          <div className="hidden md:flex gap-10 font-bold text-slate-500 text-sm">
            <a className="hover:text-emerald-600 transition-colors" href="/admin">A Plataforma</a>
            <a className="hover:text-emerald-600 transition-colors" href="/admin/compliance">Painel de Auditoria SST</a>
            <a className="hover:text-emerald-600 transition-colors" href="/assessment">Monitorização</a>
          </div>
          <Link href="/auth/login">
            <button className="bg-emerald-950 text-white px-8 py-3 rounded-2xl font-black text-sm hover:shadow-2xl transition-all active:scale-95">
              Proteger Equipa
            </button>
          </Link>
        </div>
      </nav>
      
      <main className="pt-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 md:px-12 py-24 md:py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black tracking-widest uppercase border border-emerald-100">
                  <Activity className="w-4 h-4" />
                  Next-Generation HealthTech
                </span>
                <h1 className="text-6xl md:text-[84px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                  Inteligência a favor da <span className="text-emerald-600 italic">Vida</span> no Trabalho.
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-xl font-medium leading-relaxed">
                  O AEGIS HUB é uma plataforma de apoio à gestão de risco psicossocial que ajuda organizações a estruturar processos compatíveis com a Lei 102/2009, a Lei 93/2021 e a Lei 83/2021.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <button className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-emerald-200 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                  Solicitar Demonstração Clínica
                  <ArrowRight className="w-6 h-6" />
                </button>
                <button className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] font-black text-xl hover:border-emerald-600 transition-all active:scale-95">
                  Ver Documentação Legal
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-6">
                 <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    EU AI Act & RGPD Aligned
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Lei 102/2009 & 83/2021
                 </div>
              </div>
            </div>

            <div className="relative group">
               <div className="bg-slate-100 rounded-[4rem] aspect-square overflow-hidden relative shadow-2xl border-8 border-white group-hover:scale-[1.02] transition-transform duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" 
                    alt="Modern professional office team"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl space-y-4 border border-white/50 animate-bounce duration-[3000ms]">
                     <div className="text-emerald-600 font-black text-2xl tracking-tighter">Retenção de Talentos</div>
                     <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <TrendingUp className="w-5 h-5" />
                        +34% ROI
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -left-10 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl space-y-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        <span className="font-black tracking-tighter text-lg italic">Motor M2.7</span>
                     </div>
                     <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 ml-4 rounded uppercase">Preditivo</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                     A nossa <strong>Inteligência Artificial proprietária</strong>. Triagem de exaustão via IA com mecanismo obrigatório de supervisão humana (alinhado com o EU AI Act).
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* STANDARD DE OURO CLÍNICO */}
        <section className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
              <h2 className="text-5xl font-black tracking-tighter">Standard de Ouro Clínico.</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                A nossa IA não substitui a ciência. Ela escala-a através dos protocolos mais rigorosos da medicina ocupacional moderna.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { law: 'GAD-7', title: 'Ansiedade Generalizada', desc: 'Protocolo de 7 itens para rastreio e monitorização da severidade da ansiedade, validado para contextos corporativos.' },
                { law: 'PHQ-9', title: 'Depressão & Vitalidade', desc: 'Instrumento fundamental para deteção precoce de episódios depressivos e gestão de energia produtiva.' },
                { law: 'COPSOQ II', title: 'Riscos Psicossociais', desc: 'Standard dinamarquês para avaliação exaustiva do ambiente psicossocial (Lei 102/2009).' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-emerald-200 transition-all group scale-100 hover:scale-105 duration-300 shadow-sm">
                  <div className="text-emerald-600 font-black text-3xl tracking-tighter mb-4">{item.law}</div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AS 3 GRANDES SOLUÇÕES */}
        <section className="py-32 bg-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-24">
             <h2 className="text-5xl font-black tracking-tighter mb-6">Três Pilares Regulatórios.</h2>
             <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto mb-10">O ecossistema de apoio à gestão de riscos psicossociais, denúncias e monitorização através de ferramentas validadas.</p>
             <button className="flex items-center gap-2 mx-auto font-black text-emerald-600 group text-lg">
                Explorar Metodologia
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
             </button>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
            {/* SOS TRIAGE */}
            <div className="p-10 rounded-[4rem] bg-emerald-50 space-y-8 relative overflow-hidden group">
               <HeartPulse className="w-12 h-12 text-emerald-600" />
               <h3 className="text-3xl font-black tracking-tighter">SOS Triage & Apoio Empático</h3>
               <p className="text-slate-600 font-medium">Intervenção ativa e anónima para exaustão e burnout. Ligação direta a especialistas clínicos.</p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-emerald-800 font-bold text-sm">
                     <CheckCircle2 className="w-4 h-4" /> Chat Anónimo 24/7
                  </li>
                  <li className="flex items-center gap-3 text-emerald-800 font-bold text-sm">
                     <CheckCircle2 className="w-4 h-4" /> Protocolo de Suporte Imediato
                  </li>
               </ul>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* CHANNEL 93 */}
            <div className="p-10 rounded-[4rem] bg-white border border-slate-100 space-y-8 relative overflow-hidden group">
               <Shield className="w-12 h-12 text-slate-800" />
               <h3 className="text-3xl font-black tracking-tighter">Canal de Denúncias Ativo</h3>
               <p className="text-slate-500 font-medium leading-relaxed">Conformidade obrigatória com a Lei 93/2021. Encriptação assimétrica com sigilo total.</p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                     <Lock className="w-4 h-4" /> Minimização e Controlo de Acesso
                  </li>
                  <li className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                     <Zap className="w-4 h-4" /> Arquitetura de Anonimização
                  </li>
               </ul>
            </div>

            {/* PREDICTIVE SST */}
            <div className="p-10 rounded-[4rem] bg-slate-900 text-white space-y-8 relative overflow-hidden group">
               <BarChart3 className="w-12 h-12 text-emerald-400" />
               <h3 className="text-3xl font-black tracking-tighter">Prevenção Preditiva</h3>
               <p className="text-slate-400 font-medium">Monitorização de fadiga e gestão do 'Direito a Desligar' (Lei 83/2021).</p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                     <CheckCircle2 className="w-4 h-4" /> Alertas de Direito a Desligar
                  </li>
                  <li className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                     <CheckCircle2 className="w-4 h-4" /> Mapeamento de Fatores de Stress
                  </li>
               </ul>
            </div>
          </div>
        </section>

        {/* ALERTA DE RISCO - PASSIVO JURÍDICO */}
        <section className="py-24 bg-red-50">
           <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest border border-red-200">
                    <AlertTriangle className="w-4 h-4" /> Alerta de Risco Operacional
                 </div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.95]">Gerencie os Riscos de Acidentes e Passivo Jurídico.</h2>
                 <p className="text-xl text-slate-600 font-medium leading-relaxed">
                    As coimas por incumprimento do RGPD e as auditorias da ACT sobre a Lei 102/2009 exigem prevenção contínua. São riscos reais que o AEGIS HUB reduz significativamente através de infraestrutura auditável e processos guiados.
                 </p>
                 <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all active:scale-95">
                    Auditar Meu Risco de Multa Agora
                 </button>
              </div>
              
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-red-100 space-y-6">
                 <div className="text-red-600 font-black text-xl uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-6 h-6" /> Simulador de Passivo Jurídico
                 </div>
                 <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                       <span className="font-bold text-slate-400">Status de Triagem ACT</span>
                       <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">INCUMPRIMENTO</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                       <span className="font-bold text-slate-400">Proteção de Dados (AI Act)</span>
                       <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">NIVEL AEGIS ATIVO</span>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-3xl text-center">
                       <div className="text-orange-400 font-black text-2xl tracking-tighter animate-pulse">AUDIT_ATTENTION_REQUIRED</div>
                       <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Indícios Sub-Clínicos Detetados em Avaliações Recentes</div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* RICARDO M SANTOS CARD - ARQUITETURA BLINDADA */}
        <section className="py-32 bg-white overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
              <div className="relative transform lg:-rotate-2">
                 <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10 relative z-10 transition-transform hover:rotate-0 duration-700">
                    <div className="flex justify-between items-start">
                       <div className="text-2xl font-black text-emerald-950 flex items-center gap-2 tracking-tighter leading-none">
                          <Shield className="w-6 h-6 text-emerald-600" /> AEGIS HUB | CLINICAL
                       </div>
                       <div className="text-[10px] text-slate-400 font-mono">ID: #4920-CL</div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Relatório de Pré-Triagem IA</h4>
                          <div className="grid grid-cols-2 gap-8">
                             <div>
                                <div className="text-[10px] font-bold text-slate-400 mb-1">Colaborador</div>
                                <div className="text-xl font-black text-slate-900 tracking-tighter leading-none">Ricardo M. Santos</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-slate-400 mb-1">Data da Análise</div>
                                <div className="text-xl font-black text-slate-900 tracking-tighter leading-none">14 Out 2026</div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-center">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Indicador de Risco Preditivo</div>
                          <div className="text-4xl font-black text-emerald-900 tracking-tighter leading-none">CONTROLADO</div>
                       </div>

                       <div className="flex justify-between items-center pt-6 px-4">
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black uppercase text-slate-400">Verificado Por</span>
                             <span className="font-bold text-slate-900">Dr. Helena Costa</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="text-[10px] font-black text-emerald-600 uppercase">SST Validada</div>
                             <UserCheck className="w-5 h-5 text-emerald-600" />
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-emerald-400/20 rounded-full blur-[120px] -z-10" />
              </div>

              <div className="space-y-12">
                 <div className="space-y-8">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">Medicina Ocupacional com Rosto Humano.</h2>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                       "IA Preditiva processa a exaustão, mas a decisão final é validada ativamente pelos especialistas."
                    </p>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                       Não acreditamos em diagnósticos puramente automáticos num ambiente de risco jurídico. Transformamos o processo do Anexo D e da monitorização num fluxo digital blindado pela ACT.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <Brain className="w-6 h-6 text-emerald-600" />
                          <h4 className="font-black text-xl tracking-tighter">Triagem M2.7 IA</h4>
                       </div>
                       <p className="text-sm text-slate-400 font-medium">Detecta padrões de risco invisíveis ao olho humano através de análise acústica e comportamental.</p>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <UserCheck className="w-6 h-6 text-emerald-600" />
                          <h4 className="font-black text-xl tracking-tighter">Validação Humana</h4>
                       </div>
                       <p className="text-sm text-slate-400 font-medium">Profissionais de SST assinam cada indicador e garantem a conformidade com o EU AI Act.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-32 px-6">
           <div className="max-w-6xl mx-auto bg-emerald-950 rounded-[4.5rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-12">
                 <h2 className="text-5xl md:text-[84px] font-black text-white tracking-tighter leading-[0.9]">Visão de Futuro. Segurança Jurídica.</h2>
                 <p className="text-emerald-200/60 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Cuidar da Saúde Mental já não é uma métrica intangível. É dever social e proteção do seu volume de negócios.
                 </p>
                 <button className="bg-emerald-500 text-emerald-950 px-16 py-7 rounded-[2.5rem] font-black text-2xl hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                    Falar com um C-Level AEGIS
                 </button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 via-transparent to-transparent opacity-50" />
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-24 bg-white border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="text-3xl font-black text-emerald-950 tracking-tighter flex items-center gap-2">
              <Shield className="w-10 h-10 text-emerald-600" />
              AEGIS HUB
            </div>
            <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
              AEGIS HUB Compliance Systems. Santuário Digital de Inteligência Ocupacional e Proteção de Dados de Saúde.
            </p>
          </div>
          <div className="text-left md:text-right space-y-8">
             <div className="flex flex-wrap md:justify-end gap-10 font-black text-slate-900 text-sm tracking-tighter uppercase">
                <a href="/privacidade" className="hover:text-emerald-600 transition-colors">Privacidade & RGPD</a>
                <a href="/ai-act" className="hover:text-emerald-600 transition-colors">EU AI Act Readiness</a>
                <a href="/suporte" className="hover:text-emerald-600 transition-colors">Suporte Compliance</a>
             </div>
             <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                © 2026 AEGIS HUB. Todos os direitos reservados.
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
