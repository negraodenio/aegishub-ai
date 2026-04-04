"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function RHDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🔴 Fatal Dashboard Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 blur-3xl bg-red-500/10 rounded-full" />
        <div className="relative h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-white mb-4">
        Falha Crítica no Dashboard
      </h1>
      
      <p className="max-w-md text-slate-400 text-lg leading-relaxed mb-12">
        Não foi possível carregar as informações do setor de RH. 
        Isto pode ocorrer devido a uma falha na ligação com o Supabase ou tempo de resposta excedido dos modelos de IA.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          <RefreshCcw className="h-5 w-5" />
          Tentar novamente
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-slate-300 font-bold rounded-2xl border border-white/5 hover:bg-slate-700 transition-all active:scale-95"
        >
          <Home className="h-5 w-5" />
          Voltar ao início
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-sm">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-600 mb-2">Error ID</p>
        <code className="text-[10px] text-slate-500 font-mono bg-white/5 px-3 py-1.5 rounded-full select-all">
          {error.digest || "SYSTEM_RUNTIME_ERR_0X2"}
        </code>
      </div>
    </main>
  );
}
