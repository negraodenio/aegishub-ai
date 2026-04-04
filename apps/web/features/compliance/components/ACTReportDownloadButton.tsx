"use client";

import dynamic from "next/dynamic";
import { generateACTReportMockData } from "@mindops/domain";
import { ACTReportPDF } from "../templates/ACTReportPDF";
import { useEffect, useState } from "react";

// Disabling SSR for PDFDownloadLink as it strictly requires Browser API
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <button className="bg-white/5 border border-white/10 px-6 py-2 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">A Carregar Motor PDF...</button> }
);

export function ACTReportDownloadButton({ companyName }: { companyName: string }) {
  const [mounted, setMounted] = useState(false);
  const data = generateACTReportMockData(companyName);

  // Prevent hydration mismatch by rendering only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PDFDownloadLink
      document={<ACTReportPDF data={data} />}
      fileName={`Relatorio_ACT_102-2009_${companyName.replace(/\s+/g, "_")}_2024.pdf`}
      className="bg-white/5 border border-white/10 px-6 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition-all text-white flex items-center justify-center min-w-[200px]"
    >
      {({ loading }) =>
        loading ? (
          <span className="animate-pulse">Gerando PDF Autorizado...</span>
        ) : (
          "Exportar DPIA / Relatório ACT (PDF)"
        )
      }
    </PDFDownloadLink>
  );
}
