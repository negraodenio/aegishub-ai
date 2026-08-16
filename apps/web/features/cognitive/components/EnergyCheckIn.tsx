"use client";

import React, { useState } from "react";
import { BatteryCharging, BatteryMedium, BatteryWarning, Check } from "lucide-react";

interface EnergyCheckInProps {
  tenantId: string;
  initialLevel?: number;
  onCheckinComplete?: (level: number) => void;
}

export function EnergyCheckIn({ tenantId, initialLevel, onCheckinComplete }: EnergyCheckInProps) {
  const [level, setLevel] = useState<number | null>(initialLevel || null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectLevel = async (selected: number) => {
    setLevel(selected);
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/cognitive/energy/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          energyLevel: selected
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onCheckinComplete) onCheckinComplete(selected);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsSaving(false);
    }
  };

  const getEnergyBadge = (val: number | null) => {
    if (!val) return null;
    if (val <= 3) {
      return {
        label: "Recuperação / Baixa",
        icon: BatteryWarning,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
      };
    }
    if (val <= 7) {
      return {
        label: "Fluxo Estável / Médio",
        icon: BatteryMedium,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      };
    }
    return {
      label: "Foco Alto / Pico",
      icon: BatteryCharging,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };
  };

  const badge = getEnergyBadge(level);

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <BatteryCharging className="h-4 w-4 text-amber-400" />
          Check-in de Energia do Dia (1 a 10)
        </span>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
            <badge.icon className="h-3 w-3" />
            {badge.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
          const isSelected = level === val;
          let activeColor = "hover:border-cyan-400";
          if (val <= 3) activeColor = isSelected ? "bg-rose-500 text-black font-black" : "hover:border-rose-400";
          else if (val <= 7) activeColor = isSelected ? "bg-amber-500 text-black font-black" : "hover:border-amber-400";
          else activeColor = isSelected ? "bg-emerald-500 text-black font-black" : "hover:border-emerald-400";

          return (
            <button
              key={val}
              disabled={isSaving}
              onClick={() => handleSelectLevel(val)}
              className={`py-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center ${
                isSelected
                  ? activeColor
                  : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/5"
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
        <span>1 = Baixa Energia</span>
        {savedSuccess && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Nível {level}/10 registrado
          </span>
        )}
        <span>10 = Energia Máxima</span>
      </div>
    </div>
  );
}
