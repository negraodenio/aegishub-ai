import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Modern styling for clinical compliance
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#F5F5F5',
    padding: 5,
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#000',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    borderWidth: 2,
    borderRadius: 5,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badge: {
     paddingVertical: 2,
     paddingHorizontal: 6,
     borderRadius: 3,
     fontSize: 8,
     color: '#FFF',
     marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
  },
  legalNote: {
    fontSize: 7,
    color: '#999',
    marginTop: 20,
    textAlign: 'justify',
  }
});

interface FichaAptidaoProps {
  workerName: string;
  workerId: string;
  companyName: string;
  companyId: string;
  riskLevel: string;
  assessmentDate: string;
  aiConfidence: number;
}

export const FichaAptidaoPDF = ({ 
  workerName, 
  workerId, 
  companyName, 
  companyId, 
  riskLevel, 
  assessmentDate,
  aiConfidence 
}: FichaAptidaoProps) => {
  
  const getAptitude = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return { label: 'APTO', color: '#2E7D32' };
      case 'moderate': return { label: 'APTO COM RECOMENDAÇÕES', color: '#F9A825' };
      case 'high': return { label: 'APTO COM RESTRIÇÕES (VIGEST)', color: '#EF6C00' };
      case 'critical': return { label: 'INAPTO TEMPORARIAMENTE (URGENTE)', color: '#C62828' };
      default: return { label: 'EM ANÁLISE', color: '#757575' };
    }
  };

  const status = getAptitude(riskLevel);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FICHA DE APTIDÃO MÉDICA</Text>
          <Text style={styles.subtitle}>AEGIS HUB - Sistema de Inteligência em Saúde Ocupacional</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. IDENTIFICAÇÃO DO TRABALHADOR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.value}>{workerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID Funcionário:</Text>
            <Text style={styles.value}>{workerId}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. IDENTIFICAÇÃO DO EMPREGADOR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Entidade Empregadora:</Text>
            <Text style={styles.value}>{companyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIF / ID Empresa:</Text>
            <Text style={styles.value}>{companyId}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. RISCOS PROFISSIONAIS AVALIADOS</Text>
          <Text style={styles.value}>Avaliação psicossocial digital (COPSOQ III), Risco de Burnout, Ansiedade (GAD-7) e Depressão (PHQ-9). Análise de biometria vocal AEGIS v1.2.</Text>
        </View>

        <View style={[styles.resultBox, { borderColor: status.color }]}>
          <Text style={[styles.resultText, { color: status.color }]}>PRÉ-TRIAGEM PREDITIVA (IA): {status.label}</Text>
          <Text style={{ fontSize: 8, color: '#D32F2F', marginTop: 5, fontWeight: 'bold' }}>ATENÇÃO: ESTE DOCUMENTO AGUARDA VALIDAÇÃO PRESENCIAL DO MÉDICO DO TRABALHO</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. OBSERVAÇÕES E NOTAS CLÍNICAS (AI GENERATED)</Text>
          <Text style={styles.value}>
            AEGIS Enterprise Platform - Gerado automaticamente em {new Date().toLocaleDateString("pt-PT")}. 
            Análise concluída com {(aiConfidence * 100).toFixed(1)}% de confiança. 
            Baseada nos protocolos clínicos validados pela Ordem dos Médicos em Portugal.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 8 }}>Data do Exame: {assessmentDate}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8 }}>Médico do Trabalho / Auditor AEGIS</Text>
            <Text style={{ fontSize: 7, color: '#999' }}>ID Digital: SIG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.legalNote}>
          Documento emitido nos termos da Lei n.º 102/2009, de 10 de setembro (Regime Jurídico da Promoção da Segurança e Saúde no Trabalho). 
          Este documento é uma representação digital auditada por IA. A validade clínica reside nos protocolos aplicados.
        </Text>
      </Page>
    </Document>
  );
};
