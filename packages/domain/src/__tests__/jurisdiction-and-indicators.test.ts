import { describe, it, expect } from "vitest";
import { 
  getCountryProfile, 
  PORTUGAL_PROFILE, 
  BRAZIL_PROFILE,
  calculateOrganizationalDisconnectRisk,
  WORKER_VOICE_INSTRUMENT,
  composeRiskScore
} from "../index";

describe("CountryProfile & Jurisdiction Engine", () => {
  it("should return Portugal profile by default or for 'PT'", () => {
    const defaultProfile = getCountryProfile();
    const ptProfile = getCountryProfile("PT");
    const ptLower = getCountryProfile("pt");

    expect(defaultProfile.countryCode).toBe("PT");
    expect(ptProfile.name).toBe("Portugal");
    expect(ptLower.currency).toBe("EUR");
    expect(ptProfile.terminology.mainStandardName).toContain("Lei n.º 102/2009");
    expect(ptProfile.enabledModules.actReporting).toBe(true);
  });

  it("should return Brazil profile for 'BR'", () => {
    const brProfile = getCountryProfile("BR");
    const brLower = getCountryProfile("br");

    expect(brProfile.countryCode).toBe("BR");
    expect(brLower.currency).toBe("BRL");
    expect(brProfile.terminology.mainStandardName).toContain("NR-1");
    expect(brProfile.terminology.taxIdLabel).toBe("CNPJ");
    expect(brProfile.terminology.economicActivityLabel).toBe("CNAE");
    expect(brProfile.enabledModules.nr1PgrReporting).toBe(true);
    expect(brProfile.privacyProfile.standard).toBe("LGPD");
  });
});

describe("Organizational Disconnect Risk Indicator", () => {
  it("should calculate low disconnect risk for healthy workplace parameters", () => {
    const result = calculateOrganizationalDisconnectRisk({
      afterHoursActivityPercent: 5,
      quantitativeDemandsScore: 20,
      recoveryImpairmentScore: 15,
      reportedExcessiveContact: false
    }, "PT");

    expect(result.disconnectRiskScore).toBeLessThan(35);
    expect(result.riskLevel).toBe("baixo");
    expect(result.legalReference).toContain("Lei n.º 83/2021");
  });

  it("should elevate disconnect risk when after hours and excessive contact is present", () => {
    const result = calculateOrganizationalDisconnectRisk({
      afterHoursActivityPercent: 80,
      quantitativeDemandsScore: 85,
      recoveryImpairmentScore: 90,
      reportedExcessiveContact: true
    }, "BR");

    expect(result.disconnectRiskScore).toBeGreaterThanOrEqual(75);
    expect(result.riskLevel).toBe("critico");
    expect(result.legalReference).toContain("NR-1");
  });
});

describe("Worker Voice Instrument & Scoring Integration", () => {
  it("should have valid questions and scale for worker voice", () => {
    expect(WORKER_VOICE_INSTRUMENT.code).toBe("WORKER_VOICE");
    expect(WORKER_VOICE_INSTRUMENT.questions.length).toBe(12);
    expect(WORKER_VOICE_INSTRUMENT.scaleType).toBe("1-5");
  });

  it("should compose risk score using workerVoiceScore", () => {
    const result = composeRiskScore({
      verticalPack: "manufacturing",
      workerVoiceScore: 75,
      wellbeingScore: 50
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.compositeRiskScore).toBeGreaterThan(50);
      expect(result.value.reasons).toContain("high_work_risk_factors");
    }
  });
});
