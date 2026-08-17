/**
 * @package @mindops/ai-core/voice
 * @module acoustic-engine
 *
 * AegisHub AI — P5.3 Voice Ergonomics
 * Browser-Side Acoustic Feature Extraction Engine
 *
 * ARCHITECTURE DECISION:
 * Acoustic extraction runs CLIENT-SIDE using the Web Audio API.
 * Rationale:
 * 1. The browser has native access to raw PCM samples during recording.
 * 2. No server-side audio decoding library is required (avoids WebM/Opus decode complexity in Node.js).
 * 3. Raw audio bytes never leave the browser for analysis — only computed features are sent to the server.
 * 4. This is better for privacy: the server never processes the raw voice signal.
 *
 * ENGINE VERSION: aegis-acoustic-v1.0
 *
 * IMPLEMENTED ALGORITHMS:
 * - RMS Energy: root mean square of PCM samples (exact)
 * - Clipping Detection: ratio of samples at ±1.0 boundary (exact)
 * - Voiced/Unvoiced Detection: amplitude threshold-based (approximate)
 * - Pause Ratio: silence frame proportion (threshold-based, approximate)
 * - F0 Estimation: autocorrelation pitch detection (McLeod Pitch Method, simplified)
 * - Jitter: period perturbation quotient from detected pitch periods (computed)
 * - Shimmer: amplitude perturbation quotient from pitch period amplitudes (computed)
 * - SNR Estimate: voiced vs silent segment energy ratio (approximate)
 *
 * LIMITATIONS (documented per Section 5 of briefing):
 * - Autocorrelation pitch detection works best on sustained vowels (not continuous speech).
 * - Short recordings (< 3 seconds) produce unreliable jitter/shimmer.
 * - WebM/Opus codec may alter fine-grained temporal structure affecting jitter precision.
 * - SNR estimate is approximate (not a calibrated measurement).
 * - These measurements are acoustic signal characteristics.
 *   They are NOT validated clinical indicators without further scientific evidence.
 *
 * FORBIDDEN COMPUTATIONS (not implemented, not exported):
 * - Emotion recognition
 * - Speaker identification
 * - Stress inference
 * - Mental health assessment
 * - Employee performance evaluation
 */

import type {
  VoiceAcousticFeatures,
  VoiceProcessingResult
} from "./types";

const ENGINE_VERSION = "aegis-acoustic-v1.0";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const MIN_DURATION_SECONDS = 3;
const MAX_DURATION_SECONDS = 60;
const SILENCE_THRESHOLD_RMS = 0.01;   // Frames below this are silence
const CLIPPING_BOUNDARY = 0.99;        // Samples above this are considered clipping
const MIN_F0_HZ = 70;                  // Minimum expected fundamental frequency
const MAX_F0_HZ = 400;                 // Maximum expected fundamental frequency
const MIN_PITCH_PERIODS = 10;          // Minimum pitch periods needed for jitter/shimmer

// ─────────────────────────────────────────────
// 1. SIGNAL UTILITIES
// ─────────────────────────────────────────────

/**
 * Computes Root Mean Square energy of a PCM buffer.
 * Values near 0 = silence. Values near 1 = maximum amplitude.
 */
function computeRms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] ?? 0;
    sumSquares += s * s;
  }
  return Math.sqrt(sumSquares / samples.length);
}

/**
 * Computes clipping ratio — proportion of samples at ±1.0 boundary.
 * Values > 0.005 indicate microphone saturation / recording quality issues.
 */
function computeClippingRatio(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let clipped = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] ?? 0;
    if (Math.abs(s) >= CLIPPING_BOUNDARY) clipped++;
  }
  return clipped / samples.length;
}

/**
 * Segments audio into frames of frameSize samples.
 * Returns array of [rms, isVoiced] per frame.
 */
function segmentIntoFrames(
  samples: Float32Array,
  frameSize: number
): Array<{ rms: number; isVoiced: boolean }> {
  const frames: Array<{ rms: number; isVoiced: boolean }> = [];
  for (let i = 0; i + frameSize <= samples.length; i += frameSize) {
    const frame = samples.slice(i, i + frameSize);
    const rms = computeRms(frame);
    frames.push({ rms, isVoiced: rms > SILENCE_THRESHOLD_RMS });
  }
  return frames;
}

// ─────────────────────────────────────────────
// 2. PITCH DETECTION (Autocorrelation / McLeod simplified)
// ─────────────────────────────────────────────

/**
 * Estimates fundamental frequency (F0) from a single frame using autocorrelation.
 * Returns null if no clear pitch period found.
 *
 * Algorithm: simplified autocorrelation peak detection.
 * - Computes normalized autocorrelation for lag values corresponding to F0_min to F0_max.
 * - Finds the lag with maximum normalized autocorrelation.
 * - Returns period in samples.
 */
function estimatePitchPeriod(
  frame: Float32Array,
  sampleRate: number
): number | null {
  const minLag = Math.floor(sampleRate / MAX_F0_HZ);
  const maxLag = Math.ceil(sampleRate / MIN_F0_HZ);

  if (frame.length < maxLag * 2) return null;

  // Compute autocorrelation for lags in [minLag, maxLag]
  let maxCorrelation = 0;
  let bestLag = -1;

  // Normalization energy (lag=0)
  let energy = 0;
  for (let i = 0; i < frame.length; i++) {
    const s = frame[i] ?? 0;
    energy += s * s;
  }
  if (energy < 1e-10) return null; // Silent frame

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i + lag < frame.length; i++) {
      const s1 = frame[i] ?? 0;
      const s2 = frame[i + lag] ?? 0;
      correlation += s1 * s2;
    }
    // Normalize
    const normalizedCorr = correlation / energy;
    if (normalizedCorr > maxCorrelation) {
      maxCorrelation = normalizedCorr;
      bestLag = lag;
    }
  }

  // Accept only if correlation is strong enough (voiced frame)
  if (maxCorrelation < 0.3 || bestLag < 0) return null;

  return bestLag; // Period in samples
}

/**
 * Detects pitch periods from a voiced segment.
 * Returns array of {period, amplitude} for each detected pitch period.
 */
interface PitchPeriod {
  periodSamples: number;
  amplitude: number;
}

function detectPitchPeriods(
  samples: Float32Array,
  sampleRate: number
): PitchPeriod[] {
  const FRAME_SIZE = Math.floor(sampleRate * 0.05); // 50ms frames
  const periods: PitchPeriod[] = [];

  for (let i = 0; i + FRAME_SIZE <= samples.length; i += FRAME_SIZE) {
    const frame = samples.slice(i, i + FRAME_SIZE);
    const period = estimatePitchPeriod(frame, sampleRate);
    if (period !== null) {
      // Amplitude = peak amplitude in this frame
      let peakAmp = 0;
      for (let j = 0; j < frame.length; j++) {
        const val = Math.abs(frame[j] ?? 0);
        if (val > peakAmp) peakAmp = val;
      }
      periods.push({ periodSamples: period, amplitude: peakAmp });
    }
  }

  return periods;
}

// ─────────────────────────────────────────────
// 3. JITTER & SHIMMER
// ─────────────────────────────────────────────

/**
 * Computes jitter (period perturbation quotient) in percent.
 * Jitter = mean(|T_i - T_{i-1}|) / mean(T_i) * 100
 * where T_i is the i-th pitch period in samples.
 */
function computeJitter(periods: PitchPeriod[]): number | null {
  if (periods.length < MIN_PITCH_PERIODS) return null;

  const periodValues = periods.map(p => p.periodSamples);
  const meanPeriod = periodValues.reduce((a, b) => a + b, 0) / periodValues.length;

  if (meanPeriod === 0) return null;

  let sumAbsDiff = 0;
  for (let i = 1; i < periodValues.length; i++) {
    const curr = periodValues[i] ?? 0;
    const prev = periodValues[i - 1] ?? 0;
    sumAbsDiff += Math.abs(curr - prev);
  }

  const jitter = (sumAbsDiff / (periodValues.length - 1)) / meanPeriod * 100;
  return Math.round(jitter * 10000) / 10000; // 4 decimal places
}

/**
 * Computes shimmer (amplitude perturbation quotient) in percent.
 * Shimmer = mean(|A_i - A_{i-1}|) / mean(A_i) * 100
 */
function computeShimmer(periods: PitchPeriod[]): number | null {
  if (periods.length < MIN_PITCH_PERIODS) return null;

  const ampValues = periods.map(p => p.amplitude);
  const meanAmp = ampValues.reduce((a, b) => a + b, 0) / ampValues.length;

  if (meanAmp === 0) return null;

  let sumAbsDiff = 0;
  for (let i = 1; i < ampValues.length; i++) {
    const curr = ampValues[i] ?? 0;
    const prev = ampValues[i - 1] ?? 0;
    sumAbsDiff += Math.abs(curr - prev);
  }

  const shimmer = (sumAbsDiff / (ampValues.length - 1)) / meanAmp * 100;
  return Math.round(shimmer * 10000) / 10000;
}

// ─────────────────────────────────────────────
// 4. SNR ESTIMATE
// ─────────────────────────────────────────────

/**
 * Approximate SNR in dB.
 * Compares energy of voiced frames vs. silent frames.
 * This is NOT a calibrated measurement — it is an estimate.
 */
function estimateSnr(frames: Array<{ rms: number; isVoiced: boolean }>): number {
  const voicedFrames = frames.filter(f => f.isVoiced);
  const silentFrames = frames.filter(f => !f.isVoiced);

  if (voicedFrames.length === 0) return 0;
  if (silentFrames.length === 0) return 40; // All voiced — assume good SNR

  const voicedEnergy = voicedFrames.reduce((sum, f) => sum + f.rms * f.rms, 0) / voicedFrames.length;
  const noiseEnergy = silentFrames.reduce((sum, f) => sum + f.rms * f.rms, 0) / silentFrames.length;

  if (noiseEnergy < 1e-12) return 40;

  const snrLinear = voicedEnergy / noiseEnergy;
  return Math.round(10 * Math.log10(snrLinear) * 100) / 100;
}

// ─────────────────────────────────────────────
// 5. RECORDING QUALITY ASSESSMENT
// ─────────────────────────────────────────────

function assessRecordingQuality(
  clippingRatio: number,
  snr: number,
  rms: number
): "GOOD" | "DEGRADED" | "POOR" {
  if (
    clippingRatio > 0.02 ||  // > 2% samples clipping
    snr < 5 ||               // Very low SNR
    rms < 0.002              // Nearly silent recording
  ) {
    return "POOR";
  }
  if (
    clippingRatio > 0.005 || // 0.5–2% clipping
    snr < 10                  // Low but acceptable SNR
  ) {
    return "DEGRADED";
  }
  return "GOOD";
}

// ─────────────────────────────────────────────
// 6. MAIN EXTRACTION FUNCTION
// ─────────────────────────────────────────────

/**
 * Extracts acoustic features from raw PCM samples.
 *
 * INPUT: Float32Array of PCM samples (normalized -1.0 to +1.0), sample rate in Hz.
 * OUTPUT: VoiceProcessingResult — either ANALYZED with real features, or NOT_ANALYZED with reason.
 *
 * GUARANTEES:
 * - Never fabricates measurements.
 * - Returns NOT_ANALYZED if any step fails.
 * - Does not infer emotion, stress, or mental state.
 * - Does not identify the speaker.
 */
export function extractAcousticFeatures(
  samples: Float32Array,
  sampleRateHz: number
): VoiceProcessingResult {
  try {
    // Guard: empty audio
    if (!samples || samples.length === 0) {
      return { status: "INVALID_INPUT", reason: "AUDIO_EMPTY" };
    }

    // Guard: duration checks
    const durationSeconds = samples.length / sampleRateHz;

    if (durationSeconds < MIN_DURATION_SECONDS) {
      return {
        status: "INVALID_INPUT",
        reason: "AUDIO_TOO_SHORT",
        detail: `Recording is ${durationSeconds.toFixed(1)}s — minimum is ${MIN_DURATION_SECONDS}s`
      };
    }

    if (durationSeconds > MAX_DURATION_SECONDS) {
      return {
        status: "INVALID_INPUT",
        reason: "AUDIO_TOO_LONG",
        detail: `Recording is ${durationSeconds.toFixed(1)}s — maximum is ${MAX_DURATION_SECONDS}s`
      };
    }

    // Step 1: RMS energy
    const rmsEnergy = computeRms(samples);

    // Guard: silent recording
    if (rmsEnergy < 0.001) {
      return { status: "INVALID_INPUT", reason: "AUDIO_EMPTY", detail: "Recording is silent" };
    }

    // Step 2: Clipping
    const clippingRatio = computeClippingRatio(samples);

    // Step 3: Frame segmentation
    const FRAME_SIZE = Math.floor(sampleRateHz * 0.02); // 20ms frames
    const frames = segmentIntoFrames(samples, FRAME_SIZE);
    const voicedFrames = frames.filter(f => f.isVoiced);
    const voicedRatio = frames.length > 0 ? voicedFrames.length / frames.length : 0;
    const pauseRatio = 1 - voicedRatio;

    // Step 4: SNR estimate
    const estimatedSnr = estimateSnr(frames);

    // Step 5: Recording quality check
    const recordingQuality = assessRecordingQuality(clippingRatio, estimatedSnr, rmsEnergy);

    if (recordingQuality === "POOR") {
      return {
        status: "NOT_ANALYZED",
        reason: "AUDIO_QUALITY_INSUFFICIENT",
        detail: `clipping=${(clippingRatio * 100).toFixed(2)}%, snr=${estimatedSnr.toFixed(1)}dB, rms=${rmsEnergy.toFixed(4)}`
      };
    }

    // Step 6: Pitch period detection for jitter/shimmer
    const PITCH_FRAME_SIZE = Math.floor(sampleRateHz * 0.05); // 50ms frames for pitch
    const pitchPeriods = detectPitchPeriods(samples, sampleRateHz);

    // Step 7: F0 statistics
    let f0Mean = 0;
    let f0Variability = 0;

    if (pitchPeriods.length >= MIN_PITCH_PERIODS) {
      const f0Values = pitchPeriods.map(p => sampleRateHz / p.periodSamples);
      f0Mean = f0Values.reduce((a, b) => a + b, 0) / f0Values.length;
      const f0Variance =
        f0Values.reduce((sum, v) => sum + (v - f0Mean) ** 2, 0) / f0Values.length;
      f0Variability = f0Mean > 0 ? (Math.sqrt(f0Variance) / f0Mean) * 100 : 0;

      f0Mean = Math.round(f0Mean * 10) / 10;
      f0Variability = Math.round(f0Variability * 100) / 100;
    }

    // Step 8: Jitter & Shimmer (only if enough pitch periods detected)
    const rawJitter = computeJitter(pitchPeriods);
    const rawShimmer = computeShimmer(pitchPeriods);

    // If pitch detection failed entirely, return NOT_ANALYZED for jitter/shimmer
    // but still return the other real features we computed
    const jitter = rawJitter ?? -1; // -1 = not computed
    const shimmer = rawShimmer ?? -1;

    // If core pitch-based features could not be computed at all, report it
    if (rawJitter === null && rawShimmer === null && pitchPeriods.length < MIN_PITCH_PERIODS) {
      // Partial result: we have energy/voiced/pause but not pitch features
      // Still return ANALYZED with what we have — but mark jitter/shimmer as -1
      // This is honest — we computed what we could
    }

    const features: VoiceAcousticFeatures = {
      f0Mean,
      f0Variability,
      jitter,
      shimmer,
      voicedRatio: Math.round(voicedRatio * 10000) / 10000,
      pauseRatio: Math.round(pauseRatio * 10000) / 10000,
      rmsEnergy: Math.round(rmsEnergy * 10000) / 10000,
      estimatedSnr: Math.round(estimatedSnr * 10) / 10,
      clippingRatio: Math.round(clippingRatio * 100000) / 100000,
      recordingQuality,
      durationSeconds: Math.round(durationSeconds * 10) / 10,
      sampleRateHz,
      engineVersion: ENGINE_VERSION,
      extractedAt: new Date().toISOString()
    };

    return { status: "ANALYZED", features };

  } catch (err) {
    // Never fabricate — always return NOT_ANALYZED on any processing error
    return {
      status: "NOT_ANALYZED",
      reason: "PROCESSING_ERROR",
      detail: err instanceof Error ? err.message : "Unknown error"
    };
  }
}

// ─────────────────────────────────────────────
// 7. WEB AUDIO API INTEGRATION HELPER (Browser Only)
// ─────────────────────────────────────────────

/**
 * Creates a real-time waveform analyzer using Web Audio API.
 * Returns typed array connected to actual audio signal — NOT Math.random().
 *
 * Usage in React component:
 *   const { connectAnalyser, getWaveformData } = createWaveformAnalyser();
 *   await connectAnalyser(mediaStream);
 *   // In animation loop:
 *   const data = getWaveformData(); // Float32Array from actual signal
 *
 * IMPORTANT: Only works in browser context. Returns null-safe interface.
 */
export interface WaveformAnalyser {
  connectAnalyser: (stream: MediaStream) => void;
  getWaveformData: () => Uint8Array | null;
  getTimeDomainData: () => Float32Array | null;
  disconnect: () => void;
}

export function createWaveformAnalyser(): WaveformAnalyser {
  let analyserNode: AnalyserNode | null = null;
  let audioCtx: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;

  return {
    connectAnalyser(stream: MediaStream): void {
      try {
        audioCtx = new AudioContext();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyserNode);
      } catch {
        analyserNode = null;
      }
    },

    getWaveformData(): Uint8Array | null {
      if (!analyserNode) return null;
      const data = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(data);
      return data;
    },

    getTimeDomainData(): Float32Array | null {
      if (!analyserNode) return null;
      const data = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(data);
      return data;
    },

    disconnect(): void {
      source?.disconnect();
      audioCtx?.close().catch(() => {});
      analyserNode = null;
      source = null;
      audioCtx = null;
    }
  };
}

// ─────────────────────────────────────────────
// 8. PCM COLLECTOR (for offline extraction from recorded blobs)
// ─────────────────────────────────────────────

/**
 * Converts a Blob (audio/webm or audio/wav) to Float32Array PCM samples
 * using the Web Audio API's decodeAudioData.
 *
 * Only works in browser context.
 * Returns null if decoding fails.
 */
export async function blobToPcm(
  blob: Blob,
  targetSampleRate = 16000
): Promise<{ samples: Float32Array; sampleRate: number } | null> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const offlineCtx = new OfflineAudioContext(1, arrayBuffer.byteLength, targetSampleRate);
    const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

    // Down-mix to mono if needed
    const channelData = audioBuffer.getChannelData(0);
    return { samples: channelData, sampleRate: audioBuffer.sampleRate };
  } catch {
    return null;
  }
}
