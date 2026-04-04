"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ACTReportPDF } from './ACTReportPDF';
import { ACTReportData, generateACTReportMockData } from '@mindops/domain';
import { FileDown, Loader2 } from 'lucide-react';

export function ACTDownloadButton({ 
  tenantName,
  data 
}: { 
  tenantName: string;
  data?: ACTReportData;
}) {
  // If no data provided, use the generator (Audit Fallback)
  const reportData = data || generateACTReportMockData(tenantName);

  return (
    <PDFDownloadLink
      document={<ACTReportPDF data={reportData} />}
      fileName={`Relatorio_ACT_AnexoC_${tenantName.replace(/\s+/g, '_')}_2024.pdf`}
      className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-bold tracking-widest uppercase text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg group"
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <FileDown className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}
          <span>{loading ? 'A gerar PDF...' : 'Exportar Anexo C (ACT)'}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
