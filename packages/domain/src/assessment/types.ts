import { z } from "zod";

export const RiskLevelSchema = z.enum(["low", "moderate", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const VerticalPackSchema = z.enum([
  "generic",
  "oil_and_gas",
  "bpo_callcenter",
  "healthcare",
  "logistics",
  "manufacturing",
  "retail",
  "finance"
]);
export type VerticalPack = z.infer<typeof VerticalPackSchema>;

export const CompositeScoreInputSchema = z.object({
  phq9Score: z.number().min(0).max(27).optional(),
  gad7Score: z.number().min(0).max(21).optional(),
  burnoutScore: z.number().min(0).max(100).optional(),
  wellbeingScore: z.number().min(0).max(100).optional(),
  psychosocialRiskScore: z.number().min(0).max(100).optional(),
  voiceSignalScore: z.number().min(0).max(100).optional(),
  verticalPack: VerticalPackSchema
});

export type CompositeScoreInput = z.infer<typeof CompositeScoreInputSchema>;

export interface CompositeScoreResult {
  compositeRiskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  requiresHumanReview: boolean;
  confidence: number;
}
