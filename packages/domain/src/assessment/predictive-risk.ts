export interface PredictiveRiskInput {
  lastCompositeScores: number[];
  absenteeismDays90d: number;
  sickLeaveEpisodes180d: number;
  incompleteAssessments: number;
  voiceDelta?: number;
}

export interface PredictiveRiskOutput {
  predictedRiskScore: number;
  predictedRiskLevel: "low" | "moderate" | "high" | "critical";
  drivers: string[];
}

export function predictRisk(input: PredictiveRiskInput): PredictiveRiskOutput {
  const avg =
    input.lastCompositeScores.length > 0
      ? input.lastCompositeScores.reduce((a, b) => a + b, 0) / input.lastCompositeScores.length
      : 0;

  const trend =
    input.lastCompositeScores.length >= 2
      ? input.lastCompositeScores[input.lastCompositeScores.length - 1]! -
        input.lastCompositeScores[0]!
      : 0;

  let score = avg * 0.45;
  score += Math.min(input.absenteeismDays90d * 2, 20);
  score += Math.min(input.sickLeaveEpisodes180d * 6, 18);
  score += Math.min(input.incompleteAssessments * 3, 9);
  score += Math.min(Math.max(input.voiceDelta ?? 0, 0), 10);
  score += trend > 0 ? Math.min(trend * 0.3, 15) : 0;

  const predictedRiskScore = Math.round(Math.max(0, Math.min(100, score)));

  const predictedRiskLevel =
    predictedRiskScore >= 75 ? "critical" :
    predictedRiskScore >= 55 ? "high" :
    predictedRiskScore >= 30 ? "moderate" :
    "low";

  const drivers: string[] = [];
  if (trend > 10) drivers.push("worsening_assessment_trend");
  if (input.absenteeismDays90d >= 5) drivers.push("high_recent_absenteeism");
  if (input.sickLeaveEpisodes180d >= 2) drivers.push("recurrent_sick_leave");
  if ((input.voiceDelta ?? 0) >= 8) drivers.push("voice_signal_deterioration");

  return { predictedRiskScore, predictedRiskLevel, drivers };
}
