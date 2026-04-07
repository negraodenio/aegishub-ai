"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Link2, CheckCircle, Copy, AlertCircle, Building, Briefcase } from "lucide-react";
import { getEmployeesAction, createEmployeeAction } from "../../../app/admin/team/actions";

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    businessUnit: ""
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    const data = await getEmployeesAction();
    setEmployees(data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createEmployeeAction(formData);
    if (res.success) {
      setFormData({ fullName: "", department: "", businessUnit: "" });
      setIsAdding(false);
      loadEmployees();
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/assessment/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="text-emerald-500 h-8 w-8" />
            Gestão de Equipa
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Privacy-First Onboarding // Lei 102/2009</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <UserPlus className="h-5 w-5" />
          Novo Funcionário
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white/[0.03] border border-emerald-500/20 p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Nome Completo</label>
              <input 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                placeholder="Ex. Ricardo Santos"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Departamento</label>
              <input 
                required
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                placeholder="Ex. Engenharia"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Unidade de Negócio</label>
              <input 
                required
                value={formData.businessUnit}
                onChange={e => setFormData({...formData, businessUnit: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                placeholder="Ex. Lisboa / HQ"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
             <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 font-bold px-6">Cancelar</button>
             <button type="submit" className="bg-white text-black px-10 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all">Registar & Gerar Token</button>
          </div>
        </form>
      )}

      <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500">
              <th className="px-8 py-5">Funcionário</th>
              <th className="px-8 py-5">Contexto Organizacional</th>
              <th className="px-8 py-5">Estado Clínico</th>
              <th className="px-8 py-5 text-right">Ação de Privacidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-white/5"></td></tr>)
            ) : employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/40 transition-all">
                      <span className="text-emerald-500 font-bold text-xs uppercase">{emp.full_name.substring(0,2)}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold">{emp.full_name}</div>
                      <div className="text-[9px] font-mono text-slate-600">ID: {emp.id.substring(0,8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                       <Building className="h-3 w-3 text-slate-500" /> {emp.business_unit}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                       <Briefcase className="h-3 w-3 text-slate-500" /> {emp.department}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {emp.isCompleted ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3" /> Avaliado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tighter border border-amber-500/20">
                      <AlertCircle className="h-3 w-3" /> Pendente
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => copyLink(emp.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      copiedId === emp.id ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {copiedId === emp.id ? (
                      <><CheckCircle className="h-4 w-4" /> Copiado!</>
                    ) : (
                      <><Copy className="h-4 w-4" /> Copiar Link de Avaliação</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-4 items-start">
        <Link2 className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
        <div>
          <h4 className="text-emerald-500 font-bold text-sm">Nota de Segurança Jurídica</h4>
          <p className="text-xs text-emerald-200/60 leading-relaxed mt-1">
            Cada link é gerado com um Token Único e Anonimizado. Ao partilhar este link, o funcionário entra num silo clínico protegido. A empresa nunca terá acesso às respostas individuais, apenas ao diagnóstico de aptidão agregado.
          </p>
        </div>
      </div>
    </div>
  );
}
