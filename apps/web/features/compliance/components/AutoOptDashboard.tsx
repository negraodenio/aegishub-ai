"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface InferenceEntity {
  id: string;
  tenant_id: string;
  decision_type: string;
  status: string;
  control_description?: string;
  automated_action_taken?: string;
  memory_updates: any;
  created_at: string;
}

// Inicializar de forma condicional para não quebrar Builds SSR.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://local.supabase",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

export function AutoOptDashboard() {
  const [inferences, setInferences] = useState<InferenceEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
    const interval = setInterval(fetchUpdates, 10000); // Polling (10s)
    return () => clearInterval(interval);
  }, []);

  async function fetchUpdates() {
    try {
      // Sincronizado com a tabela de Auditoria de IA (decisões endurecidas)
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("id, tenant_id, decision_type, status, control_description, automated_action_taken, memory_updates, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error) {
        setInferences(data as any || []);
      }
    } catch {
      // safe fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl shadow-lg border border-white/5 bg-neutral-900/50 p-8 backdrop-blur-xl text-white">
      <header className="mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-emerald-400">Governance Control Center (M2.7)</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-400 font-medium">Auditoria imutável de decisões autogovernadas e descrição de controles regulatórios (EU AI Act).</p>
      </header>

      {loading ? (
        <p className="text-neutral-400 font-mono text-sm py-10 text-center animate-pulse">Sincronizando com o Ledger de Auditoria...</p>
      ) : (
        <div className="space-y-6">
          {inferences.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-neutral-500 text-sm">Nenhum evento de governança registrado. O sistema está em modo passivo.</p>
            </div>
          )}
          
          {inferences.map((u) => {
            const isHighRisk = u.decision_type.includes("clinical") || u.decision_type.includes("high_risk");
            
            return (
              <div
                key={u.id}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                  isHighRisk ? "border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.05)]" : "border-white/5 bg-black/40 hover:bg-black/60 shadow-xl"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between mb-6">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] bg-neutral-800/80 px-3 py-1 rounded-full text-neutral-400 border border-white/5 uppercase tracking-widest">
                        DEC-{u.id.substring(0,8)}
                      </span>
                      <span className="text-sm font-bold text-emerald-400 uppercase tracking-tight">{u.decision_type}</span>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-[0.2em] shadow-sm ${
                        u.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-400/20"
                      }`}>
                        {u.status}
                      </span>
                    </div>
                    
                    {/* DESCRIÇÃO DE CONTROLE (Requisito "desc de contr") */}
                    <div className="space-y-2">
                       <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                         <span className="h-1 w-1 rounded-full bg-indigo-400"></span>
                         Descrição de Controle de Governança
                       </h3>
                       <p className="text-sm text-slate-200 leading-relaxed font-medium">
                         {u.control_description || "Aguardando definição taxonômica do modelo..."}
                       </p>
                    </div>

                    {u.automated_action_taken && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 w-fit px-3 py-1.5 rounded-lg italic">
                        <span className="animate-pulse">●</span> {u.automated_action_taken}
                      </div>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-neutral-600 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">{new Date(u.created_at).toLocaleString('pt-PT')}</p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative rounded-xl bg-[#000000]/80 p-5 font-mono text-[11px] text-emerald-400/90 border border-white/10 overflow-x-auto shadow-2xl">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(u.memory_updates, null, 2)}</pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
