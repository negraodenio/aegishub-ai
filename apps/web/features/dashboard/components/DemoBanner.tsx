"use client";

import React from "react";
import { Sparkles, AlertCircle } from "lucide-react";

interface DemoBannerProps {
  tenantSlug: string;
  countryCode: "PT" | "BR";
}

export function DemoBanner({ tenantSlug, countryCode }: DemoBannerProps) {
  const isDemo = tenantSlug.startsWith("demo-");
  if (!isDemo) return null;

  const isPT = countryCode === "PT";

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex items-center justify-between text-amber-300">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>AMBIENTE DE DEMONSTRAÇÃO ENTERPRISE:</strong> Todos os dados, colaboradores, laudos e métricas apresentados são 100% sintéticos.
        </span>
      </div>
      <span className="hidden md:inline-flex px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono uppercase">
        {isPT ? "🇵🇹 Demo Portugal (ACT)" : "🇧🇷 Demo Brasil (MTE)"}
      </span>
    </div>
  );
}
