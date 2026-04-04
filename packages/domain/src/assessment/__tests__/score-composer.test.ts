import { describe, it, expect } from "vitest";
import { composeRiskScore } from "../score-composer";

describe("composeRiskScore", () => {
  it("should calculate a generic score correctly", () => {
    const result = composeRiskScore({
      verticalPack: "generic",
      phq9Score: 5,
      gad7Score: 4,
      wellbeingScore: 60
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.compositeRiskScore).toBeGreaterThan(0);
      expect(result.value.riskLevel).toBeDefined();
    }
  });

  it("should flag critical risk for high depression and anxiety", () => {
    const result = composeRiskScore({
      verticalPack: "oil_and_gas",
      phq9Score: 22, // Severe
      gad7Score: 18  // Severe
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.riskLevel).toBe("critical");
      expect(result.value.requiresHumanReview).toBe(true);
    }
  });

  it("should apply vertical weights for oil_and_gas", () => {
    // Psychosocial is 50, Wellbeing (inverse) is 0
    const genericResult = composeRiskScore({
      verticalPack: "generic",
      psychosocialRiskScore: 50,
      wellbeingScore: 100 
    });

    const ogResult = composeRiskScore({
      verticalPack: "oil_and_gas",
      psychosocialRiskScore: 50,
      wellbeingScore: 100
    });

    if (genericResult.ok && ogResult.ok) {
      // OG has higher weight for psychosocial (1.5 vs 1.2)
      // Generic: (50 * 1.2 + 0 * 0.5) / 1.7 = 35
      // OG: (50 * 1.5 + 0 * 0.5) / 2.0 = 38
      expect(ogResult.value.compositeRiskScore).toBeGreaterThan(genericResult.value.compositeRiskScore);
    }
  });
});
