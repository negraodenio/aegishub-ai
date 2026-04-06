import { DPODashboard } from "../../../features/compliance/components/DPODashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DPO Compliance Center | AEGIS HUB",
  description: "Monitorização de conformidade RGPD e AI Act para gestores e auditores.",
};

export default function CompliancePage() {
  // Em produção, estes dados viriam de uma session/API.
  const mockStats = {
    companyName: "SafeHorizon Tech Solutions",
    role: "Encarregado de Proteção de Dados (DPO)",
  };

  return (
    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <DPODashboard companyName={mockStats.companyName} />
    </div>
  );
}
