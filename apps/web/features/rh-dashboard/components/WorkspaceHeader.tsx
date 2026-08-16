"use client";

import React, { useState } from "react";
import { Building2, Shield, Globe2, UserCheck, ChevronDown } from "lucide-react";
import type { TenantMembership, UserRole } from "@mindops/database";
import { OrganizationSwitcherModal } from "./OrganizationSwitcherModal";

interface WorkspaceHeaderProps {
  tenantName: string;
  countryCode: "PT" | "BR";
  userRole: UserRole;
  userEmail: string;
  memberships: TenantMembership[];
}

export function WorkspaceHeader({
  tenantName,
  countryCode,
  userRole,
  userEmail,
  memberships
}: WorkspaceHeaderProps) {
  const isPT = countryCode === "PT";
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const hasMultipleOrgs = memberships.length > 1;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
      {/* Informações da Empresa e Workspace com Trigger Interativo */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => hasMultipleOrgs && setIsSwitcherOpen(true)}
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 shrink-0 ${
            hasMultipleOrgs ? "cursor-pointer hover:scale-105 transition-transform" : ""
          }`}
          title={hasMultipleOrgs ? "Alternar organização" : tenantName}
        >
          <Building2 className="h-6 w-6" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => hasMultipleOrgs && setIsSwitcherOpen(true)}
              className={`flex items-center gap-1.5 text-xl font-bold tracking-tight text-white text-left transition-colors ${
                hasMultipleOrgs ? "hover:text-emerald-400 cursor-pointer group" : ""
              }`}
            >
              <span>{tenantName}</span>
              {hasMultipleOrgs && (
                <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
              )}
            </button>

            {hasMultipleOrgs && (
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 font-medium transition cursor-pointer"
              >
                {memberships.length} Organizações
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            Painel Executivo de Saúde Ocupacional & Riscos Psicossociais
          </p>
        </div>
      </div>

      {/* Badges de Jurisdição, RBAC e Perfil */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Badge de Jurisdição */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold">
          <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
          {isPT ? (
            <span className="text-neutral-200">
              🇵🇹 <strong className="text-white">Portugal</strong> • Lei 102/2009 (ACT)
            </span>
          ) : (
            <span className="text-neutral-200">
              🇧🇷 <strong className="text-white">Brasil</strong> • NR-1 / PGR (MTE)
            </span>
          )}
        </div>

        {/* Badge de Papel RBAC */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Shield className="h-3.5 w-3.5" />
          <span>{userRole.replace("_", " ")}</span>
        </div>

        {/* Identificação do Usuário */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400">
          <UserCheck className="h-3.5 w-3.5 text-neutral-500" />
          <span className="truncate max-w-[150px]">{userEmail}</span>
        </div>
      </div>

      {/* Modal de Alternância de Organização */}
      <OrganizationSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentTenantName={tenantName}
        memberships={memberships}
      />
    </header>
  );
}
