"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { VoiceSessionUI } from "./VoiceSessionUI";
import { submitAssessmentAction, getAssessmentContext, submitConsentAction } from "../../../app/assessment/actions";
import { GAD7, PHQ9, COPSOQ_SHORT, type ClinicalInstrument } from "@mindops/domain";

interface WorkerWizardProps {
  token: string;
}

type Step = "welcome" | "consent" | "instrument" | "voice" | "finished";

export function WorkerWizard({ token }: WorkerWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [currentInstrumentIdx, setCurrentInstrumentIdx] = useState(0);
  const instruments: ClinicalInstrument[] = [COPSOQ_SHORT, GAD7, PHQ9];
  
  const [consents, setConsents] = useState({ data_processing: false, voice_biometrics: false });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [context, setContext] = useState<{ employeeName: string; companyName: string; verticalPack: string; tenantId?: string } | null>(null);

  useEffect(() => {
    getAssessmentContext(token).then(setContext);
  }, [token]);

  const currentInstrument = instruments[currentInstrumentIdx];

  const handleConsentSubmit = async () => {
    if (!context) return;
    setIsSubmitting(true);
    try {
      await submitConsentAction({
        employeeId: token,
        tenantId: context.tenantId || "", 
        consents: [
          { type: "psychosocial_processing", granted: consents.data_processing },
          { type: "voice_technical_analysis", granted: consents.voice_biometrics }
        ]
      });
      setStep("instrument");
    } catch (err) {
      console.error(err);
      alert("Erro ao validar protocolo de segurança.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (val: number) => {
    if (!currentInstrument) return;
    const question = currentInstrument.questions[currentQuestion];
    if (!question) return;
    
    const questionId = question.id;
    setAnswers(prev => ({ ...prev, [questionId]: val }));

    if (currentQuestion < currentInstrument.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      if (currentInstrumentIdx < instruments.length - 1) {
        setCurrentInstrumentIdx(prev => prev + 1);
        setCurrentQuestion(0);
      } else {
        if (consents.voice_biometrics) {
          setStep("voice");
        } else {
          submitAssessment();
        }
      }
    }
  };

  const submitAssessment = async (audioPath?: string) => {
    setIsSubmitting(true);
    try {
      const result = await submitAssessmentAction({
        employeeId: token,
        answers,
        verticalPack: context?.verticalPack || "generic",
        voicePath: audioPath || undefined
      });

      if (result.success) {
        setStep("finished");
      } else {
        alert("Erro ao submeter avaliação: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro inesperado na submissão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">PR</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800">PsicoRisco PT</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Privacidade Ativa (Lei 102/2009)
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12 transition-all duration-500">
          
          {step === "welcome" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                Olá, {context?.employeeName || "Colaborador"}
              </h2>
              <p className="text-xl font-medium text-slate-700 mb-4">{context?.companyName || "Sua Empresa"}</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Bem-vindo ao protocolo de monitorização preventiva de saúde ocupacional. 
                Esta avaliação cumpre as exigências da <strong>Lei 102/2009</strong> e assegura a proteção da sua saúde no trabalho.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-2">Protocolo de Segurança</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Respostas anonimizadas e tratadas de forma agregada.</li>
                  <li>✓ Sem impacto no seu vínculo contratual.</li>
                  <li>✓ Duração prevista: 10 minutos.</li>
                </ul>
              </div>
              <button 
                onClick={() => setStep("consent")}
                className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
              >
                Prosseguir para Monitorização
              </button>
            </div>
          )}

          {step === "consent" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Protocolo de Monitorização Técnica</h2>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-sm">Avaliação preventiva de riscos psicossociais e fadiga vocal ocupacional (AI Act Compliance).</p>
              </div>

              <div className="space-y-4 mb-10">
                <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <input 
                    type="checkbox" 
                    id="processing"
                    checked={consents.data_processing}
                    onChange={(e) => setConsents(prev => ({ ...prev, data_processing: e.target.checked }))}
                    className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="processing" className="text-sm cursor-pointer select-none">
                    <span className="block font-bold text-slate-900 mb-1">Autorização de Tratamento de Dados</span>
                    <span className="text-slate-500 leading-snug">Autorizo o tratamento dos dados para fins de prevenção de riscos profissionais e monitorização de saúde no trabalho.</span>
                  </label>
                </div>

                <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <input 
                    type="checkbox" 
                    id="voice"
                    checked={consents.voice_biometrics}
                    onChange={(e) => setConsents(prev => ({ ...prev, voice_biometrics: e.target.checked }))}
                    className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="voice" className="text-sm cursor-pointer select-none">
                    <span className="block font-bold text-slate-900 mb-1">Análise Técnica de Qualidade Vocal (Opcional)</span>
                    <span className="text-slate-500 leading-snug">Autorizo a análise da gravação apenas para geração de índice de fadiga vocal. <strong>Não realiza reconhecimento de emoções.</strong></span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4">
                <button 
                  disabled={!consents.data_processing || isSubmitting}
                  onClick={handleConsentSubmit}
                  className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition shadow-lg"
                >
                  {isSubmitting ? "A processar..." : "Confirmar e Avançar"}
                </button>
              </div>
            </div>
          )}

          {step === "instrument" && currentInstrument && (
            <div className="animate-in fade-in duration-300">
               <div className="flex flex-col mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      {currentInstrument.name}
                    </span>
                    <span className="text-sm text-slate-400 font-mono">
                      {currentQuestion + 1} / {currentInstrument.questions.length}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full mb-12">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestion) / currentInstrument.questions.length) * 100}%` }} 
                  />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-12 leading-tight">
                  {currentInstrument.questions[currentQuestion]?.text}
                </h2>

                <div className={`grid grid-cols-1 ${currentInstrument.scaleType === "0-3" ? "sm:grid-cols-4" : "sm:grid-cols-5"} gap-3`}>
                  {(currentInstrument.scaleType === "0-3" 
                    ? ["Nunca", "Vários dias", "Mais de metade", "Quase todos"]
                    : ["Nunca", "Raramente", "Às vezes", "Frequente", "Sempre"]
                  ).map((label, idx) => (
                    <button 
                      key={label}
                      onClick={() => handleAnswer(currentInstrument.scaleType === "0-3" ? idx : idx + 1)}
                      className="flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition min-h-[100px]"
                    >
                      <span className="bg-white border border-slate-200 h-8 w-8 rounded-full flex items-center justify-center mb-3 shadow-sm text-slate-400 text-sm font-bold">
                        {currentInstrument.scaleType === "0-3" ? idx : idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
                    </button>
                  ))}
                </div>
            </div>
          )}

          {step === "voice" && (
            <div className="animate-in zoom-in-95 duration-500 text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Avaliação Técnica da Voz</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
                Análise de parâmetros acústicos para medição de fadiga vocal ocupacional. 
                Este sistema <strong>não infere emoções ou estados mentais</strong> (AI Act).
              </p>
              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-8">
                <VoiceSessionUI employeeId={token} onComplete={submitAssessment} />
              </div>
              <button 
                disabled={isSubmitting}
                onClick={() => submitAssessment()} 
                className="text-sm font-bold text-slate-500 hover:text-slate-800 underline disabled:opacity-50"
              >
                Saltar este passo e Submeter
              </button>
            </div>
          )}

          {step === "finished" && (
            <div className="animate-in fade-in zoom-in-95 duration-1000 text-center py-12">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-8 border-4 border-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Avaliação Concluída</h2>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                Os seus indicadores técnicos de fadiga vocal foram integrados no plano de prevenção organizacional da sua empresa.
              </p>
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-700 text-left space-y-2">
                <p className="font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Nota de Conformidade EU AI Act:</p>
                <p>Este índice é um indicador técnico complementar de carga ergonómica e não constitui diagnóstico clínico nem inferência de estado emocional.</p>
              </div>
              <button onClick={() => window.location.href = "about:blank"} className="mt-8 text-sm font-bold text-slate-500 hover:text-slate-800">
                Fechar Portal de Saúde Ocupacional
              </button>
            </div>
          )}

        </div>
      </main>
      
      <footer className="py-6 text-center text-xs text-slate-400 font-medium">
        Protocolo Validado • Privacidade By Design • Lei 102/2009 ACT
      </footer>
    </div>
  );
}
