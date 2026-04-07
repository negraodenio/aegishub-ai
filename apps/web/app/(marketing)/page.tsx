import React from 'react';

export default function MarketingPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container font-[Plus_Jakarta_Sans] min-h-screen [&_h1]:font-[Manrope] [&_h2]:font-[Manrope] [&_h3]:font-[Manrope]">
        <style dangerouslySetInnerHTML={{ __html: `
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
            }
        `}} />
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-50 bg-[#fafaf5]/80 backdrop-blur-xl shadow-[0_20px_40px_-5px_rgba(26,28,25,0.06)]">
          <div className="flex justify-between items-center px-6 md:px-12 py-6 max-w-[1440px] mx-auto">
            <div className="text-2xl font-black text-[#005c55] tracking-tighter">AEGIS HUB</div>
            <div className="hidden md:flex gap-10 font-[Manrope] font-semibold tracking-tight text-sm">
              <a className="text-[#005c55] border-b-2 border-[#005c55] pb-1" href="#">A Plataforma</a>
              <a className="text-[#1a1c19] hover:text-[#005c55] transition-colors" href="/admin">Painel de Auditoria SST</a>
              <a className="text-[#1a1c19] hover:text-[#005c55] transition-colors" href="/assessment">Avaliação Colaborador</a>
            </div>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-[Manrope] font-semibold text-sm active:scale-95 duration-200 ease-out hover:shadow-lg transition-all">
              Proteger a Minha Equipa
            </button>
          </div>
          <div className="bg-[#f4f4ef] h-[1px] opacity-15"></div>
        </nav>
        
        <main className="pt-24 overflow-x-hidden">
          {/* Hero Section */}
          <section className="relative min-h-[921px] flex items-center px-6 md:px-12 py-20">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-6 space-y-10">
                <div className="space-y-6">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase">
                    Next-Generation HealthTech
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-[1.05]">
                    Inteligência a favor da <span className="text-primary italic">Vida</span> no Trabalho.
                  </h1>
                  <p className="text-lg md:text-xl text-on-surface-variant max-w-xl font-light leading-relaxed">
                    A plataforma europeia de Saúde Ocupacional que une o cuidado humano à precisão da Inteligência Artificial. Proteja a saúde mental dos seus colaboradores e garanta 100% de conformidade legal.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-base hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    Solicitar Demonstração Clínica
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                  <button className="bg-surface-container-low text-primary px-10 py-5 rounded-xl font-bold text-base hover:bg-surface-container-high transition-all active:scale-95">
                    Ver Documentação Legal
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 relative">
                <div className="rounded-xl overflow-hidden aspect-[4/5] shadow-2xl relative z-10">
                  <img alt="Modern professional office team" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqSj1Fnl1ksUHeek8sjjBtaoK2Jv87JOASWCEUX4wBRBrUUUa3-M0aKJ4MOqiMEGnvicvmR8K3BGmQrCbCeZ1pYR2POZWe7kukbZQeUbvv4spTeJL4YHvp3K0qt9vpPp-HEExaQYbGyGDca2bQpNh7RqiKs2DVOdK1Be82e14z4VrOukQHKU47Vt5SNe0rCR1U-gr58YoncE_Lv-eQOTW503h9nL8QOtX0nkgNTfLUX3N7ToU4SivOZgImyJ9-Y3q812jlNi1CbfQ"/>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-secondary-container rounded-full blur-[80px] opacity-40 -z-10"></div>
                <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary-fixed-dim rounded-full blur-[80px] opacity-30 -z-10"></div>
                {/* Floating Insight Card */}
                <div className="absolute bottom-12 -right-6 md:-right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl z-20 border border-white/20 max-w-[280px]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Retenção de Talentos</div>
                      <div className="text-lg font-black text-on-surface">+34% ROI</div>
                    </div>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Flags */}
          <section className="px-6 md:px-12 py-12">
            <div className="max-w-[1440px] mx-auto">
              <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-3xl py-8 px-12 border border-outline-variant/10 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-on-surface-variant font-medium">
                <span className="flex items-center gap-2 opacity-70">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  Concebido sob o rigor do EU AI Act & RGPD
                </span>
                <span className="flex items-center gap-2 opacity-70">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  Lei 93/2021: Canal de Denúncias Integral
                </span>
                <span className="flex items-center gap-2 opacity-70">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  ACT: Conformidade Lei 102/2009 & 83/2021
                </span>
              </div>
            </div>
          </section>

          {/* Clinical Protocols Section [NEW] */}
          <section className="px-6 md:px-12 py-24 bg-surface-container-lowest">
            <div className="max-w-[1440px] mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight">Standard de Ouro <span className="text-primary italic">Clínico</span></h2>
                <p className="text-on-surface-variant max-w-2xl mx-auto font-light lg:text-lg">
                  A nossa IA não substitui a ciência. Ela escala-a através dos protocolos mais rigorosos da medicina ocupacional moderna.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 border border-outline-variant/10 rounded-3xl bg-surface hover:border-primary/30 transition-colors">
                  <div className="text-primary font-bold text-lg mb-4 font-[Manrope]">GAD-7</div>
                  <div className="text-2xl font-bold mb-4">Ansiedade Generalizada</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Protocolo de 7 itens para rastreio e monitorização da severidade da ansiedade, validado para contextos corporativos de alta performance.</p>
                </div>
                <div className="p-8 border border-outline-variant/10 rounded-3xl bg-surface hover:border-primary/30 transition-colors">
                  <div className="text-primary font-bold text-lg mb-4 font-[Manrope]">PHQ-9</div>
                  <div className="text-2xl font-bold mb-4">Depressão & Vitalidade</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Instrumento fundamental para deteção precoce de episódios depressivos e perda de energia produtiva, garantindo intervenção antes do colapso.</p>
                </div>
                <div className="p-8 border border-outline-variant/10 rounded-3xl bg-surface hover:border-primary/30 transition-colors">
                  <div className="text-primary font-bold text-lg mb-4 font-[Manrope]">COPSOQ II</div>
                  <div className="text-2xl font-bold mb-4">Riscos Psicossociais</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Standard dinamarquês para avaliação exaustiva do ambiente psicossocial, exigido para conformidade total com a Lei 102/2009.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="px-6 md:px-12 py-32 bg-surface">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-6">As 3 Grandes Soluções</h2>
                  <p className="text-xl text-on-surface-variant font-light">O ecossistema integral para gestão de riscos psicossociais e clínicos de forma audítável e com sigilo total.</p>
                </div>
                <span className="text-primary font-bold flex items-center gap-2 border-b-2 border-primary pb-2 cursor-pointer hover:gap-4 transition-all">
                  Explorar Metodologia <span className="material-symbols-outlined">arrow_right_alt</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature Card 1 */}
                <div className="group bg-surface-container-lowest p-10 rounded-xl hover:shadow-[0_40px_80px_-15px_rgba(0,92,85,0.08)] transition-all duration-500 flex flex-col justify-between min-h-[420px]">
                  <div>
                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary transition-colors duration-300">
                      <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-4">SOS Triage & Apoio Empático</h3>
                    <p className="text-on-surface-variant leading-relaxed">Intervenção ativa e anónima para exaustão e burnout. Ligação direta a especialistas clínicos em tempo real.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-outline-variant/10">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Chat Anónimo 24/7</li>
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Protocolo de Suporte Imediato</li>
                    </ul>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group bg-surface-container-lowest p-10 rounded-xl hover:shadow-[0_40px_80px_-15px_rgba(0,92,85,0.08)] transition-all duration-500 flex flex-col justify-between min-h-[420px]">
                  <div>
                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary transition-colors duration-300">
                      <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-4">Canal de Denúncias Ativo</h3>
                    <p className="text-on-surface-variant leading-relaxed">Conformidade obrigatória com a Lei 93/2021 (Whistleblowing) para empresas com +50 colaboradores. IA confidencial com encriptação assimétrica.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-outline-variant/10">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Encriptação de Grau Militar</li>
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Zero Identificação Pessoal</li>
                    </ul>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="group bg-surface-container-lowest p-10 rounded-xl hover:shadow-[0_40px_80px_-15px_rgba(0,92,85,0.08)] transition-all duration-500 flex flex-col justify-between min-h-[420px]">
                  <div>
                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary transition-colors duration-300">
                      <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-4">Prevenção Preditiva</h3>
                    <p className="text-on-surface-variant leading-relaxed">Monitorização de fadiga e gestão do 'Direito a Desligar' (Lei 83/2021), mitigando multas severas e a erosão de talentos estratégicos.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-outline-variant/10">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Alertas de Direito a Desligar</li>
                      <li className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Mapeamento de Fatores de Stress</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Risk & Fines Section [NEW] */}
          <section className="px-6 md:px-12 py-32 bg-[#1a1c19] text-white overflow-hidden relative">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 relative z-10">
                <div className="inline-block px-4 py-1 rounded-full bg-error text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Alerta de Risco</div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                  O Custo do Silêncio pode chegar aos <span className="text-error">20 Milhões de Euros</span>.
                </h2>
                <p className="text-lg text-slate-400 font-light max-w-xl">
                  As coimas por incumprimento do RGPD (4% do volume de negócios global) e as auditorias da ACT sobre a Lei 102/2009 e 83/2021 não são apenas teóricas. São riscos reais que o AEGIS HUB neutraliza.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <button className="bg-error text-white px-10 py-5 rounded-xl font-bold text-base hover:bg-red-700 transition-all shadow-[0_20px_40px_rgba(186,26,26,0.3)]">
                    Auditar Meu Risco de Multa Agora
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-surface-container-high/10 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Simulador de Passivo Jurídico</span>
                    <span className="text-error font-mono text-xs">AUDIT_CRITICAL_LEVEL</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Prazos de Triagem ACT (Lei 102/2009)</span>
                      <span className="text-error font-bold italic">Incumprimento Detetado</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-error w-full"></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Proteção de Dados (RGPD/AI Act)</span>
                      <span className="text-emerald-500 font-bold italic">Nivel Aegis Ativo</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[100%] transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-error/10 rounded-full blur-[150px] -translate-y-1/2 -z-0"></div>
          </section>
          {/* Human-in-the-Loop Section */}
          <section className="px-6 md:px-12 py-32 bg-surface-container-low">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  {/* Digital Document UI */}
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg mx-auto transform rotate-1 border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b">
                      <div className="text-lg font-bold tracking-tighter text-primary">AEGIS HUB <span className="text-xs text-on-surface-variant/50 font-medium">| Clinical</span></div>
                      <div className="text-xs text-on-surface-variant">ID: #4920-CL</div>
                    </div>
                    <div className="space-y-4 mb-10">
                      <h4 className="text-xl font-bold text-black">Ficha de Aptidão Digital</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Colaborador</div>
                          <div className="text-sm font-medium text-black">Ricardo M. Santos</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Data do Exame</div>
                          <div className="text-sm font-medium text-black">14 Out 2026</div>
                        </div>
                      </div>
                      <div className="p-4 bg-secondary-container/20 rounded-xl border border-secondary-container/40">
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">Resultado Clínico (Pré-Triagem IA)</div>
                        <div className="text-sm font-bold text-on-secondary-container">APTO PARA O TRABALHO</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-t pt-6 border-dashed border-gray-300">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Assinatura Certificada</div>
                        <div className="italic font-[Manrope] text-primary opacity-60">Dr. Helena Costa (ACT validada)</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                  </div>
                  {/* Doctor Background Image */}
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full overflow-hidden border-8 border-surface-container-low shadow-xl -z-10 hidden md:block">
                    <img alt="Doctor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBROf0Q3MJpjdB-bfCdDXwGYfw9qCrwhaiyDORr1c5cicvaLo6A0vqlzqv7mTpfJANVQAYNUjc8M2PsWpg6zv-f9SVtt-BZFkdv4twthp3ngAokr-G48WImTA2f_y8_3UINXjZ1FDssmLjlNmR7K4xXqdpbl0GBCNpy-8DtM1pKeT76Sfa2B10yRpBuH96w6txwJkqCQQQ81zK_-qwwgulsLo5-D89AVxMGQfghSOcs6wTjiWu8xWIiXOZgYqEfH2dF_vEYtNNS6c"/>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-tight">
                  Medicina Ocupacional com <span className="text-primary underline decoration-secondary-container underline-offset-8">Rosto Humano</span> e Cérebro Digital.
                </h2>
                <p className="text-lg text-on-surface-variant leading-relaxed font-light">
                  Não acreditamos em diagnósticos puramente automáticos num ambiente de risco. A nossa IA preditiva processa os dados de exaustão, mas a decisão final é validada ativamente pelos especialistas. Transformamos a burocracia do Anexo D e das Fichas de Aptidão num fluxo digital fluido e blindado pela ACT.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-primary">psychology</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">Triagem M2.7 IA</h4>
                      <p className="text-sm text-on-surface-variant">Detecta padrões de risco invisíveis ao olho humano.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-primary">clinical_notes</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">Validação Humana DPO/Médico</h4>
                      <p className="text-sm text-on-surface-variant">Profissionais de Saúde assinam cada diagnóstico e garantem o EU AI Act.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-[#005c55] to-[#0f766e] rounded-t-[3rem] mt-20 overflow-hidden relative">
          <div className="flex flex-col items-center gap-8 py-20 px-6 md:px-12 text-white max-w-[1440px] mx-auto text-center">
            <div className="text-3xl font-black tracking-tighter text-white mb-4">AEGIS HUB</div>
            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
              Cuidar da Saúde Mental já não é uma métrica intangível. É segurança jurídica, dever social e visão de futuro.
            </h2>
            <button className="bg-white text-primary px-12 py-5 rounded-xl font-bold text-lg hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 mt-8">
              Falar com um C-Level AEGIS
            </button>
            <div className="w-full h-[1px] bg-white/10 my-12"></div>
            <div className="flex flex-col md:flex-row justify-between w-full items-center gap-8 font-[Plus_Jakarta_Sans] text-sm font-light">
              <div className="flex gap-8 opacity-80">
                <a className="hover:text-[#a6f2d1] transition-opacity underline font-medium" href="#">Privacidade & RGPD</a>
                <a className="hover:text-[#a6f2d1] transition-opacity opacity-80 hover:opacity-100" href="#">EU AI Act Termos</a>
                <a className="hover:text-[#a6f2d1] transition-opacity opacity-80 hover:opacity-100" href="#">Suporte Compliance</a>
              </div>
              <div className="opacity-80">
                © 2026 AEGIS HUB. Santuário Digital de Inteligência Ocupacional.
              </div>
            </div>
          </div>
          {/* Subtle decorative background blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </footer>
      </div>
    </>
  );
}
