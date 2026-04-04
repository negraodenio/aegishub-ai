"use client";

import Link from "next/link";
import { useState } from "react";
import { BrainCircuit, ChevronRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => (window.location.href = "/rh"), 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-[440px] relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 group cursor-pointer hover:scale-110 transition-transform">
             <BrainCircuit className="h-7 w-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo ao MindOps</h1>
          <p className="text-sm text-neutral-500 mt-2 text-center">
            Acesso exclusivo para Gestores de RH e Profissionais de SST.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@empresa.pt"
                  required
                  className="w-full h-12 rounded-xl bg-white/[0.05] border border-white/5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider" htmlFor="password">
                  Palavra-passe
                </label>
                <Link href="#" className="text-[10px] text-neutral-500 hover:text-emerald-400 transition-colors">Esqueceu-se?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-12 rounded-xl bg-white/[0.05] border border-white/5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-[10px] text-neutral-600 leading-relaxed uppercase tracking-tighter">
              Este sistema utiliza criptografia de grau militar e cumpre integralmente a lei 102/2009 (SST) e o RGPD. O acesso não autorizado é punível por lei.
            </p>
          </div>
        </div>

        {/* Support */}
        <p className="mt-8 text-center text-xs text-neutral-500">
          Não tem acesso? <Link href="#" className="text-emerald-400 font-semibold hover:underline">Contacte o suporte da sua empresa.</Link>
        </p>
      </div>
    </div>
  );
}
