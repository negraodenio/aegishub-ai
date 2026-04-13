"use client";

import { motion } from "framer-motion";
import { ShieldAlert, MessageSquareWarning, LifeBuoy, Fingerprint, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SOSPortalPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* 🌌 Neural Background */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f43f5e 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#050505] to-[#050505]" />

      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-rose-500/10 blur-[150px]" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[800px] relative z-10"
      >
        <div className="text-center mb-16">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex h-20 w-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.1)] mb-8"
          >
             <ShieldAlert className="h-10 w-10 text-rose-500" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">
            Canal de <span className="text-rose-500">Integridade</span> & Apoio
          </h1>
          <p className="mt-4 text-neutral-500 text-sm font-bold uppercase tracking-[0.4em]">
            Protocolo de Proteção Ativa AEGIS HUB
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 🆘 SOS Crisis Support */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="group rounded-[40px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-8 group-hover:bg-rose-500/20 transition-colors">
               <LifeBuoy className="h-7 w-7 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Apoio em Crise (SOS)</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              Sente-se sobrecarregado ou em situação de risco psicológico imediato? A nossa IA M2.7 fará a triagem e notificará um profissional de saúde.
            </p>
            <Link href="/sos/crisis">
               <button className="w-full h-14 rounded-2xl bg-rose-500 font-black text-black text-xs tracking-widest uppercase hover:bg-rose-400 transition-all flex items-center justify-center gap-3">
                 Obter Ajuda Agora <ArrowRight className="h-4 w-4" />
               </button>
            </Link>
          </motion.div>

          {/* 🕵️ Anonymous Reporting (Denúncia) */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="group rounded-[40px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl hover:border-emerald-500/20 transition-all cursor-pointer"
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 group-hover:bg-emerald-500/20 transition-colors">
               <MessageSquareWarning className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Canal de Denúncia</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              Relate irregularidades ou violações de integridade de forma 100% anónima e cifrada, em conformidade com a Lei 93/2021.
            </p>
            <Link href="/sos/report">
               <button className="w-full h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs tracking-widest uppercase hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-3">
                 Submeter Relato <ArrowRight className="h-4 w-4" />
               </button>
            </Link>
          </motion.div>
        </div>

        {/* 🔐 Security Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-12 border-t border-white/5 pt-12 opacity-40 grayscale group-hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Zero Knowledge Arch</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Lei 93/2021 Compliant</span>
          </div>
        </div>

        <p className="mt-16 text-center text-[10px] text-neutral-600 uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
          AEGIS HUB SOS: Todas as submissões são monitorizadas pela Camada de Triagem M2.7 para garantir tempos de resposta (SLA) inferiores a 15 minutos em eventos de alto risco.
        </p>
      </motion.div>
    </div>
  );
}
