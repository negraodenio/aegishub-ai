"use client";

import { CheckCircle, AlertOctagon, Scale, ShieldAlert } from "lucide-react";
import { useState } from "react";

const initialQueue = [
  {
    id: "dec-v9",
    type: "Critical Protocol Escalation",
    description: "Multiplas falhas detetadas na unidade 'Operations SP'. M2.7 recomenda Red Flag obrigatória imediata para 12 funcionários.",
    confidence: "98%",
    status: "pending",
    actor: "MiniMax M2.7",
    date: "Hoje, 10:15",
  },
  {
    id: "dec-v10",
    type: "Scaffold Model Parameter Update",
    description: "Aumento da temperatura de amostragem de 0.6 para 0.72 devido a drift de falso negativo na classificação de voz.",
    confidence: "82%",
    status: "pending",
    actor: "Drift Engine",
    date: "Ontem, 22:45",
  },
];

export function HumanValidationQueue() {
  const [queue, setQueue] = useState(initialQueue);

  const handleAction = (id: string, action: "approve" | "reject") => {
    // In a real app this would call /api/rh/ai/validate
    setQueue((prev) => prev.filter((item) => item.id !== id));
    console.log(`[ACTION LOG] Validating decision ${id} -> ${action}`);
  };

  return (
    <article className="rounded-2xl border border-red-100 bg-red-50/20 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Human-in-the-Loop Validation</h3>
            <p className="text-xs text-neutral-500">
              Intervenções de alto risco aguardando aprovação corporativa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 items-center rounded-full bg-red-100 px-2 text-xs font-semibold text-red-700">
            {queue.length} pendentes
          </span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-white/50 p-8 text-center">
          <ShieldAlert className="mb-3 h-8 w-8 text-green-500" />
          <p className="text-sm font-medium text-neutral-700">Nenhuma decisão pendente</p>
          <p className="text-xs text-neutral-500">A operação autônoma está fluindo perfeitamente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <AlertOctagon className="h-4 w-4 text-rose-500" />
                  {item.type}
                </div>
                <span className="text-xs text-neutral-500">{item.date}</span>
              </div>
              
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed font-serif tracking-wide border-l-2 border-slate-200 pl-3 italic">
                "{item.description}"
              </p>
              
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                <div className="flex gap-4 text-xs">
                  <span className="font-mono text-neutral-500">ID: {item.id}</span>
                  <span className="font-semibold text-sky-700">Confiança: {item.confidence}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAction(item.id, "reject")}
                    className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    Rejeitar Modificação
                  </button>
                  <button 
                    onClick={() => handleAction(item.id, "approve")}
                    className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4" /> Aprovar Intervenção
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
