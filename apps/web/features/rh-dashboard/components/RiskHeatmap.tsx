import type { RHBusinessUnitRisk } from "../types";

function tone(score: number) {
  if (score >= 75) return "bg-rose-500/10 text-rose-400 border-rose-400/20";
  if (score >= 55) return "bg-orange-500/10 text-orange-400 border-orange-400/20";
  if (score >= 30) return "bg-amber-500/10 text-amber-400 border-amber-400/20";
  return "bg-emerald-500/10 text-emerald-400 border-emerald-400/20";
}

export function RiskHeatmap({ rows }: { rows: RHBusinessUnitRisk[] }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl transition-all">
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Heatmap de risco por unidade</h3>
        <p className="mt-1 text-[11px] text-slate-400 font-medium">
          Dados agregados estratégicos, sem exposição clínica nominal.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.businessUnit} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white/90">{row.businessUnit}</p>
                <p className="mt-1 text-[10px] uppercase font-bold text-slate-500">{row.assessedCount} avaliados</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter border ${tone(row.avgRiskScore)}`}>
                {row.avgRiskScore}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Alto risco</p>
                <p className="mt-2 text-xl font-black text-white tabular-nums">{row.highRiskCount}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Crítico</p>
                <p className="mt-2 text-xl font-black text-rose-500 tabular-nums">{row.criticalRiskCount}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
