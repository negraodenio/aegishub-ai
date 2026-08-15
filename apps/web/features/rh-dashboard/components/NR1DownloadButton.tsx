"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { NR1PGRReportPDF, generateNR1PGRMockData, type NR1PGRReportData } from '../../compliance/templates/NR1PGRReportPDF';
import { FileDown, Loader2 } from 'lucide-react';

export function NR1DownloadButton({ 
  tenantName,
  data 
}: { 
  tenantName: string;
  data?: NR1PGRReportData;
}) {
  const reportData = data || generateNR1PGRMockData(tenantName);

  return (
    <PDFDownloadLink
      document={<NR1PGRReportPDF data={reportData} />}
      fileName={`Relatorio_NR1_PGR_${tenantName.replace(/\s+/g, '_')}_2026.pdf`}
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
          <span>{loading ? 'Gerando PDF...' : 'Exportar PGR (NR-1)'}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
