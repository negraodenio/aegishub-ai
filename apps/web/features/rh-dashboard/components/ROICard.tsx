"use client";

import { useMemo } from "react";
import { calculatePotentialROI, type ROIParameters } from "@mindops/domain";

export function ROICard({ params }: { params: ROIParameters }) {
  const result = useMemo(() => calculatePotentialROI(params), [params]);

  const currency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-sm transition-all hover:border-emerald-500/40">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="text-4xl">💰</span>
      </div>

      <header className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Potencial de Economia (ROI)</h3>
        <p className="mt-1 text-xs text-emerald-600/70 italic">Análise baseada em redução de absenteísmo e turnover.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-emerald-800">Economia Anual Estimada</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-900 tabular-nums">
            {currency(result.potentialAnnualSavings)}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            Payback: {result.paybackMonths} meses
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-white/40 p-4 backdrop-blur-sm">
          <div className="flex justify-between text-xs text-emerald-800">
            <span>Redução em Turnover</span>
            <span className="font-semibold">{currency(result.details.turnoverCost * 0.25)}</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-800">
            <span>Produtividade Recuperada</span>
            <span className="font-semibold">{currency(result.details.productivityLoss * 0.25)}</span>
          </div>
          <div className="mt-2 h-[1px] w-full bg-emerald-500/20" />
          <div className="flex justify-between text-xs font-bold text-emerald-900">
            <span>Total</span>
            <span>{currency(result.potentialAnnualSavings)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
