export interface DisconnectRiskInput {
  afterHoursActivityPercent?: number; // 0-100 (estimativa agregada)
  quantitativeDemandsScore?: number; // 0-100 (exigências de ritmo/volume)
  recoveryImpairmentScore?: number; // 0-100 (dificuldade de desconexão relatada)
  reportedExcessiveContact?: boolean;
}

export interface DisconnectRiskResult {
  disconnectRiskScore: number; // 0-100
  riskLevel: "baixo" | "moderado" | "elevado" | "critico";
  statusDescription: string;
  recommendedMeasure: string;
  legalReference: string;
}

/**
 * Calcula o indicador agregado de Risco Organizacional de Desconexão
 * Alinhado à Lei n.º 83/2021 (PT - Abstenção de Contacto) e NR-1 / CLT (BR)
 */
export function calculateOrganizationalDisconnectRisk(
  input: DisconnectRiskInput,
  countryCode: "PT" | "BR" = "PT"
): DisconnectRiskResult {
  const afterHours = input.afterHoursActivityPercent ?? 20;
  const demands = input.quantitativeDemandsScore ?? 40;
  const recovery = input.recoveryImpairmentScore ?? 35;

  // Ponderação: 40% dificuldade de recuperação, 35% exigências quantitativas, 25% atividade fora de horário
  let rawScore = (recovery * 0.40) + (demands * 0.35) + (afterHours * 0.25);

  if (input.reportedExcessiveContact) {
    rawScore = Math.min(100, rawScore + 15);
  }

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let riskLevel: DisconnectRiskResult["riskLevel"] = "baixo";
  let statusDescription = "Práticas de desconexão e tempos de descanso adequados.";
  let recommendedMeasure = "Manter monitoramento preventivo periódico.";

  if (score >= 75) {
    riskLevel = "critico";
    statusDescription = "Elevada sobrecarga com violação frequente dos períodos de descanso.";
    recommendedMeasure = "Implementação imediata de travas de comunicação pós-expediente e redistribuição de tarefas.";
  } else if (score >= 55) {
    riskLevel = "elevado";
    statusDescription = "Indícios de contato recorrente fora da jornada de trabalho e dificuldade de recuperação.";
    recommendedMeasure = "Revisão de acordos de disponibilidade e reforço das políticas de abstenção de contato.";
  } else if (score >= 35) {
    riskLevel = "moderado";
    statusDescription = "Exigências pontuais fora de jornada identificadas em departamentos operacionais específicos.";
    recommendedMeasure = "Sensibilização das lideranças quanto aos limites de jornada e pausas regulares.";
  }

  const legalReference = countryCode === "PT" 
    ? "Lei n.º 83/2021 (Dever de Abstenção de Contacto — Código do Trabalho PT)"
    : "NR-1.5.3 (Gestão de Sobrecarga e Limites de Jornada)";

  return {
    disconnectRiskScore: score,
    riskLevel,
    statusDescription,
    recommendedMeasure,
    legalReference
  };
}
