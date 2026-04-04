import { RHService } from "@mindops/database";
import { createClient } from "../../../utils/supabase/server";
import { CoverageCard } from "../../../features/rh-dashboard/components/CoverageCard";
import { ComplianceScoreCard } from "../../../features/rh-dashboard/components/ComplianceScoreCard";
import { RiskHeatmap } from "../../../features/rh-dashboard/components/RiskHeatmap";
import { ActionQueueTable } from "../../../features/rh-dashboard/components/ActionQueueTable";
import { RiskOverviewCard } from "../../../features/dashboard/components/RiskOverviewCard";
import Link from "next/link";
import { BrainCircuit, Building2 } from "lucide-react";
import { ACTDownloadButton } from "../../../features/rh-dashboard/components/ACTDownloadButton";

export default async function RHDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  try {
    const { tenantId } = await searchParams;
    const targetTenantId = tenantId || "e037420f-71b2-40e7-935f-170eb265b36a"; // ACME Default

    const client = await createClient();
    const { overview, heatmap, actionQueue } = await RHService.getDashboardData(client as any, targetTenantId);

    return (
      <main className="space-y-12 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex items-end justify-between border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tenant: ACME Enterprise</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard RH & SST</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-lg">
            Visão executiva estratégica de risco psicossocial, cobertura clínica e conformidade normativa (Lei 102/2009).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ACTDownloadButton tenantName="ACME Enterprise" />
          <Link 
            href={"/rh/intelligence" as any} 
            className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-5 py-2.5 text-xs font-bold tracking-widest uppercase text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-lg border border-indigo-400/20 active:scale-95"
          >
            <BrainCircuit className="h-4 w-4" />
            Intelligence Center M2.7
          </Link>
        </div>
      </header>

      <section
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        <CoverageCard
          assessed={overview.assessedEmployees}
          total={overview.totalEmployees}
          coveragePercent={overview.coveragePercent}
        />
        <ComplianceScoreCard score={overview.complianceScore} />
        <RiskOverviewCard
          label="Risco alto / crítico"
          value={overview.highRiskPopulationPercent}
          unit="%"
          level={overview.highRiskPopulationPercent >= 20 ? "high" : "moderate"}
        />
        <RiskOverviewCard
          label="Alertas abertos"
          value={overview.openAlerts}
          level={overview.openAlerts > 10 ? "moderate" : "low"}
        />
        <RiskOverviewCard
          label="Encaminhamentos"
          value={overview.openReferrals}
          level={overview.openReferrals > 5 ? "moderate" : "low"}
        />
        <RiskOverviewCard
          label="Score médio"
          value={overview.avgCompositeRiskScore}
          level={overview.avgCompositeRiskScore >= 55 ? "high" : "moderate"}
        />
      </section>

      <RiskHeatmap rows={heatmap} />
      <ActionQueueTable items={actionQueue as any} />
    </main>
    );
  } catch (error: any) {
    console.error("[RH_DASHBOARD_ERROR]", error);
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-rose-500">Erro de Carregamento</h2>
        <p className="text-slate-400 mt-2">{error.message || "Falha na conexão com o Intelligence Center."}</p>
        <div className="mt-4 p-4 bg-slate-900 rounded-lg text-left font-mono text-[10px] text-slate-500 overflow-auto max-w-2xl mx-auto">
           Verifique se o seu perfil tem acesso ao Tenant { "e037420f-71b2-40e7-935f-170eb265b36a" } e se as migrações SQL foram aplicadas.
        </div>
      </div>
    );
  }
}
