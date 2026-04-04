import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500" />
            <span className="text-lg font-bold tracking-tight">MindOps</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-neutral-400 md:flex">
            <Link href="#solutions" className="transition-colors hover:text-white">Soluções</Link>
            <Link href="#roi" className="transition-colors hover:text-white">Impacto & ROI</Link>
            <Link href="#about" className="transition-colors hover:text-white">Sobre</Link>
          </div>
          <Link
            href="/auth/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Portal do Cliente
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 -left-20 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-40 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <section className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Nova fronteira em SST e Saúde Mental
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl">
            Resiliência Organizacional <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Elevada pela Inteligência.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-neutral-400">
            O MindOps é a primeira plataforma de inteligência preditiva para riscos psicossociais integrada à NR-1. 
            Proteja sua força de trabalho, reduza passivos e maximize a produtividade humana.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="h-12 rounded-full bg-emerald-500 px-8 font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              Agendar Demo Executiva
            </button>
            <button className="h-12 rounded-full border border-white/10 bg-white/5 px-8 font-semibold backdrop-blur-sm transition-colors hover:bg-white/10">
              Calcular ROI de Saúde
            </button>
          </div>
        </section>

        {/* Value Prop Cards */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Conformidade NR-1",
                desc: "Plano de ação SST automatizado conforme diretrizes de riscos psicossociais.",
                icon: "⚖️"
              },
              {
                title: "Voz Assistida por IA",
                desc: "Triagem biomecânica de voz para detectar sinais precoces de exaustão e estresse.",
                icon: "🎙️"
              },
              {
                title: "Privacidade by Design",
                desc: "Criptografia de ponta a ponta e anonimização rigorosa para dados agregados.",
                icon: "🛡️"
              }
            ].map((item, i) => (
              <div key={i} className="group rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]">
                <div className="mb-4 text-3xl">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-neutral-400 group-hover:text-neutral-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="border-t border-white/5 bg-white/[0.01] py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-500">O impacto em números</h2>
            <div className="mt-12 grid gap-12 sm:grid-cols-4">
              {[
                { label: "Redução Absenteísmo", val: "-22%" },
                { label: "Precisão de Triagem", val: "94%" },
                { label: "Economia Anual", val: "R$ 4.2M" },
                { label: "Compliance Garantido", val: "100%" }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl font-bold tabular-nums">{stat.val}</p>
                  <p className="mt-2 text-sm text-neutral-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-neutral-600">
        <p>&copy; 2026 MindOps Intelligence Systems. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
