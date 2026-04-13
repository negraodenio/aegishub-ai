"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ShieldCheck, ChevronRight, Hash, ArrowRight } from "lucide-react";

export default function AssessmentGatewayPage() {
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      router.push(`/assessment/${token.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* 🌌 Animated Intelligence Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#020202] to-[#020202]" />

      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-emerald-500/10 blur-[150px]" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* 🛡️ Header */}
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-8 cursor-pointer"
          >
             <BrainCircuit className="h-11 w-11 text-black" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-center">
            Portal de <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Avaliação Clínica</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 text-neutral-500 text-xs font-bold uppercase tracking-[0.3em]">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Gateway de Integridade Biovocal Ativa</span>
          </div>
        </div>

        {/* 💎 Entry Card */}
        <div className="rounded-[44px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <p className="text-sm text-neutral-400 text-center leading-relaxed mb-10">
            Cada link de avaliação é único e encriptado. Se recebeu um código de acesso da sua organização, introduza-o abaixo.
          </p>

          <form onSubmit={handleManualToken} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] ml-2">Token de Acesso</label>
              <div className="relative group/input">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-emerald-400 transition-colors duration-300" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="EX: ACME-RH-2026"
                  className="w-full h-16 rounded-3xl bg-black/40 border border-white/5 pl-12 pr-5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all duration-300 placeholder:text-neutral-800"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!token}
              className="w-full h-16 rounded-3xl bg-neutral-900 border border-white/10 font-black text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
              VALIDAR CREDENCIAL <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
             <button 
               onClick={() => router.push('/assessment/DEMO-PARTNER')}
               className="w-full h-16 rounded-3xl bg-emerald-500 font-black text-black hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
             >
               INICIAR MODO DEMO <ChevronRight className="h-5 w-5" />
             </button>
             <p className="mt-6 text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Acesso de Demonstração para Parceiros & SST</p>
          </div>
        </div>

        {/* 🔗 Footer Support */}
        <div className="mt-10 text-center">
           <p className="text-[9px] text-neutral-700 leading-relaxed tracking-wider uppercase">
             A AEGIS HUB cumpre integralmente o EU AI Act Art. 52 (Transparência) e Art. 9 (Gestão de Risco). 
             A sua identidade vocal é processada e anonimizada em tempo real (Scrubbing Ativo).
           </p>
        </div>
      </motion.div>
    </div>
  );
}
