"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Zap, Flame, Brain, CheckCircle2, Clock } from "lucide-react";

interface FocusTimerProps {
  tenantId: string;
  onSessionComplete?: (durationSeconds: number) => void;
}

const PRESETS = [
  { label: "5m", value: 5 * 60, icon: Zap, color: "text-amber-400 border-amber-400/30 bg-amber-500/10" },
  { label: "10m", value: 10 * 60, icon: Flame, color: "text-orange-400 border-orange-400/30 bg-orange-500/10" },
  { label: "25m", value: 25 * 60, icon: Brain, color: "text-cyan-400 border-cyan-400/30 bg-cyan-500/10" },
  { label: "50m", value: 50 * 60, icon: Clock, color: "text-indigo-400 border-indigo-400/30 bg-indigo-500/10" },
];

export function FocusTimer({ tenantId, onSessionComplete }: FocusTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [goal, setGoal] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pingIntervalRef = useRef<any>(null);

  // Countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleCompleteSession(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  // Keep-alive ping a cada 15 segundos
  useEffect(() => {
    if (isRunning && currentSessionId) {
      pingIntervalRef.current = setInterval(async () => {
        try {
          await fetch("/api/cognitive/focus/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSessionId,
              durationActualSeconds: elapsedSeconds
            })
          });
        } catch {
          // Non-blocking ping failure
        }
      }, 15000);
    } else {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    }
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [isRunning, currentSessionId, elapsedSeconds]);

  const handleStartSession = async () => {
    if (!goal.trim()) return;

    try {
      const res = await fetch("/api/cognitive/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          goal,
          durationPresetSeconds: selectedDuration
        })
      });

      const data = await res.json();
      if (res.ok && data.session?.id) {
        setCurrentSessionId(data.session.id);
        setSecondsLeft(selectedDuration);
        setElapsedSeconds(0);
        setIsRunning(true);
      }
    } catch {
      // Fallback local se offline
      setIsRunning(true);
    }
  };

  const handleCompleteSession = async (completed: boolean = true) => {
    setIsRunning(false);
    const finalDuration = elapsedSeconds;

    if (currentSessionId) {
      try {
        await fetch("/api/cognitive/focus/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            durationActualSeconds: finalDuration,
            completed,
            tenantId
          })
        });
      } catch {
        // Non-blocking
      }
    }

    if (onSessionComplete) {
      onSessionComplete(finalDuration);
    }

    setCurrentSessionId(null);
    setGoal("");
    setSecondsLeft(selectedDuration);
    setElapsedSeconds(0);
  };

  const handleReset = () => {
    if (isRunning && currentSessionId) {
      handleCompleteSession(false);
    } else {
      setIsRunning(false);
      setSecondsLeft(selectedDuration);
      setElapsedSeconds(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          Sessão de Foco Pessoal
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isRunning
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse"
              : "bg-white/5 text-neutral-400 border border-white/10"
          }`}
        >
          {isRunning ? "Em Andamento" : "Pronto"}
        </span>
      </div>

      {/* Timer Grande */}
      <div className="text-center py-4">
        <span className="text-6xl md:text-7xl font-black tracking-tight font-mono text-white">
          {formatTime(secondsLeft)}
        </span>
      </div>

      {/* Presets de Duração (Apenas visíveis quando parado) */}
      {!isRunning && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedDuration === preset.value;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSelectedDuration(preset.value);
                    setSecondsLeft(preset.value);
                  }}
                  className={`py-2 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? preset.color
                      : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {preset.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500 text-center">
            Dica: 5 minutos é o tempo ideal para quebrar a resistência inicial quando a energia está baixa.
          </p>
        </div>
      )}

      {/* Campo de Objetivo / Missão Única */}
      {!isRunning ? (
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Sua única tarefa para esta sessão
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ex: Escrever os tópicos principais da apresentação"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Missão Atual</p>
          <p className="text-sm font-bold text-white">{goal}</p>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStartSession}
            disabled={!goal.trim()}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-lg shadow-cyan-500/20"
          >
            <Play className="h-4 w-4" />
            {!goal.trim() ? "Nomeie a Tarefa para Começar" : "Iniciar Sessão de Foco"}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleCompleteSession(true)}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir Sessão
            </button>
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
              title="Cancelar Sessão"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
