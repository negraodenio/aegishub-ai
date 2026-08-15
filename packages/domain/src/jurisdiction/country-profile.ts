export type CountryCode = "PT" | "BR";

export interface JurisdictionTerminology {
  taxIdLabel: string; // "NIPC / NIF" (PT) vs "CNPJ" (BR)
  economicActivityLabel: string; // "CAE" (PT) vs "CNAE" (BR)
  laborAuthorityName: string; // "ACT (Autoridade para as Condições do Trabalho)" (PT) vs "MTE (Ministério do Trabalho e Emprego)" (BR)
  mainStandardName: string; // "Lei n.º 102/2009" (PT) vs "NR-1 (GRO / PGR)" (BR)
  riskInventoryName: string; // "Mapa de Avaliação de Riscos" (PT) vs "Inventário de Riscos Ocupacionais" (BR)
  actionPlanName: string; // "Plano de Prevenção de SST" (PT) vs "Plano de Ação do PGR" (BR)
  assessmentUnitLabel: string; // "Unidade Orgânica / Departamento" (PT) vs "Unidade / Setor / Processo" (BR)
  hazardFactorLabel: string; // "Fator de Risco Psicossocial" (PT) vs "Perigo / Fator de Risco Psicossocial" (BR)
  workerParticipationModule: string; // "Consulta e Participação (Art. 18º)" (PT) vs "Worker Voice (NR-1.5.3.3)" (BR)
  whistleblowerLaw: string; // "Lei n.º 93/2021" (PT) vs "Canal de Ética e Denúncias (Lei 14.457/2022)" (BR)
  disconnectLaw: string; // "Lei n.º 83/2021 (Direito à Desconexão)" (PT) vs "Gestão de Sobrecarga e Desconexão" (BR)
  privacyRegulation: string; // "RGPD (Regulamento UE 2016/679)" (PT) vs "LGPD (Lei nº 13.709/2018)" (BR)
}

export interface LegalFramework {
  primaryLegislation: string;
  whistleblowerLegislation: string;
  disconnectLegislation: string;
  privacyLegislation: string;
  aiGovernanceStandard: string;
  statutoryReports: string[];
}

export interface CountryProfile {
  countryCode: CountryCode;
  name: string;
  flagEmoji: string;
  language: "pt-PT" | "pt-BR";
  timezone: string;
  currency: "EUR" | "BRL";
  currencySymbol: string;
  legalFramework: LegalFramework;
  terminology: JurisdictionTerminology;
  enabledModules: {
    copsoq: boolean;
    workerVoice: boolean;
    disconnectRisk: boolean;
    whistleblowerChannel: boolean;
    actReporting: boolean;
    nr1PgrReporting: boolean;
    voiceBiometrics: boolean;
  };
  privacyProfile: {
    standard: "RGPD" | "LGPD";
    termsVersion: string;
    dpoRoleTitle: string;
    retentionYears: number;
  };
}

export const PORTUGAL_PROFILE: CountryProfile = {
  countryCode: "PT",
  name: "Portugal",
  flagEmoji: "🇵🇹",
  language: "pt-PT",
  timezone: "Europe/Lisbon",
  currency: "EUR",
  currencySymbol: "€",
  legalFramework: {
    primaryLegislation: "Lei n.º 102/2009 (Regime Jurídico da Promoção da SST)",
    whistleblowerLegislation: "Lei n.º 93/2021 (Proteção de Denunciantes)",
    disconnectLegislation: "Lei n.º 83/2021 (Dever de Abstenção de Contacto)",
    privacyLegislation: "RGPD (Regulamento UE 2016/679)",
    aiGovernanceStandard: "EU AI Act (Regulamento UE 2024/1689)",
    statutoryReports: ["Relatório de Avaliação de Riscos Psicossociais (ACT)", "Relatório Anual das Atividades de SST (Anexo D)"]
  },
  terminology: {
    taxIdLabel: "NIPC / NIF",
    economicActivityLabel: "CAE",
    laborAuthorityName: "ACT (Autoridade para as Condições do Trabalho)",
    mainStandardName: "Lei n.º 102/2009",
    riskInventoryName: "Mapa de Riscos e Avaliação Estrutural",
    actionPlanName: "Plano de Medidas de Prevenção (Art. 15º)",
    assessmentUnitLabel: "Unidade Orgânica / Departamento",
    hazardFactorLabel: "Fator de Risco Psicossocial",
    workerParticipationModule: "Consulta e Informação aos Trabalhadores (Art. 18º)",
    whistleblowerLaw: "Lei n.º 93/2021",
    disconnectLaw: "Lei n.º 83/2021 (Direito a Desligar)",
    privacyRegulation: "RGPD"
  },
  enabledModules: {
    copsoq: true,
    workerVoice: true,
    disconnectRisk: true,
    whistleblowerChannel: true,
    actReporting: true,
    nr1PgrReporting: false,
    voiceBiometrics: true
  },
  privacyProfile: {
    standard: "RGPD",
    termsVersion: "v1.2 (Portugal Lei 102/2009 & RGPD)",
    dpoRoleTitle: "Encarregado de Proteção de Dados (DPO)",
    retentionYears: 5
  }
};

export const BRAZIL_PROFILE: CountryProfile = {
  countryCode: "BR",
  name: "Brasil",
  flagEmoji: "🇧🇷",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  currency: "BRL",
  currencySymbol: "R$",
  legalFramework: {
    primaryLegislation: "Norma Regulamentadora nº 01 (NR-1) — GRO / PGR",
    whistleblowerLegislation: "Lei nº 14.457/2022 (Programa Emprega + Mulher / CIPA+A)",
    disconnectLegislation: "CLT Art. 244 / NR-17 (Ergonomia e Gestão de Sobrecarga)",
    privacyLegislation: "LGPD (Lei nº 13.709/2018)",
    aiGovernanceStandard: "Marco Ético de IA (EBIA / ISO/IEC 42001)",
    statutoryReports: ["Inventário de Riscos Ocupacionais (NR-1)", "Plano de Ação do PGR (NR-1)"]
  },
  terminology: {
    taxIdLabel: "CNPJ",
    economicActivityLabel: "CNAE",
    laborAuthorityName: "MTE (Ministério do Trabalho e Emprego)",
    mainStandardName: "NR-1 (GRO / PGR)",
    riskInventoryName: "Inventário de Riscos Ocupacionais",
    actionPlanName: "Plano de Ação do PGR (NR-1.5.5)",
    assessmentUnitLabel: "Unidade / Setor / Processo",
    hazardFactorLabel: "Perigo / Fator de Risco Psicossocial",
    workerParticipationModule: "Worker Voice (Participação dos Trabalhadores - NR-1.5.3.3)",
    whistleblowerLaw: "Canal de Denúncias e Integridade (Lei 14.457/2022 CIPA+A)",
    disconnectLaw: "Gestão da Sobrecarga e Desconexão",
    privacyRegulation: "LGPD"
  },
  enabledModules: {
    copsoq: true,
    workerVoice: true,
    disconnectRisk: true,
    whistleblowerChannel: true,
    actReporting: false,
    nr1PgrReporting: true,
    voiceBiometrics: true
  },
  privacyProfile: {
    standard: "LGPD",
    termsVersion: "v1.0 (Brasil NR-1 & LGPD Art. 7/11)",
    dpoRoleTitle: "Encarregado de Dados (DPO / LGPD)",
    retentionYears: 5
  }
};

export const COUNTRY_PROFILES: Record<CountryCode, CountryProfile> = {
  PT: PORTUGAL_PROFILE,
  BR: BRAZIL_PROFILE
};

export function getCountryProfile(countryCode?: string | null): CountryProfile {
  if (!countryCode) return PORTUGAL_PROFILE;
  const upper = countryCode.toUpperCase() as CountryCode;
  return COUNTRY_PROFILES[upper] || PORTUGAL_PROFILE;
}
