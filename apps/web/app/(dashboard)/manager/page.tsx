import { getManagerOverview } from "@mindops/database";

export default async function LineManagerDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string; orgUnitId?: string }>;
}) {
  const { tenantId, orgUnitId } = await searchParams;
  const targetTenantId = tenantId || "00000000-0000-0000-0000-000000000000";

  const data = await getManagerOverview(targetTenantId, orgUnitId);

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Dashboard do Gestor</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Visão agregada da equipa, sem dados clínicos individuais.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Equipe avaliada</p>
          <h2 className="mt-2 text-3xl font-semibold">{data.coveragePercent}%</h2>
          <p className="mt-1 text-xs text-neutral-400">
            {data.assessedCount} de {data.totalEmployees} colaboradores
          </p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Risco alto / crítico</p>
          <h2 className="mt-2 text-3xl font-semibold">
            {Math.round(((data.highRiskCount + data.criticalRiskCount) / Math.max(data.assessedCount, 1)) * 100)}%
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            {data.highRiskCount + data.criticalRiskCount} casos detectados
          </p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Compliance NR-1</p>
          <h2 className="mt-2 text-3xl font-semibold">{data.complianceScore}</h2>
        </article>
      </section>
    </main>
  );
}
