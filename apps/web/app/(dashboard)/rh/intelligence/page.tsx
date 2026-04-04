import { DriftMatrixCard } from "../../../../features/rh-dashboard/components/DriftMatrixCard";
import { PatchFeedList } from "../../../../features/rh-dashboard/components/PatchFeedList";
import { HumanValidationQueue } from "../../../../features/rh-dashboard/components/HumanValidationQueue";
import { BrainCircuit } from "lucide-react";

export default function IntelligenceHubPage() {
  return (
    <main className="space-y-8 p-6 bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between border-b border-black/5 pb-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            Intelligence Center
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Monitorização da Camada Autônoma MiniMax M2.7 & Drift Analysis.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Engine Online
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <DriftMatrixCard />
        <PatchFeedList />
      </section>

      <section className="mt-8">
        <HumanValidationQueue />
      </section>

      {/* Memory Layer RAG Snippet Demo */}
      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-neutral-900 mb-4">Organizational Memory Layer (RAG)</h3>
        <p className="text-sm text-neutral-500 mb-4">
          O sistema recalcula a prontidão corporativa pesquisando no repositório clínico da empresa o desfecho das últimas 400 intervenções T1.
        </p>
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-sky-300 overflow-hidden shadow-inner uppercase">
          <div className="opacity-50 mb-2">// Querying VDB Tensor Space for "Burnout IT Dept"</div>
          <div>&gt; FOUND 12 MATCHING INCIDENTS [SIMILARITY 0.94]</div>
          <div>&gt; EXTRACTING PREVIOUS HR INTERVENTION IMPACT...</div>
          <div className="text-emerald-400 mt-2">&gt; STRATEGY GENERATED: APLYING MANDATORY 4-DAY ROTATION TO AVOID +18% RELAPSE</div>
        </div>
      </section>
    </main>
  );
}
