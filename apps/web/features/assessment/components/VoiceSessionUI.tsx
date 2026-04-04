"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";

interface VoiceSessionUIProps {
  employeeId: string;
  onComplete: (audioPath?: string) => void;
}

export function VoiceSessionUI({ employeeId, onComplete }: VoiceSessionUIProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsUploading(true);
        try {
          const supabase = createClient();
          const fileName = `vocal-fatigue-${employeeId}-${Date.now()}.webm`;
          const filePath = `${employeeId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from("voice-assessments")
            .upload(filePath, blob);

          if (uploadError) throw uploadError;
          
          setAudioPath(filePath);
          setIsFinished(true);
        } catch (err) {
          console.error("Erro no upload da biofonia:", err);
          alert("Falha ao salvar amostra de voz. O sistema prosseguirá sem áudio.");
          setIsFinished(true);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setProgress(0);
    } catch (err) {
      console.error("Falha ao aceder ao microfone:", err);
      alert("Erro ao aceder ao microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            stopRecording();
            return 100;
          }
          return p + 0.5; // Aproximadamente 20 segundos
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onComplete(audioPath || undefined);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFinished, audioPath, onComplete]);

  return (
    <main className="flex min-h-[600px] flex-col items-center justify-center rounded-3xl border border-black/5 bg-[#fcfbf9] px-6 py-12 shadow-inner">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Monitorização de Fadiga Vocal</h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-500">
          Grave um áudio de 15 segundos para análise ergonómica de fadiga vocal ocupacional. 
          Este sistema <strong>não realiza reconhecimento de emoções</strong>. 
          Privacidade auditiva MindOps.
        </p>

        {/* Dynamic Voice Visualizer (Simulation) */}
        <div className="relative mt-12 flex h-48 w-full items-center justify-center gap-1 overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-30">
            <span className="text-xs font-mono text-emerald-400">REC: {progress}%</span>
          </div>
          
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording ? "bg-emerald-500" : "bg-neutral-800"
              }`}
              style={{
                height: isRecording ? `${20 + Math.random() * 60}%` : "10%",
                opacity: isRecording ? 0.4 + Math.random() * 0.6 : 0.2
              }}
            />
          ))}

          {/* Glowing Aura when recording */}
          {isRecording && (
            <div className="absolute h-32 w-32 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          {isFinished ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-lg scale-110 animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          ) : (
            <button
              disabled={isUploading}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-offset-2 transition-all active:scale-90 ${
                isRecording 
                  ? "bg-rose-500 ring-rose-500/50 hover:bg-rose-600 animate-pulse" 
                  : "bg-emerald-500 ring-emerald-500/50 hover:bg-emerald-600 ring-4"
              }`}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : isRecording ? (
                <Square className="h-8 w-8 text-white fill-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>
          )}

          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              <span>Status</span>
              <span>
                {isFinished ? "A submeter avaliação..." : isUploading ? "A processar sinal..." : isRecording ? "A monitorizar prosódia física..." : "Pronto para avaliação vocal"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isFinished ? 'bg-blue-500' : 'bg-emerald-500'}`}
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
          {isFinished && (
            <p className="text-xs font-bold text-blue-600 animate-bounce">✓ Indicadores de Fadiga Vocal Gerados</p>
          )}
        </div>
      </div>
    </main>
  );
}
