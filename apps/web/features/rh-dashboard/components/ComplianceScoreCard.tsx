export function ComplianceScoreCard({ score }: { score: number }) {
  const tone =
    score >= 85 ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/20" :
    score >= 70 ? "bg-amber-500/10 text-amber-400 border-amber-400/20" :
    "bg-rose-500/10 text-rose-400 border-rose-400/20";

  return (
    <article className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-slate-900/60">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Compliance NR-1</p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h3 className="text-4xl font-black tracking-tighter text-white tabular-nums">{score}</h3>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${tone}`}>
          {score >= 85 ? "Excelente" : score >= 70 ? "Atenção" : "Crítico"}
        </span>
      </div>
    </article>
  );
}
