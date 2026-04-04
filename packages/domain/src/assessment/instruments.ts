export interface InstrumentQuestion {
  id: string;
  text: string;
  domain?: string;
}

export interface ClinicalInstrument {
  code: string;
  name: string;
  maxScore: number;
  scaleType: "0-3" | "1-5";
  questions: InstrumentQuestion[];
}

export const GAD7: ClinicalInstrument = {
  code: "GAD7",
  name: "Escala de Ansiedade Generalizada (GAD-7)",
  maxScore: 21,
  scaleType: "0-3",
  questions: [
    { id: "g1", text: "Sentir-se nervoso, ansioso ou muito tenso" },
    { id: "g2", text: "Não ser capaz de parar ou controlar a preocupação" },
    { id: "g3", text: "Preocupar-se demasiado com diversas coisas" },
    { id: "g4", text: "Dificuldade em relaxar" },
    { id: "g5", text: "Sentir-se tão inquieto que é difícil ficar parado" },
    { id: "g6", text: "Irritar-se facilmente ou sentir-se melindroso" },
    { id: "g7", text: "Sentir medo, como se algo terrível pudesse acontecer" }
  ]
};

export const PHQ9: ClinicalInstrument = {
  code: "PHQ9",
  name: "Questionário de Saúde do Paciente (PHQ-9)",
  maxScore: 27,
  scaleType: "0-3",
  questions: [
    { id: "p1", text: "Pouco interesse ou prazer em fazer as coisas" },
    { id: "p2", text: "Sentir-se em baixo, deprimido ou sem esperança" },
    { id: "p3", text: "Dificuldade em adormecer, em manter o sono ou dormir demais" },
    { id: "p4", text: "Sentir-se cansado ou com pouca energia" },
    { id: "p5", text: "Falta de apetite ou comer demais" },
    { id: "p6", text: "Sentir-se mal consigo próprio (um fracasso ou que desiludiu a família)" },
    { id: "p7", text: "Dificuldade em concentrar-se em coisas como ler ou ver televisão" },
    { id: "p8", text: "Movimentar-se ou falar tão lentamente que as outras pessoas notem" },
    { id: "p9", text: "Pensamentos de que seria melhor estar morto ou de se ferir de alguma maneira" }
  ]
};

export const COPSOQ_SHORT: ClinicalInstrument = {
  code: "COPSOQ",
  name: "Copenhagen Psychosocial Questionnaire (Short PT)",
  maxScore: 50, // 10 questions * 5 points
  scaleType: "1-5",
  questions: [
    { id: "q1", text: "O seu trabalho exige que trabalhe muito intensamente?", domain: "Exigências Quantitativas" },
    { id: "q2", text: "O seu trabalho é emocionalmente exigente?", domain: "Exigências Emocionais" },
    { id: "q3", text: "Sente que o seu trabalho tem significado e importância?", domain: "Significado do Trabalho" },
    { id: "q4", text: "Recebe o apoio necessário dos seus colegas de trabalho?", domain: "Apoio Social" },
    { id: "q5", text: "Sente-se frequentemente exausto no final do dia de trabalho?", domain: "Sintomas de Burnout" },
    { id: "q6", text: "O ritmo de trabalho é tão elevado que tem dificuldade em acompanhar?", domain: "Exigências de Ritmo" },
    { id: "q7", text: "Tem a possibilidade de aprender coisas novas no seu trabalho?", domain: "Possibilidades de Desenvolvimento" },
    { id: "q8", text: "O seu trabalho permite-lhe tomar decisões importantes?", domain: "Influência no Trabalho" },
    { id: "q9", text: "Sente-se entusiasmado com o seu trabalho?", domain: "Engagement" },
    { id: "q10", text: "Existe um bom espírito de equipa entre si e os seus colegas?", domain: "Relações Sociais" },
  ]
};
