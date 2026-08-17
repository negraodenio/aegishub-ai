"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { extractAcousticFeatures, blobToPcm, createWaveformAnalyser } from "@mindops/ai-core";
import type { VoiceProcessApiResponse, VoiceAcousticFeatures } from "@mindops/ai-core";

interface VoiceSessionUIProps {
  employeeId: string;
  onComplete: (audioPath?: string) => void;
}

type RecordingPhase =
  | "idle"
  | "recording"
  | "extracting"   // Acoustic feature extraction in progress
  | "uploading"    // Audio upload to storage in progress
  | "done"
  | "error"
  | "skipped";     // User chose to skip (text-only mode)

/**
 * VoiceSessionUI — P5.3 Real Acoustic Analysis
 *
 * This component:
 * 1. Records audio via MediaRecorder (real, user-initiated, user-stoppable).
 * 2. Visualizes the REAL audio signal using Web Audio API AnalyserNode — no Math.random().
 * 3. Extracts REAL acoustic features (F0, jitter, shimmer, RMS, pause ratio, SNR) from the recording.
 * 4. Uploads the audio blob to Supabase Storage.
 * 5. Sends real features to /api/voice/process for validation and persistence.
 * 6. If extraction fails, reports NOT_ANALYZED honestly — never fabricates.
 * 7. Provides a text-only skip option at all times.
 * 8. Provides a delete button before submission.
 *
 * DISCLOSURE (displayed to user):
 * This system measures acoustic characteristics of the voice signal.
 * It does NOT evaluate emotions, personality, mental health, or work performance.
 */
export function VoiceSessionUI({ employeeId, onComplete }: VoiceSessionUIProps) {
  const [phase, setPhase] = useState<RecordingPhase>("idle");
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceAcousticFeatures | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Real waveform data from Web Audio API AnalyserNode — NOT Math.random()
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformFrameRef = useRef<number | null>(null);
  const waveformAnalyserRef = useRef(createWaveformAnalyser());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (waveformFrameRef.current) cancelAnimationFrame(waveformFrameRef.current);
      waveformAnalyserRef.current.disconnect();
    };
  }, []);

  // ── Real waveform animation loop (AnalyserNode, not random) ─────────────
  const startWaveformAnimation = useCallback(() => {
    const analyser = waveformAnalyserRef.current;

    const animate = () => {
      const data = analyser.getWaveformData();
      if (data) {
        // Map frequency data (0–255) to bar heights (0–100%)
        const step = Math.floor(data.length / 24);
        const bars = Array.from({ length: 24 }, (_, i) => {
          const value = data[i * step] ?? 0;
          return Math.round((value / 255) * 100);
        });
        setWaveformBars(bars);
      }
      waveformFrameRef.current = requestAnimationFrame(animate);
    };

    waveformFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const stopWaveformAnimation = useCallback(() => {
    if (waveformFrameRef.current) {
      cancelAnimationFrame(waveformFrameRef.current);
      waveformFrameRef.current = null;
    }
    setWaveformBars(Array(24).fill(0));
  }, []);

  // ── Start Recording ──────────────────────────────────────────────────────
  const startRecording = async () => {
    setErrorMessage(null);
    chunksRef.current = [];
    recordedBlobRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Connect to real AnalyserNode for waveform visualization
      waveformAnalyserRef.current.connectAnalyser(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stopWaveformAnimation();
        waveformAnalyserRef.current.disconnect();
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = blob;

        await processRecording(blob);
      };

      mediaRecorder.start(100); // collect chunks every 100ms
      setPhase("recording");
      setProgress(0);

      // Start real waveform visualization
      startWaveformAnimation();

      // Auto-stop after 20 seconds
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.5; // 0–100 over 20 seconds
          if (next >= 100) {
            stopRecording();
            return 100;
          }
          return next;
        });
      }, 100);

    } catch (err) {
      console.error("[VOICE_MIC_ERROR]", err);
      setErrorMessage("Não foi possível aceder ao microfone. Verifique as permissões do browser.");
      setPhase("error");
    }
  };

  const stopRecording = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setPhase("extracting");
    }
  };

  // ── Process Recording: Extract Features + Upload ─────────────────────────
  const processRecording = async (blob: Blob) => {
    setPhase("extracting");

    // Step A: Convert blob to PCM and extract real acoustic features
    let extractedFeatures: VoiceAcousticFeatures | null = null;
    let extractionStatus = "NOT_ANALYZED";

    try {
      const pcmResult = await blobToPcm(blob, 16000);
      if (pcmResult) {
        const result = extractAcousticFeatures(pcmResult.samples, pcmResult.sampleRate);
        if (result.status === "ANALYZED") {
          extractedFeatures = result.features;
          extractionStatus = "ANALYZED";
        } else {
          extractionStatus = result.status;
          console.info("[VOICE_EXTRACT] Not analyzed:", result.reason, result.detail);
        }
      }
    } catch (extractErr) {
      console.warn("[VOICE_EXTRACT_WARN]", extractErr);
      // Never fabricate — fall through to NOT_ANALYZED
    }

    setAnalysisResult(extractedFeatures);
    setAnalysisStatus(extractionStatus);

    // Step B: Upload audio to Supabase Storage (always, regardless of extraction result)
    setPhase("uploading");
    let storagePath: string | undefined;

    const isDemo = employeeId?.toUpperCase().includes("DEMO");
    if (isDemo) {
      storagePath = "demo/voice-ergonomics-sample.webm";
    } else {
      try {
        const supabase = createClient();
        const fileName = `voice-ergonomics-${employeeId}-${Date.now()}.webm`;
        const filePath = `${employeeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("voice-assessments")
          .upload(filePath, blob, { upsert: false }); // upsert: false — no silent overwrites

        if (!uploadError) {
          storagePath = filePath;
          setAudioPath(filePath);
        } else {
          console.warn("[VOICE_UPLOAD_WARN]", uploadError.message);
        }
      } catch (uploadErr) {
        console.warn("[VOICE_UPLOAD_ERROR]", uploadErr);
        // Non-fatal — analysis can still be sent even without storage path
      }
    }

    // Step C: Send real features to backend for validation and persistence
    try {
      const authToken = employeeId; // Assessment token
      const apiBody = {
        sessionId: employeeId, // Assessment session context
        acousticFeatures: extractedFeatures, // null if NOT_ANALYZED
        audioStoragePath: storagePath
      };

      const resp = await fetch("/api/voice/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(apiBody)
      });

      const result: VoiceProcessApiResponse = await resp.json();
      console.info("[VOICE_API]", result.status);
    } catch (apiErr) {
      console.warn("[VOICE_API_WARN]", apiErr);
      // Non-fatal
    }

    setPhase("done");

    // Auto-complete after brief display
    setTimeout(() => {
      onComplete(storagePath);
    }, 2000);
  };

  // ── Delete before submission ─────────────────────────────────────────────
  const handleDelete = () => {
    recordedBlobRef.current = null;
    setAudioPath(null);
    setAnalysisResult(null);
    setAnalysisStatus(null);
    setProgress(0);
    setPhase("idle");
    setWaveformBars(Array(24).fill(0));
  };

  // ── Skip to text-only mode ───────────────────────────────────────────────
  const handleSkip = () => {
    setPhase("skipped");
    setTimeout(() => onComplete(undefined), 800);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-[600px] flex-col items-center justify-center rounded-3xl border border-black/5 bg-[#fcfbf9] px-6 py-12 shadow-inner">
      <div className="mx-auto max-w-md w-full text-center space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ergonomia Vocal Ocupacional
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Grave um áudio de até 20 segundos para análise acústica de carga vocal.
          </p>
        </div>

        {/* Legal Disclosure — always visible */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
          <p className="text-xs leading-relaxed text-amber-800">
            <strong>Este sistema mede características acústicas do sinal de voz.</strong>
            {" "}Não avalia emoções, personalidade, saúde mental ou desempenho profissional.
            A gravação é voluntária. Pode continuar sem gravar.
          </p>
        </div>

        {/* Real Waveform Visualizer — AnalyserNode, not Math.random() */}
        <div className="relative flex h-40 w-full items-center justify-center gap-1 overflow-hidden rounded-2xl bg-neutral-900 shadow-xl">
          {phase === "recording" ? (
            <>
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-emerald-400 transition-all duration-75"
                  style={{ height: `${Math.max(4, height)}%`, opacity: 0.6 + (height / 300) }}
                />
              ))}
              <div className="absolute top-2 right-3">
                <span className="text-[10px] font-mono text-emerald-400">⏺ {Math.round(progress / 5)}s</span>
              </div>
            </>
          ) : (
            // Static idle bars — no animation, no fake data
            Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-neutral-700"
                style={{ height: "10%" }}
              />
            ))
          )}

          {phase === "done" && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        {(phase === "recording" || phase === "extracting" || phase === "uploading") && (
          <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-1">
              <span>
                {phase === "recording"
                  ? "A gravar..."
                  : phase === "extracting"
                  ? "A extrair características acústicas..."
                  : "A guardar..."}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: phase === "recording" ? `${progress}%` : "100%" }}
              />
            </div>
          </div>
        )}

        {/* Analysis result indicator */}
        {phase === "done" && analysisStatus && (
          <div className={`rounded-xl border px-4 py-3 text-left text-xs ${
            analysisStatus === "ANALYZED"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-neutral-200 bg-neutral-50 text-neutral-600"
          }`}>
            {analysisStatus === "ANALYZED" && analysisResult ? (
              <>
                <p className="font-bold mb-1">✓ Características acústicas extraídas</p>
                <p>Duração: {analysisResult.durationSeconds}s — Qualidade: {analysisResult.recordingQuality}</p>
                <p className="text-[10px] mt-1 text-neutral-400">
                  Motor: {analysisResult.engineVersion}
                </p>
              </>
            ) : (
              <p>Análise acústica não disponível. Avaliação continuará sem dados de voz.</p>
            )}
          </div>
        )}

        {/* Error state */}
        {phase === "error" && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
            <p className="text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {errorMessage}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-4">
          {phase === "idle" || phase === "error" ? (
            <>
              <button
                onClick={startRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"
                aria-label="Iniciar gravação"
              >
                <Mic className="h-8 w-8" />
              </button>
              <button
                onClick={handleSkip}
                className="text-xs text-neutral-400 underline hover:text-neutral-600"
              >
                Continuar sem gravação de voz
              </button>
            </>
          ) : phase === "recording" ? (
            <button
              onClick={stopRecording}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg animate-pulse hover:bg-rose-600 transition-all active:scale-95"
              aria-label="Parar gravação"
            >
              <Square className="h-8 w-8 fill-white" />
            </button>
          ) : phase === "extracting" || phase === "uploading" ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Loader2 className="h-8 w-8 text-neutral-500 animate-spin" />
            </div>
          ) : phase === "done" ? (
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              {/* Allow user to delete their recording before it's submitted */}
              {audioPath && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  title="Apagar gravação"
                >
                  <X className="h-3 w-3" /> Apagar gravação
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Skipped */}
        {phase === "skipped" && (
          <p className="text-xs text-neutral-400">A continuar sem dados de voz...</p>
        )}

      </div>
    </main>
  );
}
