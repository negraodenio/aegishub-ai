import { CompositeScoreInputSchema, type CompositeScoreResult } from "./types";
import { ok, err, type Result } from "../shared/result";

interface VerticalWeights {
  phq9: number;
  gad7: number;
  burnout: number;
  psychosocial: number;
  voice: number;
  wellbeingProtection: number;
}

const VERTICAL_WEIGHTS: Record<string, VerticalWeights> = {
  oil_and_gas: { phq9: 1.0, gad7: 0.9, burnout: 1.2, psychosocial: 1.5, voice: 0.6, wellbeingProtection: 0.5 },
  bpo_callcenter: { phq9: 1.0, gad7: 1.2, burnout: 1.3, psychosocial: 1.3, voice: 0.5, wellbeingProtection: 0.5 },
  healthcare: { phq9: 1.1, gad7: 1.0, burnout: 1.4, psychosocial: 1.2, voice: 0.5, wellbeingProtection: 0.6 },
  logistics: { phq9: 0.9, gad7: 0.9, burnout: 1.1, psychosocial: 1.3, voice: 0.4, wellbeingProtection: 0.5 },
  manufacturing: { phq9: 1.0, gad7: 0.9, burnout: 1.1, psychosocial: 1.2, voice: 0.4, wellbeingProtection: 0.5 },
  retail: { phq9: 1.0, gad7: 1.0, burnout: 1.1, psychosocial: 1.2, voice: 0.4, wellbeingProtection: 0.5 },
  finance: { phq9: 1.0, gad7: 1.1, burnout: 1.2, psychosocial: 1.2, voice: 0.4, wellbeingProtection: 0.5 },
  generic: { phq9: 1.0, gad7: 1.0, burnout: 1.0, psychosocial: 1.2, voice: 0.4, wellbeingProtection: 0.5 }
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export function composeRiskScore(inputRaw: unknown): Result<CompositeScoreResult> {
  const parsed = CompositeScoreInputSchema.safeParse(inputRaw);

  if (!parsed.success) {
    return err(new Error(parsed.error.message));
  }

  const input = parsed.data;
  const verticalWeights = VERTICAL_WEIGHTS[input.verticalPack] || VERTICAL_WEIGHTS.generic;
  const weights = verticalWeights!; // Guaranteed by 'generic' existence

  const phq9Normalized = ((input.phq9Score ?? 0) / 27) * 100;
  const gad7Normalized = ((input.gad7Score ?? 0) / 21) * 100;

  const signals = [
    { value: phq9Normalized, weight: weights.phq9, present: input.phq9Score != null },
    { value: gad7Normalized, weight: weights.gad7, present: input.gad7Score != null },
    { value: input.burnoutScore ?? 0, weight: weights.burnout, present: input.burnoutScore != null },
    { value: input.psychosocialRiskScore ?? 0, weight: weights.psychosocial, present: input.psychosocialRiskScore != null },
    { value: input.voiceSignalScore ?? 0, weight: weights.voice, present: input.voiceSignalScore != null },
    { value: 100 - (input.wellbeingScore ?? 50), weight: weights.wellbeingProtection, present: true } // Inverse wellbeing as risk
  ];

  const presentSignals = signals.filter(s => s.present);
  const totalWeight = presentSignals.reduce((acc, s) => acc + s.weight, 0);
  const weightedSum = presentSignals.reduce((acc, s) => acc + (s.value * s.weight), 0);

  const compositeRiskScore = clamp(Math.round(weightedSum / totalWeight));

  const riskLevel =
    compositeRiskScore >= 75 ? "critical" :
    compositeRiskScore >= 55 ? "high" :
    compositeRiskScore >= 30 ? "moderate" :
    "low";

  const reasons: string[] = [];
  if ((input.phq9Score ?? 0) >= 15) reasons.push("high_phq9_score");
  if ((input.gad7Score ?? 0) >= 15) reasons.push("high_gad7_score");
  if ((input.burnoutScore ?? 0) >= 70) reasons.push("high_burnout_score");
  if ((input.psychosocialRiskScore ?? 0) >= 70) reasons.push("high_work_risk_factors");
  if ((input.voiceSignalScore ?? 0) >= 70) reasons.push("voice_signal_change_detected");

  const confidence =
    [
      input.phq9Score,
      input.gad7Score,
      input.burnoutScore,
      input.wellbeingScore,
      input.psychosocialRiskScore,
      input.voiceSignalScore
    ].filter((v) => v != null).length / 6;

  return ok({
    compositeRiskScore,
    riskLevel,
    reasons,
    requiresHumanReview: riskLevel === "high" || riskLevel === "critical",
    confidence: Number(confidence.toFixed(2))
  });
}
