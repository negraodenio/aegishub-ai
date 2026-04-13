import { DriftMatrixCard } from "../../../../features/rh-dashboard/components/DriftMatrixCard";
import { PatchFeedList } from "../../../../features/rh-dashboard/components/PatchFeedList";
import { HumanValidationQueue } from "../../../../features/rh-dashboard/components/HumanValidationQueue";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function IntelligenceHubPage() {
  return (
    <main className="space-y-12 p-8 max-w-7xl mx-auto animate-in fade-in duration-700 bg-[#020202] text-white min-h-screen">
      <header className="flex items-center justify-between border-b border-white/10 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white">
                Intelligence <span className="font-light not-italic text-neutral-500 ml-1">Center M2.7</span>
             </h1>
          </div>
          <p className="text-sm text-neutral-500 max-w-lg">
            Monitorização da Camada Autónoma de Inferência e Drift Analysis da Rede Neuronal MindOps.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-2.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Core M2.7 Online
          </span>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
           <DriftMatrixCard />
           <PatchFeedList />
      </section>

      <section className="rounded-[40px] border border-white/5 bg-white/[0.01] overflow-hidden">
        <HumanValidationQueue />
      </section>

      {/* Memory Layer RAG Snippet Demo */}
      <section className="rounded-[40px] border border-white/5 bg-white/[0.02] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all" />
        <h3 className="text-lg font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
           <div className="h-2 w-6 bg-emerald-500 rounded-full" />
           Organizational Memory Layer (RAG)
        </h3>
        <p className="text-sm text-neutral-500 mb-8 max-w-3xl leading-relaxed">
          O sistema recalcula a prontidão corporativa pesquisando no repositório clínico da empresa o desfecho das últimas <span className="text-white font-bold">400 intervenções T1</span> em tempo real.
        </p>
        <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 font-mono text-[10px] text-emerald-500/80 overflow-hidden shadow-2xl relative">
          <div className="absolute top-4 right-4 text-[8px] text-neutral-700 font-bold uppercase tracking-widest">Live Tensor Stream</div>
          <div className="opacity-40 mb-2">// Querying VDB Tensor Space for "Burnout Risk IT Dept"</div>
          <div className="flex gap-2 mb-1">
             <span className="text-neutral-700">01011001</span>
             <span>&gt; FOUND 12 MATCHING INCIDENTS [SIMILARITY 0.9412]</span>
          </div>
          <div className="flex gap-2 mb-1">
             <span className="text-neutral-700">11001010</span>
             <span>&gt; EXTRACTING PREVIOUS HR INTERVENTION IMPACT...</span>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="text-white font-bold mt-4 border-l-2 border-emerald-500 pl-4 py-2 bg-emerald-500/5 rounded-r-lg"
          >
             &gt; STRATEGY GENERATED: APPLYING MANDATORY 4-DAY ROTATION TO AVOID +18% RELAPSE DETECTED IN SIMILAR CLUSTERS.
          </motion.div>
        </div>
      </section>
    </main>
  );
}
