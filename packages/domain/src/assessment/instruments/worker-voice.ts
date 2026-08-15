import { ClinicalInstrument } from "../instruments";

/**
 * Worker Voice — Instrumento de Percepção dos Fatores Psicossociais do Trabalho (NR-1.5.3.3)
 * Focado 100% nas condições e na organização do trabalho, não em patologias individuais.
 */
export const WORKER_VOICE_INSTRUMENT: ClinicalInstrument = {
  code: "WORKER_VOICE",
  name: "Worker Voice — Avaliação dos Fatores Organizacionais do Trabalho (NR-1)",
  category: "Fatores Psicossociais e Organizacionais (PGR / GRO)",
  description: "Instrumento focado nas condições, ritmos, liderança e organização do trabalho conforme exigências da NR-1.",
  maxScore: 60, // 12 questões * 5 pontos
  scaleType: "1-5",
  questions: [
    { id: "wv1", text: "O volume de trabalho exigido está dentro de limites razoáveis para a sua jornada regular?", domain: "Carga e Ritmo de Trabalho" },
    { id: "wv2", text: "Você tem clareza sobre quais são suas responsabilidades e prioridades operacionais?", domain: "Clareza de Papéis" },
    { id: "wv3", text: "A organização do trabalho permite autonomia para planejar e executar suas tarefas?", domain: "Autonomia e Controle" },
    { id: "wv4", text: "Você recebe orientações claras e suporte adequado da sua liderança direta?", domain: "Suporte da Liderança" },
    { id: "wv5", text: "O ambiente de trabalho entre colegas é colaborativo, respeitoso e livre de conflitos graves?", domain: "Relações Socioprofissionais" },
    { id: "wv6", text: "Você dispõe das ferramentas, recursos e tempo necessários para desempenhar suas atividades com segurança?", domain: "Recursos de Trabalho" },
    { id: "wv7", text: "Você consegue se desconectar do trabalho nos períodos de folga, férias e intervalos regulares?", domain: "Desconexão e Recuperação" },
    { id: "wv8", text: "As metas estabelecidas pela organização são realistas e compatíveis com a sua capacidade produtiva?", domain: "Exigências Quantitativas" },
    { id: "wv9", text: "Existe canal seguro e aberto para sugerir melhorias nas rotinas e processos de trabalho?", domain: "Participação e Escuta" },
    { id: "wv10", text: "O ritmo e as pausas no trabalho são suficientes para evitar sobrecarga física e mental?", domain: "Ritmo e Pausas" },
    { id: "wv11", text: "Você se sente reconhecido e valorizado pelos esforços que dedica ao seu trabalho?", domain: "Reconhecimento" },
    { id: "wv12", text: "O clima organizacional da sua área promove segurança psicológica para expressar dúvidas ou preocupações?", domain: "Segurança Psicológica" }
  ]
};
