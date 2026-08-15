import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface NR1PGRReportData {
  company: {
    name: string;
    cnpj: string;
    cnae: string;
    riskDegree: string;
    responsibleSST: string;
  };
  assessment: {
    periodStart: string;
    periodEnd: string;
    methodology: string;
    totalWorkers: number;
    participationRate: number;
  };
  riskInventory: {
    sector: string;
    processActivity: string;
    hazardFactor: string;
    probability: "Baixa" | "Média" | "Alta";
    severity: "Leve" | "Moderada" | "Grave";
    riskLevel: "baixo" | "medio" | "alto" | "critico";
    exposedWorkersCount: number;
  }[];
  actionPlan: {
    hazardFactor: string;
    preventiveMeasure: string;
    responsible: string;
    deadline: string;
    evidenceNotes: string;
    reassessmentDate: string;
    status: string;
  }[];
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 24, borderBottom: "2px solid #059669", paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#064e3b", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", backgroundColor: "#f0fdf4", color: "#166534", padding: 5, marginBottom: 8, borderLeft: "3px solid #10b981" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 9, color: "#475569", fontWeight: "bold" },
  value: { fontSize: 9, color: "#0f172a" },
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tableColSmall: { width: "20%", padding: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableColMed: { width: "30%", padding: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableColLarge: { width: "50%", padding: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  tableHeader: { backgroundColor: "#f8fafc", fontWeight: "bold", fontSize: 8, color: "#334155" },
  tableCell: { fontSize: 8, color: "#1e293b" },
  riskCritical: { color: "#b91c1c", fontWeight: "bold", fontSize: 8 },
  riskHigh: { color: "#ea580c", fontWeight: "bold", fontSize: 8 },
  riskMed: { color: "#d97706", fontWeight: "bold", fontSize: 8 },
  riskLow: { color: "#059669", fontWeight: "bold", fontSize: 8 },
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, fontSize: 7, color: "#94a3b8", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8 }
});

export const NR1PGRReportPDF = ({ data }: { data: NR1PGRReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho Oficial */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Gestão de Riscos Psicossociais — NR-1 (GRO / PGR)</Text>
        <Text style={styles.subtitle}>DOCUMENTO TÉCNICO COMPLEMENTAR AO PROGRAMA DE GERENCIAMENTO DE RISCOS</Text>
      </View>

      {/* 1. Identificação da Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO DA ORGANIZAÇÃO</Text>
        <View style={styles.row}><Text style={styles.label}>Razão Social:</Text><Text style={styles.value}>{data.company.name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>CNPJ:</Text><Text style={styles.value}>{data.company.cnpj}</Text></View>
        <View style={styles.row}><Text style={styles.label}>CNAE Principal / Grau de Risco:</Text><Text style={styles.value}>{data.company.cnae} — Grau {data.company.riskDegree}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Responsável Técnico SST:</Text><Text style={styles.value}>{data.company.responsibleSST}</Text></View>
      </View>

      {/* 2. Metodologia e Escuta (Worker Voice - NR-1.5.3.3) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. METODOLOGIA & PARTICIPAÇÃO DOS TRABALHADORES (NR-1.5.3.3)</Text>
        <View style={styles.row}><Text style={styles.label}>Instrumento de Escuta Ativa:</Text><Text style={styles.value}>{data.assessment.methodology}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Período de Levantamento:</Text><Text style={styles.value}>{data.assessment.periodStart} a {data.assessment.periodEnd}</Text></View>
        <View style={styles.row}><Text style={styles.label}>População Avaliada / Cobertura:</Text><Text style={styles.value}>{data.assessment.totalWorkers} trabalhadores ({(data.assessment.participationRate * 100).toFixed(1)}% de adesão)</Text></View>
      </View>

      {/* 3. Inventário de Riscos Ocupacionais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. INVENTÁRIO DE RISCOS OCUPACIONAIS (FATORES PSICOSSOCIAIS)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColSmall}><Text>Setor / Processo</Text></View>
            <View style={styles.tableColMed}><Text>Perigo / Fator de Risco</Text></View>
            <View style={styles.tableColSmall}><Text>Probabilidade / Gravidade</Text></View>
            <View style={styles.tableColSmall}><Text>Nível de Risco</Text></View>
          </View>
          {data.riskInventory.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.tableColSmall}><Text style={styles.tableCell}>{item.sector} ({item.processActivity})</Text></View>
              <View style={styles.tableColMed}><Text style={styles.tableCell}>{item.hazardFactor}</Text></View>
              <View style={styles.tableColSmall}><Text style={styles.tableCell}>{item.probability} / {item.severity}</Text></View>
              <View style={styles.tableColSmall}>
                <Text style={
                  item.riskLevel === "critico" ? styles.riskCritical :
                  item.riskLevel === "alto" ? styles.riskHigh :
                  item.riskLevel === "medio" ? styles.riskMed : styles.riskLow
                }>
                  {item.riskLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Plano de Ação do PGR */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. PLANO DE AÇÃO DO PGR (MEDIDAS DE PREVENÇÃO — NR-1.5.5)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColMed}><Text>Fator / Medida Preventiva</Text></View>
            <View style={styles.tableColSmall}><Text>Responsável</Text></View>
            <View style={styles.tableColSmall}><Text>Prazo / Reavaliação</Text></View>
            <View style={styles.tableColSmall}><Text>Status / Evidência</Text></View>
          </View>
          {data.actionPlan.map((action, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.tableColMed}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>{action.hazardFactor}</Text>
                <Text style={styles.tableCell}>{action.preventiveMeasure}</Text>
              </View>
              <View style={styles.tableColSmall}><Text style={styles.tableCell}>{action.responsible}</Text></View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{action.deadline}</Text>
                <Text style={[styles.tableCell, { color: "#64748b" }]}>Reavaliação: {action.reassessmentDate}</Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>{action.status.toUpperCase()}</Text>
                <Text style={styles.tableCell}>{action.evidenceNotes || "Aguardando evidência"}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Assinaturas Técnicas */}
      <View style={{ marginTop: 30, flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "45%", borderTop: "1px solid #334155", paddingTop: 4 }}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Eng. / Médico de Segurança do Trabalho (SST)</Text>
        </View>
        <View style={{ width: "45%", borderTop: "1px solid #334155", paddingTop: 4 }}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Representante Legal da Organização</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        AegisHub AI — Inteligência de Riscos Ocupacionais. Documento gerado em {new Date().toLocaleDateString("pt-BR")} para fins de integração com o PGR/GRO da organização. Conformidade com NR-1 e LGPD.
      </Text>
    </Page>
  </Document>
);

export function generateNR1PGRMockData(companyName: string): NR1PGRReportData {
  return {
    company: {
      name: companyName,
      cnpj: "12.345.678/0001-90",
      cnae: "62.01-5-01 - Desenvolvimento de Programas de Computador",
      riskDegree: "2",
      responsibleSST: "Eng. Roberto Vasconcelos (CREA 12345/D)"
    },
    assessment: {
      periodStart: "01/01/2026",
      periodEnd: "30/06/2026",
      methodology: "Worker Voice & Escuta Ativa Organizacional (NR-1.5.3.3)",
      totalWorkers: 158,
      participationRate: 0.91
    },
    riskInventory: [
      {
        sector: "Operações & Atendimento",
        processActivity: "Suporte ao Cliente e Resolução Crítica",
        hazardFactor: "Sobrecarga de ritmo e exigências emocionais intensas",
        probability: "Alta",
        severity: "Moderada",
        riskLevel: "alto",
        exposedWorkersCount: 42
      },
      {
        sector: "Engenharia e Produto",
        processActivity: "Desenvolvimento e Entregas Contínuas",
        hazardFactor: "Exigências de ritmo e dificuldade de desconexão pós-jornada",
        probability: "Média",
        severity: "Moderada",
        riskLevel: "medio",
        exposedWorkersCount: 75
      },
      {
        sector: "Administrativo & Financeiro",
        processActivity: "Gestão Contábil e Suprimentos",
        hazardFactor: "Clareza de papéis e comunicação interna",
        probability: "Baixa",
        severity: "Leve",
        riskLevel: "baixo",
        exposedWorkersCount: 41
      }
    ],
    actionPlan: [
      {
        hazardFactor: "Sobrecarga de ritmo (Operações)",
        preventiveMeasure: "Redistribuição de filas de chamados complexos e pausas ergonômicas estruturadas.",
        responsible: "Coordenação de Operações & Consultoria SST",
        deadline: "30/09/2026",
        evidenceNotes: "Escala de pausas atualizada e novo fluxo de triagem homologado.",
        reassessmentDate: "15/11/2026",
        status: "Em Andamento"
      },
      {
        hazardFactor: "Desconexão Pós-Jornada (Engenharia)",
        preventiveMeasure: "Política de silenciamento de notificações pós-19h e redistribuição de plantões.",
        responsible: "Gestão de Gente e Liderança Técnica",
        deadline: "15/08/2026",
        evidenceNotes: "Manual de boas práticas de desconexão publicado e termo de adesão assinado.",
        reassessmentDate: "30/10/2026",
        status: "Concluído"
      }
    ]
  };
}
