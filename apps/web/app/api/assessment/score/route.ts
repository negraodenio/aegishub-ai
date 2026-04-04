import { NextResponse } from "next/server";
import { composeRiskScore } from "@mindops/domain";
import { saveScore, completeSession } from "@mindops/database";
import { z } from "zod";

const ScoreRequestSchema = z.object({
  sessionId: z.string().uuid(),
  tenantId: z.string().uuid(),
  verticalPack: z.string(),
  phq9Score: z.number().optional(),
  gad7Score: z.number().optional(),
  burnoutScore: z.number().optional(),
  wellbeingScore: z.number().optional(),
  psychosocialRiskScore: z.number().optional(),
  voiceSignalScore: z.number().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ScoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { sessionId, tenantId, ...input } = parsed.data;

    const result = composeRiskScore({
      ...input,
      verticalPack: parsed.data.verticalPack
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    const score = result.value;

    await Promise.all([
      saveScore({
        session_id: sessionId,
        phq9_score: input.phq9Score ?? null,
        gad7_score: input.gad7Score ?? null,
        burnout_score: input.burnoutScore ?? null,
        wellbeing_score: input.wellbeingScore ?? null,
        psychosocial_risk_score: input.psychosocialRiskScore ?? null,
        voice_signal_score: input.voiceSignalScore ?? null,
        composite_risk_score: score.compositeRiskScore,
        risk_level: score.riskLevel,
        requires_human_review: score.requiresHumanReview,
        confidence: score.confidence,
        reasons: score.reasons
      }),
      completeSession(sessionId)
    ]);

    return NextResponse.json(score);
  } catch (error) {
    console.error("Scoring API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
