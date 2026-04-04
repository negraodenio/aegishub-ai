import { Activity, Beaker, Network } from "lucide-react";

export function DriftMatrixCard() {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Network className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">Matriz de Drift (M2.7)</h3>
          <p className="text-xs text-neutral-500">
            Estabilidade das inferências clínicas nos últimos 30 dias
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Activity className="h-4 w-4" /> Variância GAD-7
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900">±1.2%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Estável</span>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Beaker className="h-4 w-4" /> Taxa de Falso Positivo
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900">2.4%</span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Alerta</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Ajuste de Sampling Temperature:</span>
          <span className="font-medium text-neutral-900">0.71 → 0.68</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: "68%" }} />
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          Sistema calibrou autonomia para reduzir taxa de falsos positivos na triagem T1.
        </p>
      </div>
    </article>
  );
}
