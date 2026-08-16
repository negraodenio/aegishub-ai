"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, ShieldCheck } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CognitiveAIChatProps {
  tenantId: string;
}

export const OPEN_COGNITIVE_CHAT_EVENT = "cognitive:open-chat";

export function CognitiveAIChat({ tenantId }: CognitiveAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de apoio executivo e foco. Diga-me no que está travado agora e vou sugerir um primeiro passo prático e simples."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/cognitive/chief/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          message: userMessage,
          language: "pt"
        })
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
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
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assistente de Desbloqueio</h3>
                <p className="text-[10px] text-neutral-400">Apoio executivo e clareza de tarefas</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mensagens (Session-only) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-500 text-black font-medium rounded-br-none shadow-md shadow-cyan-500/10"
                      : "bg-white/[0.04] text-neutral-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-bl-none bg-white/[0.04] border border-white/10 flex items-center gap-1.5 text-neutral-400">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                  <span>Encontrando o melhor próximo passo...</span>
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
