"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Cpu, LayoutDashboard, Database, Anchor } from "lucide-react";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Cérebro IA (M2.7)", href: "/admin/ai-pilot", icon: Cpu },
    { name: "Compliance & DPO", href: "/admin/compliance", icon: ShieldCheck },
    { name: "Registos Frios", href: "#", icon: Database, disabled: true },
    { name: "Configurações", href: "#", icon: Anchor, disabled: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-400 font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Sidebar Enterprise */}
      <aside className="w-72 border-r border-white/5 flex flex-col sticky top-0 h-screen bg-[#080808]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="text-white font-black tracking-tighter text-xl uppercase">AEGIS <span className="text-emerald-500">HUB</span></span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Enterprise Control v12.0</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.disabled ? "#" : (item.href as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                  item.disabled ? "opacity-30 cursor-not-allowed" : 
                  isActive ? "bg-white/5 text-white shadow-lg shadow-black" : "hover:bg-white/[0.03] hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.name}
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Status do Sistema</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-200 font-bold">Audit Ledger Ativo</span>
            </div>
          </div>
          
          <button className="w-full py-3 rounded-xl border border-white/5 text-xs font-bold hover:bg-white/5 transition-all">Sair do Console</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
