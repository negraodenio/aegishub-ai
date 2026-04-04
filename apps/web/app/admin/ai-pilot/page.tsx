import { AutoOptDashboard } from "../../../features/compliance/components/AutoOptDashboard";
import { Cpu } from "lucide-react";

export default function AIPilotPage() {
  return (
    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-emerald-500 h-6 w-6 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Cérebro IA <span className="text-emerald-500">M2.7</span>
            </h1>
          </div>
          <p className="text-sm text-neutral-500 font-medium">
            Monitorização de Inferno e Auto-Otimização em Tempo Real. 
            <span className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase tracking-tighter border border-emerald-500/20">
              ● Learning Mode
            </span>
          </p>
        </header>

        {/* Console de Otimização */}
        <AutoOptDashboard />

      </div>
    </div>
  );
}
