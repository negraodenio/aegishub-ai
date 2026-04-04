import { type COPSOQResponse, COPSOQ_DIMENSIONS } from "../instruments/copsoq";

export interface DimensionResult {
  score: number; // 0-100
  riskLevel: "baixo" | "medio" | "alto";
  interpretation: string;
}

export function calculateCOPSOQScore(
  dimensionCode: string,
  responses: COPSOQResponse[]
): DimensionResult {
  const dimension = COPSOQ_DIMENSIONS[dimensionCode];
  if (!dimension) {
    throw new Error(`Dimension ${dimensionCode} not found`);
  }

  // 1. Calculate raw mean (Likert 1-5)
  const processedValues = responses.map((r) => {
    let val = r.value;
    if (r.isReversed) val = 6 - val;
    return val;
  });

  const rawMean = processedValues.reduce((a, b) => a + b, 0) / processedValues.length;
  
  // 2. Standardize to 0-100 scale
  const standardizedScore = ((rawMean - 1) / 4) * 100;

  // 3. Determine risk level (40/60 percentiles)
  let riskLevel: "baixo" | "medio" | "alto" = "medio";
  
  if (dimension.isPositive) {
    // For positive: <40 is high risk, >60 is low risk
    if (standardizedScore < 40) riskLevel = "alto";
    else if (standardizedScore > 60) riskLevel = "baixo";
  } else {
    // For negative: >60 is high risk, <40 is low risk
    if (standardizedScore > 60) riskLevel = "alto";
    else if (standardizedScore < 40) riskLevel = "baixo";
  }

  return {
    score: Math.round(standardizedScore),
    riskLevel,
    interpretation: getInterpretation(dimensionCode, riskLevel)
  };
}

function getInterpretation(code: string, level: string): string {
  const dictionary: Record<string, Record<string, string>> = {
    QD: { alto: "Exigências quantitativas excessivas (NR-1/ACT).", baixo: "Carga de trabalho equilibrada.", medio: "Exigências moderadas." },
    SLP: { alto: "Indicadores de Burnout severos (MBI).", baixo: "Resiliência adequada.", medio: "Sintomas iniciais." },
    OB: { alto: "Comportamentos ofensivos detectados (Art. 29 CT).", baixo: "Ambiente saudável.", medio: "Conflitos ocasionais." }
  };
  return dictionary[code]?.[level] || "Nível avaliado conforme COPSOQ-II.";
}
