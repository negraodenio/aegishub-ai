"use client";

import { useState } from "react";

export function WorkerIntelligenceDossier({ workerId, recordCode, history }: any) {
  const [activeSegment, setActiveSegment] = useState("overview");

  return (
    <div className="flex min-h-screen bg-[#080808] text-neutral-300 font-sans selection:bg-cyan-500/30">
      {/* Sidebar Navigation (DENSE) */}
      <aside className="w-16 border-r border-white/5 bg-black/40 flex flex-col items-center py-8 gap-8">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
          <span className="text-cyan-400 text-xs font-bold">P-R</span>
        </div>
        <nav className="flex flex-col gap-6 opacity-60">
          {["overview", "copsoq", "voice", "compliance"].map((seg) => (
            <button key={seg} onClick={() => setActiveSegment(seg)} 
                    className={`h-6 w-6 transition-all ${activeSegment === seg ? "text-cyan-400 opacity-100" : "hover:text-white"}`}>
              {seg === "overview" && "📊"}
              {seg === "copsoq" && "📋"}
              {seg === "voice" && "🎙️"}
              {seg === "compliance" && "🛡️"}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Intel Panel */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Worker Intelligence Dossier</h1>
            <p className="mt-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
              RECORD_ID: {recordCode} // REGULATORY_FRAMEWORK: PT-ACT-102/2009
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-md bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">Status</span>
              <span className="text-sm font-bold text-emerald-400">Ativo / Monitorizado</span>
            </div>
          </div>
        </header>

        {/* Content Segments */}
        {activeSegment === "overview" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Multimodal Risk Core */}
              <div className="col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-6">Tendência Multimodal (Agregado)</h3>
                <div className="h-48 flex items-end gap-1.5 px-2">
                  {[40, 45, 42, 58, 62, 55].map((val, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600/40 to-cyan-400/80 rounded-t-sm" style={{ height: `${val}%` }} />
                  ))}
                </div>
                <div className="mt-8 flex justify-between text-xs text-neutral-500 font-mono">
                  <span>JAN_24</span> <span>FER_24</span> <span>MAR_24</span> <span>ABR_24</span> <span>MAI_24</span> <span>JUN_24</span>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
                  <span className="text-[10px] uppercase font-bold text-rose-500">Alerta de Fadiga Vocal</span>
                  <p className="text-2xl font-bold text-white mt-1">Crítico</p>
                  <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
                    Sinal prosódico detectou exaustão compatível com burnout. Recomenda-se avaliação preventiva imediata.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <span className="text-[10px] uppercase font-bold text-cyan-500">COPSOQ Compliance</span>
                  <p className="text-2xl font-bold text-white mt-1">94%</p>
                  <p className="mt-4 text-xs text-neutral-400">Avaliação anual completada em 15/05/2024.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Audit/Compliance Log (DENSE TABLE) */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-white/5 bg-black/40">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
              <tr>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4">Decision_ID</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Audit_Hash</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                  <td className="px-6 py-4 text-white font-medium">Análise Vocal Prosódica</td>
                  <td className="px-6 py-4 font-mono text-cyan-400/70">AI_PROS_9281_{i}</td>
                  <td className="px-6 py-4">15/05/2024 14:32</td>
                  <td className="px-6 py-4 font-mono text-[10px] text-neutral-600">0x8a92b...{i}f</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] uppercase font-bold text-neutral-500 group-hover:text-white transition-colors">Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
