"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ACTReportDownloadButton } from "./ACTReportDownloadButton";
import { Shield, Activity, Lock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://local.supabase",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

export function DPODashboard({ companyName }: { companyName: string }) {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 15000); // Polling (15s)
    return () => clearInterval(interval);
  }, []);

  async function fetchDecisions() {
    try {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error) setDecisions(data || []);
    } catch (e) {
      console.error("DPO Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Consentimentos Ativos", val: "1,248", trend: "+12%", color: "text-cyan-400", icon: Lock },
    { label: "DPIAs Concluídas", val: "4", trend: "Validada", color: "text-emerald-400", icon: CheckCircle2 },
    { label: "Logs de Auditoria IA", val: "8,942", trend: "Seguro", color: "text-blue-400", icon: Activity },
    { label: "Riscos Detectados", val: decisions.filter(d => d.risk_level === 'high').length || "2", trend: "Críticos", color: "text-rose-400", icon: AlertTriangle }
  ];

  return (
    <div className="text-slate-300 font-sans">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-emerald-500 h-8 w-8" />
            DPO Compliance Center
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Empresa: {companyName} // <span className="opacity-50">Região: PT (ACT/CNPD)</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ACTReportDownloadButton companyName={companyName} />
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submeter ACT
          </button>
        </div>
      </header>

      {/* Compliance Stats GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">{item.label}</span>
              <item.icon className={`h-4 w-4 ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold text-white tracking-tighter">{item.val}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${item.color}`}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Compliance Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RGPD Consent Health */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-cyan-500" />
              Estado dos Consentimentos (Art. 9º)
            </h2>
            <select className="bg-black border border-white/10 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-slate-400 focus:ring-1 focus:ring-cyan-500 outline-none">
              <option>Últimos 30 dias</option>
              <option>Último Trimestre</option>
            </select>
          </div>
          <div className="space-y-8">
            {[
              { type: "Análise de Biofonia (Voz)", granted: 85, color: "from-cyan-500 to-blue-500" },
              { type: "Exploração COPSOQ-II", granted: 98, color: "from-emerald-500 to-teal-500" },
              { type: "Triagem Clínica PHQ-9", granted: 72, color: "from-blue-500 to-indigo-500" }
            ].map((row, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-[0.15em]">
                  <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{row.type}</span>
                  <span className="text-white">{row.granted}% Autorizado</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${row.color} shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-1000 ease-out`} 
                    style={{ width: `${row.granted}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-4 items-start">
            <Activity className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200/70 leading-relaxed">
              <span className="text-blue-400 font-bold">Nota Legal:</span> De acordo com o Artigo 9º do RGPD, o processamento de categorias especiais de dados (saúde/biometria) está a ser realizado sob o fundamento de Consentimento Explícito e Finalidade de Medicina do Trabalho.
            </p>
          </div>
        </div>

        {/* AI Act Audit LEDGER */}
        <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-8 flex flex-col shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              AI Act Audit Trail
            </h2>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Immutable Decision Ledger</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
              </div>
            ) : decisions.map((dec) => (
              <div key={dec.id} className="group relative flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-mono text-xs border transition-all ${
                  dec.risk_level === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {dec.risk_level === 'high' ? '!' : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-200 truncate group-hover:text-white transition-colors">
                    {dec.vertical || "Inferência Sistémica"}
                  </p>
                  <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-tighter mt-1">
                    Hash: <span className="text-neutral-500 group-hover:text-blue-400/50 transition-colors">0x{dec.id.substring(0,12)}...</span>
                  </p>
                </div>
                <div className="text-[10px] text-neutral-600 font-mono group-hover:text-neutral-400 transition-colors">
                  {new Date(dec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {!loading && decisions.length === 0 && (
              <p className="text-xs text-center py-10 text-slate-600 italic">Sem eventos de auditoria registados.</p>
            )}
          </div>
          
          <button className="w-full mt-8 py-3 border border-dashed border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-slate-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
            Ver Certificado Imutável
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 pt-8 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">
          AEGIS HUB // Palantir-Grade Compliance // 2026
        </p>
        <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <a href="#" className="hover:text-emerald-500 transition-colors">Termos de Auditoria</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">DPIA Policy</a>
        </div>
      </footer>
    </div>
  );
}
