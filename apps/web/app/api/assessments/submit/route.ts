import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, consents, answers } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
    }

    if (!consents?.data_processing) {
      return NextResponse.json({ error: "Consent to process sensitive data is missing" }, { status: 403 });
    }

    // Example Backend Processing (COPSOQ-II Engine)
    // 1. Calculate the scoring for the answers
    // 2. Validate the consent (record with a cryptographic hash)
    // 3. Update the health records (creating an anonymous ID)
    
    // Simulating database insertion and scoring process:
    const receiptCode = `WRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Return the summary data that limits what the worker sees,
    // usually indicating only 'Severe' / 'Normal' without exposing complex clinical terms
    return NextResponse.json({
      success: true,
      data: {
        receiptCode,
        clinicalInsight: "O seu estado aparenta resiliência. Sem indícios de alerta para Fadiga Severa.",
        recommendation: "Pode contactar a linha de triagem se precisar."
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
