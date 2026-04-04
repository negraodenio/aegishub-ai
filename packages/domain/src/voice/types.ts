import { z } from "zod";

export const VoiceFeatureSetSchema = z.object({
  speakingRateWPM: z.number().min(0).max(300),
  pauseDensityPercent: z.number().min(0).max(100),
  pitchVarianceSemitones: z.number().min(0).max(24),
  energyVarianceDB: z.number().min(0).max(60),
  articulationClarity: z.number().min(0).max(100),
  jitterPercent: z.number().min(0).max(10),
  shimmerDB: z.number().min(0).max(10)
});

export type VoiceFeatureSet = z.infer<typeof VoiceFeatureSetSchema>;

export interface VoiceAnalysisResult {
  signalScore: number;
  confidence: number;
  flags: string[];
  disclaimer: string;
}
