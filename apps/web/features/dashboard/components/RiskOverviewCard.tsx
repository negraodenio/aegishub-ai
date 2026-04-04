type RiskLevel = "low" | "moderate" | "high" | "critical";

const styles: Record<RiskLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
  moderate: "bg-amber-500/10 text-amber-400 border-amber-400/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-400/20",
  critical: "bg-rose-500/10 text-rose-400 border-rose-400/20"
};

export function RiskOverviewCard({
  label,
  value,
  level,
  unit
}: {
  label: string;
  value: number | string;
  level?: RiskLevel;
  unit?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-slate-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tight text-white tabular-nums">{value}</h3>
            {unit ? <span className="text-xs font-bold text-slate-500 uppercase">{unit}</span> : null}
          </div>
        </div>
        {level ? (
          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tighter border ${styles[level]}`}>
            {level}
          </span>
        ) : null}
      </div>
    </article>
  );
}
