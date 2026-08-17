/**
 * @package @mindops/ai-core/voice
 * @module types
 *
 * AegisHub AI — P5.3 Voice Ergonomics
 * Acoustic Voice Analysis Type Definitions
 *
 * SCOPE: Acoustic ergonomics measurements only.
 * FORBIDDEN: Emotion recognition, psychological profiling, employee ranking,
 *            medical diagnosis, stress inference, mental health classification.
 */

// ─────────────────────────────────────────────
// 1. ANALYSIS STATUS
// ─────────────────────────────────────────────

/**
 * Processing status codes.
 * ANALYZED: Real acoustic features extracted from actual audio.
 * NOT_ANALYZED: Engine unavailable, quality insufficient, or error — NO data fabricated.
 * INVALID_INPUT: Audio rejected at validation stage.
 */
export type VoiceAnalysisStatus =
  | "ANALYZED"
  | "NOT_ANALYZED"
  | "INVALID_INPUT";

/**
 * Reason codes for NOT_ANALYZED status.
 */
export type VoiceNotAnalyzedReason =
  | "ACOUSTIC_ENGINE_UNAVAILABLE"
  | "AUDIO_TOO_SHORT"              // < 3 seconds
  | "AUDIO_TOO_LONG"               // > 60 seconds
  | "AUDIO_QUALITY_INSUFFICIENT"   // SNR below threshold or excessive clipping
  | "AUDIO_FORMAT_UNSUPPORTED"
  | "AUDIO_EMPTY"
  | "AUDIO_CORRUPTED"
  | "PITCH_DETECTION_FAILED"       // Could not find stable F0
  | "PROCESSING_ERROR"
  | "CONSENT_NOT_GRANTED";

// ─────────────────────────────────────────────
// 2. ACOUSTIC FEATURES
// ─────────────────────────────────────────────

/**
 * Acoustic features extracted from a real voice recording.
 *
 * All values are acoustic signal measurements.
 * NONE of these values may be described as emotional, psychological,
 * or medical indicators without separate scientific validation.
 *
 * Terminology:
 * - "vocal-load indicator" = acoustic measurement that may correlate with
 *   prolonged vocal use in occupational contexts.
 * - These are NOT diagnostic criteria.
 */
export interface VoiceAcousticFeatures {
  /**
   * Fundamental frequency (pitch) mean — Hz.
   * Acoustic characteristic of vocal fold vibration.
   * Range: ~80–300 Hz for typical speech.
   */
  f0Mean: number;

  /**
   * F0 variability — coefficient of variation (%).
   * Measures pitch range across the recording.
   */
  f0Variability: number;

  /**
   * Jitter — period perturbation quotient (%).
   * Measures cycle-to-cycle F0 variation.
   * Acoustic indicator of vocal fold regularity.
   * IMPORTANT: Jitter alone does NOT diagnose vocal fatigue.
   * Typical values in healthy voice: < 1.04%
   */
  jitter: number;

  /**
   * Shimmer — amplitude perturbation quotient (%).
   * Measures cycle-to-cycle amplitude variation.
   * Acoustic indicator of phonatory amplitude stability.
   * IMPORTANT: Shimmer alone does NOT diagnose vocal fatigue.
   * Typical values: < 3.81%
   */
  shimmer: number;

  /**
   * Speech rate — voiced frames per total frames (ratio 0–1).
   * Derived from voiced/unvoiced detection.
   * NOT a transcription-based word rate.
   */
  voicedRatio: number;

  /**
   * Pause ratio — silence frames per total frames (ratio 0–1).
   */
  pauseRatio: number;

  /**
   * RMS energy — root mean square of signal amplitude (0–1 normalized).
   */
  rmsEnergy: number;

  /**
   * Signal-to-noise ratio — estimated SNR in dB.
   * Based on comparison of voiced vs. silent segments.
   */
  estimatedSnr: number;

  /**
   * Clipping ratio — proportion of samples at ±1.0 (0–1).
   * Indicates recording quality issues.
   */
  clippingRatio: number;

  /**
   * Recording quality assessment.
   * GOOD: clipping < 0.5%, SNR > 10 dB, duration sufficient.
   * DEGRADED: some quality issues but analysis still possible.
   * POOR: analysis not reliable, should return NOT_ANALYZED.
   */
  recordingQuality: "GOOD" | "DEGRADED" | "POOR";

  /**
   * Duration of the analyzed audio in seconds.
   */
  durationSeconds: number;

  /**
   * Sample rate of the analyzed audio in Hz.
   */
  sampleRateHz: number;

  /**
   * Version of the acoustic extraction engine.
   */
  engineVersion: string;

  /**
   * ISO 8601 timestamp of extraction.
   */
  extractedAt: string;
}

// ─────────────────────────────────────────────
// 3. PROCESSING RESULT
// ─────────────────────────────────────────────

/**
 * Successful analysis result.
 */
export interface VoiceAnalyzedResult {
  status: "ANALYZED";
  features: VoiceAcousticFeatures;
}

/**
 * Result when analysis could not be performed.
 * NEVER fabricate measurements — always use this type instead.
 */
export interface VoiceNotAnalyzedResult {
  status: "NOT_ANALYZED";
  reason: VoiceNotAnalyzedReason;
  detail?: string;
}

/**
 * Result when input was rejected at validation.
 */
export interface VoiceInvalidInputResult {
  status: "INVALID_INPUT";
  reason: VoiceNotAnalyzedReason;
  detail?: string;
}

export type VoiceProcessingResult =
  | VoiceAnalyzedResult
  | VoiceNotAnalyzedResult
  | VoiceInvalidInputResult;

// ─────────────────────────────────────────────
// 4. API CONTRACT
// ─────────────────────────────────────────────

/**
 * Request body for POST /api/voice/process
 */
export interface VoiceProcessRequest {
  sessionId: string;
  /** Pre-computed acoustic features from browser-side Web Audio API extraction */
  acousticFeatures: VoiceAcousticFeatures;
  /** Audio storage path in Supabase Storage (for audit) */
  audioStoragePath?: string;
}

/**
 * API response for POST /api/voice/process
 * Status field always present so clients can check before reading features.
 */
export interface VoiceProcessApiResponse {
  success: boolean;
  status: VoiceAnalysisStatus;
  analysis?: VoiceAcousticFeatures;
  reason?: VoiceNotAnalyzedReason;
  detail?: string;
  timestamp: string;
}

// ─────────────────────────────────────────────
// 5. CONSENT
// ─────────────────────────────────────────────

/**
 * Voice consent categories.
 *
 * IMPORTANT: Standard voice_ergonomics_processing is NOT biometric identification.
 * It measures acoustic signal properties — it does not identify individuals from voice.
 *
 * Legal classification note (for DPO review):
 * - If the system can identify individuals from voice: biometric data (Art. 9 RGPD)
 * - If the system only measures acoustic signal properties and CANNOT identify individuals:
 *   standard personal data requiring consent under Art. 6(1)(a) RGPD
 * - This system does NOT perform speaker identification.
 */
export type VoiceConsentType =
  | "voice_ergonomics_processing"     // Acoustic signal analysis for occupational ergonomics
  | "voice_biometry_analysis";        // Legacy type — retained for backward compatibility

export interface VoiceConsentRecord {
  employeeId: string;
  tenantId: string;
  consentType: VoiceConsentType;
  isGranted: boolean;
  termsVersion: string;
  grantedAt?: string;
  revokedAt?: string;
}

// ─────────────────────────────────────────────
// 6. PRIVACY & DATA LIFECYCLE
// ─────────────────────────────────────────────

/**
 * Voice data retention policy.
 * Raw audio should be deleted after feature extraction or within TTL.
 */
export interface VoiceRetentionPolicy {
  rawAudioTtlHours: number;         // Default: 24
  featuresRetentionDays: number;    // Default: 365 (1 year, standard occupational records)
  deleteOnConsentRevocation: boolean; // Always: true
}

export const DEFAULT_VOICE_RETENTION_POLICY: VoiceRetentionPolicy = {
  rawAudioTtlHours: 24,
  featuresRetentionDays: 365,
  deleteOnConsentRevocation: true
};

// ─────────────────────────────────────────────
// 7. FORBIDDEN OUTPUTS — TYPE-LEVEL ENFORCEMENT
// ─────────────────────────────────────────────

/**
 * Forbidden output types.
 * These types must NEVER be created, returned, or stored by this module.
 * They exist here as documentation of the prohibited scope.
 */
export type _ForbiddenVoiceOutput_DoNotImplement =
  | { emotionalState: string }       // FORBIDDEN: EU AI Act Art. 5
  | { stressLevel: number }          // FORBIDDEN: Medical inference
  | { burnoutRisk: number }          // FORBIDDEN: Medical inference
  | { mentalHealthScore: number }    // FORBIDDEN: Medical inference
  | { speakerIdentity: string }      // FORBIDDEN: Biometric identification
  | { performanceRating: number }    // FORBIDDEN: Employee surveillance
  | { psychologicalFitness: string } // FORBIDDEN: Employment decision
  | { employeeRanking: number };     // FORBIDDEN: Worker ranking
