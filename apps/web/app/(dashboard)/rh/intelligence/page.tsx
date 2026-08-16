export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import {
  getAIGovernanceMetrics,
  getPendingAIDecisions,
  getAIAuditLogs
} from "@mindops/database";
import { AIGovernanceHeader } from "@/features/ai-governance/AIGovernanceHeader";
import { AIGovernanceKPIGrid } from "@/features/ai-governance/AIGovernanceKPIGrid";
import { HumanOversightQueue } from "@/features/ai-governance/HumanOversightQueue";
import { ModelCalibrationCard } from "@/features/ai-governance/ModelCalibrationCard";
import { DecisionExplainabilityCard } from "@/features/ai-governance/DecisionExplainabilityCard";
import { AIAuditTrailTable } from "@/features/ai-governance/AIAuditTrailTable";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default async function IntelligenceHubPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string; country?: string }>;
}) {
  try {
    const { tenantId: requestedTenantId, country: requestedCountry } = await searchParams;
    const client = await createClient();

    // 🛡️ P0/P2 SECURITY: Resolução estrita de tenant context e RBAC para Governança de IA
    const tenantContext = await resolveTenantContext({
      requiredRoles: ["admin", "sst_professional", "health_professional", "manager", "rh"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: true
    });

    const targetTenantId = tenantContext.tenantId;
    const tenantName = tenantContext.tenantName;
    const countryCode = (requestedCountry || tenantContext.countryCode) as "PT" | "BR";

    // 1. Obter métricas reais de governança de IA para o tenant
    const metrics = await getAIGovernanceMetrics(client as any, targetTenantId);

    // 2. Obter decisões pendentes de validação humana (Human-in-the-Loop)
    const pendingDecisions = await getPendingAIDecisions(client as any, targetTenantId);

    // 3. Obter logs do AI Audit Trail
    const auditLogs = await getAIAuditLogs(client as any, targetTenantId, 30);

    return (
      <main className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 font-sans min-h-screen text-white bg-[#020202]">
        {/* 1. Header do Centro de Governança de IA */}
        <AIGovernanceHeader
          tenantName={tenantName}
          countryCode={countryCode}
          userRole={tenantContext.role}
          monitoredModels={metrics.monitoredModels}
        />

        {/* 2. Grid de KPIs de Governança de IA */}
        <AIGovernanceKPIGrid metrics={metrics} />

        {/* 3. Supervisão Humana Obrigatória (Human-in-the-Loop) */}
        <HumanOversightQueue decisions={pendingDecisions} />

        {/* 4. Calibração de Modelos e Explicabilidade Estruturada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModelCalibrationCard metrics={metrics} />
          <DecisionExplainabilityCard />
        </div>

        {/* 5. Rastro Imutável de Auditoria (AI Audit Trail) */}
        <AIAuditTrailTable logs={auditLogs} />
      </main>
    );
  } catch (error: any) {
    console.error("[AI_GOVERNANCE_PAGE_ERROR]", error);
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-10 font-sans">
        <div className="h-20 w-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <BrainCircuit className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Acesso Não Autorizado ao Centro de Governança</h2>
        <p className="text-neutral-400 mt-2 text-xs max-w-md text-center">
          {error.message || "O Centro de Governança de IA requer permissões específicas de auditoria, SST ou administração de organização."}
        </p>
        <Link
          href="/rh"
          className="mt-8 px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-all"
        >
          Voltar ao Dashboard RH
        </Link>
      </div>
    );
  }
}
