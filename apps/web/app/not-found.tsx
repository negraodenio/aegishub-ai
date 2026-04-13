"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, ChevronLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* 🌌 Background Elements */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#020202] to-[#020202]" />

      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[800px] w-[800px] rounded-full bg-rose-500/5 blur-[120px]" 
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="h-24 w-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="h-12 w-12 text-rose-500" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl font-black tracking-tighter italic uppercase mb-4"
        >
          404 <span className="text-neutral-600 block text-2xl not-italic font-light tracking-widest mt-2 uppercase">Protocolo Interrompido</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-neutral-500 text-sm tracking-wide leading-relaxed mb-12 uppercase font-bold max-w-md"
        >
          O recurso que tentou aceder não foi localizado no tensor space da AEGIS HUB ou o acesso foi revogado por motivos de integridade algorítmica.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/">
            <button className="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3">
              <ChevronLeft className="h-4 w-4" />
              Retornar à Base
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="h-14 px-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase text-xs tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-3">
              <BrainCircuit className="h-4 w-4" />
              Intelligence Login
            </button>
          </Link>
        </motion.div>

        <div className="mt-20 flex items-center gap-3 grayscale opacity-30">
           <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500">
             System Error Log // Code 0x8F404
           </span>
        </div>
      </div>
    </div>
  );
}
