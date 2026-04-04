export interface GuardrailCheck {
  passed: boolean;
  violations: string[];
}

const FORBIDDEN = [
  "diagnóstico",
  "diagnosticado",
  "você tem",
  "sofre de",
  "transtorno",
  "prescrição",
  "medicamento"
];

export function checkClinicalGuardrails(output: string): GuardrailCheck {
  const lower = output.toLowerCase();
  const violations = FORBIDDEN.filter((word) => lower.includes(word));
  return {
    passed: violations.length === 0,
    violations
  };
}

export function wrapWithDisclaimer(content: string): string {
  return `${content}

⚠️ Este conteúdo é assistivo e não substitui avaliação clínica profissional.`;
}
