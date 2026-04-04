import { VoiceFeatureSetSchema, type VoiceAnalysisResult } from "./types";
import { ok, err, type Result } from "../shared/result";

export function analyzeVoiceFeatures(inputRaw: unknown): Result<VoiceAnalysisResult> {
  const parsed = VoiceFeatureSetSchema.safeParse(inputRaw);

  if (!parsed.success) {
    return err(new Error(parsed.error.message));
  }

  const f = parsed.data;
  let score = 0;
  const flags: string[] = [];

  if (f.speakingRateWPM < 100) {
    score += 20;
    flags.push("low_speaking_rate");
  }

  if (f.pauseDensityPercent > 30) {
    score += 20;
    flags.push("high_pause_density");
  }

  if (f.pitchVarianceSemitones < 2) {
    score += 15;
    flags.push("reduced_pitch_variation");
  }

  if (f.energyVarianceDB < 5) {
    score += 15;
    flags.push("flat_energy_envelope");
  }

  if (f.articulationClarity < 50) {
    score += 15;
    flags.push("low_articulation_clarity");
  }

  if (f.jitterPercent > 2) {
    score += 10;
    flags.push("elevated_jitter");
  }

  if (f.shimmerDB > 3) {
    score += 5;
    flags.push("elevated_shimmer");
  }

  return ok({
    signalScore: Math.max(0, Math.min(100, score)),
    confidence: flags.length > 4 ? 0.6 : flags.length > 2 ? 0.72 : 0.82,
    flags,
    disclaimer: "Este sinal é complementar e não constitui diagnóstico. Requer avaliação profissional."
  });
}
