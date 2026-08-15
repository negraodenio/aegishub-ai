export const dynamic = "force-dynamic";

import { createClient } from "../../../utils/supabase/server";
import { resolveTenantContext } from "@/lib/tenant-context";
import { getCampaignsByTenant, getCampaignAggregates, type Campaign } from "@mindops/database";
import { WorkspaceHeader } from "../../../features/rh-dashboard/components/WorkspaceHeader";
import { CampaignSelector } from "../../../features/rh-dashboard/components/CampaignSelector";
import { EmptyCampaignState } from "../../../features/rh-dashboard/components/EmptyCampaignState";
import { EnterpriseKPIGrid } from "../../../features/rh-dashboard/components/EnterpriseKPIGrid";
import { AnonymizedHeatmap } from "../../../features/rh-dashboard/components/AnonymizedHeatmap";
import { OrganizationalActionTable } from "../../../features/rh-dashboard/components/OrganizationalActionTable";
import { ACTDownloadButton } from "../../../features/rh-dashboard/components/ACTDownloadButton";
import { NR1DownloadButton } from "../../../features/rh-dashboard/components/NR1DownloadButton";
import Link from "next/link";
import { BrainCircuit, AlertTriangle, ShieldCheck } from "lucide-react";

export default async function RHDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string; campaignId?: string; country?: string }>;
}) {
  try {
    const { tenantId: requestedTenantId, campaignId: requestedCampaignId, country: requestedCountry } = await searchParams;
    const client = await createClient();
    
    // 🛡️ P0/P1 SECURITY: Resolução estrita do tenant via sessão e memberships autenticadas
    const tenantContext = await resolveTenantContext({
      requiredRoles: ["admin", "rh", "sst_professional", "manager"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: true
    });

    const targetTenantId = tenantContext.tenantId;
    const tenantName = tenantContext.tenantName;
    const countryCode = (requestedCountry || tenantContext.countryCode) as "PT" | "BR";

    // 1. Obter todas as campanhas da organização
    const campaigns = await getCampaignsByTenant(client as any, targetTenantId);

    // 2. Determinar a campanha ativa / selecionada
    let activeCampaign: Campaign | null = null;
    if (campaigns.length > 0) {
      if (requestedCampaignId) {
        activeCampaign = campaigns.find(c => c.id === requestedCampaignId) || campaigns[0] || null;
      } else {
        // Seleciona a primeira com status 'active', ou a mais recente
        activeCampaign = campaigns.find(c => c.status === "active") || campaigns[0] || null;
      }
    }

    // 3. Obter métricas e agregações da campanha aplicando o limiar de anonimato (N >= 5)
    let aggregates = null;
    if (activeCampaign) {
      aggregates = await getCampaignAggregates(client as any, activeCampaign);
    }

    const canManageCampaigns = ["admin", "rh", "sst_professional"].includes(tenantContext.role);

    return (
      <main className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 font-sans">
        {/* 1. Header do Workspace & Jurisdição */}
        <WorkspaceHeader
          tenantName={tenantName}
          countryCode={countryCode}
          userRole={tenantContext.role}
          userEmail={tenantContext.user.email || ""}
          memberships={tenantContext.availableMemberships}
        />

        {/* 2. Barra de Seleção e Controle de Campanha */}
        <CampaignSelector
          campaigns={campaigns}
          activeCampaign={activeCampaign}
          canCreateCampaign={canManageCampaigns}
        />

        {/* 3. Empty State ou Dashboard Operacional */}
        {!activeCampaign || campaigns.length === 0 ? (
          <EmptyCampaignState tenantName={tenantName} hasCampaigns={campaigns.length > 0} />
        ) : (
          <>
            {/* 4. Grid de 5 Indicadores Fundamentais */}
            <EnterpriseKPIGrid aggregates={aggregates} />

            {/* 5. Mapa de Calor por Departamento (Protegido por N >= 5) */}
            <AnonymizedHeatmap
              departments={aggregates?.departmentHeatmap || []}
              minAnonymityThreshold={activeCampaign.min_anonymity_group_size || 5}
            />

            {/* 6. Gestão de Medidas Preventivas (Zero Dados Individuais ao RH) */}
            <OrganizationalActionTable
              actions={aggregates?.organizationalActions || []}
            />

            {/* 7. Exportação Regulatória & Links Oficiais */}
            <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Relatórios & Evidências Estatutárias</h4>
                  <p className="text-[11px] text-neutral-400">
                    Exportação de dossiê em conformidade com {countryCode === "PT" ? "ACT (Lei 102/2009)" : "MTE (NR-1 / PGR)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {countryCode === "BR" ? (
                  <NR1DownloadButton tenantName={tenantName} />
                ) : (
                  <ACTDownloadButton tenantName={tenantName} />
                )}
                <Link
                  href={"/rh/intelligence" as any}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition-all border border-white/10"
                >
                  <BrainCircuit className="h-4 w-4 text-cyan-400" />
                  <span>AI Governance Log</span>
                </Link>
              </div>
            </footer>
          </>
        )}
      </main>
    );
  } catch (error: any) {
    console.error("[RH_DASHBOARD_ERROR]", error);
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-10 font-sans">
        <div className="h-20 w-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
          <BrainCircuit className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Erro de Carregamento do Painel</h2>
        <p className="text-neutral-400 mt-2 text-xs max-w-md text-center">
          {error.message || "Não foi possível carregar as informações do dashboard. Verifique sua sessão."}
        </p>
        <Link
          href="/auth/login"
          className="mt-8 px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition-all"
        >
          Reiniciar Sessão
        </Link>
      </div>
    );
  }
}
