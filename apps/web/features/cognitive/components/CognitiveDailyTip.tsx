"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Lightbulb, RefreshCw, MessageSquare, X, Sparkles } from "lucide-react";
import { OPEN_COGNITIVE_CHAT_EVENT } from "./CognitiveAIChat";

interface CognitiveDailyTipProps {
  language?: string;
}

export function CognitiveDailyTip({ language = "pt" }: CognitiveDailyTipProps) {
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const fetchTip = useCallback(
    async (forceRefresh: boolean = false) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cognitive/chief/tip?lang=${language}&refresh=${forceRefresh}`);
        const data = await res.json();
        if (res.ok && data.tip) {
          setTip(data.tip);
        } else {
          setTip("Divida a tarefa mais complexa do seu dia em 3 blocos de 10 minutos. O primeiro passo é apenas abrir o arquivo.");
        }
      } catch {
        setTip("Começar pelo passo menor reduz a resistência inicial. Uma ação simples desbloqueia o ritmo de trabalho.");
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  useEffect(() => {
    fetchTip(false);
  }, [fetchTip]);

  const handleAskAssistant = () => {
    window.dispatchEvent(new Event(OPEN_COGNITIVE_CHAT_EVENT));
  };

  if (dismissed) return null;

  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-cyan-500/20 relative overflow-hidden space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Dica de Foco Diária
            </span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed italic">
            {loading ? "Carregando dica prática para hoje..." : `"${tip}"`}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white transition"
          title="Fechar dica"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => fetchTip(true)}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-[11px] flex items-center gap-1.5 transition disabled:opacity-40"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Outra Dica
        </button>
        <button
          onClick={handleAskAssistant}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1.5 transition"
        >
          <MessageSquare className="h-3 w-3" />
          Falar com o Assistente
        </button>
      </div>
    </div>
  );
}
