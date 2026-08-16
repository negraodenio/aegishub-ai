import { getManagerOverview } from "@mindops/database";
export const dynamic = "force-dynamic";
import { createClient } from "../../../utils/supabase/server";
import { BrainCircuit, Users, AlertTriangle, ShieldCheck, TrendingUp, Globe2, Activity } from "lucide-react";
import Link from "next/link";
import { resolveTenantContext } from "@/lib/tenant-context";

export default async function LineManagerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string; orgUnitId?: string }>;
}) {
  try {
    const { tenantId: requestedTenantId, orgUnitId } = await searchParams;
    const client = await createClient();

    // 🛡️ P0/P4 SECURITY: Resolução estrita do tenant via sessão autorizada
    const tenantContext = await resolveTenantContext({
      requiredRoles: ["admin", "manager", "rh", "sst_professional"],
      requestedTenantId: requestedTenantId || null,
      redirectToLoginOnFail: true
    });

    const targetTenantId = tenantContext.tenantId;
    const tenantName = tenantContext.tenantName;
    const isPT = tenantContext.countryCode === "PT";

    const data = await getManagerOverview(client as any, targetTenantId, orgUnitId);

    return (
      <main className="min-h-screen bg-[#020202] text-white p-8 animate-in fade-in duration-700 font-sans">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BrainCircuit className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                AEGIS <span className="font-light text-neutral-500 ml-1">HUB</span> / Gestão
              </h1>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Organização: {tenantName}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-lg">
              Visão estratégica de saúde ocupacional e resiliência da equipa. Dados agregados em conformidade com {isPT ? "o RGPD (UE 2016/679)" : "a LGPD (Lei 13.709/2018)"}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
              {isPT ? (
                <span className="text-neutral-200">
                  🇵🇹 <strong>Portugal</strong> (Lei 102/2009 / ACT)
                </span>
              ) : (
                <span className="text-neutral-200">
                  🇧🇷 <strong>Brasil</strong> (NR-1 / GRO / PGR)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              AegisHub Governança & SST
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <Users className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Cobertura da Equipa
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-tight">Taxa de Participação</p>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black tracking-tight">{data.coveragePercent}%</h2>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-xs text-neutral-500 font-medium">
              {data.assessedCount} de {data.totalEmployees} colaboradores avaliados
            </p>
          </article>

          <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <Activity className="h-5 w-5 text-amber-400" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Sobrecarga Psicossocial
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-tight">
              Fatores de Risco Elevado
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black tracking-tight text-amber-400">
                {Math.round(((data.highRiskCount + data.criticalRiskCount) / Math.max(data.assessedCount, 1)) * 100)}%
              </h2>
            </div>
            <p className="mt-2 text-xs text-neutral-500 font-medium">
              Proporção com necessidade de medidas preventivas
            </p>
          </article>

          <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Protocolo Regulatório
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-tight">
              {isPT ? "Conformidade Lei 102/2009 (ACT)" : "Conformidade NR-1 / GRO (MTE)"}
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black tracking-tight text-cyan-400">{data.complianceScore}</h2>
            </div>
            <p className="mt-2 text-xs text-neutral-500 font-medium">
              Indicador de prontidão para auditoria de SST
            </p>
          </article>
        </section>
      </main>
    );
  } catch (error: any) {
    return (
      <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-8">
        <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 max-w-md text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Acesso Restrito ao Painel de Gestão</h2>
          <p className="text-xs text-neutral-400">
            {error.message || "Você não possui permissão para visualizar este espaço de trabalho."}
          </p>
          <Link
            href="/rh"
            className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </main>
    );
  }
}
