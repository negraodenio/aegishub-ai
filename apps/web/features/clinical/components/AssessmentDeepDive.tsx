export type Reason = {
  code: string;
  label: string;
  description: string;
  icon?: string;
  confidence: number;
  source: "PHQ9" | "GAD7" | "WHO5" | "VOICE" | "SYSTEM";
  evidence?: Record<string, any>;
};

export type Recommendation = {
  type: string;
  priority: "low" | "medium" | "high";
  message: string;
  justification: string[];
  confidence: number;
};

export function AssessmentDeepDive({
  score,
  reasons,
  recommendation,
  decisionId,
  vertical
}: {
  score: number;
  reasons: Reason[];
  recommendation: Recommendation;
  decisionId: string;
  vertical: string;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
      
      {/* HEADER */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Suporte à Decisão Clínica</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Decision ID: <span className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-600">{decisionId}</span>
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Score Base: <span className="font-semibold text-neutral-900">{score}</span> ({vertical})
          </p>
        </div>

        <div className="flex -space-x-2">
          {["PHQ9", "GAD7", "WHO5", "VOICE"].map((prot) => (
            <div key={prot} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-[10px] font-bold text-neutral-400">
              {prot}
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">

        {/* REASONS & EXPLAINABILITY (AI ACT COMPLIANCE) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Evidências Estruturadas (Explainability)
          </h4>

          {reasons.map((r) => (
            <div key={r.code} className="flex gap-4 rounded-2xl border border-rose-500/10 bg-rose-50/30 p-5 items-start">
              <div className="flex h-10 w-10 items-center justify-center shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-rose-500/10 text-xl">
                <span>{r.icon || "⚠️"}</span>
              </div>

              <div className="w-full">
                <p className="text-sm font-bold text-rose-900">{r.label}</p>
                <p className="mt-1 text-xs text-rose-800/70">{r.description}</p>

                {/* CONFIDENCE BAR */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-rose-200/50">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${r.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 min-w-[28px] text-right">
                    {(r.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* SOURCE TRAIL */}
                <p className="mt-2 text-[10px] font-mono text-neutral-500 bg-white/50 px-2 py-1 rounded inline-block">
                  Source: {r.source}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RECOMMENDATION & OVERSIGHT */}
        <div className="rounded-2xl bg-neutral-50 p-6 flex flex-col justify-between">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Recomendação Clínica (Decision Engine)
            </h4>

            <div className="rounded-xl border border-white bg-white p-5 shadow-sm">
              <p className="text-sm italic font-medium text-neutral-800 border-l-2 border-rose-500 pl-3">
                "{recommendation.message}"
              </p>

              {/* JUSTIFICATION LIST */}
              <div className="mt-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Justificativa Inferida:</p>
                <ul className="text-xs text-neutral-600 list-disc pl-4 space-y-1">
                  {recommendation.justification.map((j, i) => (
                    <li key={i}>{j}</li>
                  ))}
                </ul>
              </div>

              {/* OVERALL CONFIDENCE */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-400 uppercase">Grau de Confiança:</span>
                <div className="h-2 flex-1 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${recommendation.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {(recommendation.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* HUMAN-IN-THE-LOOP - AUDIT TRAIL */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 text-center mb-3">
              Supervisão Obrigatória (Human-in-the-Loop)
            </h4>
            <div className="flex gap-3">
              <button className="flex-1 bg-black text-white rounded-xl px-4 py-3 text-xs font-bold shadow-lg shadow-black/20 hover:scale-[1.02] transition-transform">
                Validar Decisão
              </button>
              <button className="flex-1 border-2 border-neutral-200 bg-white rounded-xl px-4 py-3 text-xs font-bold text-neutral-700 hover:border-rose-300 hover:text-rose-600 transition-colors">
                Rejeitar Falso Positivo
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
