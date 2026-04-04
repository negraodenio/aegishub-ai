import { getClinicalReviewQueue } from "@mindops/database";
import { RiskLevelSchema } from "@mindops/domain";

export default async function ClinicalPortalPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { tenantId } = await searchParams;
  const targetTenantId = tenantId || "00000000-0000-0000-0000-000000000000";

  const { data: queue, error } = await getClinicalReviewQueue(targetTenantId);

  const stats = {
    pending: queue?.length ?? 0,
    urgent: queue?.filter((a: any) => a.severity === "high" || a.severity === "critical").length ?? 0,
    returnToWork: 0 // Will be implemented in RTW module
  };

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Portal Clínico</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fila clínica, triagem assistida e acompanhamento de encaminhamentos.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Casos pendentes</p>
          <h2 className="mt-2 text-3xl font-semibold">{stats.pending}</h2>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Urgentes</p>
          <h2 className="mt-2 text-3xl font-semibold text-rose-600">{stats.urgent}</h2>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Acompanhamento</p>
          <h2 className="mt-2 text-3xl font-semibold">{stats.returnToWork}</h2>
        </article>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-black/5 px-5 py-4">
          <h3 className="text-sm font-semibold">Fila de triagem</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Colaborador</th>
                <th className="px-5 py-3 text-left font-medium">Tipo de Alerta</th>
                <th className="px-5 py-3 text-left font-medium">Severidade</th>
                <th className="px-5 py-3 text-left font-medium">Data</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {queue?.map((alert: any) => (
                <tr key={alert.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium">{(alert.employee_id as any)?.full_name ?? "—"}</td>
                  <td className="px-5 py-3">{alert.alert_type}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      alert.severity === "critical" ? "bg-rose-50 text-rose-700" :
                      alert.severity === "high" ? "bg-orange-50 text-orange-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {new Date(alert.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">{alert.status}</td>
                </tr>
              ))}
              {(!queue || queue.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-neutral-400">
                    Nenhum caso pendente na fila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
