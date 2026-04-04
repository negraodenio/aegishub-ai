import { createHash } from "crypto";

export interface ConsentRequest {
  employeeId: string;
  categoryCode: string; // 'VOICE_ANALYSIS', 'CLINICAL_SCREENING'
  explicitAction: boolean;
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
}

export interface ConsentRecord {
  consentHash: string;
  status: "granted" | "denied";
  validUntil: Date;
}

/**
 * Manages RGPD compliant consents for sensitive health data (Art. 9º).
 * Implements non-repudiation via cryptographic hashing.
 */
export function createConsentRecord(request: ConsentRequest): ConsentRecord {
  if (!request.explicitAction) {
    throw new Error("Explicit consent is required for sensitive health data (Art. 9º RGPD)");
  }

  // Create a immutable proof hash of the consent action
  const proofPayload = JSON.stringify({
    eID: request.employeeId,
    cat: request.categoryCode,
    ts: new Date().toISOString(),
    ip: request.metadata.ipAddress
  });

  const consentHash = createHash("sha256").update(proofPayload).digest("hex");

  // Retention policy: 24 months for clinical data, 12 months for voice
  const validUntil = new Date();
  const retentionMonths = request.categoryCode === "VOICE_ANALYSIS" ? 12 : 24;
  validUntil.setMonth(validUntil.getMonth() + retentionMonths);

  return {
    consentHash,
    status: "granted",
    validUntil
  };
}
