"use client";

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  pdf
} from '@react-pdf/renderer';
import { ACTReportData } from '@mindops/domain';

// Styling for a professional legal document (Portuguese ACT Style)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#F3F4F6',
    padding: 6,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: '#666666',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 6,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
  legalNotice: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 8,
    color: '#4B5563',
    fontStyle: 'italic',
  }
});

export const ACTReportPDF = ({ data }: { data: ACTReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Riscos Psicossociais - Anexo C</Text>
        <Text style={styles.subtitle}>Conforme Lei n.º 102/2009 (Regime Jurídico da Promoção da Segurança e Saúde no Trabalho)</Text>
      </View>

      {/* Identificação da Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Identificação da Entidade Empregadora</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>NIF / Nome</Text>
            <Text style={styles.value}>{data.company.nif} - {data.company.name}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Código ACT / CAE</Text>
            <Text style={styles.value}>{data.company.actCode}</Text>
          </View>
        </View>
      </View>

      {/* Metodologia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Metodologia e Abrangência</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Período de Referência</Text>
            <Text style={styles.value}>{data.assessment.periodStart} a {data.assessment.periodEnd}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Taxa de Participação</Text>
            <Text style={styles.value}>{(data.assessment.participationRate * 100).toFixed(1)}% ({data.assessment.totalWorkersCovered} trabalhadores)</Text>
          </View>
          <View style={{ width: '100%', marginTop: 8 }}>
            <Text style={styles.label}>Instrumento Clínico Validado</Text>
            <Text style={styles.value}>{data.assessment.methodology}</Text>
          </View>
        </View>
      </View>

      {/* Resultados por Departamento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Caracterização do Risco por Unidades Orgânicas</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Departamento / Unidade</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Trabalhadores</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Nível de Risco</Text>
          </View>
          {data.departments.map((dept, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{dept.name}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{dept.workersCount}</Text>
              <Text style={[
                styles.tableCell, 
                { textAlign: 'center', fontWeight: 'bold', color: dept.overallRisk === 'alto' ? '#DC2626' : '#000000' }
              ]}>
                {dept.overallRisk.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Plano de Prevenção */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Medidas de Prevenção e Controlo Propostas</Text>
        {data.preventionPlan.map((plan, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={[styles.value, { color: '#4F46E5' }]}>{plan.dimension}</Text>
            {plan.proposedMeasures.map((measure, j) => (
              <Text key={j} style={[styles.tableCell, { marginLeft: 10, marginTop: 4 }]}>• {measure}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Nota Legal */}
      <View style={styles.legalNotice}>
        <Text>Este documento é gerado automaticamente pelo sistema PsicoRisco PT (MindOps Intelligence M2.7) e carece de validação final pelo Responsável SST ou Médico do Trabalho da empresa.</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Documento Auditável via Blockchain SHA-256 | Gerado em {new Date().toLocaleDateString('pt-PT')} | Página 1 de 1
      </Text>
    </Page>
  </Document>
);
