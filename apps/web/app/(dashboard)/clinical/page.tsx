import { getClinicalReviewQueue } from "@mindops/database";
export const dynamic = "force-dynamic";
import { createClient } from "../../../utils/supabase/server";
import { BrainCircuit, Activity, AlertCircle, Clock, CheckCircle2, ChevronRight, Stethoscope, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function ClinicalPortalPage({
  searchParams
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  try {
    const { tenantId } = await searchParams;
    const client = await createClient();

    // 1. Tentar obter o tenantId do utilizador logado se não for fornecido via URL
    let targetTenantId = tenantId;
    let tenantName = "Ecossistema Clínico";

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

    const { data: queue, error } = await getClinicalReviewQueue(client as any, targetTenantId!);

  const stats = {
    pending: queue?.length ?? 0,
    urgent: queue?.filter((a: any) => a.severity === "high" || a.severity === "critical").length ?? 0,
    healthIndex: 94
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white p-8 animate-in fade-in duration-700 font-sans">
      <header className="flex items-center justify-between border-b border-white/10 pb-8 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BrainCircuit className="h-6 w-6 text-black" />
             </div>
             <h1 className="text-2xl font-black tracking-tighter italic uppercase">AEGIS <span className="font-light not-italic text-neutral-500 ml-1">HUB</span> / Clínico</h1>
          </div>
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auditando: {tenantName}</span>
          </div>
          <p className="text-sm text-neutral-500 max-w-lg">
            Centro de Diagnóstico e Triagem Assistida. Monitorização de fadiga, burnout e resiliência biométrica.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-2.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
           <Activity className="h-4 w-4 animate-pulse" />
           Protocolo M2.7 Ativo
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <Clock className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Aguardando</span>
          </div>
          <p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Fila de Triagem</p>
          <h2 className="text-4xl font-black tracking-tighter mt-4">{stats.pending}</h2>
          <p className="mt-2 text-xs text-neutral-600 font-bold uppercase tracking-tighter">
            Análises pendentes de validação clínica
          </p>
        </article>

        <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.02] border-rose-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Prioridade</span>
          </div>
          <p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Casos Críticos</p>
          <h2 className="text-4xl font-black tracking-tighter text-rose-500 mt-4">{stats.urgent}</h2>
          <p className="mt-2 text-xs text-neutral-600 font-bold uppercase tracking-tighter">
            Risco imediato de burnout / trauma detectado
          </p>
        </article>

        <article className="group rounded-[32px] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <Stethoscope className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Saúde Lab</span>
          </div>
          <p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Health Index</p>
          <h2 className="text-4xl font-black tracking-tighter text-indigo-400 mt-4">{stats.healthIndex}%</h2>
          <p className="mt-2 text-xs text-neutral-600 font-bold uppercase tracking-tighter">
            Pontuação média de resiliência do tenant
          </p>
        </article>
      </section>

      <section className="mt-12 rounded-[40px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl relative">
        <div className="border-b border-white/10 px-10 py-6 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <CheckCircle2 className="h-5 w-5 text-emerald-500" />
             <h3 className="text-sm font-bold uppercase tracking-widest">Fila de Intervenção Prioritária</h3>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:underline">Ver Histórico Completo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#050505]/50 text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-10 py-5">Colaborador</th>
                <th className="px-10 py-5">Tipo de Alerta</th>
                <th className="px-10 py-5">Severidade</th>
                <th className="px-10 py-5">Data de Detecção</th>
                <th className="px-10 py-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {queue?.map((alert: any) => (
                <tr key={alert.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-10 py-6 font-bold text-neutral-300">{(alert.employee_id as any)?.full_name ?? "—"}</td>
                  <td className="px-10 py-6 text-neutral-500 font-medium lowercase tracking-tight">{alert.alert_type}</td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      alert.severity === "critical" ? "bg-rose-500/10 border-rose-500/30 text-rose-500" :
                      alert.severity === "high" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-neutral-600 font-bold tabular-nums">
                    {new Date(alert.created_at).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-neutral-400 hover:text-white">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!queue || queue.length === 0) && (
            <div className="px-10 py-32 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/5 flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck className="h-6 w-6 text-emerald-500/30" />
              </div>
              <p className="text-xs text-neutral-600 font-bold uppercase tracking-[0.3em]">
                Zero anomalias clínicas detectadas no protocolo atual.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
    );
  } catch (error: any) {
    console.error("[CLINICAL_PORTAL_ERROR]", error);
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-10 font-sans text-center">
        <div className="h-20 w-20 rounded-[28px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
           <BrainCircuit className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Protocolo Clínico <span className="text-rose-500">Suspenso</span></h2>
        <p className="text-slate-500 mt-4 text-sm max-w-md uppercase font-bold tracking-widest leading-relaxed">
          Falha na verificação de integridade biométrica ou ausência de permissões para este Tenant.
        </p>
        <Link href="/auth/login" className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 hover:underline">
          Validar Identidade Médica
        </Link>
      </div>
    );
  }
}
