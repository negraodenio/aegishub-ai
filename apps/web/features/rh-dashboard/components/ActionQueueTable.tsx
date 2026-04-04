"use client";

import type { RHActionQueueItem } from "../types";
import { getAssessmentInviteAction } from "../actions";
import { PlayCircle, UserPlus } from "lucide-react";

const badgeMap = {
  low: "bg-neutral-100 text-neutral-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-rose-50 text-rose-700"
};

export function ActionQueueTable({ items }: { items: RHActionQueueItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md shadow-2xl">
      <div className="border-b border-white/5 px-6 py-5 bg-white/[0.02]">
        <h3 className="text-sm font-bold tracking-tight text-white/90 uppercase opacity-60">Action center</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">Título</th>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">BU</th>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">Prazo</th>
              <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-4 text-center font-semibold text-[11px] uppercase tracking-wider">Biofonia</th>
              <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono text-[11px] text-indigo-400/80">{item.type}</td>
                <td className="px-6 py-4 font-medium text-white/80">{item.title}</td>
                <td className="px-6 py-4 text-slate-400">{item.businessUnit ?? "—"}</td>
                <td className="px-6 py-4 text-slate-300 font-medium">{item.ownerName ?? "—"}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{item.dueDate ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-sm border border-white/5 ${badgeMap[item.priority]}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.voicePath ? (
                    <button 
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voice-assessments/${item.voicePath}`, '_blank')}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-400/20"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Ouvir Fadiga
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                    onClick={async () => {
                      const res = await getAssessmentInviteAction(item.employeeId);
                      if (res.success && res.token) {
                        const url = `${window.location.origin}/assessment/${res.token}`;
                        navigator.clipboard.writeText(url);
                        alert("Link de convite SEGURO copiado!");
                      } else {
                        alert("Erro ao gerar convite seguro.");
                      }
                    }}
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                   >
                    <UserPlus className="h-3 w-3" />
                    Gerar Convite
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
