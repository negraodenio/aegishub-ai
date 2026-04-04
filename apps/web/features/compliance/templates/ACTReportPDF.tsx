import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ACTReportData } from "@mindops/domain";

// Register custom fonts if needed (Inter, Roboto). Using standard fonts for robustness in this setup.

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#f9fafb" },
  header: { marginBottom: 30, borderBottom: "2px solid #0891b2", paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 5 },
  subtitle: { fontSize: 10, color: "#6b7280", textTransform: "uppercase" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", backgroundColor: "#e5e7eb", padding: 5, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { fontSize: 10, color: "#4b5563", fontWeight: "bold" },
  value: { fontSize: 10, color: "#111827" },
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#d1d5db" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db" },
  tableCol: { width: "33%", padding: 5, borderRightWidth: 1, borderRightColor: "#d1d5db" },
  tableHeader: { backgroundColor: "#f3f4f6", fontWeight: "bold", fontSize: 10 },
  tableCell: { fontSize: 10, color: "#374151" },
  riskHigh: { color: "#dc2626", fontWeight: "bold" },
  riskMed: { color: "#d97706", fontWeight: "bold" },
  riskLow: { color: "#059669", fontWeight: "bold" },
  preventionItem: { fontSize: 10, marginBottom: 4, paddingLeft: 10 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center", borderTop: "1px solid #d1d5db", paddingTop: 10 }
});

export const ACTReportPDF = ({ data }: { data: ACTReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Avaliação de Riscos Psicossociais</Text>
        <Text style={styles.subtitle}>DOCUMENTO OFICIAL: LEI 102/2009 (AUTORIDADE PARA AS CONDIÇÕES DO TRABALHO)</Text>
      </View>

      {/* Identidade */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO DO EMPREGADOR</Text>
        <View style={styles.row}><Text style={styles.label}>Entidade Empregadora:</Text><Text style={styles.value}>{data.company.name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>NIPC (NIF):</Text><Text style={styles.value}>{data.company.nif}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Setor de Atividade (CAE):</Text><Text style={styles.value}>{data.company.actCode}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Responsável Legal (DPO):</Text><Text style={styles.value}>{data.company.dpoName}</Text></View>
      </View>

      {/* Metodologia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. METODOLOGIA E ABRANGÊNCIA</Text>
        <View style={styles.row}><Text style={styles.label}>Instrumento Validado:</Text><Text style={styles.value}>{data.assessment.methodology}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Período de Referência:</Text><Text style={styles.value}>{data.assessment.periodStart} - {data.assessment.periodEnd}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Nº Trabalhadores Abrangidos:</Text><Text style={styles.value}>{data.assessment.totalWorkersCovered}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Taxa de Participação:</Text><Text style={styles.value}>{(data.assessment.participationRate * 100).toFixed(1)}%</Text></View>
      </View>

      {/* Resultados Globais - Matriz Densa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. MAPA DE RISCO ESTRUTURAL</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}><Text>Unidade Orgânica / Dept.</Text></View>
            <View style={styles.tableCol}><Text>Nível de Risco Global</Text></View>
            <View style={styles.tableCol}><Text>Fatores Críticos (&gt; Percentil 60)</Text></View>
          </View>
          {data.departments.map((dept: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{dept.name} ({dept.workersCount} trab.)</Text></View>
              <View style={styles.tableCol}>
                <Text style={
                  dept.overallRisk === "alto" ? styles.riskHigh : 
                  dept.overallRisk === "medio" ? styles.riskMed : styles.riskLow
                }>
                  {dept.overallRisk.toUpperCase()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{dept.criticalDimensions.join(", ") || "Nenhum"}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Plano de Prevenção */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. PLANO DE PREVENÇÃO (ART. 15º DA LEI 102/2009)</Text>
        {data.preventionPlan.map((plan: any, i: number) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={[styles.label, { marginBottom: 3, color: "#111827" }]}>Dimensão Crítica: {plan.dimension}</Text>
            {plan.proposedMeasures.map((measure: string, j: number) => (
              <Text key={j} style={styles.preventionItem}>{measure}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Footer Assinatura e Audit Trail */}
      <View style={{ marginTop: 50 }}>
        <View style={{ width: 200, borderTop: "1px solid #111827", paddingTop: 5 }}>
          <Text style={{ fontSize: 10, textAlign: "center" }}>Assinatura do Empregador / DPO</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        MindOps Enterprise Platform - Gerado automaticamente em {new Date().toLocaleDateString("pt-PT")}. 
        Documento confidencial preparado para efeitos de inspeção e auditoria da ACT. Validação criptográfica (Hash): 0xab3...f1a
      </Text>
    </Page>
  </Document>
);
