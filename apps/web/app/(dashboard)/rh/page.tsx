import { RHService } from "@mindops/database";
export const dynamic = "force-dynamic";
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
    const client = await createClient();
    
    // 1. Tentar obter o tenantId do utilizador logado se não for fornecido via URL
    let targetTenantId = tenantId;
    let tenantName = "Empresa Demonstrativa";

    if (!targetTenantId) {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const { data: profile } = await client.from("profiles").select("tenant_id").eq("id", user.id).single();
        targetTenantId = (profile as any)?.tenant_id;
      }
    }

    // 2. Fallback para o tenant ACME se tudo falhar (para facilitar o teste do parceiro)
    if (!targetTenantId) {
       const { data: acme } = await client.from("tenants").select("id, name").eq("slug", "acme-corp").single();
       targetTenantId = (acme as any)?.id || "e037420f-71b2-40e7-935f-170eb265b36a";
       tenantName = (acme as any)?.name || "ACME Enterprise";
    }

    const { overview, heatmap, actionQueue } = await RHService.getDashboardData(client as any, targetTenantId!);

    return (
      <main className="space-y-12 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex items-end justify-between border-b border-white/10 pb-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase italic">AEGIS <span className="font-light not-italic text-neutral-500 ml-1">HUB</span> / RH & SST</h1>
          </div>
          <div className="flex items-center gap-2 text-indigo-400">
            <Building2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tenant Auditada: {tenantName} // Portugal</span>
          </div>
          <p className="mt-2 text-sm text-slate-400 max-w-lg">
            Visão executiva estratégica de risco psicossocial, cobertura clínica e conformidade normativa (Lei 102/2009).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ACTDownloadButton tenantName={tenantName} />
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
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-10 font-sans">
        <div className="h-20 w-20 rounded-[28px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
           <BrainCircuit className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Erro de <span className="text-rose-500">Sincronização</span></h2>
        <p className="text-slate-500 mt-4 text-sm max-w-md text-center uppercase font-bold tracking-widest leading-relaxed">
          Não foi possível carregar os dados do Intelligence Center. Certifique-se que o Tenant ID é válido e que o protocolo M2.7 está ativo.
        </p>
        <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left font-mono text-[10px] text-slate-600 overflow-auto max-w-2xl mx-auto shadow-inner">
           {error.message || "Erro desconhecido na camada de dados RH."}
        </div>
        <Link href="/auth/login" className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 hover:underline">
          Reiniciar Sessão de Auditoria
        </Link>
      </div>
    );
  }
}
