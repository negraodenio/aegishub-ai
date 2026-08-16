"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Wind, Sparkles, ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { OPEN_COGNITIVE_CHAT_EVENT } from "./CognitiveAIChat";

interface CognitiveStuckFlowProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onResetRecorded?: () => void;
}

export function CognitiveStuckFlow({
  tenantId,
  isOpen,
  onClose,
  onResetRecorded
}: CognitiveStuckFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Registro inicial do evento de travamento
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCountdown(null);
      setSelectedReason(null);

      fetch("/api/cognitive/stuck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          eventType: "stuck_triggered",
          step: 1
        })
      }).catch(() => {});
    }
  }, [isOpen, tenantId]);

  // Countdown de 10 segundos para a Micro Win
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);
        setStep(4);
        if (onResetRecorded) onResetRecorded();

        fetch("/api/cognitive/stuck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            eventType: "micro_action_completed",
            step: 4
          })
        }).catch(() => {});
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onResetRecorded, tenantId]);

  const handleSelectReason = (reason: "overwhelm" | "distraction" | "low_energy") => {
    setSelectedReason(reason);
    setStep(3);

    fetch("/api/cognitive/stuck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        eventType: "stuck_category_selected",
        category: reason,
        step: 2
      })
    }).catch(() => {});
  };

  const handleStartMicroAction = () => {
    setCountdown(10);

    fetch("/api/cognitive/stuck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        eventType: "micro_action_started",
        step: 3
      })
    }).catch(() => {});
  };

  const handleTalkToAssistant = () => {
    onClose();
    window.dispatchEvent(new Event(OPEN_COGNITIVE_CHAT_EVENT));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: RESPIRAÇÃO EM CAIXA (BOX BREATHING 4-4-4-4) */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                Pausa Consciente
              </span>
              <h3 className="text-xl font-bold text-white">Desacelere o Ritmo</h3>
              <p className="text-xs text-neutral-400">
                Apenas 1 minuto de pausa ajuda a restaurar a atenção.
              </p>
            </div>

            {/* Animação de Respiração */}
            <div className="py-6 flex items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping opacity-60" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500 text-black font-black text-lg shadow-xl shadow-cyan-500/30 animate-pulse">
                  4-4-4-4
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-neutral-300">
              <p className="font-semibold text-white">Inspire... Segure... Expire... Segure...</p>
              <p className="text-[11px] text-neutral-500">Siga um ritmo calmo e compassado.</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20"
            >
              Estou Pronto para Identificar o Bloqueio
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: IDENTIFICAR O BLOQUEIO */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                Identificação Funcional
              </span>
              <h3 className="text-xl font-bold text-white">O que está travando agora?</h3>
              <p className="text-xs text-neutral-400">
                Reconhecer o tipo de resistência torna mais fácil escolher o próximo passo.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectReason("overwhelm")}
                className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-cyan-500/30 text-left transition flex items-center gap-4 group"
              >
                <div className="text-2xl">📋</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-cyan-300">Sobrecarga de Informação</p>
                  <p className="text-[11px] text-neutral-500">Muitas frentes abertas ao mesmo tempo.</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectReason("distraction")}
                className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-cyan-500/30 text-left transition flex items-center gap-4 group"
              >
                <div className="text-2xl">🎯</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-cyan-300">Dificuldade de Direcionamento</p>
                  <p className="text-[11px] text-neutral-500">Atenção fragmentada por estímulos externos.</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectReason("low_energy")}
                className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-cyan-500/30 text-left transition flex items-center gap-4 group"
              >
                <div className="text-2xl">🔋</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-cyan-300">Energia em Baixa</p>
                  <p className="text-[11px] text-neutral-500">Cansaço no momento para tarefas longas.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MICRO WIN (COUNTDOWN 10S) */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Uma Pequena Ação
              </span>
              <h3 className="text-xl font-bold text-white">Micro-Vitória de 10 Segundos</h3>
              <p className="text-xs text-neutral-400">
                Sem pressão de concluir o todo. Apenas dê o primeiro movimento prático.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 font-medium">
              "Apenas abra o documento ou arquivo da tarefa. Só isso."
            </div>

            {countdown === null ? (
              <button
                onClick={handleStartMicroAction}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm tracking-wide transition shadow-lg shadow-emerald-500/20"
              >
                COMEÇAR 10s AGORA
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-5xl font-black font-mono text-emerald-400 tabular-nums animate-pulse">
                  {countdown}
                </div>
                <p className="text-xs text-neutral-400">
                  Faça o menor movimento agora. Apenas os primeiros 10 segundos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: CONCLUÍDO / ACKNOWLEDGED */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Reset Concluído
              </span>
              <h3 className="text-xl font-bold text-white">Você deu o primeiro passo!</h3>
              <p className="text-xs text-neutral-400">
                Este movimento foi contabilizado no seu painel de progresso semanal.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleTalkToAssistant}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20"
              >
                <MessageSquare className="h-4 w-4" />
                Ainda pesado? Falar com o Assistente
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs transition"
              >
                Pronto por Agora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
