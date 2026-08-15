export interface InstrumentQuestion {
  id: string;
  text: string;
  domain?: string;
}

export interface ClinicalInstrument {
  code: string;
  name: string;
  category: string;
  description: string;
  maxScore: number;
  scaleType: "0-3" | "1-5";
  questions: InstrumentQuestion[];
}

export const COPSOQ_SHORT: ClinicalInstrument = {
  code: "COPSOQ",
  name: "Avaliação de Riscos Psicossociais (COPSOQ)",
  category: "Ambiente e Carga Psicossocial",
  description: "Mapeamento padronizado de exigências quantitativas, emocionais, ritmo e apoio social no trabalho.",
  maxScore: 50,
  scaleType: "1-5",
  questions: [
    { id: "q1", text: "O seu trabalho exige que trabalhe muito intensamente?", domain: "Exigências Quantitativas" },
    { id: "q2", text: "O seu trabalho é emocionalmente exigente?", domain: "Exigências Emocionais" },
    { id: "q3", text: "Sente que o seu trabalho tem significado e importância?", domain: "Significado do Trabalho" },
    { id: "q4", text: "Recebe o apoio necessário dos seus colegas de trabalho?", domain: "Apoio Social" },
    { id: "q5", text: "Sente-se frequentemente exausto no final do dia de trabalho?", domain: "Indicadores de Burnout" },
    { id: "q6", text: "O ritmo de trabalho é tão elevado que tem dificuldade em acompanhar?", domain: "Ritmo de Trabalho" },
    { id: "q7", text: "Tem a possibilidade de aprender coisas novas no seu trabalho?", domain: "Desenvolvimento Profissional" },
    { id: "q8", text: "O seu trabalho permite-lhe tomar decisões importantes?", domain: "Autonomia e Influência" },
    { id: "q9", text: "Sente-se entusiasmado com o seu trabalho?", domain: "Engagement e Motivação" },
    { id: "q10", text: "Existe um bom espírito de equipa entre si e os seus colegas?", domain: "Relações Interpessoais" },
  ]
};

export const GAD7: ClinicalInstrument = {
  code: "GAD7",
  name: "Rastreio de Níveis de Ansiedade (GAD-7)",
  category: "Ansiedade e Tensão Ocupacional",
  description: "Escala clínica internacional para rastreio de sintomas de ansiedade e sobrecarga nas últimas 2 semanas.",
  maxScore: 21,
  scaleType: "0-3",
  questions: [
    { id: "g1", text: "Sentir-se nervoso, ansioso ou muito tenso", domain: "Tensão Geral" },
    { id: "g2", text: "Não ser capaz de parar ou controlar a preocupação", domain: "Controlo de Pensamento" },
    { id: "g3", text: "Preocupar-se demasiado com diversas coisas", domain: "Preocupação Excessiva" },
    { id: "g4", text: "Dificuldade em relaxar", domain: "Tensão Muscular/Relaxamento" },
    { id: "g5", text: "Sentir-se tão inquieto que é difícil ficar parado", domain: "Inquietação Motora" },
    { id: "g6", text: "Irritar-se facilmente ou sentir-se melindroso", domain: "Irritabilidade" },
    { id: "g7", text: "Sentir medo, como se algo terrível pudesse acontecer", domain: "Apreensão e Medo" }
  ]
};

export const PHQ9: ClinicalInstrument = {
  code: "PHQ9",
  name: "Rastreio de Humor e Desânimo (PHQ-9)",
  category: "Humor, Energia e Depressão",
  description: "Questionário padronizado para avaliação de sintomas de fadiga, desânimo e depressão nas últimas 2 semanas.",
  maxScore: 27,
  scaleType: "0-3",
  questions: [
    { id: "p1", text: "Pouco interesse ou prazer em fazer as coisas", domain: "Anedonia" },
    { id: "p2", text: "Sentir-se em baixo, deprimido ou sem esperança", domain: "Humor Depressivo" },
    { id: "p3", text: "Dificuldade em adormecer, em manter o sono ou dormir demais", domain: "Padrão de Sono" },
    { id: "p4", text: "Sentir-se cansado ou com pouca energia", domain: "Fadiga Física" },
    { id: "p5", text: "Falta de apetite ou comer demais", domain: "Alterações de Apetite" },
    { id: "p6", text: "Sentir-se mal consigo próprio (um fracasso ou que desiludiu a família)", domain: "Autoestima" },
    { id: "p7", text: "Dificuldade em concentrar-se em coisas como ler ou trabalhar", domain: "Concentração" },
    { id: "p8", text: "Movimentar-se ou falar tão lentamente que as outras pessoas notem", domain: "Psicomotricidade" },
    { id: "p9", text: "Pensamentos de que seria melhor estar morto ou de se ferir de alguma maneira", domain: "Ideação Crítica" }
  ]
};
