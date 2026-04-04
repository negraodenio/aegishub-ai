export function CoverageCard({
  assessed,
  total,
  coveragePercent
}: {
  assessed: number;
  total: number;
  coveragePercent: number;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-slate-900/60">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cobertura de assessment</p>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-4xl font-black tracking-tighter text-white tabular-nums">{coveragePercent}%</h3>
        <span className="text-[10px] font-bold text-indigo-400 uppercase">Audit Ready</span>
      </div>
      <p className="mt-2 text-xs text-slate-400 font-medium">
        {assessed} de {total} colaboradores avaliados
      </p>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${coveragePercent}%` }}
        />
      </div>
    </article>
  );
}
