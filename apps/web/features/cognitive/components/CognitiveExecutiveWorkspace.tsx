"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  ShieldCheck,
  AlertCircle,
  ListTodo,
  Lock,
  Wind,
  Layers
} from "lucide-react";
import {
  submitCognitiveConsentAction,
  saveCognitiveTaskAction,
  updateCognitiveTaskAction,
  deleteCognitiveTaskAction
} from "@/app/employee/cognitive/actions";
import { FocusTimer } from "./FocusTimer";
import { EnergyCheckIn } from "./EnergyCheckIn";
import { CognitiveDailyTip } from "./CognitiveDailyTip";
import { CognitiveWeeklyProgress } from "./CognitiveWeeklyProgress";
import { CognitiveStuckFlow } from "./CognitiveStuckFlow";
import { CognitiveAIChat } from "./CognitiveAIChat";

interface Step {
  id: string;
  text: string;
  completed: boolean;
  estimatedMinutes?: number;
}

interface Task {
  id?: string;
  title: string;
  steps: Step[];
  status: "pending" | "in_progress" | "completed" | "archived";
  energy_level: "low" | "medium" | "high";
  estimated_minutes: number;
}

interface CognitiveExecutiveWorkspaceProps {
  tenantId: string;
  tenantName: string;
  initialProfile: any;
  initialTasks: Task[];
  isBenefitEnabled: boolean;
  countryCode: "PT" | "BR";
}

export function CognitiveExecutiveWorkspace({
  tenantId,
  tenantName,
  initialProfile,
  initialTasks,
  isBenefitEnabled,
  countryCode
}: CognitiveExecutiveWorkspaceProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(
    !initialProfile?.consent_given_at || initialProfile?.is_consent_revoked
  );
  const [isConsenting, setIsConsenting] = useState(false);
  const [isStuckModalOpen, setIsStuckModalOpen] = useState(false);

  // Task Decomposer State
  const [taskInput, setTaskInput] = useState("");
  const [taskDescInput, setTaskDescInput] = useState("");
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decomposedResult, setDecomposedResult] = useState<Task | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Consent Handler
  const handleAcceptConsent = async () => {
    try {
      setIsConsenting(true);
      const res = await submitCognitiveConsentAction({ tenantId, version: "1.0-RGPD-LGPD" });
      if (res.success) {
        setProfile(res.profile);
        setIsConsentModalOpen(false);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Erro ao registrar consentimento.");
    } finally {
      setIsConsenting(false);
    }
  };

  // AI Task Decomposer
  const handleDecomposeTask = async () => {
    if (!taskInput.trim()) return;
    setErrorMessage(null);
    setIsDecomposing(true);

    try {
      const res = await fetch("/api/cognitive/tasks/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: taskInput,
          taskDescription: taskDescInput,
          tenantId,
          estimatedMinutes: 45
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao desdobrar tarefa.");
      }

      setDecomposedResult({
        title: data.task.title,
        steps: data.task.steps,
        status: "pending",
        energy_level: "medium",
        estimated_minutes: data.task.estimatedMinutes
      });
    } catch (e: any) {
      setErrorMessage(e.message || "Falha na geração das micro-etapas.");
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSaveDecomposedTask = async () => {
    if (!decomposedResult) return;
    try {
      const res = await saveCognitiveTaskAction({
        tenantId,
        title: decomposedResult.title,
        steps: decomposedResult.steps,
        energyLevel: decomposedResult.energy_level,
        estimatedMinutes: decomposedResult.estimated_minutes
      });

      if (res.success && res.task) {
        setTasks((prev) => [res.task as Task, ...prev]);
        setDecomposedResult(null);
        setTaskInput("");
        setTaskDescInput("");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Erro ao salvar tarefa.");
    }
  };

  const handleToggleStep = async (taskIndex: number, stepId: string) => {
    const targetTask = tasks[taskIndex];
    if (!targetTask || !targetTask.id) return;

    const updatedSteps = targetTask.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );

    const allCompleted = updatedSteps.every((s) => s.completed);
    const newStatus = allCompleted ? "completed" : "in_progress";

    setTasks((prev) =>
      prev.map((t, idx) => (idx === taskIndex ? { ...t, steps: updatedSteps, status: newStatus } : t))
    );

    await updateCognitiveTaskAction(targetTask.id, {
      steps: updatedSteps,
      status: newStatus
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteCognitiveTaskAction(taskId);
  };

  if (!isBenefitEnabled) {
    return (
      <main className="min-h-screen bg-[#050505] text-white p-8 flex items-center justify-center">
        <div className="max-w-md p-8 rounded-3xl border border-white/10 bg-white/[0.02] text-center space-y-4">
          <Lock className="h-10 w-10 text-neutral-500 mx-auto" />
          <h2 className="text-xl font-bold">Benefício de Acessibilidade Cognitiva Não Ativo</h2>
          <p className="text-xs text-neutral-400">
            O programa de apoio executivo e clareza de tarefas não foi habilitado pela administração da sua organização ({tenantName}).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] text-white p-6 md:p-12 font-sans relative">
      {/* 🛡️ MODAL DE CONSENTIMENTO LIVRE E ESCLARECIDO */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl border border-cyan-500/30 bg-[#0a0a0a] p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Termo de Consentimento & Privacidade</h3>
                <p className="text-xs text-neutral-400">
                  {countryCode === "PT" ? "Regulamento Geral sobre a Proteção de Dados (RGPD)" : "Lei Geral de Proteção de Dados (LGPD)"}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <p>
                <strong>1. Confidencialidade Absoluta:</strong> Suas metas, blocos de foco, tarefas pessoais e reflexões de rotina são estritamente privadas e <u>inacessíveis ao seu empregador ou equipe de RH</u>.
              </p>
              <p>
                <strong>2. Finalidade Não Clínica:</strong> Este recurso oferece ferramentas práticas de apoio a funções executivas, foco e organização. <u>Não realiza diagnóstico médico nem substitui avaliação clínica</u>.
              </p>
              <p>
                <strong>3. Voluntariedade:</strong> O uso é 100% facultativo e o consentimento pode ser revogado a qualquer momento.
              </p>
            </div>

            <button
              onClick={handleAcceptConsent}
              disabled={isConsenting}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm tracking-wide transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isConsenting ? "Registrando Consentimento..." : "Aceitar e Acessar Meu Espaço Pessoal"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE RECUPERAÇÃO DE FOCO (STUCK FLOW) */}
      <CognitiveStuckFlow
        tenantId={tenantId}
        isOpen={isStuckModalOpen}
        onClose={() => setIsStuckModalOpen(false)}
      />

      {/* ASSISTENTE DE IA FLUTUANTE (SESSION-ONLY) */}
      <CognitiveAIChat tenantId={tenantId} />

      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BrainCircuit className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              AEGIS <span className="font-light text-neutral-500 ml-1">COGNITIVE</span> / Acessibilidade & Foco
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            Ambiente pessoal de foco, clareza e organização funcional. Dados 100% privados e criptografados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStuckModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
          >
            <Wind className="h-4 w-4" />
            Bloqueado? Reset de 10s
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            Privacidade Garantida
          </div>
        </div>
      </header>

      {/* DICA DIÁRIA DE PRODUTIVIDADE */}
      <div className="mb-8">
        <CognitiveDailyTip language={countryCode === "PT" ? "pt" : "pt"} />
      </div>

      {/* AVISO NÃO CLÍNICO OBRIGATÓRIO */}
      <div className="mb-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0" />
        <p className="text-xs text-indigo-200">
          <strong>Aviso de Governança:</strong> Este recurso oferece apoio prático à organização diária, foco e funções executivas. Não realiza diagnóstico médico, não infere patologias e não substitui avaliação especializada.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* COLUNA ESQUERDA: TIMER DE FOCO + CHECK-IN DE ENERGIA */}
        <section className="lg:col-span-5 space-y-6">
          <FocusTimer tenantId={tenantId} />
          <EnergyCheckIn
            tenantId={tenantId}
            initialLevel={profile?.preferences?.lastEnergyLevel}
          />
        </section>

        {/* COLUNA DIREITA: DECOMPOSIÇÃO DE TAREFAS & CHECKLIST */}
        <section className="lg:col-span-7 space-y-6">
          {/* DECOMPOSER ASSISTIDO */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Quebra de Tarefas em Micro-Etapas (Task Decomposer)
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Ex: Escrever proposta técnica para o cliente"
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <textarea
                value={taskDescInput}
                onChange={(e) => setTaskDescInput(e.target.value)}
                placeholder="Detalhes opcionais ou o que está gerando atrito para começar..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400 transition resize-none"
              />
            </div>

            <button
              onClick={handleDecomposeTask}
              disabled={isDecomposing || !taskInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="h-4 w-4" />
              {isDecomposing ? "Desdobrando em Micro-Etapas..." : "Desdobrar em Etapas Práticas"}
            </button>

            {/* PREVIEW DO DESDOBRAMENTO */}
            {decomposedResult && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-300">Plano de Execução Sugerido</h4>
                  <span className="text-[10px] text-neutral-400">~{decomposedResult.estimated_minutes} min totais</span>
                </div>
                <div className="space-y-2">
                  {decomposedResult.steps.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 text-xs text-neutral-200">
                      <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                      <span className="flex-1">{step.text}</span>
                      <span className="text-[10px] text-neutral-500">{step.estimatedMinutes}m</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveDecomposedTask}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition"
                >
                  Salvar no Meu Painel de Tarefas
                </button>
              </div>
            )}
          </div>

          {/* LISTA DE TAREFAS PESSOAIS */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-emerald-400" />
                Minhas Metas e Etapas
              </span>
              <span className="text-[11px] text-neutral-500">
                {tasks.filter((t) => t.status === "completed").length} de {tasks.length} concluídas
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Nenhuma tarefa ativa no momento. Crie um plano de foco acima!
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, taskIdx) => (
                  <div
                    key={task.id || taskIdx}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      task.status === "completed"
                        ? "bg-white/[0.01] border-white/5 opacity-60"
                        : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-neutral-500" />
                        )}
                        {task.title}
                      </h4>
                      {task.id && (
                        <button
                          onClick={() => handleDeleteTask(task.id!)}
                          className="p-1 rounded-lg text-neutral-600 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {task.steps && task.steps.length > 0 && (
                      <div className="space-y-1.5 pl-6">
                        {task.steps.map((step) => (
                          <button
                            key={step.id}
                            onClick={() => handleToggleStep(taskIdx, step.id)}
                            className="flex items-center gap-2 text-left w-full group"
                          >
                            {step.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-neutral-600 group-hover:text-cyan-400 shrink-0" />
                            )}
                            <span
                              className={`text-[11px] ${
                                step.completed ? "line-through text-neutral-500" : "text-neutral-300"
                              }`}
                            >
                              {step.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* SEÇÃO INFERIOR: PROGRESSO SEMANAL COMPARATIVO */}
      <section className="mt-8">
        <CognitiveWeeklyProgress />
      </section>
    </main>
  );
}
