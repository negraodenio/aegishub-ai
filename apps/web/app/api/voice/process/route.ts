import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyAssessmentToken } from "@/utils/assessment-token";
import { voiceRateLimiter } from "@mindops/ai-core";
import type { VoiceProcessRequest, VoiceProcessApiResponse, VoiceAcousticFeatures } from "@mindops/ai-core";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// FEATURE VALIDATION RANGES
// Values outside these ranges indicate corrupted or fabricated data.
// ─────────────────────────────────────────────
const FEATURE_RANGES = {
  f0Mean: [0, 600],           // 0 = not computed; 70–400 normal speech
  f0Variability: [0, 200],
  jitter: [-1, 30],           // -1 = not computed
  shimmer: [-1, 50],          // -1 = not computed
  voicedRatio: [0, 1],
  pauseRatio: [0, 1],
  rmsEnergy: [0, 1],
  estimatedSnr: [-20, 60],
  clippingRatio: [0, 1],
  durationSeconds: [3, 60],
  sampleRateHz: [8000, 96000]
} as const;

/**
 * Validates that extracted features are within plausible ranges.
 * This prevents storing corrupted or injected data.
 */
function validateFeatureRanges(features: VoiceAcousticFeatures): string | null {
  for (const [key, [min, max]] of Object.entries(FEATURE_RANGES)) {
    const value = features[key as keyof VoiceAcousticFeatures];
    if (typeof value !== "number" || value < min || value > max) {
      return `Feature '${key}' out of valid range [${min}, ${max}]: ${value}`;
    }
  }
  return null; // Valid
}

/**
 * POST /api/voice/process
 *
 * P5.3 — Real Acoustic Analysis Backend
 *
 * WHAT THIS ENDPOINT DOES:
 * 1. Authenticates the request via Bearer token.
 * 2. Enforces rate limiting per authenticated employee.
 * 3. Validates session ownership (anti-IDOR).
 * 4. Checks voice consent is granted.
 * 5. Receives pre-computed acoustic features from browser-side engine.
 * 6. Validates feature ranges (guards against injected data).
 * 7. Persists features to voice_features table.
 * 8. Returns the stored features with ANALYZED status.
 *
 * WHAT THIS ENDPOINT DOES NOT DO:
 * - Does NOT fabricate measurements.
 * - Does NOT infer emotion, stress, mental health, or personality.
 * - Does NOT identify the employee from their voice.
 * - Does NOT return hardcoded values.
 * - Does NOT expose results to managers or HR.
 *
 * API CONTRACT:
 * On success:  { success: true, status: "ANALYZED", analysis: {...}, timestamp }
 * On failure:  { success: true, status: "NOT_ANALYZED", reason: "...", timestamp }
 * On error:    { success: false, error: "...", timestamp } + HTTP 4xx/5xx
 */
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // ── 1. Authentication ────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Authentication token is required", timestamp },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1] ?? "";
    const { success: tokenValid, employeeId, tenantId } = await verifyAssessmentToken(token);

    if (!tokenValid || !employeeId || !tenantId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Token is invalid or expired", timestamp },
        { status: 401 }
      );
    }

    // ── 2. Rate Limiting ─────────────────────────────────────────────────────
    const rateLimit = voiceRateLimiter.check(employeeId);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `RATE_LIMIT_EXCEEDED: Voice analysis rate limit reached. Retry in ${rateLimit.retryAfterSeconds}s.`,
          timestamp
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining)
          }
        }
      );
    }

    // ── 3. Parse & Validate Payload ──────────────────────────────────────────
    let body: VoiceProcessRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "BAD_REQUEST: Invalid JSON body", timestamp },
        { status: 400 }
      );
    }

    const { sessionId, acousticFeatures, audioStoragePath } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "BAD_REQUEST: sessionId is required", timestamp },
        { status: 400 }
      );
    }

    if (!acousticFeatures) {
      // No features provided — return NOT_ANALYZED honestly
      // This is the expected response when the browser engine fails
      const response: VoiceProcessApiResponse = {
        success: true,
        status: "NOT_ANALYZED",
        reason: "ACOUSTIC_ENGINE_UNAVAILABLE",
        timestamp
      };
      return NextResponse.json(response);
    }

    // ── 4. Feature Range Validation ──────────────────────────────────────────
    const rangeError = validateFeatureRanges(acousticFeatures);
    if (rangeError) {
      return NextResponse.json(
        { error: `BAD_REQUEST: ${rangeError}`, timestamp },
        { status: 400 }
      );
    }

    // If recording quality is POOR, the browser should not have sent features
    // but handle it defensively
    if (acousticFeatures.recordingQuality === "POOR") {
      const response: VoiceProcessApiResponse = {
        success: true,
        status: "NOT_ANALYZED",
        reason: "AUDIO_QUALITY_INSUFFICIENT",
        detail: "Recording quality was too low for reliable acoustic analysis",
        timestamp
      };
      return NextResponse.json(response);
    }

    const supabase = await createClient();

    // ── 5. Session Ownership (Anti-IDOR) ─────────────────────────────────────
    const { data: session, error: sessionError } = await (supabase
      .from("assessment_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("employee_id", employeeId)
      .single() as any);

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "FORBIDDEN: Access denied to this assessment session", timestamp },
        { status: 403 }
      );
    }

    // ── 6. Consent Verification ───────────────────────────────────────────────
    const { data: consentRecord } = await (supabase
      .from("consent_logs")
      .select("is_granted")
      .eq("employee_id", employeeId)
      .eq("tenant_id", tenantId)
      .in("consent_type", ["voice_biometry_analysis", "voice_ergonomics_processing"])
      .eq("is_granted", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as any);

    if (!consentRecord?.is_granted) {
      const response: VoiceProcessApiResponse = {
        success: true,
        status: "NOT_ANALYZED",
        reason: "CONSENT_NOT_GRANTED",
        timestamp
      };
      return NextResponse.json(response);
    }

    // ── 7. Persist Real Acoustic Features ────────────────────────────────────
    // Only real, validated features are persisted — never hardcoded values
    const { error: insertError } = await (supabase.from as any)("voice_features").upsert({
      session_id: sessionId,
      feature_set_version: acousticFeatures.engineVersion,
      f0_mean: acousticFeatures.f0Mean > 0 ? acousticFeatures.f0Mean : null,
      jitter_local: acousticFeatures.jitter >= 0 ? acousticFeatures.jitter : null,
      shimmer_local: acousticFeatures.shimmer >= 0 ? acousticFeatures.shimmer : null,
      hnr_mean: acousticFeatures.estimatedSnr,
      speech_rate: acousticFeatures.voicedRatio,
      pause_ratio: acousticFeatures.pauseRatio,
      created_at: acousticFeatures.extractedAt
    });

    if (insertError) {
      // Storage failed — still return the analysis, just log warning
      console.warn("[VOICE_PERSIST_WARN]", insertError.message);
    }

    // ── 8. Audit Log ─────────────────────────────────────────────────────────
    await (supabase.from as any)("voice_audit_log").insert({
      session_id: sessionId,
      event_type: "acoustic_analysis_stored",
      actor_type: "employee_self",
      details_json: {
        engineVersion: acousticFeatures.engineVersion,
        recordingQuality: acousticFeatures.recordingQuality,
        durationSeconds: acousticFeatures.durationSeconds,
        hasJitter: acousticFeatures.jitter >= 0,
        hasShimmer: acousticFeatures.shimmer >= 0,
        // Never log raw feature values in audit log — only metadata
        audioStoragePath: audioStoragePath ?? null
      }
    });

    // ── 9. Return Real Features ───────────────────────────────────────────────
    const response: VoiceProcessApiResponse = {
      success: true,
      status: "ANALYZED",
      analysis: acousticFeatures,
      timestamp
    };

    return NextResponse.json(response);

  } catch (error) {
    // Fail-safe: never fabricate. Always return NOT_ANALYZED on unexpected errors.
    // The text-only workflow remains fully functional.
    console.error("[VOICE_PROCESS_ERROR]", error);

    const response: VoiceProcessApiResponse = {
      success: true,
      status: "NOT_ANALYZED",
      reason: "PROCESSING_ERROR",
      detail: "An unexpected error occurred. The text-only workflow remains fully available.",
      timestamp
    };

    return NextResponse.json(response, { status: 500 });
  }
}
