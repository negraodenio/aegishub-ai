"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  RefreshCw,
  Layers,
  Play,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  CognitiveUnstuckSessionContext,
  createInitialSessionContext,
  UnstuckQuickAction,
  getQuickActionContextSeed
} from "@mindops/ai-core";

interface Message {
  role: "user" | "assistant";
  content: string;
  nextAction?: string | null;
  suggestedTimerSeconds?: 300 | 600 | 1500 | null;
  confidence?: "low" | "medium" | "high";
}

interface CognitiveAIChatProps {
  tenantId: string;
  selectedTask?: { id?: string; title: string } | null;
}

export const OPEN_COGNITIVE_CHAT_EVENT = "cognitive:open-chat";
export const START_COGNITIVE_TIMER_EVENT = "cognitive:start-timer";

export function CognitiveAIChat({ tenantId, selectedTask }: CognitiveAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<CognitiveUnstuckSessionContext>(() =>
    createInitialSessionContext({ selectedTask: selectedTask || null })
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou seu assistente de clareza e foco. Diga-me no que você está travado agora e vamos encontrar um primeiro passo prático de até 2 minutos."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincroniza tarefa selecionada no workspace com o contexto da sessão
  useEffect(() => {
    if (selectedTask) {
      setContext((prev) => ({ ...prev, selectedTask }));
    }
  }, [selectedTask]);

  // Escuta o evento global 'cognitive:open-chat' para abertura a partir de qualquer componente
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_COGNITIVE_CHAT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_COGNITIVE_CHAT_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendQuery = async (queryText: string, updatedCtx?: Partial<CognitiveUnstuckSessionContext>) => {
    if (!queryText.trim() || loading) return;

    const outgoingContext: CognitiveUnstuckSessionContext = {
      ...context,
      ...(updatedCtx || {})
    };

    setMessages((prev) => [...prev, { role: "user", content: queryText.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/cognitive/chief/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          message: queryText.trim(),
          context: outgoingContext,
          language: "pt"
        })
      });

      const data = await res.json();
      if (res.ok && data.response) {
        if (data.context) {
          setContext(data.context);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            nextAction: data.nextAction || null,
            suggestedTimerSeconds: data.suggestedTimerSeconds || null,
            confidence: data.context?.nextActionConfidence || "medium"
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Não foi possível processar no momento. Tente uma mensagem mais curta."
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sem conexão no momento. Respire fundo e tente novamente em instantes."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendQuery(input);
  };

  const handleQuickAction = (action: UnstuckQuickAction) => {
    const seed = getQuickActionContextSeed(action, selectedTask);
    const labelMap: Record<UnstuckQuickAction, string> = {
      overwhelmed: "Estou sobrecarregado com muitas coisas ao mesmo tempo.",
      next_step: selectedTask ? `Qual é o próximo passo para: ${selectedTask.title}?` : "Qual é o menor próximo passo para começar?",
      lost_context: "Fui interrompido e perdi o contexto da minha tarefa.",
      break_down: selectedTask ? `Ajude a dividir esta tarefa: ${selectedTask.title}` : "Como posso dividir esta tarefa grande em partes menores?"
    };

    sendQuery(labelMap[action], seed);
  };

  const handleStartTimer = (seconds: number, goalAction?: string | null) => {
    const goal = goalAction || context.nextAction || selectedTask?.title || "Sessão de foco";
    window.dispatchEvent(
      new CustomEvent(START_COGNITIVE_TIMER_EVENT, {
        detail: { durationSeconds: seconds, goal }
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `🎯 Timer de ${seconds / 60} minutos iniciado no workspace para: "${goal}". Mantenha o foco apenas nesta etapa!`
      }
    ]);
  };

  const handleAcknowledgeAction = () => {
    setContext((prev) => ({
      ...prev,
      conversationState: "ACKNOWLEDGE",
      nextAction: null
    }));

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Excelente! Você movimentou o primeiro passo. Deseja definir a próxima micro-etapa ou iniciar um bloco de foco?"
      }
    ]);
  };

  return (
    <>
      {/* Botão Flutuante de Abertura */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-2xl shadow-cyan-500/30 flex items-center gap-2 transition hover:scale-105"
          title="Abrir Assistente de Desbloqueio"
        >
          <Bot className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Desbloquear Foco</span>
        </button>
      )}

      {/* Janela Modal do Chat (Session-only) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assistente de Desbloqueio</h3>
                <p className="text-[10px] text-neutral-400">Foco em ação imediata • Zero enrolação</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-3 py-2 border-b border-white/5 bg-black/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleQuickAction("overwhelmed")}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-neutral-300 border border-white/10 whitespace-nowrap flex items-center gap-1 transition"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Sobrecarregado</span>
            </button>
            <button
              onClick={() => handleQuickAction("next_step")}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-neutral-300 border border-white/10 whitespace-nowrap flex items-center gap-1 transition"
            >
              <Target className="h-3 w-3 text-emerald-400" />
              <span>Próximo Passo</span>
            </button>
            <button
              onClick={() => handleQuickAction("lost_context")}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-neutral-300 border border-white/10 whitespace-nowrap flex items-center gap-1 transition"
            >
              <RefreshCw className="h-3 w-3 text-cyan-400" />
              <span>Perdi Contexto</span>
            </button>
            <button
              onClick={() => handleQuickAction("break_down")}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-neutral-300 border border-white/10 whitespace-nowrap flex items-center gap-1 transition"
            >
              <Layers className="h-3 w-3 text-indigo-400" />
              <span>Dividir Tarefa</span>
            </button>
          </div>

          {/* Mensagens & Next Action Block (Session-only) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-500 text-black font-medium rounded-br-none shadow-md shadow-cyan-500/10"
                      : "bg-white/[0.04] text-neutral-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>

                {/* ⚡ Card de Destaque "NEXT ACTION" */}
                {m.nextAction && (
                  <div className="mt-2 w-[90%] p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 text-white space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> PRÓXIMO PASSO IMEDIATO (≤ 2 MIN)
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Ação Física
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-neutral-100 leading-snug">
                      {m.nextAction}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => handleStartTimer(300, m.nextAction)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                      >
                        <Play className="h-3 w-3 fill-black" />
                        <span>Foco 5m</span>
                      </button>
                      <button
                        onClick={() => handleStartTimer(600, m.nextAction)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-[11px] flex items-center gap-1 transition"
                      >
                        <Clock className="h-3 w-3" />
                        <span>10m</span>
                      </button>
                      <button
                        onClick={handleAcknowledgeAction}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-[11px] flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                        <span>Feito</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-bl-none bg-white/[0.04] border border-white/10 flex items-center gap-1.5 text-neutral-400">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  <span>Extraindo o menor próximo passo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer Não Clínico */}
          <div className="px-4 py-2 bg-white/[0.01] border-t border-white/5 text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>Sessão temporária e confidencial. Não substitui avaliação profissional.</span>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0a0a0a] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Estou travado em..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
