import { GitCommitHorizontal, GitMerge, Settings2 } from "lucide-react";

export function PatchFeedList() {
  const patches = [
    {
      id: "patch-82",
      icon: GitCommitHorizontal,
      title: "Redução no Threshold de Burnout (Setor TI)",
      description: "MiniMax detectou fadiga oculta. Baseline ajustada de 60 para 55.",
      time: "Há 4 horas",
      status: "auto_applied",
    },
    {
      id: "patch-81",
      icon: GitMerge,
      title: "Fusão de Regras GAD-7",
      description: "Unificação de gatilhos de alerta entre Operações e Atendimento.",
      time: "Ontem, 14:30",
      status: "auto_applied",
    },
    {
      id: "patch-80",
      icon: Settings2,
      title: "Calibração de Loop de Decisão",
      description: "Looping detectado no reencaminhamento T2. Penalty adicionado na prompt memory.",
      time: "Há 2 dias",
      status: "learning",
    },
  ];

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900">Autonomus Workflow Rewriter</h3>
          <p className="text-xs text-neutral-500">Registro de otimizações de scaffold</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-indigo-700">
          LIVE PATCHING
        </span>
      </div>

      <div className="space-y-4">
        {patches.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="relative flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-neutral-900">{p.title}</h4>
                  <span className="text-[10px] text-neutral-400">{p.time}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{p.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
