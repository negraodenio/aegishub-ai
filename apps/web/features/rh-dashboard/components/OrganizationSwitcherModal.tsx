"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  Shield,
  Search,
  Loader2,
  Globe2,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import type { TenantMembership } from "@mindops/database";
import { switchOrganizationAction } from "@/app/admin/actions/workspace";
import { useRouter } from "next/navigation";

interface OrganizationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTenantName: string;
  memberships: TenantMembership[];
}

export function OrganizationSwitcherModal({
  isOpen,
  onClose,
  currentTenantName,
  memberships
}: OrganizationSwitcherModalProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredMemberships = memberships.filter((m) => {
    const name = m.tenant_name || m.tenantName || "";
    const slug = m.tenant_slug || "";
    const country = m.country_code || "";
    const role = m.role || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      slug.toLowerCase().includes(search.toLowerCase()) ||
      country.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSwitch = async (targetTenantId: string, isCurrent: boolean) => {
    if (isCurrent) {
      onClose();
      return;
    }

    setSwitchingId(targetTenantId);
    setError(null);

    const result = await switchOrganizationAction(targetTenantId);

    if (result.success) {
      onClose();
      // Redireciona para o dashboard com contexto limpo
      router.push("/rh" as any);
      router.refresh();
    } else {
      setError(result.error || "Falha ao alternar organização.");
      setSwitchingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alternar Organização</h3>
              <p className="text-xs text-neutral-400">
                Selecione o espaço de trabalho corporativo que deseja gerenciar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        {memberships.length > 3 && (
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, país ou função..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* List of Organizations */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
          {filteredMemberships.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              Nenhuma organização encontrada para a busca "{search}".
            </div>
          ) : (
            filteredMemberships.map((m) => {
              const name = m.tenant_name || m.tenantName || "Organização";
              const tenantId = m.tenant_id || m.tenantId || "";
              const isCurrent = name === currentTenantName;
              const isPT = (m.country_code || "PT") === "PT";

              return (
                <div
                  key={m.id}
                  onClick={() => !switchingId && handleSwitch(tenantId, isCurrent)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? "bg-emerald-500/[0.06] border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isCurrent
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      }`}
                    >
                      {name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{name}</h4>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativa
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Globe2 className="h-3 w-3 text-cyan-400" />
                          {isPT ? "🇵🇹 Portugal (ACT)" : "🇧🇷 Brasil (NR-1)"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono uppercase text-emerald-400">
                          <Shield className="h-3 w-3" />
                          {m.role.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    {switchingId === tenantId ? (
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                    ) : isCurrent ? (
                      <span className="text-[11px] text-neutral-400 font-semibold px-3 py-1.5 rounded-xl bg-white/5">
                        Em uso
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-black text-neutral-300 font-bold transition-all text-xs group cursor-pointer"
                      >
                        <span>Acessar</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>


        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0 text-xs text-neutral-400">
          <span>{memberships.length} organizações associadas à sua conta</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
