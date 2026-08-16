"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Clock, CheckCircle2, RotateCcw, Sparkles, TrendingUp } from "lucide-react";

interface CognitiveWeeklyProgressProps {
  initialStats?: any;
}

export function CognitiveWeeklyProgress({ initialStats }: CognitiveWeeklyProgressProps) {
  const [stats, setStats] = useState<any>(initialStats || null);
  const [loading, setLoading] = useState<boolean>(!initialStats);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/cognitive/stats/weekly");
        const data = await res.json();
        if (res.ok && data.stats) {
          setStats(data.stats);
        }
      } catch {
        // Non-blocking
      } finally {
        setLoading(false);
      }
    }

    if (!initialStats) {
      loadStats();
    }
  }, [initialStats]);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
          <div className="h-20 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Evidência de Avanço Pessoal
          </span>
          <h3 className="text-sm font-bold text-white">Progresso Semanal Comparativo</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <TrendingUp className="h-3 w-3" />
          Semana Atual vs Anterior
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Vitórias de Foco */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Vitórias de Foco
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats.focusWins?.current || 0}
          </p>
          <p className="text-[10px] text-neutral-500">
            Semana passada: {stats.focusWins?.last || 0}
          </p>
        </div>

        {/* Horas de Foco */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Tempo em Foco
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats.focusTimeHours?.current || 0}h
          </p>
          <p className="text-[10px] text-neutral-500">
            Semana passada: {stats.focusTimeHours?.last || 0}h
          </p>
        </div>

        {/* Resets de Bloqueio */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
              Resets de Foco
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats.stuckResets?.current || 0}
          </p>
          <p className="text-[10px] text-neutral-500">
            Semana passada: {stats.stuckResets?.last || 0}
          </p>
        </div>

        {/* Micro-Vitórias */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Micro-Ações (10s)
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats.microWins?.current || 0}
          </p>
          <p className="text-[10px] text-neutral-500">
            Semana passada: {stats.microWins?.last || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
