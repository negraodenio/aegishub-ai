"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, AlertTriangle, Loader2, Phone, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSOSSession, sendSOSMessage } from "../../../app/sos/actions";

export function SOSChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'ai' | 'user' | 'human', content: string}[]>([
    { role: 'ai', content: 'Iniciando Triagem SOS Especializada (M2.7). Estamos aqui para acolher.' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  // Initialize session on first open
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSOSSession().then(res => {
        if (res.success && res.sessionId) setSessionId(res.sessionId);
      });
    }
  }, [isOpen, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !hasConsented) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendSOSMessage(sessionId, userMsg, "anonymous");
      if (res.success && res.response) {
        setMessages(prev => [...prev, { role: 'ai', content: res.response as string }]);
        if (res.escalated) setIsEscalated(true);
      }
    } catch (err) {
      console.error("SOS Chat Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white shadow-2xl transition-all hover:bg-rose-700 hover:scale-110 active:scale-95 group overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-8 w-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative flex items-center justify-center">
              {isEscalated && (
                <span className="absolute inset-0 block animate-ping rounded-full bg-rose-400 opacity-75" />
              )}
              <AlertTriangle className={`relative h-8 w-8 ${isEscalated ? 'animate-pulse' : ''}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* SOS Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 flex h-[550px] w-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-rose-600/20 px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">SOS Intervenção Enterprise</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isEscalated ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">
                      {isEscalated ? 'Escalado para Humano (T1)' : 'Triagem Ativa via IA M2.7'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Overlay */}
            {!hasConsented && (
              <div className="absolute inset-x-0 bottom-0 top-[72px] z-10 bg-slate-900/95 p-8 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-md">
                <AlertTriangle className="h-12 w-12 text-rose-500 animate-pulse" />
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Aviso de Segurança Crítico</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Este sistema fornece triagem inicial automatizada e intervenção assistida. 
                    <span className="text-rose-400 font-bold"> Não substitui apoio médico ou psicológico hospitalar.</span>
                  </p>
                  <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-widest px-2">
                       <span>Emergência</span>
                       <span className="text-rose-500">112</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-widest px-2">
                       <span>Linha SNS 24</span>
                       <span className="text-indigo-400">808 24 24 24</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setHasConsented(true)}
                  className="w-full bg-rose-600 text-white rounded-2xl py-4 text-sm font-bold shadow-xl hover:bg-rose-500 transition-all active:scale-95"
                >
                  Compreendo e Desejo Continuar
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="relative">
                <input
                  value={input}
                  disabled={!hasConsented || isEscalated}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isEscalated ? "Suporte Humano Ativado..." : "Escreva como se sente..."}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!hasConsented || isEscalated}
                  className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
